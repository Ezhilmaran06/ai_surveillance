from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text
from ..database import Base

class ZoneModel(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    zone_type = Column(String(50), default="polygon")  # 'polygon' or 'line'
    coordinates_json = Column(Text, nullable=False)  # JSON string of [[x, y], ...]
    color = Column(String(50), default="#06b6d4")
    max_capacity = Column(Integer, default=5)
    dwell_threshold_seconds = Column(Float, default=10.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
