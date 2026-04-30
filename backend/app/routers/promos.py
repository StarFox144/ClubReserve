from typing import List

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.promo import PromoCode
from app.models.user import User
from app.schemas.promo import PromoCreate, PromoResponse, PromoValidateResponse
from app.services.auth import get_current_admin_user

router = APIRouter(prefix="/promos", tags=["promos"])


@router.get("", response_model=List[PromoResponse])
def list_promos(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return db.query(PromoCode).order_by(PromoCode.id.desc()).all()


@router.post("", response_model=PromoResponse, status_code=status.HTTP_201_CREATED)
def create_promo(
    data: PromoCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    if not (1 <= data.discount_percent <= 100):
        raise HTTPException(status_code=400, detail="Discount must be between 1 and 100")
    if db.query(PromoCode).filter(PromoCode.code == data.code.upper()).first():
        raise HTTPException(status_code=409, detail="Code already exists")
    promo = PromoCode(code=data.code.upper(), discount_percent=data.discount_percent, max_uses=data.max_uses)
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo


@router.patch("/{promo_id}/toggle", response_model=PromoResponse)
def toggle_promo(promo_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    promo = db.query(PromoCode).filter(PromoCode.id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo not found")
    promo.is_active = not promo.is_active
    db.commit()
    db.refresh(promo)
    return promo


@router.post("/validate", response_model=PromoValidateResponse)
def validate_promo(code: str = Body(..., embed=True), db: Session = Depends(get_db)):
    promo = db.query(PromoCode).filter(PromoCode.code == code.upper(), PromoCode.is_active == True).first()
    if not promo:
        return PromoValidateResponse(valid=False, message="Код не знайдено або неактивний")
    if promo.max_uses is not None and promo.used_count >= promo.max_uses:
        return PromoValidateResponse(valid=False, message="Код вичерпано")
    return PromoValidateResponse(valid=True, discount_percent=promo.discount_percent, message="")
