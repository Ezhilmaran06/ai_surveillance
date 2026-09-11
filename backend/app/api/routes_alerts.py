from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.alert import AlertModel
from ..schemas.alert import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    session_id: Optional[int] = None,
    severity: Optional[str] = None,
    acknowledged: Optional[bool] = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    q = db.query(AlertModel)
    if session_id is not None:
        q = q.filter(AlertModel.session_id == session_id)
    if severity is not None:
        q = q.filter(AlertModel.severity == severity)
    if acknowledged is not None:
        q = q.filter(AlertModel.acknowledged == acknowledged)

    return q.order_by(AlertModel.id.desc()).limit(limit).all()

@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
    if alert:
        alert.acknowledged = True
        db.commit()
        db.refresh(alert)
    return alert

@router.post("/acknowledge-all")
def acknowledge_all(db: Session = Depends(get_db)):
    db.query(AlertModel).update({AlertModel.acknowledged: True})
    db.commit()
    return {"status": "all_acknowledged"}

@router.delete("/{alert_id}")
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
    if not alert:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"status": "deleted", "alert_id": alert_id}

@router.delete("/clear")
def clear_alerts(db: Session = Depends(get_db)):
    db.query(AlertModel).delete()
    db.commit()
    return {"status": "cleared"}
