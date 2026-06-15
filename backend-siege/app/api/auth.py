from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
import httpx
from app.config import get_settings

router = APIRouter()
settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

ALLOWED_ROLES = [
    "responsable_exploitation",
    "responsable_entrepot",
    "qualite",
    "supply_chain",
    "siege",
]

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

def get_country_url(country_code: str | None = None) -> str:
    if country_code:
        url = settings.get_country_urls().get(country_code.upper())
        if not url:
            raise HTTPException(status_code=404, detail="Country not found")
        return url
    return next(iter(settings.get_country_urls().values()))


async def proxy_request(
    method: str,
    url: str,
    token: str | None = None,
    json: dict | None = None,
):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.request(method, url, headers=headers, json=json)
    return response


@router.get("/users")
async def list_users(token: str = Depends(oauth2_scheme)):
    users_by_email: dict[str, dict] = {}
    for base_url in settings.get_country_urls().values():
        try:
            res = await proxy_request("GET", f"{base_url}/auth/users", token=token)
            if res.status_code == 200:
                for user in res.json():
                    users_by_email.setdefault(user["email"], user)
        except Exception:
            continue
    return list(users_by_email.values())


@router.post("/users")
async def create_user(payload: dict, token: str = Depends(oauth2_scheme)):
    base_url = get_country_url(payload.get("country_code"))
    try:
        res = await proxy_request("POST", f"{base_url}/auth/users", token=token, json=payload)
        if res.status_code in (200, 201):
            return res.json()
        raise HTTPException(status_code=res.status_code, detail=res.json().get("detail", "Error creating user"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Country API unreachable: {e}")


@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    payload: dict,
    token: str = Depends(oauth2_scheme)
):
    base_url = get_country_url(payload.get("country_code"))
    try:
        res = await proxy_request("PUT", f"{base_url}/auth/users/{user_id}", token=token, json=payload)
        if res.status_code == 200:
            return res.json()
        raise HTTPException(status_code=res.status_code, detail=res.json().get("detail", "Error updating user"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Country API unreachable: {e}")


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    country_code: str | None = Query(None),
    token: str = Depends(oauth2_scheme)
):
    base_url = get_country_url(country_code)
    try:
        res = await proxy_request("DELETE", f"{base_url}/auth/users/{user_id}", token=token)
        if res.status_code == 204:
            return
        raise HTTPException(status_code=res.status_code, detail=res.json().get("detail", "Error deleting user"))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Country API unreachable: {e}")


@router.get("/roles")
async def list_roles():
    return {"roles": ALLOWED_ROLES}


@router.get("/countries")
async def list_countries(token: str = Depends(oauth2_scheme)):
    for base_url in settings.get_country_urls().values():
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{base_url}/auth/countries",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if res.status_code == 200:
                    return res.json()
        except Exception:
            continue
    raise HTTPException(status_code=502, detail="Unable to fetch countries")
