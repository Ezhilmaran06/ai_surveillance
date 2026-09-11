import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "privacy" in data

def test_privacy_disclosure():
    response = client.get("/api/privacy")
    assert response.status_code == 200
    data = response.json()
    assert data["privacy_compliance"] is True

def test_zones_api():
    # List zones
    res_list = client.get("/api/zones")
    assert res_list.status_code == 200

    # Create zone
    payload = {
        "name": "Test Security Zone",
        "zone_type": "polygon",
        "coordinates_json": "[[0,0],[100,0],[100,100],[0,100]]",
        "color": "#06b6d4",
        "max_capacity": 4,
        "dwell_threshold_seconds": 12.0,
        "is_active": True
    }
    res_create = client.post("/api/zones", json=payload)
    assert res_create.status_code == 200
    created = res_create.json()
    z_id = created["id"]
    assert created["name"] == "Test Security Zone"

    # Delete zone
    res_del = client.delete(f"/api/zones/{z_id}")
    assert res_del.status_code == 200

def test_settings_api():
    res_get = client.get("/api/settings")
    assert res_get.status_code == 200
    current_settings = res_get.json()
    assert "confidence" in current_settings
    assert "max_crowd_capacity" in current_settings

def test_restricted_zone_and_alerts_lifecycle():
    # 1. Create a restricted zone
    payload = {
        "name": "Server Vault Restricted Area",
        "zone_type": "polygon",
        "coordinates_json": "[[200,200],[400,200],[400,400],[200,400]]",
        "color": "#ef4444",
        "max_capacity": 1,
        "dwell_threshold_seconds": 5.0,
        "is_active": True,
        "is_restricted": True
    }
    res_create = client.post("/api/zones", json=payload)
    assert res_create.status_code == 200
    z_data = res_create.json()
    assert z_data["is_restricted"] is True
    z_id = z_data["id"]

    # 2. Test Alert Engine simulation with this restricted zone
    from backend.app.ai.alert_engine import AlertEngine
    from backend.app.database import SessionLocal
    from backend.app.models.alert import AlertModel

    db = SessionLocal()
    engine = AlertEngine(cooldown_seconds=1.0)
    fake_tracks = [{
        "track_id": 99,
        "zones": ["Server Vault Restricted Area"],
        "dwell_time": 6.0,
        "foot_point": (250, 250)
    }]
    zone_cfgs = {
        "Server Vault Restricted Area": {"is_restricted": True, "max_capacity": 1, "dwell_threshold_seconds": 5.0}
    }
    alerts = engine.evaluate(
        db=db,
        session_id=1,
        active_tracks=fake_tracks,
        zone_occupancies={"Server Vault Restricted Area": 1},
        zone_configs=zone_cfgs,
        crossing_events=[],
        current_time=100.0
    )
    assert len(alerts) >= 1
    restricted_alert = next((a for a in alerts if a["alert_type"] == "restricted_entry"), None)
    assert restricted_alert is not None
    assert restricted_alert["severity"] == "critical"

    # 3. Test Delete single alert endpoint
    alert_id = restricted_alert["id"]
    res_del_alert = client.delete(f"/api/alerts/{alert_id}")
    assert res_del_alert.status_code == 200
    assert res_del_alert.json()["status"] == "deleted"

    # Cleanup zone
    client.delete(f"/api/zones/{z_id}")
    db.close()

def test_analytics_and_reports_export():
    res_csv = client.get("/api/analytics/export/csv")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]

    res_json = client.get("/api/analytics/export/json")
    assert res_json.status_code == 200
    assert isinstance(res_json.json(), list)

    res_pdf = client.get("/api/analytics/export/pdf")
    assert res_pdf.status_code == 200
    assert "SentinelVision AI" in res_pdf.text
