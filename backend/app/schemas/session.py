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

    model_config = ConfigDict(from_attributes=True)
