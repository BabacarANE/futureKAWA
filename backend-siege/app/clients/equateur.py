from app.clients.base import fetch
from app.config import get_settings

settings = get_settings()

async def get_lots(token: str):
    return await fetch(f"{settings.api_equateur}/lots/", token)

async def get_measures(token: str, warehouse_id: int | None = None):
    url = f"{settings.api_equateur}/measures/"
    if warehouse_id:
        url += f"?warehouse_id={warehouse_id}"
    return await fetch(url, token)

async def get_alerts(token: str):
    return await fetch(f"{settings.api_equateur}/alerts/", token)

async def get_health(token: str):
    return await fetch(f"{settings.api_equateur}/health", token)
