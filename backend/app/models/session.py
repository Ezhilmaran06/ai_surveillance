from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from ..database import Base

class SessionModel(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    source_type = Column(String(50), nullable=False)  # 'upload', 'webcam', 'sample'
    source_path = Column(Text, nullable=True)
    status = Column(String(50), default="idle")  # 'idle', 'processing', 'completed', 'failed', 'stopped'
    fps = Column(Float, default=0.0)
    total_frames = Column(Integer, default=0)
    processed_frames = Column(Integer, default=0)
    duration_seconds = Column(Float, default=0.0)
    resolution = Column(String(50), default="0x0")
    created_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
