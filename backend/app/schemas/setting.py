from typing import Optional
from pydantic import BaseModel, ConfigDict

class SettingBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SettingCreate(SettingBase):
    pass

class SettingResponse(SettingBase):
    model_config = ConfigDict(from_attributes=True)
