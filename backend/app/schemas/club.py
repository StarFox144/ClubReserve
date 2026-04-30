from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ClubBase(BaseModel):
    name: str
    address: Optional[str] = None
    description: Optional[str] = None


class ClubCreate(ClubBase):
    pass


class ClubUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ClubResponse(ClubBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ClubWithStats(ClubResponse):
    avg_rating: Optional[float] = None
    review_count: int = 0
    min_price: Optional[float] = None
