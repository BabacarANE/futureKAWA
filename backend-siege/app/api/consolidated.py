from fastapi import APIRouter, Depends, Query
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
import asyncio
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
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Country not found")
    return await client.get_lots(token) or []

@router.get("/{country_code}/measures")
async def get_measures(
    country_code: str,
    warehouse_id: Optional[int] = Query(None),
    token: str = Depends(oauth2_scheme)
):
    client = CLIENTS.get(country_code.upper())
    if not client:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Country not found")
    return await client.get_measures(token, warehouse_id) or []

@router.get("/{country_code}/alerts")
async def get_alerts(
    country_code: str,
    token: str = Depends(oauth2_scheme)
):
    client = CLIENTS.get(country_code.upper())
    if not client:
        from fastapi import HTTPException
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
