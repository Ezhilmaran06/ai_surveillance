import time
import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from ..models.alert import AlertModel

logger = logging.getLogger("ai_surveillance.alert_engine")

class AlertEngine:
    def __init__(self, cooldown_seconds: float = 6.0):
        self.cooldown_seconds = cooldown_seconds
        # Cooldown table: { (alert_type, key): last_triggered_timestamp }
        self.alert_cooldowns: Dict[Tuple[str, str], float] = {}

    def evaluate(
        self,
        db: Session,
        session_id: int,
        active_tracks: List[Dict[str, Any]],
        zone_occupancies: Dict[str, int],
        zone_configs: Dict[str, Dict[str, Any]],
        crossing_events: List[Dict[str, Any]],
        current_time: float,
        global_max_crowd: int = 15
    ) -> List[Dict[str, Any]]:
        """
        Evaluates current surveillance frame against security and density rules.
        Saves triggered alerts to SQLite and returns them for WebSocket broadcast.
        """
        new_alerts = []

        # 1. Global Crowd Overcrowding Rule
        total_people = len(active_tracks)
        if total_people > global_max_crowd:
            cd_key = ("crowd_density", "GLOBAL")
            if current_time - self.alert_cooldowns.get(cd_key, 0.0) >= self.cooldown_seconds:
                self.alert_cooldowns[cd_key] = current_time
                alert = AlertModel(
                    session_id=session_id,
                    alert_type="crowd_density",
                    severity="critical" if total_people > global_max_crowd * 1.5 else "warning",
                    zone_name="Global Surveillance Area",
                    track_id=None,
                    message=f"High crowd density alert: {total_people} persons detected (Capacity limit: {global_max_crowd})"
                )
                db.add(alert)
                db.commit()
                db.refresh(alert)
                new_alerts.append({
                    "id": alert.id,
                    "session_id": session_id,
                    "alert_type": alert.alert_type,
                    "severity": alert.severity,
                    "zone_name": alert.zone_name,
                    "track_id": alert.track_id,
                    "message": alert.message,
                    "timestamp": alert.timestamp.isoformat(),
                    "acknowledged": False
                })

        # 2. Zone Capacity Rules
        for z_name, count in zone_occupancies.items():
            z_cfg = zone_configs.get(z_name, {})
            max_cap = z_cfg.get("max_capacity", 5)
            if count > max_cap:
                cd_key = ("crowd_density", z_name)
                if current_time - self.alert_cooldowns.get(cd_key, 0.0) >= self.cooldown_seconds:
                    self.alert_cooldowns[cd_key] = current_time
                    alert = AlertModel(
                        session_id=session_id,
                        alert_type="crowd_density",
                        severity="warning",
                        zone_name=z_name,
                        track_id=None,
                        message=f"Zone '{z_name}' capacity exceeded: {count} / {max_cap} persons present"
                    )
                    db.add(alert)
                    db.commit()
                    db.refresh(alert)
                    new_alerts.append({
                        "id": alert.id,
                        "session_id": session_id,
                        "alert_type": alert.alert_type,
                        "severity": alert.severity,
                        "zone_name": alert.zone_name,
                        "track_id": alert.track_id,
                        "message": alert.message,
                        "timestamp": alert.timestamp.isoformat(),
                        "acknowledged": False
                    })

        # 3. Loitering / Dwell Time Rules per Track
        for trk in active_tracks:
            t_id = trk["track_id"]
            dwell = trk.get("dwell_time", 0.0)
            zones = trk.get("zones", [])

            for z_name in zones:
                z_cfg = zone_configs.get(z_name, {})
                dwell_limit = z_cfg.get("dwell_threshold_seconds", 12.0)
                if dwell >= dwell_limit:
                    cd_key = ("dwell_time", f"{z_name}_{t_id}")
                    if current_time - self.alert_cooldowns.get(cd_key, 0.0) >= self.cooldown_seconds:
                        self.alert_cooldowns[cd_key] = current_time
                        alert = AlertModel(
                            session_id=session_id,
                            alert_type="dwell_time",
                            severity="warning",
                            zone_name=z_name,
                            track_id=t_id,
                            message=f"Loitering Alert: Person #{t_id} dwelled in '{z_name}' for {round(dwell, 1)}s (Threshold: {int(dwell_limit)}s)"
                        )
                        db.add(alert)
                        db.commit()
                        db.refresh(alert)
                        new_alerts.append({
                            "id": alert.id,
                            "session_id": session_id,
                            "alert_type": alert.alert_type,
                            "severity": alert.severity,
                            "zone_name": alert.zone_name,
                            "track_id": alert.track_id,
                            "message": alert.message,
                            "timestamp": alert.timestamp.isoformat(),
                            "acknowledged": False
                        })

        # 4. Virtual Tripwire Line Crossing Events
        for c_evt in crossing_events:
            t_id = c_evt["track_id"]
            l_name = c_evt["line_name"]
            direction = c_evt["direction"]
            alert = AlertModel(
                session_id=session_id,
                alert_type="line_crossing",
                severity="info",
                zone_name=l_name,
                track_id=t_id,
                message=f"Perimeter tripwire '{l_name}' crossed ({direction}) by Person #{t_id}"
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            new_alerts.append({
                "id": alert.id,
                "session_id": session_id,
                "alert_type": alert.alert_type,
                "severity": alert.severity,
                "zone_name": alert.zone_name,
                "track_id": alert.track_id,
                "message": alert.message,
                "timestamp": alert.timestamp.isoformat(),
                "acknowledged": False
            })

        # 5. Restricted Zone Security Intrusion Detection
        for trk in active_tracks:
            t_id = trk["track_id"]
            zones = trk.get("zones", [])
            for z_name in zones:
                z_cfg = zone_configs.get(z_name, {})
                if z_cfg.get("is_restricted", False):
                    cd_key = ("restricted_entry", f"{z_name}_{t_id}")
                    if current_time - self.alert_cooldowns.get(cd_key, 0.0) >= max(8.0, self.cooldown_seconds):
                        self.alert_cooldowns[cd_key] = current_time
                        alert = AlertModel(
                            session_id=session_id,
                            alert_type="restricted_entry",
                            severity="critical",
                            zone_name=z_name,
                            track_id=t_id,
                            message=f"RESTRICTED AREA BREACH: Unauthorized intrusion by Person #{t_id} inside '{z_name}'"
                        )
                        db.add(alert)
                        db.commit()
                        db.refresh(alert)
                        new_alerts.append({
                            "id": alert.id,
                            "session_id": session_id,
                            "alert_type": alert.alert_type,
                            "severity": alert.severity,
                            "zone_name": alert.zone_name,
                            "track_id": alert.track_id,
                            "message": alert.message,
                            "timestamp": alert.timestamp.isoformat(),
                            "acknowledged": False
                        })

        return new_alerts
