import math
import random
from pathlib import Path
import numpy as np

def generate_sample_surveillance_video(output_path: str, duration_sec: int = 15, fps: int = 25, width: int = 800, height: int = 450) -> str:
    """
    Generates a realistic mock CCTV surveillance video clip with walking humanoid subjects
    to allow immediate end-to-end testing of detection, tracking, zones, and tripwires.
    """
    import cv2

    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    writer = cv2.VideoWriter(str(out_file), fourcc, fps, (width, height))

    total_frames = duration_sec * fps

    # Setup simulated people with trajectories
    persons = [
        # { 'id': 1, 'x': 50, 'y': 220, 'vx': 2.5, 'vy': 0.2, 'loiter_frame': (100, 200), 'color': (60, 60, 180) }
        {"x": 60.0, "y": 200.0, "vx": 2.2, "vy": 0.4, "loiter": (80, 220), "shirt": (180, 80, 50), "pants": (40, 40, 40)},
        {"x": 720.0, "y": 280.0, "vx": -2.0, "vy": -0.3, "loiter": (120, 240), "shirt": (40, 140, 60), "pants": (50, 50, 80)},
        {"x": 100.0, "y": 320.0, "vx": 1.8, "vy": -0.2, "loiter": (0, 0), "shirt": (160, 160, 40), "pants": (30, 30, 30)},
        {"x": 650.0, "y": 180.0, "vx": -2.4, "vy": 0.5, "loiter": (150, 260), "shirt": (120, 50, 150), "pants": (60, 60, 60)},
        {"x": 380.0, "y": 100.0, "vx": 0.3, "vy": 1.5, "loiter": (70, 180), "shirt": (50, 100, 180), "pants": (20, 20, 20)},
        {"x": 420.0, "y": 380.0, "vx": -0.2, "vy": -1.6, "loiter": (0, 0), "shirt": (80, 180, 180), "pants": (40, 40, 40)},
    ]

    for frame_idx in range(total_frames):
        # Create CCTV background (indoor lobby / hallway look)
        frame = np.full((height, width, 3), (28, 32, 38), dtype=np.uint8)

        # Draw floor tiles / grid perspective
        for y in range(120, height, 40):
            cv2.line(frame, (0, y), (width, y), (38, 44, 52), 1)
        for x in range(0, width, 60):
            cv2.line(frame, (x, 120), (int(x * 1.1), height), (35, 40, 48), 1)

        # Draw decorative architectural pillars and counters
        cv2.rectangle(frame, (20, 60), (90, 380), (45, 52, 62), -1)
        cv2.rectangle(frame, (710, 60), (780, 380), (45, 52, 62), -1)
        cv2.rectangle(frame, (240, 80), (560, 140), (40, 48, 56), -1)
        cv2.putText(frame, "RECEPTION / CONCOURSE", (310, 115), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 120, 140), 1)

        # Draw CCTV timestamp HUD
        timestamp_str = f"CAM-01 [ENTRY HALL]  REC  FRAME: {frame_idx:04d} / {total_frames}"
        cv2.putText(frame, timestamp_str, (25, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 230, 200), 1)
        cv2.circle(frame, (15, 26), 5, (0, 0, 230), -1)

        # Draw each humanoid person
        for p in persons:
            # Check loiter frames
            l_start, l_end = p["loiter"]
            is_loitering = l_start <= frame_idx <= l_end

            if not is_loitering:
                p["x"] += p["vx"]
                p["y"] += p["vy"]

                # Bounce off walls
                if p["x"] < 80 or p["x"] > width - 80:
                    p["vx"] *= -1
                if p["y"] < 150 or p["y"] > height - 60:
                    p["vy"] *= -1

            cx = int(p["x"])
            cy = int(p["y"])

            # Scale height slightly with perspective
            scale = 0.7 + (cy / height) * 0.4
            pw = int(24 * scale)
            ph = int(60 * scale)

            # Draw Head
            head_r = int(8 * scale)
            cv2.circle(frame, (cx, cy - ph + head_r), head_r, (190, 180, 170), -1)

            # Draw Torso
            torso_top = cy - ph + (head_r * 2)
            torso_bottom = cy - int(ph * 0.45)
            cv2.rectangle(frame, (cx - pw // 2, torso_top), (cx + pw // 2, torso_bottom), p["shirt"], -1)

            # Draw Legs / animation step
            step_phase = math.sin(frame_idx * 0.3) * (6 * scale) if not is_loitering else 0
            # Left leg
            cv2.line(frame, (cx - pw // 4, torso_bottom), (cx - pw // 4 + int(step_phase), cy), p["pants"], int(4 * scale))
            # Right leg
            cv2.line(frame, (cx + pw // 4, torso_bottom), (cx + pw // 4 - int(step_phase), cy), p["pants"], int(4 * scale))

        writer.write(frame)

    writer.release()
    return str(out_file)
