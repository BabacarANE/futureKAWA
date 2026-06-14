from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional
from app.db.database import get_db
from app.models.measure import Measure
from app.models.warehouse import Warehouse
from app.models.country import Country
from app.models.exploitation import Exploitation
from app.api.auth import get_current_user
from app.models.user import User
from app.config import get_settings

router = APIRouter()
settings = get_settings()

class MeasureCreate(BaseModel):
    warehouse_id: int
    temperature: float
    humidity: float

class MeasureResponse(BaseModel):
    id: int
    warehouse_id: int
    temperature: float
    humidity: float
    timestamp: datetime
    status: str

    class Config:
        from_attributes = True

def compute_status(
    temperature: float,
    humidity: float,
    country_code: str,
    db: Session
) -> str:
    country = db.query(Country).filter(Country.code == country_code).first()
    if not country:
        return "normal"

    temp_ok = abs(temperature - country.ideal_temp) <= country.tolerance_temp
    hum_ok = abs(humidity - country.ideal_humidity) <= country.tolerance_humidity

    return "normal" if (temp_ok and hum_ok) else "out_of_range"

@router.get("/", response_model=list[MeasureResponse])
def get_measures(
    warehouse_id: Optional[int] = Query(None),
    from_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Measure)
    if warehouse_id:
        query = query.filter(Measure.warehouse_id == warehouse_id)
    if from_date:
        query = query.filter(Measure.timestamp >= from_date)
    return query.order_by(Measure.timestamp.asc()).all()

@router.get("/warehouse/{warehouse_id}/latest", response_model=MeasureResponse)
def get_latest_measure(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    measure = (
        db.query(Measure)
        .filter(Measure.warehouse_id == warehouse_id)
        .order_by(Measure.timestamp.desc())
        .first()
    )
    if not measure:
        raise HTTPException(status_code=404, detail="No measures found")
    return measure

@router.post("/", response_model=MeasureResponse)
def create_measure(
    payload: MeasureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == payload.warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    exploitation = db.query(Exploitation).filter(
        Exploitation.id == warehouse.exploitation_id
    ).first()

    status = compute_status(
        payload.temperature,
        payload.humidity,
        exploitation.country_code,
        db
    )

    measure = Measure(
        warehouse_id=payload.warehouse_id,
        temperature=payload.temperature,
        humidity=payload.humidity,
        timestamp=datetime.now(timezone.utc),
        status=status
    )
    db.add(measure)
    db.commit()
    db.refresh(measure)
    return measure
