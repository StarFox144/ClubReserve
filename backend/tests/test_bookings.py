from datetime import datetime, timedelta


def _future(hours_from_now, extra_hours=1):
    start = datetime.now() + timedelta(hours=hours_from_now)
    end = start + timedelta(hours=extra_hours)
    return start.strftime("%Y-%m-%dT%H:%M"), end.strftime("%Y-%m-%dT%H:%M")


def test_get_bookings_requires_auth(client):
    resp = client.get("/bookings")
    assert resp.status_code == 401


def test_create_booking_success(client, auth_headers, test_computer):
    start, end = _future(1)
    resp = client.post("/bookings", json={
        "computer_id": test_computer.id, "start_time": start, "end_time": end,
    }, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "active"
    assert data["computer_id"] == test_computer.id


def test_create_booking_requires_auth(client, test_computer):
    start, end = _future(1)
    resp = client.post("/bookings", json={
        "computer_id": test_computer.id, "start_time": start, "end_time": end,
    })
    assert resp.status_code == 401


def test_create_booking_overlap(client, auth_headers, test_computer):
    start, end = _future(1, 2)
    body = {"computer_id": test_computer.id, "start_time": start, "end_time": end}
    client.post("/bookings", json=body, headers=auth_headers)
    resp = client.post("/bookings", json=body, headers=auth_headers)
    assert resp.status_code == 409


def test_create_booking_end_before_start(client, auth_headers, test_computer):
    start, end = _future(2, 1)
    resp = client.post("/bookings", json={
        "computer_id": test_computer.id, "start_time": end, "end_time": start,
    }, headers=auth_headers)
    assert resp.status_code == 400


def test_cancel_booking(client, auth_headers, test_computer):
    start, end = _future(1)
    create_resp = client.post("/bookings", json={
        "computer_id": test_computer.id, "start_time": start, "end_time": end,
    }, headers=auth_headers)
    booking_id = create_resp.json()["id"]

    cancel_resp = client.delete(f"/bookings/{booking_id}", headers=auth_headers)
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["status"] == "cancelled"


def test_cancel_already_cancelled(client, auth_headers, test_computer):
    start, end = _future(1)
    create_resp = client.post("/bookings", json={
        "computer_id": test_computer.id, "start_time": start, "end_time": end,
    }, headers=auth_headers)
    booking_id = create_resp.json()["id"]
    client.delete(f"/bookings/{booking_id}", headers=auth_headers)
    resp = client.delete(f"/bookings/{booking_id}", headers=auth_headers)
    assert resp.status_code == 400


def test_my_bookings_list(client, auth_headers, test_computer):
    start, end = _future(1)
    client.post("/bookings", json={
        "computer_id": test_computer.id, "start_time": start, "end_time": end,
    }, headers=auth_headers)
    resp = client.get("/bookings", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_past_bookings_auto_completed(client, auth_headers, test_computer, db):
    from app.models.booking import Booking
    from app.models.user import User

    user = db.query(User).filter(User.email == "user@test.com").first()
    past = Booking(
        user_id=user.id,
        computer_id=test_computer.id,
        start_time=datetime.now() - timedelta(hours=3),
        end_time=datetime.now() - timedelta(hours=1),
        status="active",
    )
    db.add(past); db.commit()

    resp = client.get("/bookings", headers=auth_headers)
    bookings = resp.json()
    assert len(bookings) == 1
    assert bookings[0]["status"] == "completed"
