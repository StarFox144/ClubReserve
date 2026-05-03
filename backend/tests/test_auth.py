def test_register_success(client):
    resp = client.post("/auth/register", json={
        "email": "new@test.com", "username": "newuser", "password": "pass123",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "new@test.com"
    assert data["username"] == "newuser"
    assert "hashed_password" not in data


def test_register_duplicate_email(client, test_user):
    resp = client.post("/auth/register", json={
        "email": "user@test.com", "username": "other", "password": "pass123",
    })
    assert resp.status_code == 400
    assert "Email" in resp.json()["detail"]


def test_register_duplicate_username(client, test_user):
    resp = client.post("/auth/register", json={
        "email": "other@test.com", "username": "testuser", "password": "pass123",
    })
    assert resp.status_code == 400
    assert "Username" in resp.json()["detail"]


def test_login_success(client, test_user):
    resp = client.post("/auth/login", json={"email": "user@test.com", "password": "password123"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user):
    resp = client.post("/auth/login", json={"email": "user@test.com", "password": "wrongpass"})
    assert resp.status_code == 401


def test_login_nonexistent_email(client):
    resp = client.post("/auth/login", json={"email": "nobody@test.com", "password": "pass"})
    assert resp.status_code == 401
