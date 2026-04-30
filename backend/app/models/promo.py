from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database import Base


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False, index=True)
    discount_percent = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    max_uses = Column(Integer, nullable=True)
    used_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
