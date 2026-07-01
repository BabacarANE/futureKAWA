"""
backend-siege/app/api/warehouses.py
Routes warehouses agrégées — GET + POST (création) maintenant fonctionnels.
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
import httpx
from app.config import get_settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
settings = get_settings()

COUNTRY_URLS = {
    "BR": settings.api_bresil,
    "EC": settings.api_equateur,
    "CO": settings.api_colombie,
}


async def fetch_json(url: str, token: str):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(url, headers={"Authorization": f"Bearer {token}"})
            if res.status_code == 200:
                return res.json()
    except Exception:
        pass
    return None


# ── GET /warehouses/ — tous les entrepôts de tous les pays ───────────────────
@router.get("/")
async def get_all_warehouses(token: str = Depends(oauth2_scheme)):
    all_warehouses = []
    for code, base_url in COUNTRY_URLS.items():
        data = await fetch_json(f"{base_url}/warehouses/", token)
        if data:
            for w in data:
                w["country_code"] = code
            all_warehouses.extend(data)
    return all_warehouses


# ── GET /warehouses/{country_code} — entrepôts d'un pays ─────────────────────
@router.get("/{country_code}")
async def get_country_warehouses(
    country_code: str,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    data = await fetch_json(f"{base_url}/warehouses/", token)
    if data is None:
        raise HTTPException(status_code=503, detail="Country API unreachable")
    for w in data:
        w["country_code"] = country_code.upper()
    return data


# ── POST /warehouses/{country_code} — créer un entrepôt ──────────────────────
class WarehouseCreate(BaseModel):
    name: str
    location: Optional[str] = None
    exploitation_id: int


@router.post("/{country_code}", status_code=201)
async def create_warehouse(
    country_code: str,
    payload: WarehouseCreate,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail=f"Country '{country_code}' not found. Use BR, EC or CO.")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(
                f"{base_url}/warehouses/",
                json=payload.model_dump(),
                headers={"Authorization": f"Bearer {token}"}
            )
            if res.status_code in (200, 201):
                data = res.json()
                data["country_code"] = country_code.upper()
                return data
            # Propager l'erreur backend-pays vers le frontend
            raise HTTPException(
                status_code=res.status_code,
                detail=res.json().get("detail", "Erreur backend pays")
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Backend pays inaccessible: {e}")


# ── PUT /warehouses/{country_code}/{warehouse_id} — modifier un entrepôt ─────
class WarehouseUpdate(BaseModel):
    name: str
    location: Optional[str] = None
    exploitation_id: int


@router.put("/{country_code}/{warehouse_id}")
async def update_warehouse(
    country_code: str,
    warehouse_id: int,
    payload: WarehouseUpdate,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.put(
                f"{base_url}/warehouses/{warehouse_id}",
                json=payload.model_dump(),
                headers={"Authorization": f"Bearer {token}"}
            )
            if res.status_code in (200, 201):
                data = res.json()
                data["country_code"] = country_code.upper()
                return data
            raise HTTPException(status_code=res.status_code,
                                detail=res.json().get("detail", "Erreur backend pays"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Backend pays inaccessible: {e}")


# ── DELETE /warehouses/{country_code}/{warehouse_id} — supprimer ──────────────
@router.delete("/{country_code}/{warehouse_id}", status_code=204)
async def delete_warehouse(
    country_code: str,
    warehouse_id: int,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.delete(
                f"{base_url}/warehouses/{warehouse_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            if res.status_code == 204:
                return
            raise HTTPException(status_code=res.status_code,
                                detail=res.json().get("detail", "Erreur backend pays"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Backend pays inaccessible: {e}")


# ── GET /warehouses/{country_code}/{warehouse_id}/measures ───────────────────
@router.get("/{country_code}/{warehouse_id}/measures")
async def get_warehouse_measures(
    country_code: str,
    warehouse_id: int,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    data = await fetch_json(f"{base_url}/measures/?warehouse_id={warehouse_id}", token)
    return data or []


# ── GET /warehouses/{country_code}/{warehouse_id}/alerts ─────────────────────
@router.get("/{country_code}/{warehouse_id}/alerts")
async def get_warehouse_alerts(
    country_code: str,
    warehouse_id: int,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    data = await fetch_json(f"{base_url}/alerts/?warehouse_id={warehouse_id}", token)
    return data or []
