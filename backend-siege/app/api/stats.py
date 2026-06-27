"""
backend-siege/app/api/stats.py
KPIs et analytics agrégées depuis tous les backends pays.
"""
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
import asyncio
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


async def safe_get(url: str, token: str):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(url, headers={"Authorization": f"Bearer {token}"})
            if res.status_code == 200:
                return res.json()
    except Exception:
        pass
    return None


@router.get("/summary")
async def get_summary(token: str = Depends(oauth2_scheme)):
    """KPIs globaux : total lots, alertes, mesures moyennes."""
    tasks = []
    for code, base_url in COUNTRY_URLS.items():
        tasks.append(safe_get(f"{base_url}/lots/", token))
        tasks.append(safe_get(f"{base_url}/alerts/", token))
        tasks.append(safe_get(f"{base_url}/measures/", token))

    results = await asyncio.gather(*tasks)

    total_lots = 0
    total_alerts = 0
    temps = []
    humidities = []

    for i, code in enumerate(COUNTRY_URLS.keys()):
        lots    = results[i * 3]     or []
        alerts  = results[i * 3 + 1] or []
        measures= results[i * 3 + 2] or []

        total_lots   += len(lots)
        total_alerts += len(alerts)
        for m in measures[-20:]:  # dernières 20 mesures
            if isinstance(m, dict):
                temps.append(m.get("temperature", 0))
                humidities.append(m.get("humidity", 0))

    avg_temp     = round(sum(temps) / len(temps), 1)     if temps     else 0
    avg_humidity = round(sum(humidities) / len(humidities), 1) if humidities else 0

    return {
        "total_lots":        total_lots,
        "total_alerts":      total_alerts,
        "avg_temperature":   avg_temp,
        "avg_humidity":      avg_humidity,
        "active_countries":  len(COUNTRY_URLS),
    }


@router.get("/alerts-by-country")
async def alerts_by_country(token: str = Depends(oauth2_scheme)):
    """Alertes regroupées par pays."""
    tasks = [
        safe_get(f"{base_url}/alerts/", token)
        for base_url in COUNTRY_URLS.values()
    ]
    results = await asyncio.gather(*tasks)
    return {
        code: len(data or [])
        for code, data in zip(COUNTRY_URLS.keys(), results)
    }


@router.get("/lots-by-country")
async def lots_by_country(token: str = Depends(oauth2_scheme)):
    """Nombre de lots par pays."""
    tasks = [
        safe_get(f"{base_url}/lots/", token)
        for base_url in COUNTRY_URLS.values()
    ]
    results = await asyncio.gather(*tasks)
    return {
        code: len(data or [])
        for code, data in zip(COUNTRY_URLS.keys(), results)
    }


@router.get("/measures-latest")
async def latest_measures(token: str = Depends(oauth2_scheme)):
    """Dernières mesures de chaque pays."""
    tasks = [
        safe_get(f"{base_url}/measures/?limit=5", token)
        for base_url in COUNTRY_URLS.values()
    ]
    results = await asyncio.gather(*tasks)
    out = {}
    for code, data in zip(COUNTRY_URLS.keys(), results):
        measures = data or []
        if measures:
            latest = sorted(measures, key=lambda m: m.get("timestamp", ""), reverse=True)[:1]
            out[code] = latest[0] if latest else None
        else:
            out[code] = None
    return out