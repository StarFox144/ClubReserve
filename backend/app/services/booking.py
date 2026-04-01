from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.booking import Booking


def check_overlap(
    db: Session,
    computer_id: int,
    start_time: datetime,
    end_time: datetime,
    exclude_booking_id: Optional[int] = None,
) -> bool:
    """
    Returns True if there is an overlapping active booking for the given computer
    in the specified time range.
    """
    query = db.query(Booking).filter(
        Booking.computer_id == computer_id,
        Booking.status == "active",
        Booking.start_time < end_time,
        Booking.end_time > start_time,
    )
    if exclude_booking_id is not None:
        query = query.filter(Booking.id != exclude_booking_id)
    return query.first() is not None
