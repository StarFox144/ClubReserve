from typing import Optional

from pydantic import BaseModel


class ComputerBase(BaseModel):
    name: str
    description: Optional[str] = None
    club_id: int
    price_per_hour: Optional[float] = None


class ComputerCreate(ComputerBase):
    pass


class ComputerUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    price_per_hour: Optional[float] = None


class ComputerResponse(ComputerBase):
    id: int
    is_active: bool

    model_config = {"from_attributes": True}
