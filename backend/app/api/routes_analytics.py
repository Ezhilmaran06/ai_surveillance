import csv
import io
import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.analytics import AnalyticsSummaryModel
from ..models.alert import AlertModel
from ..models.session import SessionModel
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

@router.get("/insights")
def get_analytics_insights(session_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Computes real automated textual insights from actual recorded session telemetry."""
    q = db.query(AnalyticsSummaryModel)
    if session_id is not None:
        q = q.filter(AnalyticsSummaryModel.session_id == session_id)
    records = q.order_by(AnalyticsSummaryModel.timestamp.asc()).all()

    if not records:
        return {
            "insights": [
                "No surveillance telemetry recorded for this session yet.",
                "Start a video or webcam feed to begin automated analytical ingestion."
            ],
            "peak_count": 0,
            "peak_time": None,
            "avg_count": 0.0,
            "total_entries": 0,
            "total_exits": 0,
            "critical_alerts_count": 0
        }

    counts = [r.current_count for r in records]
    dwells = [r.average_dwell_time for r in records if r.average_dwell_time > 0]
    peak_count = max(counts)
    peak_record = next(r for r in records if r.current_count == peak_count)
    avg_count = round(sum(counts) / len(counts), 1)
    avg_dwell = round(sum(dwells) / len(dwells), 1) if dwells else 0.0

    last_record = records[-1]
    total_entries = last_record.entries_count
    total_exits = last_record.exits_count

    # Fetch alerts
    alert_q = db.query(AlertModel)
    if session_id is not None:
        alert_q = alert_q.filter(AlertModel.session_id == session_id)
    alerts = alert_q.all()
    critical_alerts = [a for a in alerts if a.severity in ("CRITICAL", "HIGH")]

    insights = []
    # 1. Peak insight
    peak_time_str = peak_record.timestamp.strftime("%H:%M:%S")
    insights.append(f"Peak occupancy reached {peak_count} persons at {peak_time_str}.")

    # 2. Flow insight
    if total_entries > 0 or total_exits > 0:
        net = total_entries - total_exits
        insights.append(f"Cumulative flow recorded {total_entries} entries and {total_exits} exits (net presence: {net}).")

    # 3. Dwell time insight
    if avg_dwell > 0:
        insights.append(f"Average occupant dwell duration across active zones was {avg_dwell} seconds.")

    # 4. Safety & alerts insight
    if critical_alerts:
        insights.append(f"{len(critical_alerts)} high/critical security perimeter alerts were triggered during monitoring.")
    else:
        insights.append("Zero critical perimeter or capacity violations occurred during the monitored period.")

    return {
        "insights": insights,
        "peak_count": peak_count,
        "peak_time": peak_time_str,
        "avg_count": avg_count,
        "avg_dwell": avg_dwell,
        "total_entries": total_entries,
        "total_exits": total_exits,
        "critical_alerts_count": len(critical_alerts)
    }

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
        headers={"Content-Disposition": "attachment; filename=sentinelvision_analytics_report.csv"}
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

@router.get("/export/pdf", response_class=HTMLResponse)
def export_pdf_report(session_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Renders an executive, printable PDF/HTML compliance audit report.
    Includes automated print trigger (@media print) for direct one-click PDF saving.
    """
    session_obj = None
    if session_id is not None:
        session_obj = db.query(SessionModel).filter(SessionModel.id == session_id).first()

    session_name = session_obj.name if session_obj else "Active Surveillance Session"
    source = session_obj.source_type if session_obj else "Real-Time / Ingested Video"

    q = db.query(AnalyticsSummaryModel)
    if session_id is not None:
        q = q.filter(AnalyticsSummaryModel.session_id == session_id)
    records = q.order_by(AnalyticsSummaryModel.timestamp.asc()).all()

    alert_q = db.query(AlertModel)
    if session_id is not None:
        alert_q = alert_q.filter(AlertModel.session_id == session_id)
    alerts = alert_q.order_by(AlertModel.id.desc()).limit(15).all()

    peak = max([r.current_count for r in records], default=0)
    avg_count = round(sum([r.current_count for r in records]) / max(1, len(records)), 1) if records else 0
    total_entries = records[-1].entries_count if records else 0
    total_exits = records[-1].exits_count if records else 0

    alert_rows = "".join(f"""
        <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">{a.timestamp.strftime('%H:%M:%S')}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: {'#dc2626' if a.severity in ('CRITICAL','HIGH') else '#d97706'};">{a.severity}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">{a.alert_type}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">{a.zone_name or 'Global Area'}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">{a.message}</td>
        </tr>
    """ for a in alerts) or "<tr><td colspan='5' style='padding: 16px; text-align: center; color: #64748b;'>No alerts triggered during this session.</td></tr>"

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SentinelVision AI — Executive Compliance & Crowd Report</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            background: #ffffff;
            margin: 0;
            padding: 32px;
            line-height: 1.5;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }}
        .title {{
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 4px 0;
        }}
        .subtitle {{
            font-size: 14px;
            color: #64748b;
            margin: 0;
        }}
        .grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 28px;
        }}
        .metric-card {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 16px;
        }}
        .metric-label {{
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }}
        .metric-value {{
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 28px;
            font-size: 14px;
        }}
        th {{
            text-align: left;
            padding: 10px 12px;
            background: #f1f5f9;
            color: #475569;
            font-weight: 700;
            border-bottom: 2px solid #cbd5e1;
        }}
        .disclaimer {{
            background: #f0fdf4;
            border-left: 4px solid #16a34a;
            padding: 12px 16px;
            font-size: 13px;
            color: #166534;
            margin-top: 32px;
            border-radius: 0 6px 6px 0;
        }}
        .print-btn {{
            position: fixed;
            top: 20px;
            right: 20px;
            background: #0284c7;
            color: #ffffff;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(2,132,199,0.3);
        }}
        @media print {{
            .print-btn {{ display: none; }}
            body {{ padding: 0; }}
        }}
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>

    <div class="header">
        <div>
            <h1 class="title">SentinelVision AI — Operational Audit Report</h1>
            <p class="subtitle">Session: <strong>{session_name}</strong> | Source: {source}</p>
        </div>
        <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; color: #64748b;">Report Generated</p>
            <p style="margin: 0; font-weight: 700; font-size: 14px;">Real-Time Compliance Audit</p>
        </div>
    </div>

    <div class="grid">
        <div class="metric-card">
            <div class="metric-label">Peak Occupancy</div>
            <div class="metric-value">{peak} <span style="font-size: 14px; font-weight: 400; color: #64748b;">persons</span></div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Average Occupancy</div>
            <div class="metric-value">{avg_count} <span style="font-size: 14px; font-weight: 400; color: #64748b;">persons</span></div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Total Entries</div>
            <div class="metric-value">{total_entries}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Total Exits</div>
            <div class="metric-value">{total_exits}</div>
        </div>
    </div>

    <h3 style="font-size: 16px; margin: 0 0 12px 0; color: #0f172a;">Security & Crowd Incident Log (Latest)</h3>
    <table>
        <thead>
            <tr>
                <th>Time</th>
                <th>Severity</th>
                <th>Event Type</th>
                <th>Zone / Perimeter</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            {alert_rows}
        </tbody>
    </table>

    <div class="disclaimer">
        <strong>Privacy & Compliance Certification:</strong> This surveillance analysis operated exclusively in zero-biometric mode. No facial recognition, facial landmark captures, emotion classification, or individual identity tracking was performed or stored. All detection data is strictly anonymous.
    </div>
</body>
</html>"""
    return HTMLResponse(content=html_content)
