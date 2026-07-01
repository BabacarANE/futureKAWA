from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
import httpx
from app.config import get_settings

router = APIRouter()
settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

async def try_auth(base_url: str, username: str, password: str):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(
                f"{base_url}/auth/token",
                data={"username": username, "password": password}
            )
            if res.status_code == 200:
                return res.json()
    except Exception:
        return None

@router.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    for base_url in settings.get_country_urls().values():
        result = await try_auth(base_url, form_data.username, form_data.password)
        if result:
            return result
    raise HTTPException(status_code=401, detail="Incorrect email or password")

@router.get("/me")
async def me(token: str = Depends(oauth2_scheme)):
    for base_url in settings.get_country_urls().values():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{base_url}/auth/me",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if res.status_code == 200:
                    return res.json()
        except Exception:
            continue
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/users/")
async def list_users(token: str = Depends(oauth2_scheme)):
    """Agrège les utilisateurs de tous les backends pays (dédupliqués par email)."""
    all_users: list = []
    seen: set = set()
    for base_url in settings.get_country_urls().values():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{base_url}/auth/users/",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if res.status_code == 200:
                    for u in res.json():
                        if u["email"] not in seen:
                            seen.add(u["email"])
                            all_users.append(u)
        except Exception:
            continue
    return all_users

@router.post("/users/", status_code=201)
async def create_user(request: Request, token: str = Depends(oauth2_scheme)):
    """Crée un utilisateur sur le backend pays correspondant (country_code) ou BR par défaut."""
    payload = await request.json()
    country_code = (payload.get("country_code") or "BR").upper()
    urls = settings.get_country_urls()
    base_url = urls.get(country_code, urls["BR"])
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.post(
                f"{base_url}/auth/users/",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
            )
        if res.status_code not in (200, 201):
            detail = res.json().get("detail", "Erreur lors de la création")
            raise HTTPException(status_code=res.status_code, detail=detail)
        return res.json()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=503, detail="Backend indisponible")

@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int, token: str = Depends(oauth2_scheme)):
    """Supprime l'utilisateur sur le backend qui le contient."""
    deleted = False
    for base_url in settings.get_country_urls().values():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.delete(
                    f"{base_url}/auth/users/{user_id}",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if res.status_code == 204:
                    deleted = True
        except Exception:
            continue
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
