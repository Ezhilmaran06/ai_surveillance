import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..config import settings, UPLOAD_DIR
from ..database import get_db
from ..models.session import SessionModel
from ..models.analytics import AnalyticsSummaryModel
from ..models.alert import AlertModel
from ..schemas.session import SessionResponse, SessionCreate
from ..services.video_processor import video_processor
from ..services.sample_generator import generate_sample_surveillance_video

router = APIRouter(prefix="/sessions", tags=["Sessions"])

def _enrich_session(sess: SessionModel, db: Session) -> SessionResponse:
    stats = db.query(
        func.max(AnalyticsSummaryModel.current_count),
        func.avg(AnalyticsSummaryModel.current_count),
        func.max(AnalyticsSummaryModel.entries_count),
        func.max(AnalyticsSummaryModel.exits_count)
    ).filter(AnalyticsSummaryModel.session_id == sess.id).first()

    alerts_cnt = db.query(AlertModel).filter(AlertModel.session_id == sess.id).count()

    peak_count = int(stats[0] or 0) if stats else 0
    avg_count = round(float(stats[1] or 0.0), 1) if stats else 0.0
    entries = int(stats[2] or 0) if stats else 0
    exits = int(stats[3] or 0) if stats else 0

    return SessionResponse(
        id=sess.id,
        name=sess.name,
        source_type=sess.source_type,
        source_path=sess.source_path,
        status=sess.status,
        fps=sess.fps or 25.0,
        total_frames=sess.total_frames or 0,
        processed_frames=sess.processed_frames or 0,
        duration_seconds=sess.duration_seconds or 0.0,
        resolution=sess.resolution or "AUTO",
        created_at=sess.created_at,
        ended_at=sess.ended_at,
        peak_count=peak_count,
        avg_count=avg_count,
        total_alerts=alerts_cnt,
        total_entries=entries,
        total_exits=exits
    )

@router.get("", response_model=List[SessionResponse])
def get_sessions(db: Session = Depends(get_db)):
    rows = db.query(SessionModel).order_by(SessionModel.id.desc()).all()
    return [_enrich_session(s, db) for s in rows]

@router.get("/{session_id}", response_model=SessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)):
    sess = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    return _enrich_session(sess, db)

@router.post("/upload", response_model=SessionResponse)
async def upload_video(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Validate file extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".mp4", ".avi", ".mov", ".mkv", ".webm"]:
        raise HTTPException(status_code=400, detail="Invalid video format. Supported: .mp4, .avi, .mov, .mkv, .webm")

    safe_name = f"{uuid.uuid4().hex[:10]}_{file.filename}"
    file_path = UPLOAD_DIR / safe_name

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    session = SessionModel(
        name=file.filename or "Uploaded Video",
        source_type="upload",
        source_path=str(file_path),
        status="idle"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/webcam", response_model=SessionResponse)
def create_webcam_session(db: Session = Depends(get_db)):
    session = SessionModel(
        name="Live USB/Integrated Camera Feed",
        source_type="webcam",
        source_path="0",
        status="idle"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/sample", response_model=SessionResponse)
def create_sample_session(db: Session = Depends(get_db)):
    sample_file = UPLOAD_DIR / "sample_surveillance.mp4"
    if not sample_file.exists():
        generate_sample_surveillance_video(str(sample_file))

    session = SessionModel(
        name="Terminal Concourse (Sample CCTV)",
        source_type="sample",
        source_path=str(sample_file),
        status="idle"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/{session_id}/start")
async def start_session(session_id: int, db: Session = Depends(get_db)):
    sess = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    await video_processor.start(session_id)
    return {"status": "started", "session_id": session_id}

@router.post("/{session_id}/pause")
async def pause_session(session_id: int):
    paused = await video_processor.pause_toggle()
    return {"status": "paused" if paused else "resumed"}

@router.post("/{session_id}/stop")
async def stop_session(session_id: int):
    await video_processor.stop()
    return {"status": "stopped", "session_id": session_id}

@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    sess = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")

    if sess.source_path and os.path.exists(sess.source_path) and sess.source_type == "upload":
        try:
            os.remove(sess.source_path)
        except Exception:
            pass

    db.delete(sess)
    db.commit()
    return {"status": "deleted", "session_id": session_id}

async def mjpeg_frame_generator():
    """Generator yielding MJPEG multipart frames for real-time video streaming"""
    import asyncio
    while True:
        frame_bytes = video_processor.latest_frame_jpeg
        if frame_bytes:
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")
        await asyncio.sleep(0.04)

@router.get("/{session_id}/stream")
def stream_session(session_id: int):
    return StreamingResponse(
        mjpeg_frame_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
