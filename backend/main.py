from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import status
from fastapi import HTTPException
from sqlalchemy import text
from fastapi import Depends
from fastapi import FastAPI
from db.session import get_db

from routers.webhooks import clerk_webhook_call
from routers.me import current_user, get_user_profile

app = FastAPI()

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"server connected"}

@app.get("/server-health")
async def serverHealth(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "message": "User table exists and is accessible"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is connected, but the User table is missing or corrupted."
        )

@app.get("/me")
async def get_current_user(profile: dict = Depends(get_user_profile)):
    return {
        "user": profile,
        "message": "user verified"
    }

@app.post("/webhook/clerk")
async def clerk_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    return await clerk_webhook_call(request,db)
