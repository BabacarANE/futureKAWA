from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
import httpx
from app.config import get_settings

router = APIRouter()
settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def _url(code: str) -> str:
    urls = settings.get_country_urls()
    base = urls.get(code.upper())
    if not base:
        raise HTTPException(status_code=404, detail="Pays introuvable")
    return base


KNOWN_CODES = {"BR", "EC", "CO"}

@router.post("/", status_code=201)
async def create_country(request: Request, token: str = Depends(oauth2_scheme)):
    """Crée un pays sur le backend correspondant (BR/EC/CO) ou BR par défaut."""
    payload = await request.json()
    code = payload.get("code", "").upper()
    urls = settings.get_country_urls()
    base_url = urls.get(code if code in KNOWN_CODES else "BR", urls["BR"])
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(
                f"{base_url}/countries/",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
        if res.status_code in (200, 201):
            return res.json()
        raise HTTPException(status_code=res.status_code,
                            detail=res.json().get("detail", "Erreur création"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/")
async def list_countries(token: str = Depends(oauth2_scheme)):
    """Agrège les configs de tous les backends pays (dédupliqué par code)."""
    seen: set = set()
    result: list = []
    for base_url in settings.get_country_urls().values():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{base_url}/countries/",
                    headers={"Authorization": f"Bearer {token}"},
                )
                if res.status_code == 200:
                    for c in res.json():
                        if c["code"] not in seen:
                            seen.add(c["code"])
                            result.append(c)
        except Exception:
            continue
    return result


@router.get("/{code}")
async def get_country(code: str, token: str = Depends(oauth2_scheme)):
    base_url = _url(code)
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(
                f"{base_url}/countries/{code.upper()}",
                headers={"Authorization": f"Bearer {token}"},
            )
            if res.status_code == 200:
                return res.json()
            raise HTTPException(status_code=res.status_code,
                                detail=res.json().get("detail", "Erreur"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.put("/{code}")
async def update_country(code: str, request: Request, token: str = Depends(oauth2_scheme)):
    payload = await request.json()
    base_url = _url(code)
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.put(
                f"{base_url}/countries/{code.upper()}",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
            if res.status_code == 200:
                return res.json()
            raise HTTPException(status_code=res.status_code,
                                detail=res.json().get("detail", "Erreur"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
