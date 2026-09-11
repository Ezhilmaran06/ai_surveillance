from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AlertBase(BaseModel):
    session_id: Optional[int] = None
    alert_type: str
    severity: str = "warning"
    zone_name: Optional[str] = None
    track_id: Optional[int] = None
    message: str

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    timestamp: datetime
    acknowledged: bool

    model_config = ConfigDict(from_attributes=True)
