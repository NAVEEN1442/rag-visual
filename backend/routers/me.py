from datetime import timedelta
from fastapi import Security, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import jwt
from config import settings
from db.session import get_db
from db.models import User

security = HTTPBearer()
CLERK_JWT_PUBLIC_KEY = settings.clerk_jwt_public_key.get_secret_value()


async def decode_token(token: str) -> dict:
    payload = jwt.decode(
        token,
        CLERK_JWT_PUBLIC_KEY,
        algorithms=["RS256"],
        options={"verify_aud": False},
        leeway=timedelta(seconds=200)
    )

    return payload


async def current_user(credentials: HTTPAuthorizationCredentials = Security(security)):

    token = credentials.credentials

    payload = await decode_token(token)

    print(payload)

    user_id = payload.get('sub')

    return user_id


async def get_user_profile(
    user_id: str = Depends(current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch full user profile from the database."""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user:
        return {
            "user_id": user.id,
            "email": user.email,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }

    # User exists in Clerk but not yet in our DB (webhook may be delayed)
    return {
        "user_id": user_id,
        "email": None,
        "created_at": None,
    }