import logging
try:
    import torch
    HAS_TORCH = True
except ImportError:
    torch = None
    HAS_TORCH = False
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import init_db
from .api import (
    sessions_router,
    zones_router,
    alerts_router,
    analytics_router,
    settings_router,
    ws_router
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sentinelvision")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing SentinelVision database tables...")
    init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info("Application shutting down.")

# Ensure DB schema is up-to-date upon app initialization
init_db()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    description="Production-grade AI Surveillance & Anonymous Crowd Analytics Platform."
)

# Enable CORS for frontend Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(sessions_router, prefix=settings.API_PREFIX)
app.include_router(zones_router, prefix=settings.API_PREFIX)
app.include_router(alerts_router, prefix=settings.API_PREFIX)
app.include_router(analytics_router, prefix=settings.API_PREFIX)
app.include_router(settings_router, prefix=settings.API_PREFIX)
app.include_router(ws_router)

@app.get("/api/health")
def health_check():
    has_cuda = (torch.cuda.is_available() if HAS_TORCH and torch and hasattr(torch, "cuda") else False)
    device_name = "CUDA" if has_cuda else "CPU"
    return {
        "status": "healthy",
        "system_status": "ONLINE",
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "device": device_name,
        "components": {
            "backend": "ONLINE",
            "database": "ONLINE",
            "ai_engine": "ONLINE",
            "websocket": "ONLINE",
            "model_path": settings.DEFAULT_MODEL
        },
        "privacy": "Strictly anonymous crowd analytics. Zero facial recognition or biometric capture."
    }

@app.get("/api/privacy")
def privacy_disclosure():
    return {
        "privacy_compliance": True,
        "policy": "This system processes video streams exclusively for anonymized spatial crowd counting, dwell estimation, and safety boundary alerting. No facial recognition, facial landmark detection, emotion classification, or individual identity tracking is implemented or stored."
    }
