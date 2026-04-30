from datetime import datetime
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
from app.schemas.club import ClubCreate, ClubResponse, ClubUpdate, ClubWithStats
from app.services.auth import get_current_admin_user

router = APIRouter(prefix="/clubs", tags=["clubs"])


@router.get("", response_model=List[ClubWithStats])
def list_clubs(db: Session = Depends(get_db)):
    clubs = db.query(Club).filter(Club.is_active == True).all()
    result = []
    for club in clubs:
        avg_r = db.query(func.avg(Review.rating)).filter(Review.club_id == club.id).scalar()
        rev_count = db.query(func.count(Review.id)).filter(Review.club_id == club.id).scalar() or 0
        min_p = db.query(func.min(Computer.price_per_hour)).filter(
            Computer.club_id == club.id, Computer.is_active == True
        ).scalar()
        result.append({
            "id": club.id, "name": club.name, "address": club.address,
            "description": club.description, "is_active": club.is_active,
            "created_at": club.created_at,
            "avg_rating": round(float(avg_r), 2) if avg_r else None,
            "review_count": rev_count,
            "min_price": float(min_p) if min_p else None,
        })
    return result


@router.get("/admin/all", response_model=List[ClubResponse])
def list_all_clubs_admin(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    return db.query(Club).order_by(Club.id).all()


@router.get("/{club_id}", response_model=ClubResponse)
def get_club(club_id: int, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    return club


@router.get("/{club_id}/busy-computers")
def get_busy_computers(club_id: int, db: Session = Depends(get_db)):
    now = datetime.utcnow()
    rows = (
        db.query(Booking.computer_id)
        .join(Computer, Booking.computer_id == Computer.id)
        .filter(
            Computer.club_id == club_id,
            Booking.status == "active",
            Booking.start_time <= now,
            Booking.end_time >= now,
        )
        .all()
    )
    return {"busy_ids": [r[0] for r in rows]}


@router.post("", response_model=ClubResponse, status_code=status.HTTP_201_CREATED)
def create_club(
    club_data: ClubCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    club = Club(**club_data.model_dump())
    db.add(club)
    db.commit()
    db.refresh(club)
    return club


@router.put("/{club_id}", response_model=ClubResponse)
def update_club(
    club_id: int,
    club_data: ClubUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    for field, value in club_data.model_dump(exclude_unset=True).items():
        setattr(club, field, value)
    db.commit()
    db.refresh(club)
    return club


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_club(
    club_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    db.delete(club)
    db.commit()
