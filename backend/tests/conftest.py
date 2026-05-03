import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("DATABASE_URL", "postgresql://postgres:password@localhost:5432/clubreserve_test")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-ci")

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.club import Club
from app.models.computer import Computer
from app.services.auth import get_password_hash

TEST_DB_URL = os.environ["DATABASE_URL"]
engine = create_engine(TEST_DB_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_user(db):
    user = User(
        email="user@test.com",
        username="testuser",
        hashed_password=get_password_hash("password123"),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, test_user):
    resp = client.post("/auth/login", json={"email": "user@test.com", "password": "password123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_club(db):
    club = Club(name="Test Club", address="Test St 1", description="Desc", is_active=True)
    db.add(club)
    db.commit()
    db.refresh(club)
    return club


@pytest.fixture
def test_computer(db, test_club):
    computer = Computer(
        club_id=test_club.id, name="PC-1",
        description="Intel i7 · RTX 4070 · 16 GB RAM",
        is_active=True, price_per_hour=60,
    )
    db.add(computer)
    db.commit()
    db.refresh(computer)
    return computer
