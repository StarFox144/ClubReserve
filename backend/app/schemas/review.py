from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, model_validator


class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    club_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    username: Optional[str] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def extract_related(cls, obj: Any) -> Any:
        if not isinstance(obj, dict):
            user = getattr(obj, "user", None)
            return {
                "id": obj.id,
                "user_id": obj.user_id,
                "club_id": obj.club_id,
                "rating": obj.rating,
                "comment": obj.comment,
                "created_at": obj.created_at,
                "username": user.username if user else None,
            }
        return obj
