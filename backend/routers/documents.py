from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import HttpUrl
import uuid
from fastapi import HTTPException, UploadFile
from storage.supabase_client import get_supabase_client
from db.models import Document

BUCKET_NAME = "rag-visual"

async def upload_documents(db: AsyncSession, file: UploadFile, user_id: str):
    try:
        file_bytes = await file.read()

        ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else ""
        unique_name = f"{user_id}/{uuid.uuid4()}.{ext}" if ext else f"{user_id}/{uuid.uuid4()}"

        client = get_supabase_client()
        client.storage.from_(BUCKET_NAME).upload(
            path=unique_name,
            file=file_bytes,
            file_options={"content-type": file.content_type or "application/octet-stream"},
        )

        public_url = client.storage.from_(BUCKET_NAME).get_public_url(unique_name)
        #upload in the db

        document = Document(
            user_id = user_id,
            file_url = public_url,
            file_name =  unique_name,
            mime_type = "pdf"

            
        )
        try:
            db.add(document)
            await db.commit()
            await db.refresh(document)
            return document
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Supabase DB upload failed: {str(e)}")

        return {
            "status_code":200,
            "message": "Successfully uploaded the file",
            "file_data": {
                "path": unique_name,
                "public_url": public_url,
                "content_type": file.content_type,
            },
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Supabase upload failed: {str(e)}")


async def get_document_user(db:AsyncSession, user_id:str):

    try:
        stmt = select(Document).where(Document.user_id == user_id)
        res = await db.execute(stmt)
        result = res.scalars().all()
        
        
        print(result)

        return result
    except Exception as e:
        raise HTTPException(
            print(e),
            detail = e
        )
    