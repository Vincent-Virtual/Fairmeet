import os

import pytest

os.environ["FAIRMEET_STORAGE"] = "memory"

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_create_meetup_success(client):
    response = client.post("/api/create-meetup", json={
        "meetupName": "Test Meetup",
        "activityType": "coffee",
        "budget": "$$",
        "preferredArea": "Back Bay",
        "indoorOutdoor": "Any",
        "eventCode": "TEST01",
        "createdAt": "2026-04-27T00:00:00",
        "participants": []
    })

    assert response.status_code == 200
    data = response.get_json()
    assert data["eventCode"] == "TEST01"


def test_get_meetup_success(client):
    # Uses meetup from create test
    response = client.get("/api/meetup/TEST01")

    assert response.status_code == 200
    data = response.get_json()
    assert data["eventCode"] == "TEST01"


def test_join_meetup_success(client):
    response = client.post("/api/join-meetup", json={
        "eventCode": "TEST01",
        "name": "Alice",
        "location": "Allston"
    })

    assert response.status_code == 200
    data = response.get_json()
    assert len(data["participants"]) >= 1


def test_join_invalid_meetup(client):
    response = client.post("/api/join-meetup", json={
        "eventCode": "INVALID",
        "name": "Bob",
        "location": "Cambridge"
    })

    assert response.status_code == 404


def test_missing_json_create(client):
    response = client.post("/api/create-meetup", data={})

    assert response.status_code == 400


def test_summary_exists(client):
    response = client.get("/api/meetup/TEST01")
    data = response.get_json()

    assert "summary" in data
    assert "fairnessScore" in data["summary"]


def test_best_place_exists(client):
    response = client.get("/api/meetup/TEST01")
    data = response.get_json()

    assert "bestPlace" in data
    assert "lat" in data["bestPlace"]
    assert "lon" in data["bestPlace"]


def test_multiple_participants_update(client):
    client.post("/api/join-meetup", json={
        "eventCode": "TEST01",
        "name": "Charlie",
        "location": "MIT"
    })

    response = client.get("/api/meetup/TEST01")
    data = response.get_json()

    assert len(data["participants"]) >= 2
