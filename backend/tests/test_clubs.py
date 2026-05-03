def test_list_clubs_empty(client):
    resp = client.get("/clubs")
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_clubs(client, test_club):
    resp = client.get("/clubs")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Club"
    assert data[0]["address"] == "Test St 1"


def test_list_clubs_excludes_inactive(client, db):
    from app.models.club import Club
    club = Club(name="Inactive", address="Somewhere", description="", is_active=False)
    db.add(club); db.commit()
    resp = client.get("/clubs")
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_club(client, test_club):
    resp = client.get(f"/clubs/{test_club.id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Test Club"


def test_get_club_not_found(client):
    resp = client.get("/clubs/99999")
    assert resp.status_code == 404


def test_busy_computers_empty(client, test_club):
    resp = client.get(f"/clubs/{test_club.id}/busy-computers")
    assert resp.status_code == 200
    assert resp.json() == {"busy_ids": []}


def test_busy_computers_with_active_booking(client, auth_headers, test_club, test_computer, db):
    from datetime import datetime, timedelta
    from zoneinfo import ZoneInfo
    from app.models.booking import Booking
    from app.models.user import User

    kyiv_now = datetime.now(ZoneInfo("Europe/Kyiv")).replace(tzinfo=None)
    user = db.query(User).filter(User.email == "user@test.com").first()
    booking = Booking(
        user_id=user.id,
        computer_id=test_computer.id,
        start_time=kyiv_now - timedelta(minutes=30),
        end_time=kyiv_now + timedelta(hours=1),
        status="active",
    )
    db.add(booking); db.commit()

    resp = client.get(f"/clubs/{test_club.id}/busy-computers")
    assert test_computer.id in resp.json()["busy_ids"]
