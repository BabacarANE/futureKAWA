"""
backend-siege/app/api/clients.py
Proxy clients — agrège depuis tous les backends pays (dédupliqué par id+pays).
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
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


def _base(country_code: str) -> str:
    url = COUNTRY_URLS.get(country_code.upper())
    if not url:
        raise HTTPException(status_code=404, detail="Pays introuvable")
    return url


async def _get(url: str, token: str):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(url, headers={"Authorization": f"Bearer {token}"})
            if res.status_code == 200:
                return res.json()
    except Exception:
        pass
    return None


@router.get("/")
async def list_all_clients(token: str = Depends(oauth2_scheme)):
    """Agrège les clients de tous les backends pays."""
    all_clients = []
    seen = set()
    for code, base_url in COUNTRY_URLS.items():
        data = await _get(f"{base_url}/clients/", token)
        if data:
            for c in data:
                key = (code, c["id"])
                if key not in seen:
                    seen.add(key)
                    c["country_code"] = code
                    all_clients.append(c)
    all_clients.sort(key=lambda c: c.get("name", ""))
    return all_clients


@router.get("/{country_code}")
async def list_country_clients(country_code: str, token: str = Depends(oauth2_scheme)):
    base_url = _base(country_code)
    data = await _get(f"{base_url}/clients/", token)
    if data is None:
        raise HTTPException(status_code=503, detail="Backend pays indisponible")
    for c in data:
        c["country_code"] = country_code.upper()
    return data


@router.post("/{country_code}", status_code=201)
async def create_client(country_code: str, request: Request, token: str = Depends(oauth2_scheme)):
    base_url = _base(country_code)
    payload = await request.json()
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(
                f"{base_url}/clients/",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
        if res.status_code in (200, 201):
            data = res.json()
            data["country_code"] = country_code.upper()
            return data
        raise HTTPException(status_code=res.status_code, detail=res.json().get("detail", "Erreur"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.put("/{country_code}/{client_id}")
async def update_client(country_code: str, client_id: int, request: Request, token: str = Depends(oauth2_scheme)):
    base_url = _base(country_code)
    payload = await request.json()
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.put(
                f"{base_url}/clients/{client_id}",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
        if res.status_code == 200:
            data = res.json()
            data["country_code"] = country_code.upper()
            return data
        raise HTTPException(status_code=res.status_code, detail=res.json().get("detail", "Erreur"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.delete("/{country_code}/{client_id}", status_code=204)
async def delete_client(country_code: str, client_id: int, token: str = Depends(oauth2_scheme)):
    base_url = _base(country_code)
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.delete(
                f"{base_url}/clients/{client_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
        if res.status_code == 204:
            return
        raise HTTPException(status_code=res.status_code, detail="Erreur suppression")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
