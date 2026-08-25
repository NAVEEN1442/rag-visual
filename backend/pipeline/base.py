from sqlalchemy.ext.asyncio import AsyncSession
from pipeline.parsers.pdf_parser import pdf_parsing_file
from pipeline.chunkers.pdf_chunker import pdf_chunker_file
from pipeline.embedders.pdf_embedder import pdf_embed_text

async def process_file(file_path: str, db: AsyncSession, user_id: str, document_id: str = None):

    parser = await pdf_parsing_file(file_path=file_path)

    chunking_group = await pdf_chunker_file(file_data=parser)

    embedded_data = await pdf_embed_text(db, chunking_group, user_id, document_id=document_id)

    return embedded_data


    