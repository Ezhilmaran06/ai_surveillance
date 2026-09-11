import numpy as np
from typing import List, Dict, Any, Tuple

class CrowdAnalytics:
    def __init__(self, grid_w: int = 64, grid_h: int = 36):
        self.grid_w = grid_w
        self.grid_h = grid_h
        self.heatmap_grid = np.zeros((self.grid_h, self.grid_w), dtype=np.float32)
        self.peak_count = 0
        self.total_entries = 0
        self.total_exits = 0

    def reset(self):
        self.heatmap_grid.fill(0)
        self.peak_count = 0
        self.total_entries = 0
        self.total_exits = 0

    def register_crossings(self, crossing_events: List[Dict[str, Any]]):
        for event in crossing_events:
            if event["direction"] == "IN":
                self.total_entries += 1
            else:
                self.total_exits += 1

    def update(self, active_tracks: List[Dict[str, Any]], frame_w: int, frame_h: int) -> Dict[str, Any]:
        """
        Updates cumulative stats and accumulates heatmap density from active footpoints.
        """
        count = len(active_tracks)
        if count > self.peak_count:
            self.peak_count = count

        # Average dwell time
        if count > 0:
            avg_dwell = sum(t.get("dwell_time", 0.0) for t in active_tracks) / count
        else:
            avg_dwell = 0.0

        # Accumulate heatmap
        if frame_w > 0 and frame_h > 0:
            for trk in active_tracks:
                fx, fy = trk["foot_point"]
                # Map to grid coordinates
                gx = int(np.clip((fx / frame_w) * self.grid_w, 0, self.grid_w - 1))
                gy = int(np.clip((fy / frame_h) * self.grid_h, 0, self.grid_h - 1))

                # Splash 3x3 gaussian-like footprint
                for dy in range(-1, 2):
                    for dx in range(-1, 2):
                        ny, nx = gy + dy, gx + dx
                        if 0 <= ny < self.grid_h and 0 <= nx < self.grid_w:
                            weight = 1.0 if (dx == 0 and dy == 0) else 0.5
                            self.heatmap_grid[ny, nx] += weight

        # Density index: scale between 0.0 and 1.0 (assuming normal max crowd around 20)
        density_index = min(1.0, round(count / 20.0, 3))

        return {
            "current_count": count,
            "peak_count": self.peak_count,
            "average_dwell_time": round(avg_dwell, 1),
            "density_index": density_index,
            "entries": self.total_entries,
            "exits": self.total_exits
        }

    def get_normalized_heatmap(self) -> List[Dict[str, float]]:
        """
        Returns normalized non-zero points for web canvas heatmap rendering.
        List of {x: 0..1, y: 0..1, weight: 0..1}
        """
        max_val = float(np.max(self.heatmap_grid))
        if max_val <= 0:
            return []

        points = []
        for r in range(self.grid_h):
            for c in range(self.grid_w):
                val = float(self.heatmap_grid[r, c])
                if val > (max_val * 0.05):  # threshold noise
                    points.append({
                        "x": round(c / self.grid_w, 3),
                        "y": round(r / self.grid_h, 3),
                        "weight": round(val / max_val, 3)
                    })
        return points
