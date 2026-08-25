from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from unstructured.documents.elements import Title, NarrativeText, Text, ListItem, Table, Image


async def pdf_chunker_file(file_data: List[dict]):

    chunking_group = []

    current_titles = []

    for data in file_data:

        text = data.get("text", "").strip()

        if len(text) < 10:
            continue

        metadata = data.get("metadata", {})

        element_type = data.get("type", "")
        page_number = metadata.get("page_number", 1)
        file_format = metadata.get("filetype", "pdf")

        if element_type == "Title":
            current_titles.append(text)
            continue

        if element_type in ["NarrativeText", "Text", "ListItem", "Table", "Image"]:

            chunking_group.append(
                {
                    "text": text,
                    "titles": current_titles.copy(),
                    "file_format": file_format,
                    "page_number": page_number
                }
            )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150
    )

    final_chunks = []

    for data in chunking_group:

        title_context = ""

        if data["titles"]:
            title_context = " > ".join(data["titles"]) + "\n\n"

        chunks = splitter.split_text(data["text"])

        for chunk in chunks:

            final_chunks.append(
                {
                    "text": title_context + chunk,
                    "file_format": data["file_format"],
                    "page_number": data["page_number"],
                    "titles": data["titles"]
                }
            )

    return final_chunks