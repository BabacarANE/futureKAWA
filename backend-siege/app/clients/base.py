import httpx
from typing import Any

async def fetch(url: str, token: str) -> Any | None:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(
                url,
                headers={"Authorization": f"Bearer {token}"}
            )
            res.raise_for_status()
            return res.json()
    except Exception:
        return None
