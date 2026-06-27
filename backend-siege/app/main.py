"""
backend-siege/app/main.py
API Siège — agrège les données de tous les backends pays.
Expose le seul point d'entrée utilisé par le frontend (port 8000).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.consolidated import router as consolidated_router
from app.api.auth import router as auth_router
from app.api.warehouses import router as warehouses_router
from app.api.exploitations import router as exploitations_router
from app.api.stats import router as stats_router

app = FastAPI(
    title="FutureKawa API — Siège",
    version="1.1.0",
    description="API centrale FutureKawa — agrège BR, EC, CO",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "http://frontend:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router,          prefix="/auth",          tags=["auth"])
app.include_router(consolidated_router,  prefix="/consolidated",  tags=["consolidated"])
app.include_router(warehouses_router,    prefix="/warehouses",    tags=["warehouses"])
app.include_router(exploitations_router, prefix="/exploitations", tags=["exploitations"])
app.include_router(stats_router,         prefix="/stats",         tags=["stats"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "siege", "version": "1.1.0"}