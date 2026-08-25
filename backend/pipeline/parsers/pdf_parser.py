from pathlib import Path
from unstructured.partition.pdf import partition_pdf
import io
import httpx
from fastapi import HTTPException

async def pdf_parsing_file(file_path: str):
    try:
            #content
        response = httpx.get(file_path)

        elements = partition_pdf(
            file=io.BytesIO(response.content),
            strategy="hi_res",    
            infer_table_structure=True 
        )

        elements_dict = [element.to_dict() for element in elements]
        return elements_dict
    except Exception as e:
        raise HTTPException(status_code = 500,detail="Unexpected error found during file parsings {e}")


       






