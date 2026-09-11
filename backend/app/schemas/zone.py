from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class ZoneBase(BaseModel):
    name: str
    zone_type: str = "polygon"  # 'polygon' or 'line'
    coordinates_json: str  # [[x, y], ...]
    color: str = "#06b6d4"
    max_capacity: int = 5
    dwell_threshold_seconds: float = 10.0
    is_active: bool = True
    is_restricted: bool = False

class ZoneCreate(ZoneBase):
    pass

class ZoneUpdate(BaseModel):
    name: Optional[str] = None
    zone_type: Optional[str] = None
    coordinates_json: Optional[str] = None
    color: Optional[str] = None
    max_capacity: Optional[int] = None
    dwell_threshold_seconds: Optional[float] = None
    is_active: Optional[bool] = None
    is_restricted: Optional[bool] = None

class ZoneResponse(ZoneBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
