import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.video_processor import video_processor

logger = logging.getLogger("ai_surveillance.websocket")
router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/live")
async def websocket_live_stream(websocket: WebSocket):
    await websocket.accept()
    video_processor.register_ws(websocket)
    logger.info("New WebSocket client connected to /ws/live")

    # Send initial state if available
    try:
        if video_processor.latest_telemetry:
            await websocket.send_text(json.dumps(video_processor.latest_telemetry))
        else:
            await websocket.send_text(json.dumps({
                "type": "connection_established",
                "status": "connected",
                "is_running": video_processor.is_running
            }))

        while True:
            data = await websocket.receive_text()
            # Handle client control commands via WebSocket (e.g. ping, pause, etc)
            try:
                cmd = json.loads(data)
                if cmd.get("action") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        video_processor.unregister_ws(websocket)
