import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import Base, get_db
from app.api.auth import hash_password
from app.models import Country, User

DATABASE_URL = "sqlite:///./test_auth.db"
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
    admin_user = User(
        name="Admin Siege",
        email="admin.siege@futurekawa.com",
        hashed_password=hash_password("adminpass"),
        role="siege",
        country_code=None
    )
    db.add(admin_user)

    normal_user = User(
        name="User Normal",
        email="user@futurekawa.com",
        hashed_password=hash_password("userpass"),
        role="responsable_entrepot",
        country_code="BR"
    )
    db.add(normal_user)
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
def admin_token(client):
    res = client.post(
        "/auth/token",
        data={"username": "admin.siege@futurekawa.com", "password": "adminpass"}
    )
    return res.json()["access_token"]


@pytest.fixture
def user_token(client):
    res = client.post(
        "/auth/token",
        data={"username": "user@futurekawa.com", "password": "userpass"}
    )
    return res.json()["access_token"]


def test_admin_can_create_user(client, admin_token):
    response = client.post(
        "/auth/users",
        json={
            "name": "New User",
            "email": "new.user@futurekawa.com",
            "password": "newpass",
            "role": "qualite",
            "country_code": "BR"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 201
    content = response.json()
    assert content["email"] == "new.user@futurekawa.com"
    assert content["role"] == "qualite"


def test_non_admin_cannot_create_user(client, user_token):
    response = client.post(
        "/auth/users",
        json={
            "name": "New User",
            "email": "new.user2@futurekawa.com",
            "password": "newpass",
            "role": "qualite",
            "country_code": "BR"
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin privileges required"


def test_admin_can_list_roles(client, admin_token):
    response = client.get(
        "/auth/roles",
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 200
    assert "roles" in response.json()
    assert "siege" in response.json()["roles"]


def test_admin_can_list_users(client, admin_token):
    response = client.get(
        "/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)
    assert any(user["email"] == "admin.siege@futurekawa.com" for user in users)


def test_admin_can_update_user(client, admin_token):
    response = client.get(
        "/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    user_list = response.json()
    user_id = next(user["id"] for user in user_list if user["email"] == "user@futurekawa.com")

    update_response = client.put(
        f"/auth/users/{user_id}",
        json={"name": "User Mis à Jour", "role": "qualite"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert update_response.status_code == 200
    assert update_response.json()["name"] == "User Mis à Jour"
    assert update_response.json()["role"] == "qualite"


def test_admin_can_delete_user(client, admin_token):
    create_response = client.post(
        "/auth/users",
        json={
            "name": "Delete Me",
            "email": "delete.me@futurekawa.com",
            "password": "deletepass",
            "role": "qualite",
            "country_code": "BR"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/auth/users/{user_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert delete_response.status_code == 204
    list_response = client.get(
        "/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert all(user["id"] != user_id for user in list_response.json())
