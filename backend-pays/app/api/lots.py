from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
from app.db.database import get_db
from app.models.lot import Lot
from app.models.warehouse import Warehouse
from app.models.exploitation import Exploitation
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter()

class LotCreate(BaseModel):
    id: str
    exploitation_id: int
    warehouse_id: int
    quality_notes: Optional[str] = None

class LotResponse(BaseModel):
    id: str
    exploitation_id: int
    warehouse_id: int
    storage_date: datetime
    status: str
    quality_notes: Optional[str]

    class Config:
        from_attributes = True

@router.get("/", response_model=list[LotResponse])
def get_lots(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Lot).order_by(Lot.storage_date.asc()).all()

@router.get("/{lot_id}", response_model=LotResponse)
def get_lot(
    lot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    return lot

@router.post("/", response_model=LotResponse, status_code=status.HTTP_201_CREATED)
def create_lot(
    payload: LotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Lot).filter(Lot.id == payload.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Lot ID already exists")

    warehouse = db.query(Warehouse).filter(Warehouse.id == payload.warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    exploitation = db.query(Exploitation).filter(Exploitation.id == payload.exploitation_id).first()
    if not exploitation:
        raise HTTPException(status_code=404, detail="Exploitation not found")

    lot = Lot(
        id=payload.id,
        exploitation_id=payload.exploitation_id,
        warehouse_id=payload.warehouse_id,
        storage_date=datetime.now(timezone.utc),
        status="compliant",
        quality_notes=payload.quality_notes
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return lot

class LotUpdate(BaseModel):
    quality_notes: Optional[str] = None
    status: Optional[str] = None
    warehouse_id: Optional[int] = None

@router.put("/{lot_id}", response_model=LotResponse)
def update_lot(
    lot_id: str,
    payload: LotUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    allowed_statuses = ["compliant", "alert", "expired"]
    if payload.status is not None:
        if payload.status not in allowed_statuses:
            raise HTTPException(status_code=400, detail=f"Status must be one of {allowed_statuses}")
        lot.status = payload.status
    if payload.quality_notes is not None:
        lot.quality_notes = payload.quality_notes or None
    if payload.warehouse_id is not None:
        wh = db.query(Warehouse).filter(Warehouse.id == payload.warehouse_id).first()
        if not wh:
            raise HTTPException(status_code=404, detail="Warehouse not found")
        lot.warehouse_id = payload.warehouse_id
    db.commit()
    db.refresh(lot)
    return lot

@router.patch("/{lot_id}/status")
def update_lot_status(
    lot_id: str,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allowed = ["compliant", "alert", "expired"]
    if status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed}")

    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    lot.status = status
    db.commit()
    return {"id": lot_id, "status": status}

@router.delete("/{lot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lot(
    lot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    db.delete(lot)
    db.commit()
