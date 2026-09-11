import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
WEIGHTS_DIR = BASE_DIR / "weights"
DATA_DIR = BASE_DIR / "data"
REPORTS_DIR = BASE_DIR / "reports"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    APP_NAME: str = "SentinelVision AI — Crowd Surveillance & Analytics"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR / 'surveillance.db'}")
    DEFAULT_MODEL: str = os.getenv("MODEL_PATH", "yolov8n.pt")
    YOLO_CONFIDENCE: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.35"))
    YOLO_IOU: float = float(os.getenv("IOU_THRESHOLD", "0.45"))
    MAX_CROWD_CAPACITY: int = int(os.getenv("MAX_CROWD_CAPACITY", "15"))
    MAX_DWELL_SECONDS: int = int(os.getenv("MAX_DWELL_SECONDS", "10"))
    ALERT_COOLDOWN_SECONDS: int = int(os.getenv("ALERT_COOLDOWN_SECONDS", "5"))
    MONITORED_AREA_M2: float = float(os.getenv("MONITORED_AREA_M2", "50.0"))
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "250"))
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
