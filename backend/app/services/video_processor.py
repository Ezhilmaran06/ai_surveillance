import asyncio
import base64
import json
import logging
import time
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
import cv2
import numpy as np

from ..config import settings
from ..database import SessionLocal
from ..models.session import SessionModel
from ..models.zone import ZoneModel
from ..models.analytics import AnalyticsSummaryModel, TrackRecordModel
from ..ai.detector import PersonDetector
from ..ai.tracker import MultiObjectTracker
from ..ai.zones import ZoneEngine
from ..ai.analytics import CrowdAnalytics
from ..ai.alert_engine import AlertEngine

logger = logging.getLogger("ai_surveillance.processor")

class VideoProcessor:
    def __init__(self):
        self.detector = PersonDetector(model_name=settings.DEFAULT_MODEL)
        self.tracker = MultiObjectTracker()
        self.zone_engine = ZoneEngine()
        self.analytics = CrowdAnalytics()
        self.alert_engine = AlertEngine(cooldown_seconds=settings.ALERT_COOLDOWN_SECONDS)

        self.current_session_id: Optional[int] = None
        self.is_running = False
        self.is_paused = False
        self._task: Optional[asyncio.Task] = None
        self.latest_frame_jpeg: Optional[bytes] = None
        self.latest_telemetry: Dict[str, Any] = {}
        self.ws_subscribers: set = set()

    def register_ws(self, ws):
        self.ws_subscribers.add(ws)

    def unregister_ws(self, ws):
        self.ws_subscribers.discard(ws)

    async def broadcast(self, message: dict):
        if not self.ws_subscribers:
            return
        dead = []
        msg_str = json.dumps(message)
        for ws in self.ws_subscribers:
            try:
                await ws.send_text(msg_str)
            except Exception:
                dead.append(ws)
        for d in dead:
            self.ws_subscribers.discard(d)

    def load_active_zones(self):
        db = SessionLocal()
        try:
            zones = db.query(ZoneModel).filter(ZoneModel.is_active == True).all()
            self.zone_engine.set_zones(zones)
        finally:
            db.close()

    async def start(self, session_id: int):
        if self.is_running:
            await self.stop()

        db = SessionLocal()
        try:
            session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
            if not session:
                raise ValueError(f"Session {session_id} not found")

            session.status = "processing"
            db.commit()
            self.current_session_id = session_id
            self.is_running = True
            self.is_paused = False
            self.tracker.reset()
            self.analytics.reset()
            self.load_active_zones()

            source = session.source_path if session.source_type != "webcam" else 0
            self._task = asyncio.create_task(self._process_loop(session_id, source))
        finally:
            db.close()

    async def stop(self):
        self.is_running = False
        self.is_paused = False
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

        if self.current_session_id:
            db = SessionLocal()
            try:
                session = db.query(SessionModel).filter(SessionModel.id == self.current_session_id).first()
                if session:
                    session.status = "completed"
                    session.ended_at = datetime.utcnow()
                    db.commit()
            finally:
                db.close()

    async def pause_toggle(self) -> bool:
        self.is_paused = not self.is_paused
        return self.is_paused

    async def _process_loop(self, session_id: int, source: Any):
        logger.info(f"Starting video processing loop for session {session_id}, source={source}")
        cap = cv2.VideoCapture(source)

        if not cap.isOpened():
            logger.error(f"Cannot open video source: {source}")
            db = SessionLocal()
            try:
                sess = db.query(SessionModel).filter(SessionModel.id == session_id).first()
                if sess:
                    sess.status = "failed"
                    db.commit()
            finally:
                db.close()
            self.is_running = False
            return

        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0 or np.isnan(fps):
            fps = 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        db = SessionLocal()
        try:
            sess = db.query(SessionModel).filter(SessionModel.id == session_id).first()
            if sess:
                sess.fps = float(fps)
                sess.total_frames = total_frames
                sess.resolution = f"{width}x{height}"
                sess.duration_seconds = round(total_frames / fps, 1) if total_frames > 0 else 0.0
                db.commit()
        finally:
            db.close()

        frame_idx = 0
        last_summary_frame = 0
        frame_interval = 1.0 / max(10.0, min(fps, 30.0))

        try:
            while self.is_running:
                if self.is_paused:
                    await asyncio.sleep(0.1)
                    continue

                t_start = time.perf_counter()
                ret, frame = cap.read()

                # Loop playback for continuous surveillance if uploaded/sample video finishes
                if not ret:
                    if isinstance(source, (str, Path)):
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        ret, frame = cap.read()
                        if not ret:
                            break
                    else:
                        break

                frame_idx += 1
                curr_time = time.time()

                # Step 1: Detect Persons
                detections, inference_ms = self.detector.detect(
                    frame,
                    conf_threshold=settings.YOLO_CONFIDENCE,
                    iou_threshold=settings.YOLO_IOU
                )

                # Step 2: Multi-Object Tracking
                active_tracks = self.tracker.update(detections, curr_time)

                # Step 3: Zone & Tripwire Processing
                occupancies, crossing_events = self.zone_engine.process(active_tracks, curr_time)
                self.analytics.register_crossings(crossing_events)

                # Step 4: Behavioral Analytics & Heatmap
                stats = self.analytics.update(active_tracks, width, height)

                # Step 5: Alerts Evaluation
                db = SessionLocal()
                new_alerts = []
                try:
                    new_alerts = self.alert_engine.evaluate(
                        db=db,
                        session_id=session_id,
                        active_tracks=active_tracks,
                        zone_occupancies=occupancies,
                        zone_configs=self.zone_engine.zones,
                        crossing_events=crossing_events,
                        current_time=curr_time,
                        global_max_crowd=settings.MAX_CROWD_CAPACITY
                    )
                finally:
                    db.close()

                # Step 6: Render Visual Overlays on Frame for streaming
                annotated = self._render_annotations(frame.copy(), active_tracks, occupancies)
                _, buffer = cv2.imencode('.jpg', annotated, [cv2.IMWRITE_JPEG_QUALITY, 75])
                self.latest_frame_jpeg = buffer.tobytes()

                # Step 7: Periodic Database Persistence for analytics (every 25 frames or 1s)
                if frame_idx - last_summary_frame >= 25:
                    last_summary_frame = frame_idx
                    db = SessionLocal()
                    try:
                        summary = AnalyticsSummaryModel(
                            session_id=session_id,
                            frame_number=frame_idx,
                            current_count=stats["current_count"],
                            peak_count=stats["peak_count"],
                            average_dwell_time=stats["average_dwell_time"],
                            density_score=stats["density_index"],
                            entries_count=stats["entries"],
                            exits_count=stats["exits"],
                            zone_occupancy_json=json.dumps(occupancies)
                        )
                        db.add(summary)
                        # Update session processed frames
                        sess = db.query(SessionModel).filter(SessionModel.id == session_id).first()
                        if sess:
                            sess.processed_frames = frame_idx
                        db.commit()
                    finally:
                        db.close()

                # Step 8: Construct Telemetry & Broadcast WebSocket
                t_end = time.perf_counter()
                loop_ms = (t_end - t_start) * 1000.0
                actual_fps = round(1000.0 / max(1e-3, loop_ms), 1)

                telemetry = {
                    "type": "frame_update",
                    "session_id": session_id,
                    "frame_number": frame_idx,
                    "total_frames": total_frames,
                    "timestamp": curr_time,
                    "fps": min(actual_fps, fps),
                    "inference_ms": inference_ms,
                    "people_count": stats["current_count"],
                    "peak_count": stats["peak_count"],
                    "density_index": stats["density_index"],
                    "average_dwell_time": stats["average_dwell_time"],
                    "entries": stats["entries"],
                    "exits": stats["exits"],
                    "active_tracks": active_tracks,
                    "zone_occupancies": occupancies,
                    "recent_alerts": new_alerts,
                    "zones_meta": [
                        {
                            "name": z["name"],
                            "type": z["type"],
                            "coordinates": z["coordinates"],
                            "color": z["color"],
                            "max_capacity": z["max_capacity"]
                        } for z in self.zone_engine.zones.values()
                    ]
                }
                self.latest_telemetry = telemetry
                await self.broadcast(telemetry)

                # Regulate playback speed
                elapsed = time.perf_counter() - t_start
                sleep_time = max(0.001, frame_interval - elapsed)
                await asyncio.sleep(sleep_time)

        except Exception as e:
            logger.error(f"Error in video processor loop: {e}", exc_info=True)
        finally:
            cap.release()
            self.is_running = False

    def _render_annotations(self, frame: np.ndarray, tracks: List[Dict[str, Any]], occupancies: Dict[str, int]) -> np.ndarray:
        """Renders bounding boxes, IDs, zones, and HUD directly onto the frame."""
        h, w = frame.shape[:2]

        # Draw Zones
        for z_name, z_data in self.zone_engine.zones.items():
            pts = z_data["coordinates"]
            if not pts:
                continue

            # Convert hex color to BGR
            hex_color = z_data.get("color", "#06b6d4").lstrip("#")
            bgr = tuple(int(hex_color[i:i+2], 16) for i in (4, 2, 0))

            if z_data["type"] == "polygon" and len(pts) >= 3:
                poly_pts = np.array(pts, dtype=np.int32).reshape((-1, 1, 2))
                # Fill transparent
                overlay = frame.copy()
                cv2.fillPoly(overlay, [poly_pts], bgr)
                cv2.addWeighted(overlay, 0.25, frame, 0.75, 0, frame)
                cv2.polylines(frame, [poly_pts], isClosed=True, color=bgr, thickness=2)

                # Label zone
                label = f"{z_name} ({occupancies.get(z_name, 0)}/{z_data.get('max_capacity', 5)})"
                cv2.putText(frame, label, (int(pts[0][0]), int(pts[0][1]) - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (240, 240, 240), 1)

            elif z_data["type"] == "line" and len(pts) >= 2:
                p1 = (int(pts[0][0]), int(pts[0][1]))
                p2 = (int(pts[1][0]), int(pts[1][1]))
                cv2.line(frame, p1, p2, bgr, 3)
                cv2.putText(frame, f"LINE: {z_name}", (p1[0], p1[1] - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.45, bgr, 1)

        # Draw Tracks
        for trk in tracks:
            bbox = trk["bbox"]
            t_id = trk["track_id"]
            dwell = trk.get("dwell_time", 0.0)
            x1, y1, x2, y2 = [int(v) for v in bbox]

            # Bounding box
            box_color = (0, 220, 255)  # Cyan
            if dwell > 10.0:
                box_color = (0, 140, 255)  # Amber warning
            if dwell > 20.0:
                box_color = (0, 0, 240)  # Red critical

            cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)

            # Label banner
            label = f"Person #{t_id} [{dwell:.1f}s]"
            cv2.rectangle(frame, (x1, max(0, y1 - 20)), (x1 + len(label) * 8 + 10, y1), (20, 24, 30), -1)
            cv2.putText(frame, label, (x1 + 4, y1 - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (240, 240, 240), 1)

            # Draw trajectory path
            traj = trk.get("trajectory", [])
            for i in range(1, len(traj)):
                ptA = (int(traj[i-1][0]), int(traj[i-1][1]))
                ptB = (int(traj[i][0]), int(traj[i][1]))
                cv2.line(frame, ptA, ptB, (0, 220, 255), 1)

            # Foot point dot
            fx, fy = int(trk["foot_point"][0]), int(trk["foot_point"][1])
            cv2.circle(frame, (fx, fy), 4, (0, 255, 128), -1)

        return frame

video_processor = VideoProcessor()
