from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models.setting import SettingModel
from ..schemas.setting import SettingResponse, SettingCreate

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=Dict[str, Any])
def get_settings(db: Session = Depends(get_db)):
    rows = db.query(SettingModel).all()
    current_vals = {
        "yolo_model": settings.DEFAULT_MODEL,
        "confidence": settings.YOLO_CONFIDENCE,
        "iou": settings.YOLO_IOU,
        "max_crowd_capacity": settings.MAX_CROWD_CAPACITY,
        "max_dwell_seconds": settings.MAX_DWELL_SECONDS,
        "alert_cooldown_seconds": settings.ALERT_COOLDOWN_SECONDS,
        "privacy_mode": "Anonymous Trackers Only (No Facial / Biometric Rec)",
        "hardware_acceleration": "Auto (CUDA if present, else CPU)"
    }
    for r in rows:
        try:
            if r.key in ["confidence", "iou"]:
                current_vals[r.key] = float(r.value)
            elif r.key in ["max_crowd_capacity", "max_dwell_seconds", "alert_cooldown_seconds"]:
                current_vals[r.key] = int(r.value)
            else:
                current_vals[r.key] = r.value
        except Exception:
            current_vals[r.key] = r.value
    return current_vals

@router.post("")
def update_settings(payload: Dict[str, Any], db: Session = Depends(get_db)):
    for k, v in payload.items():
        row = db.query(SettingModel).filter(SettingModel.key == k).first()
        if not row:
            row = SettingModel(key=k, value=str(v))
            db.add(row)
        else:
            row.value = str(v)

        # Update in-memory settings
        if k == "confidence":
            settings.YOLO_CONFIDENCE = float(v)
        elif k == "iou":
            settings.YOLO_IOU = float(v)
        elif k == "max_crowd_capacity":
            settings.MAX_CROWD_CAPACITY = int(v)
        elif k == "max_dwell_seconds":
            settings.MAX_DWELL_SECONDS = int(v)
        elif k == "alert_cooldown_seconds":
            settings.ALERT_COOLDOWN_SECONDS = int(v)

    db.commit()
    return {"status": "updated", "settings": payload}
