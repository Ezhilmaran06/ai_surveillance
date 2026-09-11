from .routes_sessions import router as sessions_router
from .routes_zones import router as zones_router
from .routes_alerts import router as alerts_router
from .routes_analytics import router as analytics_router
from .routes_settings import router as settings_router
from .websocket import router as ws_router

__all__ = [
    "sessions_router",
    "zones_router",
    "alerts_router",
    "analytics_router",
    "settings_router",
    "ws_router"
]
