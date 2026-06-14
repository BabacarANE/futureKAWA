import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base, get_db
from app.api.auth import hash_password
from app.models import Country, User, Exploitation, Warehouse

DATABASE_URL = "sqlite:///./test_lots.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    country = Country(
        code="BR", name="Bresil",
        ideal_temp=29.0, ideal_humidity=55.0,
        tolerance_temp=3.0, tolerance_humidity=2.0
    )
    db.add(country)
    db.flush()

    exploitation = Exploitation(
        name="Test Exploitation",
        country_code="BR", city="Manaus"
    )
    db.add(exploitation)
    db.flush()

    warehouse = Warehouse(
        name="Test Warehouse",
        location="Zone A",
        exploitation_id=exploitation.id
    )
    db.add(warehouse)
    db.flush()

    user = User(
        name="Test User",
        email="test@futurekawa.com",
        hashed_password=hash_password("testpass"),
        role="responsable_exploitation",
        country_code="BR"
    )
    db.add(user)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    from app.main import app
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

@pytest.fixture
def token(client):
    res = client.post(
        "/auth/token",
        data={"username": "test@futurekawa.com", "password": "testpass"}
    )
    return res.json()["access_token"]

def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_create_lot(client, token):
    res = client.post(
        "/lots/",
        json={
            "id": "BR-TEST-001",
            "exploitation_id": 1,
            "warehouse_id": 1,
            "quality_notes": "Test lot"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["id"] == "BR-TEST-001"
    assert data["status"] == "compliant"

def test_get_lots_fifo(client, token):
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/lots/", json={
        "id": "BR-TEST-001", "exploitation_id": 1, "warehouse_id": 1
    }, headers=headers)
    client.post("/lots/", json={
        "id": "BR-TEST-002", "exploitation_id": 1, "warehouse_id": 1
    }, headers=headers)
    res = client.get("/lots/", headers=headers)
    assert res.status_code == 200
    lots = res.json()
    assert len(lots) == 2
    dates = [l["storage_date"] for l in lots]
    assert dates == sorted(dates)

def test_create_lot_duplicate(client, token):
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/lots/", json={
        "id": "BR-DUP-001", "exploitation_id": 1, "warehouse_id": 1
    }, headers=headers)
    res = client.post("/lots/", json={
        "id": "BR-DUP-001", "exploitation_id": 1, "warehouse_id": 1
    }, headers=headers)
    assert res.status_code == 409

def test_get_lot_not_found(client, token):
    res = client.get(
        "/lots/INEXISTANT",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 404

def test_unauthorized(client):
    res = client.get("/lots/")
    assert res.status_code == 401
