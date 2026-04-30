from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, model_validator


class BookingBase(BaseModel):
    computer_id: int
    start_time: datetime
    end_time: datetime


class BookingCreate(BookingBase):
    promo_code: Optional[str] = None


class BookingResponse(BookingBase):
    id: int
    user_id: int
    status: str
    promo_code: Optional[str] = None
    created_at: datetime
    computer_name: Optional[str] = None
    club_name: Optional[str] = None

    model_config = {"from_attributes": True}

    @model_validator(mode='before')
    @classmethod
    def extract_related(cls, obj: Any) -> Any:
        if not isinstance(obj, dict):
            computer = getattr(obj, 'computer', None)
            return {
                'id': obj.id,
                'user_id': obj.user_id,
                'computer_id': obj.computer_id,
                'start_time': obj.start_time,
                'end_time': obj.end_time,
                'status': obj.status,
                'promo_code': obj.promo_code,
                'created_at': obj.created_at,
                'computer_name': computer.name if computer else None,
                'club_name': computer.club.name if (computer and computer.club) else None,
            }
        return obj
