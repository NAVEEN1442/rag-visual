from sqlalchemy import select
from langchain_ollama import OllamaEmbeddings
from sqlalchemy.ext.asyncio.session import AsyncSession
from vectorstore.chroma_client import chroma_db_client as chroma
from fastapi import HTTPException
from db.models import Embedded_Text_Document
from pipeline.generators.llm_generator import generate_answer

embed_model = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://localhost:11434"
)

async def run_get_answer(db:AsyncSession,query:str):
    try:
        query_embed = embed_model.embed_query(query)

        found_docs = chroma.get_from_chroma(query_embeddings=query_embed,n_results=5)
        docs_hub = []
        docs_collection = found_docs["ids"][0]
 
        for docs_id in docs_collection:

            stmt = select(Embedded_Text_Document).where(Embedded_Text_Document.id == docs_id)
            res = await db.execute(stmt)
            result = res.scalars().all()
            docs_hub.append(result[0])

        result_docs = await generate_answer(query,docs_hub)

        return result_docs



    except Exception as e:
        raise HTTPException(status_code = 500,detail = f"Error in retrieving docs {e}")



        
