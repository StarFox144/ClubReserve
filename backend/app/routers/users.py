from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.club import Club
from app.models.computer import Computer
from app.models.review import Review
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth import get_current_admin_user, get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_update.email and user_update.email != current_user.email:
        if db.query(User).filter(User.email == user_update.email).first():
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = user_update.email

    if user_update.username and user_update.username != current_user.username:
        if db.query(User).filter(User.username == user_update.username).first():
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = user_update.username

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/stats")
def get_my_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id, Booking.status != "cancelled")
        .all()
    )
    total_bookings = len(bookings)
    total_hours = round(
        sum((b.end_time - b.start_time).total_seconds() / 3600 for b in bookings), 1
    )
    total_reviews = db.query(func.count(Review.id)).filter(Review.user_id == current_user.id).scalar() or 0

    club_counts: dict = {}
    for b in bookings:
        comp = db.query(Computer).filter(Computer.id == b.computer_id).first()
        if comp:
            club_counts[comp.club_id] = club_counts.get(comp.club_id, 0) + 1

    favorite_club = None
    if club_counts:
        fav_id = max(club_counts, key=club_counts.get)
        club = db.query(Club).filter(Club.id == fav_id).first()
        if club:
            favorite_club = club.name

    return {
        "total_bookings": total_bookings,
        "total_hours": total_hours,
        "total_reviews": total_reviews,
        "loyalty_points": current_user.loyalty_points or 0,
        "favorite_club": favorite_club,
    }


@router.get("/admin/all", response_model=List[UserResponse])
def list_all_users(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(User).order_by(User.id).all()


@router.patch("/{user_id}/toggle-admin", response_model=UserResponse)
def toggle_admin(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own admin status")
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/toggle-active", response_model=UserResponse)
def toggle_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user
