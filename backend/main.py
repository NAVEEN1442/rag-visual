from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import status
from fastapi import HTTPException
from sqlalchemy import text
from fastapi import Depends
from fastapi import FastAPI
from db.session import get_db

app = FastAPI()

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


