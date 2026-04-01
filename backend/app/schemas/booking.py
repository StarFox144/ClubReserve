from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class BookingBase(BaseModel):
    computer_id: int
    start_time: datetime
    end_time: datetime


class BookingCreate(BookingBase):
    pass


class BookingResponse(BookingBase):
    id: int
    user_id: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class BookingCancel(BaseModel):
    booking_id: int
