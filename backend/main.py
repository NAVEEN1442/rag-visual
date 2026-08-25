import pipeline
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

from pipeline.base import process_file


from routers.webhooks import clerk_webhook_call
from routers.me import current_user, get_user_profile
from routers.documents import upload_documents, get_document_user, delete_document
from routers.runs import run_get_answer 
from vectorstore.chroma_client import chroma_db_client as chroma

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

@app.post("/document/delete_all")
async def clear_document_volume(db: Annotated[AsyncSession, Depends(get_db)]):
    """
    Clear all embeddings from Chroma AND truncate the embedded_text_document table in Postgres.
    """
    chroma_result = chroma.empty_chroma_storage()
    await db.execute(text("TRUNCATE TABLE embedded_text_document CASCADE;"))
    await db.commit()
    return {
        **chroma_result,
        "postgres": "embedded_text_document table cleared"
    }

@app.post("/document-upload")
async def document_upload(db: Annotated[AsyncSession, Depends(get_db)] , file : Annotated[UploadFile, File(...)] , profile: Annotated[dict, Depends(get_user_profile)]):
    user_id = profile['user_id']
    return await upload_documents(db,file,user_id)

@app.post("/runs")
async def document_retrieval(db: Annotated[AsyncSession, Depends(get_db)], query: Annotated[str, "No query provided"], profile: Annotated[dict, Depends(get_user_profile)]):
    user_id = profile['user_id']
    return await run_get_answer(db, query=query)

@app.get("/get-documents")
async def get_AllDocuments_USER(db: Annotated[AsyncSession, Depends(get_db)], profile: Annotated[dict, Depends(get_user_profile)]):
    user_id = profile['user_id']
    return await get_document_user(db, user_id)   

@app.get("/documents/process")
async def process_File(file_path: str, document_id: str, db: Annotated[AsyncSession, Depends(get_db)], profile: Annotated[dict, Depends(get_user_profile)]):
    user_id = profile['user_id']
    return await process_file(file_path, db, user_id, document_id=document_id)

@app.delete("/documents/{document_id}")
async def delete_Document(document_id: str, db: Annotated[AsyncSession, Depends(get_db)], profile: Annotated[dict, Depends(get_user_profile)]):
    """
    Delete a document and all its associated Chroma embeddings and Postgres chunk records.
    """
    return await delete_document(db, document_id)
