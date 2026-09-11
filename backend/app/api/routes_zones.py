import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.zone import ZoneModel
from ..schemas.zone import ZoneResponse, ZoneCreate, ZoneUpdate
from ..services.video_processor import video_processor

router = APIRouter(prefix="/zones", tags=["Zones"])

@router.get("", response_model=List[ZoneResponse])
def get_zones(db: Session = Depends(get_db)):
    return db.query(ZoneModel).all()

@router.post("", response_model=ZoneResponse)
def create_zone(zone_in: ZoneCreate, db: Session = Depends(get_db)):
    zone = ZoneModel(
        name=zone_in.name,
        zone_type=zone_in.zone_type,
        coordinates_json=zone_in.coordinates_json,
        color=zone_in.color,
        max_capacity=zone_in.max_capacity,
        dwell_threshold_seconds=zone_in.dwell_threshold_seconds,
        is_active=zone_in.is_active
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    video_processor.load_active_zones()
    return zone

@router.put("/{zone_id}", response_model=ZoneResponse)
def update_zone(zone_id: int, zone_update: ZoneUpdate, db: Session = Depends(get_db)):
    zone = db.query(ZoneModel).filter(ZoneModel.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    update_data = zone_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(zone, field, value)

    db.commit()
    db.refresh(zone)
    video_processor.load_active_zones()
    return zone

@router.delete("/{zone_id}")
def delete_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(ZoneModel).filter(ZoneModel.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    db.delete(zone)
    db.commit()
    video_processor.load_active_zones()
    return {"status": "deleted", "zone_id": zone_id}

@router.post("/defaults")
def create_default_zones(db: Session = Depends(get_db)):
    """Initializes realistic surveillance zones if none exist."""
    existing = db.query(ZoneModel).count()
    if existing > 0:
        return {"status": "existing_zones_present", "count": existing}

    default_zones = [
        ZoneModel(
            name="Zone A — Concourse Lounge",
            zone_type="polygon",
            coordinates_json=json.dumps([[120, 180], [420, 180], [420, 360], [120, 360]]),
            color="#06b6d4",
            max_capacity=4,
            dwell_threshold_seconds=10.0,
            is_active=True
        ),
        ZoneModel(
            name="Zone B — Restricted Counter",
            zone_type="polygon",
            coordinates_json=json.dumps([[480, 160], [740, 160], [740, 380], [480, 380]]),
            color="#f59e0b",
            max_capacity=2,
            dwell_threshold_seconds=8.0,
            is_active=True
        ),
        ZoneModel(
            name="Perimeter Tripwire Line 1",
            zone_type="line",
            coordinates_json=json.dumps([[100, 240], [700, 240]]),
            color="#ef4444",
            max_capacity=999,
            dwell_threshold_seconds=999.0,
            is_active=True
        )
    ]

    for z in default_zones:
        db.add(z)
    db.commit()
    video_processor.load_active_zones()
    return {"status": "created_defaults", "count": len(default_zones)}
