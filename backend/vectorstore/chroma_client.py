import uuid
from typing import Annotated
from typing_extensions import List
import chromadb

class ChromaService():

    def __init__(self):
        #chroma initialize 
        self.chroma_client = chromadb.HttpClient(
            host="localhost",
            port=8000
        )
        self.collection = self.chroma_client.get_or_create_collection("rag-visual")

        

    def add_to_chroma(
        self,
        id:str,
        embeddings:List[List[float]],
        metadata:List[dict]
       

        ):
        #adding embeds to chroma
        self.collection.add(
            ids=[str(id)],
            embeddings=embeddings,
            metadatas=metadata,
        
        )
        


    def get_from_chroma(self,query_embeddings: List[List[float]],n_results:int):
        
        docs_found = self.collection.query(
            
            query_embeddings=query_embeddings,
            n_results=n_results
            
        )
        return docs_found

    
    def delete_from_chroma_ID(self, documents_id: str):
        """Delete a single vector from Chroma by its ID."""
        self.collection.delete(ids=[documents_id])

    def delete_by_ids(self, ids: list):
        """Delete multiple vectors from Chroma by a list of IDs."""
        if ids:
            self.collection.delete(ids=[str(i) for i in ids])

    def empty_chroma_storage(self):
        collections = self.chroma_client.list_collections()

        for collection in collections:
            self.chroma_client.delete_collection(collection.name)
        
        self.collection = self.chroma_client.get_or_create_collection("rag-visual")
        
        return{
            "new Chroma Size : ": self.collection.count()
        }



    def check_chroma_size(self):
        return self.collection.count()

chroma_db_client = ChromaService()