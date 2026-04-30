from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/clubs", tags=["reviews"])


@router.get("/{club_id}/reviews", response_model=List[ReviewResponse])
def get_reviews(club_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.club_id == club_id)
        .order_by(Review.created_at.desc())
        .all()
    )


@router.post("/{club_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    club_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not (1 <= review_data.rating <= 5):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rating must be between 1 and 5")

    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.club_id == club_id,
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="You have already reviewed this club")

    review = Review(
        user_id=current_user.id,
        club_id=club_id,
        rating=review_data.rating,
        comment=review_data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
