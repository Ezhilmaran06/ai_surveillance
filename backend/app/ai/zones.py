import json
from typing import List, Dict, Any, Tuple, Optional

def point_in_polygon(point: Tuple[float, float], polygon: List[Tuple[float, float]]) -> bool:
    """
    Ray casting algorithm to determine if a point (x, y) is inside a polygon.
    Works for any arbitrary 2D polygon.
    """
    x, y = point
    n = len(polygon)
    if n < 3:
        return False

    inside = False
    p1x, p1y = polygon[0]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y

    return inside

def ccw(A: Tuple[float, float], B: Tuple[float, float], C: Tuple[float, float]) -> bool:
    return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0])

def segments_intersect(A: Tuple[float, float], B: Tuple[float, float], C: Tuple[float, float], D: Tuple[float, float]) -> bool:
    """Returns True if line segment AB and line segment CD intersect."""
    return (ccw(A, C, D) != ccw(B, C, D)) and (ccw(A, B, C) != ccw(A, B, D))

def line_side(P: Tuple[float, float], A: Tuple[float, float], B: Tuple[float, float]) -> float:
    """Returns determinant: > 0 for one side, < 0 for the other side."""
    return (B[0] - A[0]) * (P[1] - A[1]) - (B[1] - A[1]) * (P[0] - A[0])

class ZoneEngine:
    def __init__(self):
        self.zones: Dict[str, Dict[str, Any]] = {}
        # Track line crossing history to prevent multiple triggers in adjacent frames
        # {(track_id, line_name): last_crossed_time}
        self.crossing_debounce: Dict[Tuple[int, str], float] = {}

    def set_zones(self, zone_models: List[Any]):
        """Populates active zones from database models or dicts."""
        self.zones.clear()
        for z in zone_models:
            is_active = getattr(z, "is_active", True)
            if not is_active:
                continue

            z_id = getattr(z, "id", None)
            name = getattr(z, "name", f"Zone-{z_id}")
            z_type = getattr(z, "zone_type", "polygon")
            coords_raw = getattr(z, "coordinates_json", "[]")

            try:
                coords = json.loads(coords_raw) if isinstance(coords_raw, str) else coords_raw
            except Exception:
                coords = []

            max_cap = getattr(z, "max_capacity", 5)
            dwell_thresh = getattr(z, "dwell_threshold_seconds", 10.0)
            color = getattr(z, "color", "#06b6d4")
            is_restricted = getattr(z, "is_restricted", False)

            self.zones[name] = {
                "id": z_id,
                "name": name,
                "type": z_type,
                "coordinates": [(float(pt[0]), float(pt[1])) for pt in coords if len(pt) >= 2],
                "max_capacity": max_cap,
                "dwell_threshold_seconds": dwell_thresh,
                "color": color,
                "is_restricted": is_restricted
            }

    def process(self, active_tracks: List[Dict[str, Any]], current_time: float) -> Tuple[Dict[str, int], List[Dict[str, Any]]]:
        """
        Calculates:
        1. Occupancy per polygon zone
        2. Line crossing events (Tripwire)
        Returns:
            occupancies: {zone_name: count}
            crossing_events: [{track_id, line_name, direction, timestamp}]
        """
        occupancies = {name: 0 for name, z in self.zones.items() if z["type"] == "polygon"}
        crossing_events = []

        # Cleanup old debounce entries (> 5 seconds ago)
        self.crossing_debounce = {
            k: v for k, v in self.crossing_debounce.items()
            if current_time - v < 5.0
        }

        for trk in active_tracks:
            t_id = trk["track_id"]
            foot_pt = (trk["foot_point"][0], trk["foot_point"][1])
            trajectory = trk.get("trajectory", [])
            prev_pt = None
            if len(trajectory) >= 2:
                prev_pt = (trajectory[-2][0], trajectory[-2][1])
            curr_pt = (trajectory[-1][0], trajectory[-1][1]) if len(trajectory) >= 1 else foot_pt

            current_person_zones = []

            # Check polygon zones
            for z_name, z_data in self.zones.items():
                if z_data["type"] == "polygon" and len(z_data["coordinates"]) >= 3:
                    if point_in_polygon(foot_pt, z_data["coordinates"]):
                        occupancies[z_name] = occupancies.get(z_name, 0) + 1
                        current_person_zones.append(z_name)

                # Check virtual tripwire lines
                elif z_data["type"] == "line" and len(z_data["coordinates"]) >= 2 and prev_pt is not None:
                    p1 = z_data["coordinates"][0]
                    p2 = z_data["coordinates"][1]

                    if segments_intersect(prev_pt, curr_pt, p1, p2):
                        debounce_key = (t_id, z_name)
                        if debounce_key not in self.crossing_debounce:
                            side_before = line_side(prev_pt, p1, p2)
                            side_after = line_side(curr_pt, p1, p2)

                            direction = "IN" if side_after > side_before else "OUT"
                            self.crossing_debounce[debounce_key] = current_time

                            crossing_events.append({
                                "track_id": t_id,
                                "line_name": z_name,
                                "direction": direction,
                                "timestamp": current_time
                            })

            trk["zones"] = current_person_zones

        return occupancies, crossing_events
