from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.models.country import Country
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter()


class CountryConfig(BaseModel):
    ideal_temp: float
    ideal_humidity: float
    tolerance_temp: float
    tolerance_humidity: float

class CountryCreate(BaseModel):
    code: str
    name: str
    ideal_temp: float
    ideal_humidity: float
    tolerance_temp: float = 3.0
    tolerance_humidity: float = 2.0


def _serialize(c: Country) -> dict:
    return {
        "code":              c.code,
        "name":              c.name,
        "ideal_temp":        c.ideal_temp,
        "ideal_humidity":    c.ideal_humidity,
        "tolerance_temp":    c.tolerance_temp,
        "tolerance_humidity": c.tolerance_humidity,
    }


@router.post("/", status_code=201)
def create_country(
    payload: CountryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("siege", "admin"):
        raise HTTPException(status_code=403, detail="Forbidden")
    code = payload.code.upper()
    if db.query(Country).filter(Country.code == code).first():
        raise HTTPException(status_code=400, detail="Code pays déjà utilisé")
    c = Country(
        code=code,
        name=payload.name,
        ideal_temp=payload.ideal_temp,
        ideal_humidity=payload.ideal_humidity,
        tolerance_temp=payload.tolerance_temp,
        tolerance_humidity=payload.tolerance_humidity,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _serialize(c)


@router.get("/")
def list_countries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return [_serialize(c) for c in db.query(Country).all()]


@router.get("/{code}")
def get_country(
    code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    c = db.query(Country).filter(Country.code == code.upper()).first()
    if not c:
        raise HTTPException(status_code=404, detail="Pays introuvable")
    return _serialize(c)


@router.put("/{code}")
def update_country(
    code: str,
    payload: CountryConfig,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("siege", "admin"):
        raise HTTPException(status_code=403, detail="Forbidden")
    c = db.query(Country).filter(Country.code == code.upper()).first()
    if not c:
        raise HTTPException(status_code=404, detail="Pays introuvable")
    c.ideal_temp        = payload.ideal_temp
    c.ideal_humidity    = payload.ideal_humidity
    c.tolerance_temp    = payload.tolerance_temp
    c.tolerance_humidity = payload.tolerance_humidity
    db.commit()
    db.refresh(c)
    return _serialize(c)
