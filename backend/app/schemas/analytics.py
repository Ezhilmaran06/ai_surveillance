from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict

class AnalyticsSummaryBase(BaseModel):
    session_id: int
    frame_number: int
    current_count: int
    peak_count: int
    average_dwell_time: float
    density_score: float
    entries_count: int
    exits_count: int
    zone_occupancy_json: str

class AnalyticsSummaryResponse(AnalyticsSummaryBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class HeatmapPoint(BaseModel):
    x: float
    y: float
    weight: float

class LiveFrameTelemetry(BaseModel):
    frame_number: int
    timestamp: float
    fps: float
    inference_ms: float
    people_count: int
    peak_count: int
    density_index: float
    entries: int
    exits: int
    active_tracks: List[Dict[str, Any]]
    zone_occupancies: Dict[str, int]
    recent_alerts: List[Dict[str, Any]]
