from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
import asyncio
import httpx
import app.clients.bresil as bresil
import app.clients.equateur as equateur
import app.clients.colombie as colombie

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

CLIENTS = {
    "BR": bresil,
    "EC": equateur,
    "CO": colombie,
}

COUNTRY_URLS = {
    "BR": "http://api-bresil:8000",
    "EC": "http://api-equateur:8000",
    "CO": "http://api-colombie:8000",
}

class LotCreate(BaseModel):
    id: str
    exploitation_id: int
    warehouse_id: int
    quality_notes: Optional[str] = None

class LotUpdate(BaseModel):
    quality_notes: Optional[str] = None
    status: Optional[str] = None
    warehouse_id: Optional[int] = None

@router.get("/")
async def get_all(token: str = Depends(oauth2_scheme)):
    results = await asyncio.gather(
        *[
            asyncio.gather(
                client.get_lots(token),
                client.get_alerts(token),
                client.get_health(token),
            )
            for client in CLIENTS.values()
        ]
    )
    return [
        {
            "country_code": code,
            "lots": lots or [],
            "alerts": alerts or [],
            "status": health,
        }
        for (code, (lots, alerts, health)) in zip(CLIENTS.keys(), results)
    ]

@router.get("/{country_code}/lots")
async def get_lots(
    country_code: str,
    token: str = Depends(oauth2_scheme)
):
    client = CLIENTS.get(country_code.upper())
    if not client:
        raise HTTPException(status_code=404, detail="Country not found")
    return await client.get_lots(token) or []

@router.post("/{country_code}/lots")
async def create_lot(
    country_code: str,
    payload: LotCreate,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(
                f"{base_url}/lots/",
                json=payload.model_dump(),
                headers={"Authorization": f"Bearer {token}"}
            )
            if res.status_code in (200, 201):
                return res.json()
            raise HTTPException(
                status_code=res.status_code,
                detail=res.json().get("detail", "Error creating lot")
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Country API unreachable: {e}")

@router.get("/{country_code}/lots/{lot_id}")
async def get_single_lot(
    country_code: str,
    lot_id: str,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(
                f"{base_url}/lots/{lot_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            if res.status_code == 200:
                return res.json()
            raise HTTPException(status_code=res.status_code,
                                detail=res.json().get("detail", "Lot not found"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.put("/{country_code}/lots/{lot_id}")
async def update_lot(
    country_code: str,
    lot_id: str,
    payload: LotUpdate,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.put(
                f"{base_url}/lots/{lot_id}",
                json=payload.model_dump(exclude_none=True),
                headers={"Authorization": f"Bearer {token}"}
            )
            if res.status_code == 200:
                return res.json()
            raise HTTPException(status_code=res.status_code,
                                detail=res.json().get("detail", "Erreur mise à jour lot"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.delete("/{country_code}/lots/{lot_id}", status_code=204)
async def delete_lot(
    country_code: str,
    lot_id: str,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.delete(
                f"{base_url}/lots/{lot_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            if res.status_code == 204:
                return
            raise HTTPException(status_code=res.status_code,
                                detail=res.json().get("detail", "Erreur suppression lot"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/{country_code}/measures")
async def get_measures(
    country_code: str,
    warehouse_id: Optional[int] = Query(None),
    token: str = Depends(oauth2_scheme)
):
    client = CLIENTS.get(country_code.upper())
    if not client:
        raise HTTPException(status_code=404, detail="Country not found")
    return await client.get_measures(token, warehouse_id) or []

@router.get("/{country_code}/alerts")
async def get_alerts(
    country_code: str,
    token: str = Depends(oauth2_scheme)
):
    client = CLIENTS.get(country_code.upper())
    if not client:
        raise HTTPException(status_code=404, detail="Country not found")
    return await client.get_alerts(token) or []

@router.get("/health")
async def health_all(token: str = Depends(oauth2_scheme)):
    results = await asyncio.gather(
        *[client.get_health(token) for client in CLIENTS.values()]
    )
    return {
        code: result or "unreachable"
        for code, result in zip(CLIENTS.keys(), results)
    }


@router.post("/{country_code}/lots/{lot_id}/ship")
async def ship_lot(
    country_code: str,
    lot_id: str,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(
                f"{base_url}/lots/{lot_id}/ship",
                headers={"Authorization": f"Bearer {token}"}
            )
            if res.status_code == 200:
                return res.json()
            raise HTTPException(
                status_code=res.status_code,
                detail=res.json().get("detail", "Error shipping lot")
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/{country_code}/lots/{lot_id}/unship")
async def unship_lot(
    country_code: str,
    lot_id: str,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(
                f"{base_url}/lots/{lot_id}/unship",
                headers={"Authorization": f"Bearer {token}"}
            )
            if res.status_code == 200:
                return res.json()
            raise HTTPException(
                status_code=res.status_code,
                detail=res.json().get("detail", "Error cancelling shipment")
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/{country_code}/lots/history")
async def get_lots_history(
    country_code: str,
    token: str = Depends(oauth2_scheme)
):
    base_url = COUNTRY_URLS.get(country_code.upper())
    if not base_url:
        raise HTTPException(status_code=404, detail="Country not found")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(
                f"{base_url}/lots/history",
                headers={"Authorization": f"Bearer {token}"}
            )
            return res.json() if res.status_code == 200 else []
    except Exception:
        return []
