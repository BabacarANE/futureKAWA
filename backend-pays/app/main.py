from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db.database import engine, Base
from app.config import get_settings
from app.api import lots, mesures, alertes, auth

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title=f"FutureKawa API — {settings.pays.capitalize()}",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(auth.router,    prefix="/auth",     tags=["auth"])
app.include_router(lots.router,    prefix="/lots",     tags=["lots"])
app.include_router(mesures.router, prefix="/measures", tags=["measures"])
app.include_router(alertes.router, prefix="/alerts",   tags=["alerts"])

@app.get("/health")
def health():
    return {"status": "ok", "pays": settings.pays}
