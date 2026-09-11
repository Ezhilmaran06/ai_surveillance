import time
from collections import deque
from typing import List, Dict, Any, Tuple
import numpy as np

def compute_iou(bb1: List[float], bb2: List[float]) -> float:
    """Calculate the Intersection over Union (IoU) of two bounding boxes."""
    x_left = max(bb1[0], bb2[0])
    y_top = max(bb1[1], bb2[1])
    x_right = min(bb1[2], bb2[2])
    y_bottom = min(bb1[3], bb2[3])

    if x_right < x_left or y_bottom < y_top:
        return 0.0

    intersection_area = (x_right - x_left) * (y_bottom - y_top)
    bb1_area = (bb1[2] - bb1[0]) * (bb1[3] - bb1[1])
    bb2_area = (bb2[2] - bb2[0]) * (bb2[3] - bb2[1])
    union_area = bb1_area + bb2_area - intersection_area

    if union_area <= 0:
        return 0.0
    return intersection_area / union_area

class Track:
    def __init__(self, track_id: int, bbox: List[float], conf: float, timestamp: float):
        self.track_id = track_id
        self.bbox = bbox
        self.conf = conf
        self.first_seen = timestamp
        self.last_seen = timestamp
        self.hits = 1
        self.misses = 0
        self.current_zones: set[str] = set()

        cx = (bbox[0] + bbox[2]) / 2.0
        cy = (bbox[1] + bbox[3]) / 2.0
        foot_x = cx
        foot_y = bbox[3]

        self.history = deque(maxlen=60)
        self.history.append((cx, cy, foot_x, foot_y, timestamp))
        self.velocity = [0.0, 0.0]

    @property
    def dwell_time(self) -> float:
        return max(0.0, self.last_seen - self.first_seen)

    @property
    def foot_point(self) -> Tuple[float, float]:
        """Ground plane point (bottom center of bbox) for accurate zone detection"""
        return ((self.bbox[0] + self.bbox[2]) / 2.0, self.bbox[3])

    @property
    def centroid(self) -> Tuple[float, float]:
        return ((self.bbox[0] + self.bbox[2]) / 2.0, (self.bbox[1] + self.bbox[3]) / 2.0)

    def update(self, bbox: List[float], conf: float, timestamp: float):
        old_cx, old_cy = self.centroid
        new_cx = (bbox[0] + bbox[2]) / 2.0
        new_cy = (bbox[1] + bbox[3]) / 2.0
        dt = max(1e-3, timestamp - self.last_seen)

        self.velocity = [(new_cx - old_cx) / dt, (new_cy - old_cy) / dt]
        self.bbox = bbox
        self.conf = conf
        self.last_seen = timestamp
        self.hits += 1
        self.misses = 0
        self.history.append((new_cx, new_cy, new_cx, bbox[3], timestamp))

    def mark_missed(self):
        self.misses += 1

class MultiObjectTracker:
    """
    High-accuracy real-time multi-object tracker for anonymous person tracking.
    Uses spatial IoU and velocity motion estimation with track continuity.
    """
    def __init__(self, max_misses: int = 25, iou_threshold: float = 0.25):
        self.max_misses = max_misses
        self.iou_threshold = iou_threshold
        self.tracks: Dict[int, Track] = {}
        self._next_id = 1
        self.total_tracked_count = 0

    def reset(self):
        self.tracks.clear()
        self._next_id = 1
        self.total_tracked_count = 0

    def update(self, detections: List[Dict[str, Any]], current_time: float) -> List[Dict[str, Any]]:
        """
        Associates incoming detections with existing tracks.
        Returns active tracks formatted for telemetry and rendering.
        """
        track_ids = list(self.tracks.keys())
        det_count = len(detections)
        trk_count = len(track_ids)

        cost_matrix = np.zeros((det_count, trk_count), dtype=float)

        for d_idx, det in enumerate(detections):
            for t_idx, t_id in enumerate(track_ids):
                trk = self.tracks[t_id]
                # Predict estimated position based on velocity
                dt = max(1e-3, current_time - trk.last_seen)
                pred_bbox = [
                    trk.bbox[0] + trk.velocity[0] * dt,
                    trk.bbox[1] + trk.velocity[1] * dt,
                    trk.bbox[2] + trk.velocity[0] * dt,
                    trk.bbox[3] + trk.velocity[1] * dt,
                ]
                iou = compute_iou(det["bbox"], pred_bbox)
                cost_matrix[d_idx, t_idx] = iou

        matched_detections = set()
        matched_tracks = set()

        # Greedy match high IoU pairs
        if det_count > 0 and trk_count > 0:
            flat_indices = np.argsort(-cost_matrix, axis=None)
            for idx in flat_indices:
                d_idx, t_idx = np.unravel_index(idx, cost_matrix.shape)
                if cost_matrix[d_idx, t_idx] < self.iou_threshold:
                    break
                if d_idx in matched_detections or t_idx in matched_tracks:
                    continue
                # Match
                t_id = track_ids[t_idx]
                self.tracks[t_id].update(
                    bbox=detections[d_idx]["bbox"],
                    conf=detections[d_idx]["conf"],
                    timestamp=current_time
                )
                matched_detections.add(d_idx)
                matched_tracks.add(t_idx)

        # Unmatched existing tracks
        for t_idx, t_id in enumerate(track_ids):
            if t_idx not in matched_tracks:
                self.tracks[t_id].mark_missed()

        # Remove dead tracks
        dead_ids = [t_id for t_id, trk in self.tracks.items() if trk.misses > self.max_misses]
        for t_id in dead_ids:
            del self.tracks[t_id]

        # Spawn new tracks for unmatched detections
        for d_idx, det in enumerate(detections):
            if d_idx not in matched_detections:
                new_id = self._next_id
                self._next_id += 1
                self.total_tracked_count += 1
                new_trk = Track(
                    track_id=new_id,
                    bbox=det["bbox"],
                    conf=det["conf"],
                    timestamp=current_time
                )
                self.tracks[new_id] = new_trk

        # Build output list
        results = []
        for t_id, trk in self.tracks.items():
            if trk.misses <= 2:  # Only output active or barely missed tracks
                foot_x, foot_y = trk.foot_point
                cx, cy = trk.centroid
                results.append({
                    "track_id": t_id,
                    "label": f"Person #{t_id}",
                    "bbox": [round(c, 1) for c in trk.bbox],
                    "conf": round(trk.conf, 2),
                    "foot_point": [round(foot_x, 1), round(foot_y, 1)],
                    "centroid": [round(cx, 1), round(cy, 1)],
                    "dwell_time": round(trk.dwell_time, 1),
                    "zones": list(trk.current_zones),
                    "trajectory": [
                        [round(pt[0], 1), round(pt[1], 1)]
                        for pt in list(trk.history)[-15:]
                    ]
                })

        return results
