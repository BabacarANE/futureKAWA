from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from app.db.database import engine, Base, SessionLocal
from app.config import get_settings
from app.api import lots, mesures, alertes, auth
from app.mqtt.subscriber import start_mqtt_client
from app.alerting.rules import check_expired_lots
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()

mqtt_client = None
scheduler = BackgroundScheduler()

def run_expired_check():
    db = SessionLocal()
    try:
        check_expired_lots(db)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global mqtt_client
    Base.metadata.create_all(bind=engine)

    mqtt_client = start_mqtt_client()

    scheduler.add_job(
        run_expired_check,
        trigger="interval",
        hours=6,
        id="expired_lots_check"
    )
    scheduler.start()
    logger.info("Scheduler started — expired lots check every 6 hours")

    yield

    scheduler.shutdown()
    if mqtt_client:
        mqtt_client.loop_stop()
        mqtt_client.disconnect()

app = FastAPI(
    title=f"FutureKawa API — {settings.pays.capitalize()}",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,    prefix="/auth",     tags=["auth"])
app.include_router(lots.router,    prefix="/lots",     tags=["lots"])
app.include_router(mesures.router, prefix="/measures", tags=["measures"])
app.include_router(alertes.router, prefix="/alerts",   tags=["alerts"])

@app.get("/health")
def health():
    return {
        "status": "ok",
        "pays": settings.pays,
        "mqtt": "connected" if mqtt_client else "disconnected"
    }
