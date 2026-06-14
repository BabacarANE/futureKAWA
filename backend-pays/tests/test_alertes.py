import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base, get_db
from app.api.auth import hash_password
from app.models import Country, User, Exploitation, Warehouse
from app.models.alert import Alert

DATABASE_URL = "sqlite:///./test_alerts.db"
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
    # Créer toutes les tables dans le bon ordre
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
    db.flush()

    alert = Alert(
        warehouse_id=warehouse.id,
        type="out_of_range",
        message="Test alert conditions hors seuil",
        lot_id=None
    )
    db.add(alert)
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

def test_get_alerts(client, token):
    res = client.get(
        "/alerts/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) >= 1
    assert alerts[0]["type"] == "out_of_range"

def test_get_alerts_filter_type(client, token):
    res = client.get(
        "/alerts/?type=out_of_range",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    for alert in res.json():
        assert alert["type"] == "out_of_range"

def test_get_alert_by_id(client, token):
    res = client.get(
        "/alerts/1",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert res.json()["id"] == 1

def test_get_alert_not_found(client, token):
    res = client.get(
        "/alerts/9999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 404
