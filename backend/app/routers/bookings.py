from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.computer import Computer
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.auth import get_current_user
from app.services.booking import check_overlap

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=List[BookingResponse])
def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return bookings


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if booking_data.start_time >= booking_data.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_time must be before end_time",
        )

    computer = db.query(Computer).filter(
        Computer.id == booking_data.computer_id,
        Computer.is_active == True,
    ).first()
    if not computer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Computer not found or inactive",
        )

    has_overlap = check_overlap(
        db,
        booking_data.computer_id,
        booking_data.start_time,
        booking_data.end_time,
    )
    if has_overlap:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Computer is already booked for this time slot",
        )

    booking = Booking(
        user_id=current_user.id,
        computer_id=booking_data.computer_id,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.delete("/{booking_id}", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if booking.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Booking is already {booking.status}",
        )
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking
