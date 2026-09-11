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
