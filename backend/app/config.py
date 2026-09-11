import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
WEIGHTS_DIR = BASE_DIR / "weights"
DATA_DIR = BASE_DIR / "data"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    APP_NAME: str = "AegisVision AI — Anonymous Surveillance & Crowd Analytics"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = f"sqlite:///{DATA_DIR / 'surveillance.db'}"
    DEFAULT_MODEL: str = "yolov8n.pt"
    YOLO_CONFIDENCE: float = 0.35
    YOLO_IOU: float = 0.45
    MAX_CROWD_CAPACITY: int = 15
    MAX_DWELL_SECONDS: int = 10
    ALERT_COOLDOWN_SECONDS: int = 5
    MAX_UPLOAD_SIZE_MB: int = 200
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
