from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from ..database import Base

class AnalyticsSummaryModel(Base):
    __tablename__ = "analytics_summaries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    frame_number = Column(Integer, default=0)
    current_count = Column(Integer, default=0)
    peak_count = Column(Integer, default=0)
    average_dwell_time = Column(Float, default=0.0)
    density_score = Column(Float, default=0.0)
    entries_count = Column(Integer, default=0)
    exits_count = Column(Integer, default=0)
    zone_occupancy_json = Column(Text, default="{}")  # {"Zone A": 3, "Zone B": 1}

class TrackRecordModel(Base):
    __tablename__ = "track_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, nullable=False, index=True)
    track_id = Column(Integer, nullable=False, index=True)  # Anonymous integer
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    dwell_duration = Column(Float, default=0.0)
    zones_visited_json = Column(Text, default="[]")  # ["Zone A", "Gate B"]
    trajectory_sample_json = Column(Text, default="[]")  # sampled points for heatmap/path
