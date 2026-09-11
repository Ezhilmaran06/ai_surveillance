import os
import time
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import numpy as np

logger = logging.getLogger("ai_surveillance.detector")

class PersonDetector:
    """
    Lightweight YOLO person detector.
    Filters specifically for class 0 ('person') to preserve performance and privacy.
    """
    def __init__(self, model_name: str = "yolov8n.pt", device: Optional[str] = None):
        self.model_name = model_name
        self.device = device  # 'cpu', 'cuda', or None for auto
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            import torch

            if self.device is None:
                self.device = "cuda" if torch.cuda.is_available() else "cpu"

            logger.info(f"Loading YOLO detector '{self.model_name}' on device: {self.device}")
            self.model = YOLO(self.model_name)
            logger.info("YOLO model successfully initialized.")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            self.model = None

    def detect(self, frame: np.ndarray, conf_threshold: float = 0.35, iou_threshold: float = 0.45) -> tuple[List[Dict[str, Any]], float]:
        """
        Runs inference on a single BGR/RGB frame.
        Uses YOLOv8 if loaded, or OpenCV HOG person detector as graceful fallback.
        Returns:
            detections: List of dicts {bbox: [x1, y1, x2, y2], conf: float, class_id: 0}
            inference_ms: Inference latency in milliseconds
        """
        if frame is None or frame.size == 0:
            return [], 0.0

        t0 = time.perf_counter()

        # Primary: Ultralytics YOLO
        if self.model is not None:
            try:
                results = self.model.predict(
                    source=frame,
                    classes=[0],  # Person only
                    conf=conf_threshold,
                    iou=iou_threshold,
                    device=self.device,
                    verbose=False
                )
                inference_ms = (time.perf_counter() - t0) * 1000.0

                detections = []
                if results and len(results) > 0:
                    boxes = results[0].boxes
                    if boxes is not None:
                        for box in boxes:
                            coords = box.xyxy[0].cpu().numpy().astype(float).tolist()
                            conf = float(box.conf[0].cpu().numpy())
                            detections.append({
                                "bbox": coords,
                                "conf": round(conf, 3),
                                "class_id": 0,
                                "label": "Person"
                            })
                return detections, round(inference_ms, 2)
            except Exception as e:
                logger.error(f"YOLO inference error, falling back to HOG: {e}")

        # Graceful Fallback: High-Speed Computer Vision Motion & Contour Detection
        try:
            import cv2
            if not hasattr(self, "_bg_subtractor") or self._bg_subtractor is None:
                self._bg_subtractor = cv2.createBackgroundSubtractorMOG2(
                    history=120,
                    varThreshold=20,
                    detectShadows=False
                )

            fg_mask = self._bg_subtractor.apply(frame)
            # Morphological noise removal
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            fg_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel)
            fg_mask = cv2.dilate(fg_mask, kernel, iterations=2)

            contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            inference_ms = (time.perf_counter() - t0) * 1000.0

            detections = []
            frame_h, frame_w = frame.shape[:2]
            for cnt in contours:
                area = cv2.contourArea(cnt)
                if area < 700 or area > (frame_w * frame_h * 0.4):
                    continue

                x, y, w, h = cv2.boundingRect(cnt)
                # Humanoid aspect ratio filter (taller than wide, or normal perspective)
                aspect = h / max(1.0, float(w))
                if aspect >= 0.8 and h >= 35:
                    detections.append({
                        "bbox": [float(x), float(y), float(x + w), float(y + h)],
                        "conf": round(min(0.95, 0.5 + (area / 10000.0)), 2),
                        "class_id": 0,
                        "label": "Person"
                    })

            return detections, round(inference_ms, 2)
        except Exception as e:
            logger.error(f"Detection fallback error: {e}")
            return [], round((time.perf_counter() - t0) * 1000.0, 2)
