from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.club import Club
from app.models.computer import Computer

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
def search(q: str = Query("", min_length=0), db: Session = Depends(get_db)):
    q = q.strip()
    if len(q) < 2:
        return {"clubs": [], "computers": []}

    pattern = f"%{q.lower()}%"

    clubs = (
        db.query(Club)
        .filter(
            Club.is_active == True,
            func.lower(Club.name).like(pattern)
            | func.lower(Club.address).like(pattern),
        )
        .limit(5)
        .all()
    )

    computers = (
        db.query(Computer)
        .filter(
            Computer.is_active == True,
            func.lower(Computer.name).like(pattern),
        )
        .limit(5)
        .all()
    )

    return {
        "clubs": [{"id": c.id, "name": c.name, "address": c.address} for c in clubs],
        "computers": [{"id": c.id, "name": c.name, "club_id": c.club_id} for c in computers],
    }
