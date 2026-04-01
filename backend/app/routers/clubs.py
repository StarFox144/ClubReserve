from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.club import Club
from app.models.user import User
from app.schemas.club import ClubCreate, ClubResponse, ClubUpdate
from app.services.auth import get_current_admin_user

router = APIRouter(prefix="/clubs", tags=["clubs"])


@router.get("", response_model=List[ClubResponse])
def list_clubs(db: Session = Depends(get_db)):
    clubs = db.query(Club).filter(Club.is_active == True).all()
    return clubs


@router.get("/{club_id}", response_model=ClubResponse)
def get_club(club_id: int, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.id == club_id).first()
    if not club:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Club not found")
    return club


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
    update_data = club_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(club, field, value)
    db.commit()
    db.refresh(club)
    return club
