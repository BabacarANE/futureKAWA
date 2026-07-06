"""
backend-siege/app/api/expeditions.py
Proxy & agrégation des expéditions pour tous les backends pays.
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
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(url, headers={"Authorization": f"Bearer {token}"})
            if res.status_code == 200:
                return res.json()
    except Exception:
        pass
    return None


@router.get("/")
async def list_all_expeditions(token: str = Depends(oauth2_scheme)):
    """Agrège les expéditions de tous les pays."""
    all_exps = []
    for code, base_url in COUNTRY_URLS.items():
        data = await _get(f"{base_url}/expeditions/", token)
        if data:
            for exp in data:
                exp["country_code"] = code
            all_exps.extend(data)
    all_exps.sort(key=lambda e: e.get("shipped_at", ""), reverse=True)
    return all_exps


@router.get("/{country_code}")
async def list_country_expeditions(
    country_code: str,
    token: str = Depends(oauth2_scheme),
):
    base_url = _base(country_code)
    data = await _get(f"{base_url}/expeditions/", token)
    if data is None:
        raise HTTPException(status_code=503, detail="Backend pays indisponible")
    for exp in data:
        exp["country_code"] = country_code.upper()
    return data


@router.post("/{country_code}", status_code=201)
async def create_expedition(
    country_code: str,
    request: Request,
    token: str = Depends(oauth2_scheme),
):
    base_url = _base(country_code)
    payload = await request.json()
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.post(
                f"{base_url}/expeditions/",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
        if res.status_code in (200, 201):
            data = res.json()
            data["country_code"] = country_code.upper()
            return data
        raise HTTPException(status_code=res.status_code,
                            detail=res.json().get("detail", "Erreur création"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.put("/{country_code}/{expedition_id}")
async def update_expedition(
    country_code: str,
    expedition_id: int,
    request: Request,
    token: str = Depends(oauth2_scheme),
):
    base_url = _base(country_code)
    payload = await request.json()
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.put(
                f"{base_url}/expeditions/{expedition_id}",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
        if res.status_code == 200:
            data = res.json()
            data["country_code"] = country_code.upper()
            return data
        raise HTTPException(status_code=res.status_code,
                            detail=res.json().get("detail", "Erreur mise à jour"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.delete("/{country_code}/{expedition_id}", status_code=204)
async def cancel_expedition(
    country_code: str,
    expedition_id: int,
    token: str = Depends(oauth2_scheme),
):
    base_url = _base(country_code)
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.delete(
                f"{base_url}/expeditions/{expedition_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
        if res.status_code == 204:
            return
        raise HTTPException(status_code=res.status_code,
                            detail="Erreur annulation")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
