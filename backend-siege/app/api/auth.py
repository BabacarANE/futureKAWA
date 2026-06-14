from fastapi import APIRouter, HTTPException, Depends
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
