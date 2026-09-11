from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class SessionBase(BaseModel):
    name: str
    source_type: str
    source_path: Optional[str] = None

class SessionCreate(SessionBase):
    pass

class SessionResponse(SessionBase):
    id: int
    status: str
    fps: float
    total_frames: int
    processed_frames: int
    duration_seconds: float
    resolution: str
    created_at: datetime
    ended_at: Optional[datetime] = None
    peak_count: int = 0
    avg_count: float = 0.0
    total_alerts: int = 0
    total_entries: int = 0
    total_exits: int = 0

    model_config = ConfigDict(from_attributes=True)
