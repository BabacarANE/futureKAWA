from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from datetime import datetime, date, timezone
from typing import Optional
from app.db.database import get_db
from app.models.expedition import Expedition
from app.models.lot import Lot
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter()


class ClientInfo(BaseModel):
    id:      int
    name:    str
    company: Optional[str]
    email:   Optional[str]

    class Config:
        from_attributes = True


class ExpeditionCreate(BaseModel):
    lot_id:             str
    client_id:          Optional[int] = None
    destination:        str
    carrier:            Optional[str] = None
    tracking_number:    Optional[str] = None
    estimated_arrival:  Optional[date] = None
    notes:              Optional[str] = None


class ExpeditionUpdate(BaseModel):
    client_id:          Optional[int] = None
    destination:        Optional[str] = None
    carrier:            Optional[str] = None
    tracking_number:    Optional[str] = None
    status:             Optional[str] = None
    estimated_arrival:  Optional[date] = None
    delivered_at:       Optional[datetime] = None
    notes:              Optional[str] = None


class ExpeditionResponse(BaseModel):
    id:                 int
    lot_id:             str
    client_id:          Optional[int]
    client:             Optional[ClientInfo]
    destination:        str
    carrier:            Optional[str]
    tracking_number:    Optional[str]
    status:             str
    notes:              Optional[str]
    shipped_at:         datetime
    estimated_arrival:  Optional[date]
    delivered_at:       Optional[datetime]

    class Config:
        from_attributes = True


VALID_STATUSES = {"en_route", "livre", "annule"}


@router.get("/", response_model=list[ExpeditionResponse])
def list_expeditions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Expedition)
        .options(joinedload(Expedition.client))
        .order_by(Expedition.shipped_at.desc())
        .all()
    )


@router.post("/", response_model=ExpeditionResponse, status_code=status.HTTP_201_CREATED)
def create_expedition(
    payload: ExpeditionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lot = db.query(Lot).filter(Lot.id == payload.lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot introuvable")
    if lot.status == "shipped":
        raise HTTPException(status_code=409, detail="Ce lot est déjà expédié")

    existing = db.query(Expedition).filter(Expedition.lot_id == payload.lot_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Une expédition existe déjà pour ce lot")

    expedition = Expedition(
        lot_id=payload.lot_id,
        client_id=payload.client_id,
        destination=payload.destination,
        carrier=payload.carrier,
        tracking_number=payload.tracking_number,
        estimated_arrival=payload.estimated_arrival,
        notes=payload.notes,
        status="en_route",
        shipped_at=datetime.now(timezone.utc),
    )
    db.add(expedition)

    lot.status = "shipped"
    db.commit()

    # Reload avec la relation client chargée
    return (
        db.query(Expedition)
        .options(joinedload(Expedition.client))
        .filter(Expedition.id == expedition.id)
        .first()
    )


@router.get("/{expedition_id}", response_model=ExpeditionResponse)
def get_expedition(
    expedition_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exp = (
        db.query(Expedition)
        .options(joinedload(Expedition.client))
        .filter(Expedition.id == expedition_id)
        .first()
    )
    if not exp:
        raise HTTPException(status_code=404, detail="Expédition introuvable")
    return exp


@router.put("/{expedition_id}", response_model=ExpeditionResponse)
def update_expedition(
    expedition_id: int,
    payload: ExpeditionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exp = db.query(Expedition).filter(Expedition.id == expedition_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expédition introuvable")

    if payload.status is not None and payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Statut invalide. Valeurs : {VALID_STATUSES}")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(exp, field, value)

    # Si livré → mettre à jour delivered_at et le statut du lot
    if payload.status == "livre":
        if not exp.delivered_at:
            exp.delivered_at = datetime.now(timezone.utc)
        lot = db.query(Lot).filter(Lot.id == exp.lot_id).first()
        if lot:
            lot.status = "shipped"

    # Si annulé → remettre le lot en compliant
    if payload.status == "annule":
        lot = db.query(Lot).filter(Lot.id == exp.lot_id).first()
        if lot:
            lot.status = "compliant"

    db.commit()

    return (
        db.query(Expedition)
        .options(joinedload(Expedition.client))
        .filter(Expedition.id == exp.id)
        .first()
    )


@router.delete("/{expedition_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_expedition(
    expedition_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exp = db.query(Expedition).filter(Expedition.id == expedition_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Expédition introuvable")

    lot = db.query(Lot).filter(Lot.id == exp.lot_id).first()
    if lot:
        lot.status = "compliant"

    db.delete(exp)
    db.commit()
