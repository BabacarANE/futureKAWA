from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.consolidated import router as consolidated_router
from app.api.auth import router as auth_router

app = FastAPI(
    title="FutureKawa API — Siège",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,        prefix="/auth",        tags=["auth"])
app.include_router(consolidated_router, prefix="/consolidated", tags=["consolidated"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "siege"}
