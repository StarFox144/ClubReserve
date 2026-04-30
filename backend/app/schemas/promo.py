from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PromoCreate(BaseModel):
    code: str
    discount_percent: int
    max_uses: Optional[int] = None


class PromoResponse(BaseModel):
    id: int
    code: str
    discount_percent: int
    is_active: bool
    max_uses: Optional[int] = None
    used_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class PromoValidateResponse(BaseModel):
    valid: bool
    discount_percent: int = 0
    message: str = ""
