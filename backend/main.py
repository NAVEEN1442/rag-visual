from fastapi import UploadFile, File
from typing import Annotated
from fastapi.datastructures import FormData
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
from routers.documents import upload_documents,get_document_user

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

@app.post("/document-upload")
async def document_upload(db: Annotated[AsyncSession, Depends(get_db)] , file : Annotated[UploadFile, File(...)] , profile: Annotated[dict, Depends(get_user_profile)]):
    user_id = profile['user_id']
    return await upload_documents(db,file,user_id)

@app.get("/get-documents")
async def get_AllDocuments_USER(db:Annotated[AsyncSession, Depends(get_db)],profile:Annotated[dict,Depends(get_user_profile)]):
    user_id = profile['user_id']
    return await get_document_user(db,user_id)    
