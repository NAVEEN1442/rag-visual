from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine,AsyncSession,async_sessionmaker
from sqlalchemy.orm import declarative_base
from config import settings

DATABASE_URL = settings.database_url.get_secret_value()

#create engine
engine = create_async_engine(DATABASE_URL,
    pool_size=20,          
    max_overflow=10,       
    pool_timeout=30,       
    pool_pre_ping=True,    
    pool_recycle=3600,)

#create session
session = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

#create base
Base = declarative_base()

#get db
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    db = session()
    try:
        yield db
    finally:
        await db.close()


