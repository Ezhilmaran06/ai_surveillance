from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from ..database import Base

class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, nullable=True, index=True)
    alert_type = Column(String(50), nullable=False)  # 'crowd_density', 'dwell_time', 'restricted_entry', 'line_crossing'
    severity = Column(String(20), default="warning")  # 'info', 'warning', 'critical'
    zone_name = Column(String(100), nullable=True)
    track_id = Column(Integer, nullable=True)  # Anonymous ID, e.g. 17 for Person #17
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged = Column(Boolean, default=False)
