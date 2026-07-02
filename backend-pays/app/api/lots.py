from fastapi import APIRouter, Depends, HTTPException, status, Query
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
    shipped_at: Optional[datetime]
    shipped_by: Optional[int]

    class Config:
        from_attributes = True

# ── Lots actifs (hors shipped) ──────────────────────────────
@router.get("/", response_model=list[LotResponse])
def get_lots(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Lot)
        .filter(Lot.status != "shipped")
        .order_by(Lot.storage_date.asc())
        .all()
    )

# ── Historique (lots expédiés) ──────────────────────────────
@router.get("/history", response_model=list[LotResponse])
def get_lots_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Lot)
        .filter(Lot.status == "shipped")
        .order_by(Lot.shipped_at.desc())
        .all()
    )

# ── Détail lot ──────────────────────────────────────────────
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

# ── Créer lot ───────────────────────────────────────────────
@router.post("/", response_model=LotResponse, status_code=status.HTTP_201_CREATED)
def create_lot(
    payload: LotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [
        "responsable_exploitation", "responsable_entrepot", "siege"
    ]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if db.query(Lot).filter(Lot.id == payload.id).first():
        raise HTTPException(status_code=409, detail="Lot ID already exists")

    warehouse = db.query(Warehouse).filter(
        Warehouse.id == payload.warehouse_id
    ).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    exploitation = db.query(Exploitation).filter(
        Exploitation.id == payload.exploitation_id
    ).first()
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

# ── Expédier lot (sortie) ───────────────────────────────────
@router.post("/{lot_id}/ship")
def ship_lot(
    lot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "siege":
        raise HTTPException(status_code=403, detail="Only siege users can ship lots")

    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    if lot.status == "shipped":
        raise HTTPException(status_code=409, detail="Lot already shipped")

    lot.status = "shipped"
    lot.shipped_at = datetime.now(timezone.utc)
    lot.shipped_by = current_user.id
    db.commit()
    return {
        "id": lot_id,
        "status": "shipped",
        "shipped_at": lot.shipped_at,
        "shipped_by": current_user.id.encode("utf-8").decode("utf-8")
    }

# ── Annuler sortie ──────────────────────────────────────────
@router.post("/{lot_id}/unship")
def unship_lot(
    lot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "siege":
        raise HTTPException(status_code=403, detail="Only siege users can cancel shipments")

    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    if lot.status != "shipped":
        raise HTTPException(status_code=409, detail="Lot is not shipped")

    lot.status = "compliant"
    lot.shipped_at = None
    lot.shipped_by = None
    db.commit()
    return {"id": lot_id, "status": "compliant"}

# ── Modifier statut ─────────────────────────────────────────
@router.patch("/{lot_id}/status")
def update_lot_status(
    lot_id: str,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allowed = ["compliant", "alert", "expired"]
    if status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of {allowed}"
        )
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    lot.status = status
    db.commit()
    return {"id": lot_id, "status": status}

# ── Supprimer lot ───────────────────────────────────────────
@router.delete("/{lot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lot(
    lot_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["siege", "responsable_exploitation"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    db.delete(lot)
    db.commit()
