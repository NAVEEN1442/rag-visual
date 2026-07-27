# config.py
from functools import lru_cache #avoids recalculations for the outputs CPU already knows by enabling caching
from pydantic import SecretStr # avoid acidental prints of the secrets in console
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    
    app_name: str = "rag-project"
    environment: str = "development"
    frontend_url: str
    
    database_url: SecretStr 
    
    clerk_secret_key: SecretStr

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_nested_delimiter="__", 
        extra="ignore"
    )

settings = Settings()

#Dependency injection 
@lru_cache
def get_settings():
    return settings