"""
backend-pays/app/api/warehouses.py
Routes CRUD entrepôts + lecture exploitations pour chaque backend pays.
Ce fichier est importé dans main.py avec : from app.api.warehouses import router as warehouses_router
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.db.database import get_db
from app.models.warehouse import Warehouse
from app.models.exploitation import Exploitation
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter()


# ── Schémas ────────────────────────────────────────────────────────────────────
class WarehouseCreate(BaseModel):
    name: str
    location: Optional[str] = None
    exploitation_id: int


class WarehouseResponse(BaseModel):
    id: int
    name: str
    location: Optional[str]
    exploitation_id: int

    class Config:
        from_attributes = True


class ExploitationResponse(BaseModel):
    id: int
    name: str
    country_code: str
    city: Optional[str]

    class Config:
        from_attributes = True


# ── Warehouses ─────────────────────────────────────────────────────────────────

@router.get("/warehouses/", response_model=list[WarehouseResponse])
def get_warehouses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Warehouse).all()


@router.get("/warehouses/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    w = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return w


@router.post("/warehouses/", response_model=WarehouseResponse, status_code=201)
def create_warehouse(
    payload: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifier que l'exploitation existe
    exploitation = db.query(Exploitation).filter(
        Exploitation.id == payload.exploitation_id
    ).first()
    if not exploitation:
        raise HTTPException(
            status_code=404,
            detail=f"Exploitation {payload.exploitation_id} introuvable dans ce pays"
        )

    w = Warehouse(
        name=payload.name,
        location=payload.location,
        exploitation_id=payload.exploitation_id,
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    return w


@router.put("/warehouses/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(
    warehouse_id: int,
    payload: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    w = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    w.name     = payload.name
    w.location = payload.location
    db.commit()
    db.refresh(w)
    return w


@router.delete("/warehouses/{warehouse_id}", status_code=204)
def delete_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    w = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(w)
    db.commit()


# ── Exploitations ──────────────────────────────────────────────────────────────

class ExploitationCreate(BaseModel):
    name: str
    city: Optional[str] = None


@router.post("/exploitations/", response_model=ExploitationResponse, status_code=201)
def create_exploitation(
    payload: ExploitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import os
    pays_map = {'bresil': 'BR', 'equateur': 'EC', 'colombie': 'CO'}
    pays = os.getenv('PAYS', 'bresil').lower()
    country_code = pays_map.get(pays, pays.upper()[:2])

    e = Exploitation(name=payload.name, city=payload.city, country_code=country_code)
    db.add(e)
    db.commit()
    db.refresh(e)
    return e


@router.get("/exploitations/", response_model=list[ExploitationResponse])
def get_exploitations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Exploitation).all()


@router.get("/exploitations/{exploitation_id}", response_model=ExploitationResponse)
def get_exploitation(
    exploitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    e = db.query(Exploitation).filter(Exploitation.id == exploitation_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Exploitation not found")
    return e
