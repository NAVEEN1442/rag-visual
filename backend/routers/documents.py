from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import HttpUrl
import uuid
from fastapi import HTTPException, UploadFile
from storage.supabase_client import get_supabase_client
from db.models import Document, Embedded_Text_Document
from fastapi import HTTPException
from vectorstore.chroma_client import chroma_db_client as chroma

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

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Supabase upload failed: {str(e)}")


async def delete_document(db: AsyncSession, document_id: str):
    """
    Delete a document by ID:
    1. Fetch all Embedded_Text_Document chunk IDs for this document from Postgres.
    2. Delete those chunk vectors from Chroma DB.
    3. Delete the Document row from Postgres (cascades to embedded_text_document rows).
    """
    try:
        # 1. Get all chunk IDs belonging to this document
        stmt = select(Embedded_Text_Document.id).where(
            Embedded_Text_Document.document_id == document_id
        )
        res = await db.execute(stmt)
        chunk_ids = [str(row[0]) for row in res.fetchall()]

        # 2. Delete from Chroma
        if chunk_ids:
            chroma.delete_by_ids(chunk_ids)

        # 3. Delete document from Postgres (cascades to embedded_text_document)
        stmt_del = select(Document).where(Document.id == document_id)
        res_doc = await db.execute(stmt_del)
        document = res_doc.scalar_one_or_none()

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        await db.delete(document)
        await db.commit()

        return {
            "status": "deleted",
            "document_id": document_id,
            "chunks_deleted": len(chunk_ids),
        }

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")


async def get_document_user(db: AsyncSession, user_id: str):

    try:
        stmt = select(Document).where(Document.user_id == user_id)
        res = await db.execute(stmt)
        result = res.scalars().all()
        
        print(result)

        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    