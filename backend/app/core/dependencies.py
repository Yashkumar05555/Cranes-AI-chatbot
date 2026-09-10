from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token, get_password_hash
from app.db.database import get_db
from app.models.user import User

security = HTTPBearer(auto_error=False)

# Fixed guest user for frontend compatibility (unauthenticated dev mode)
GUEST_EMAIL = "guest@cranes.local"
GUEST_ID = "00000000-0000-0000-0000-000000000001"


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user


# Optional helper for endpoints that can work without auth in dev but prefer auth
async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    if credentials is None or not credentials.credentials:
        return None
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_or_create_guest_user(db: AsyncSession) -> User:
    """Get or create deterministic guest user for unauthenticated frontend access."""
    result = await db.execute(select(User).where(User.email == GUEST_EMAIL))
    guest = result.scalar_one_or_none()
    if guest is not None:
        return guest
    # Also check by ID in case email changed
    result = await db.execute(select(User).where(User.id == GUEST_ID))
    guest = result.scalar_one_or_none()
    if guest is not None:
        return guest
    # Create guest user with fixed ID and random password (not used for login)
    guest = User(
        id=GUEST_ID,
        email=GUEST_EMAIL,
        hashed_password=get_password_hash("guest-not-for-login-" + GUEST_ID),
        role="user",
    )
    db.add(guest)
    try:
        await db.commit()
        await db.refresh(guest)
    except Exception:
        await db.rollback()
        result = await db.execute(select(User).where(User.email == GUEST_EMAIL))
        guest = result.scalar_one_or_none()
        if guest is None:
            raise
    return guest


async def get_current_user_or_guest(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Frontend-compatible auth: if valid Bearer token present, return authenticated user.
    If no token or empty, return deterministic guest user (for dev/frontend without auth).
    If token present but invalid/expired, raise 401 (strict for bad tokens).
    This allows `src/App.tsx` to work without code changes while preserving
    authenticated user isolation when a token is provided.
    """
    if credentials is not None and credentials.credentials:
        payload = decode_access_token(credentials.credentials)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    # No credentials → guest fallback (dev/frontend compatibility)
    return await get_or_create_guest_user(db)
