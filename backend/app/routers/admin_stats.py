from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.booking import Booking
from app.models.club import Club
from app.models.computer import Computer
from app.models.review import Review
from app.models.user import User
from app.models.promo import PromoCode
from app.services.auth import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_clubs = db.query(func.count(Club.id)).scalar() or 0
    total_computers = db.query(func.count(Computer.id)).scalar() or 0
    total_bookings = db.query(func.count(Booking.id)).scalar() or 0
    active_bookings = db.query(func.count(Booking.id)).filter(Booking.status == "active").scalar() or 0
    cancelled_bookings = db.query(func.count(Booking.id)).filter(Booking.status == "cancelled").scalar() or 0
    total_reviews = db.query(func.count(Review.id)).scalar() or 0
    active_promos = db.query(func.count(PromoCode.id)).filter(PromoCode.is_active == True).scalar() or 0

    bookings_with_price = (
        db.query(Booking, Computer.price_per_hour)
        .join(Computer, Booking.computer_id == Computer.id)
        .filter(Booking.status.in_(["active", "completed"]), Computer.price_per_hour.isnot(None))
        .all()
    )
    total_revenue = sum(
        (b.end_time - b.start_time).total_seconds() / 3600 * float(price)
        for b, price in bookings_with_price
        if price
    )

    top_computers = (
        db.query(Computer.name, Club.name.label("club_name"), func.count(Booking.id).label("cnt"))
        .join(Booking, Booking.computer_id == Computer.id)
        .join(Club, Computer.club_id == Club.id)
        .group_by(Computer.id, Computer.name, Club.name)
        .order_by(func.count(Booking.id).desc())
        .limit(5)
        .all()
    )

    bookings_per_day = (
        db.query(
            func.date(Booking.created_at).label("day"),
            func.count(Booking.id).label("cnt"),
        )
        .group_by(func.date(Booking.created_at))
        .order_by(func.date(Booking.created_at))
        .limit(14)
        .all()
    )

    return {
        "total_users": total_users,
        "total_clubs": total_clubs,
        "total_computers": total_computers,
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        "cancelled_bookings": cancelled_bookings,
        "total_reviews": total_reviews,
        "active_promos": active_promos,
        "total_revenue": round(total_revenue, 2),
        "top_computers": [
            {"computer_name": name, "club_name": club, "bookings_count": cnt}
            for name, club, cnt in top_computers
        ],
        "bookings_by_day": [
            {"day": str(day), "count": cnt}
            for day, cnt in bookings_per_day
        ],
    }


@router.get("/reviews")
def get_all_reviews(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    reviews = (
        db.query(Review)
        .options(joinedload(Review.user), joinedload(Review.club))
        .order_by(Review.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "username": r.user.username if r.user else None,
            "club_id": r.club_id,
            "club_name": r.club.name if r.club else None,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
        }
        for r in reviews
    ]


@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return {"status": "deleted"}


@router.get("/bookings")
def get_all_bookings(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    bookings = (
        db.query(Booking)
        .options(
            joinedload(Booking.user),
            joinedload(Booking.computer).joinedload(Computer.club),
        )
        .order_by(Booking.created_at.desc())
        .limit(200)
        .all()
    )
    return [
        {
            "id": b.id,
            "user_id": b.user_id,
            "username": b.user.username if b.user else None,
            "computer_id": b.computer_id,
            "computer_name": b.computer.name if b.computer else None,
            "club_name": b.computer.club.name if (b.computer and b.computer.club) else None,
            "start_time": b.start_time,
            "end_time": b.end_time,
            "status": b.status,
            "created_at": b.created_at,
        }
        for b in bookings
    ]
