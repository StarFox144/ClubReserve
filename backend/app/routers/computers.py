from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.computer import Computer
from app.models.user import User
from app.schemas.computer import ComputerCreate, ComputerResponse
from app.services.auth import get_current_admin_user
from app.services.booking import check_overlap

router = APIRouter(prefix="/computers", tags=["computers"])


@router.get("", response_model=List[ComputerResponse])
def list_computers(
    club_id: Optional[int] = Query(None, description="Filter by club ID"),
    db: Session = Depends(get_db),
):
    query = db.query(Computer).filter(Computer.is_active == True)
    if club_id is not None:
        query = query.filter(Computer.club_id == club_id)
    return query.all()


@router.get("/{computer_id}", response_model=ComputerResponse)
def get_computer(computer_id: int, db: Session = Depends(get_db)):
    computer = db.query(Computer).filter(Computer.id == computer_id).first()
    if not computer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Computer not found")
    return computer


@router.post("", response_model=ComputerResponse, status_code=status.HTTP_201_CREATED)
def create_computer(
    computer_data: ComputerCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user),
):
    computer = Computer(**computer_data.model_dump())
    db.add(computer)
    db.commit()
    db.refresh(computer)
    return computer


@router.get("/{computer_id}/availability")
def check_availability(
    computer_id: int,
    start_time: datetime = Query(..., description="Start time ISO format"),
    end_time: datetime = Query(..., description="End time ISO format"),
    db: Session = Depends(get_db),
):
    computer = db.query(Computer).filter(Computer.id == computer_id).first()
    if not computer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Computer not found")
    if start_time >= end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_time must be before end_time",
        )
    has_overlap = check_overlap(db, computer_id, start_time, end_time)
    return {
        "computer_id": computer_id,
        "available": not has_overlap,
        "start_time": start_time,
        "end_time": end_time,
    }
