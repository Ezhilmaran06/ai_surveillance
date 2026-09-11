import csv
import io
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.analytics import AnalyticsSummaryModel
from ..schemas.analytics import AnalyticsSummaryResponse, HeatmapPoint
from ..services.video_processor import video_processor

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/history", response_model=List[AnalyticsSummaryResponse])
def get_analytics_history(
    session_id: Optional[int] = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    q = db.query(AnalyticsSummaryModel)
    if session_id is not None:
        q = q.filter(AnalyticsSummaryModel.session_id == session_id)
    return q.order_by(AnalyticsSummaryModel.id.desc()).limit(limit).all()

@router.get("/heatmap", response_model=List[HeatmapPoint])
def get_heatmap():
    return video_processor.analytics.get_normalized_heatmap()

@router.get("/export/csv")
def export_csv(session_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(AnalyticsSummaryModel)
    if session_id is not None:
        q = q.filter(AnalyticsSummaryModel.session_id == session_id)
    records = q.order_by(AnalyticsSummaryModel.id.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "SessionID", "Timestamp", "FrameNumber", "PeopleCount",
        "PeakCount", "AverageDwellTime", "DensityScore", "Entries", "Exits", "ZoneOccupancy"
    ])

    for r in records:
        writer.writerow([
            r.id, r.session_id, r.timestamp.isoformat(), r.frame_number,
            r.current_count, r.peak_count, r.average_dwell_time,
            r.density_score, r.entries_count, r.exits_count, r.zone_occupancy_json
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=surveillance_analytics_report.csv"}
    )

@router.get("/export/json")
def export_json(session_id: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(AnalyticsSummaryModel)
    if session_id is not None:
        q = q.filter(AnalyticsSummaryModel.session_id == session_id)
    records = q.order_by(AnalyticsSummaryModel.id.asc()).all()

    data = [
        {
            "id": r.id,
            "session_id": r.session_id,
            "timestamp": r.timestamp.isoformat(),
            "frame_number": r.frame_number,
            "people_count": r.current_count,
            "peak_count": r.peak_count,
            "average_dwell_time": r.average_dwell_time,
            "density_score": r.density_score,
            "entries": r.entries_count,
            "exits": r.exits_count,
            "zone_occupancy": json.loads(r.zone_occupancy_json or "{}")
        }
        for r in records
    ]
    return data
