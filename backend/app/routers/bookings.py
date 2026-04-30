from datetime import timedelta
from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.computer import Computer
from app.models.promo import PromoCode
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.auth import get_current_user
from app.services.booking import check_overlap

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=List[BookingResponse])
def get_my_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if booking_data.start_time >= booking_data.end_time:
        raise HTTPException(status_code=400, detail="start_time must be before end_time")

    computer = db.query(Computer).filter(
        Computer.id == booking_data.computer_id, Computer.is_active == True
    ).first()
    if not computer:
        raise HTTPException(status_code=404, detail="Computer not found or inactive")

    if check_overlap(db, booking_data.computer_id, booking_data.start_time, booking_data.end_time):
        raise HTTPException(status_code=409, detail="Computer is already booked for this time slot")

    promo_code_str = None
    if booking_data.promo_code:
        promo = db.query(PromoCode).filter(
            PromoCode.code == booking_data.promo_code.upper(),
            PromoCode.is_active == True,
        ).first()
        if promo and (promo.max_uses is None or promo.used_count < promo.max_uses):
            promo.used_count += 1
            promo_code_str = promo.code

    booking = Booking(
        user_id=current_user.id,
        computer_id=booking_data.computer_id,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        promo_code=promo_code_str,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.post("/{booking_id}/extend", response_model=BookingResponse)
def extend_booking(
    booking_id: int,
    hours: int = Body(..., embed=True, ge=1, le=4),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if booking.status != "active":
        raise HTTPException(status_code=400, detail="Only active bookings can be extended")

    new_end = booking.end_time + timedelta(hours=hours)
    if check_overlap(db, booking.computer_id, booking.end_time, new_end, exclude_booking_id=booking_id):
        raise HTTPException(status_code=409, detail="Час зайнятий іншим бронюванням")

    booking.end_time = new_end
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
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    if booking.status != "active":
        raise HTTPException(status_code=400, detail=f"Booking is already {booking.status}")
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking
