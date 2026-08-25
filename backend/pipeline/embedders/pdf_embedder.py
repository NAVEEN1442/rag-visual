# nomic embed text
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_ollama import OllamaEmbeddings
from typing import List
from db.models import Embedded_Text_Document
from vectorstore.chroma_client import chroma_db_client as chroma

#model instantiate

embed_model = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://localhost:11434"
)

#query call fro embedding
async def pdf_embed_text(db: AsyncSession, chunks: List[dict], user_id: str, document_id: str = None):

    try:

        print("user_id ",user_id)

        for chunk in chunks:
            embeddings = embed_model.embed_query(chunk["text"])

            #Store the text in the supabase-pg
            text = chunk["text"]
            file_format = chunk["file_format"]
            page_number = chunk["page_number"]

            doc_pg = Embedded_Text_Document(

                user_id = user_id,
                document_id = document_id,
                text = text,
                page_number = page_number
                
            )
            # adding to supabase while storing temp
            db.add(doc_pg)
            await db.flush()

            chunk_id = doc_pg.id
            metadata = {
                "file_format":file_format,
                "page_number":page_number
            }
            # storing to chroma
            chroma.add_to_chroma(
                
                id = chunk_id,
                embeddings=embeddings,
                metadata=metadata
                
            )
            
        return {

            "message ":"Successfully added to the chroma and pg",
            "New Chroma size ": chroma.check_chroma_size(),

        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"PDF EMBEDDING ERROR: {str(e)}")

    finally:
        await db.commit()



        


