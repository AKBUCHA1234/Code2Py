from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

# Reads the "Authorization: Bearer <token>" header. auto_error=False lets us
# return our own 401 message and also support optional auth.
bearer_scheme = HTTPBearer(auto_error=False)

_UNAUTHENTICATED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the logged-in user from the Bearer token. Raises 401 if anything fails.

    Use on protected routes: `current_user: User = Depends(get_current_user)`.
    """
    if credentials is None:
        raise _UNAUTHENTICATED
    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise _UNAUTHENTICATED
    user = db.get(User, user_id)
    if user is None:
        raise _UNAUTHENTICATED
    return user


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    """Like get_current_user but returns None instead of 401 when unauthenticated.

    Use on anonymous-allowed routes (e.g. POST /translate).
    """
    if credentials is None:
        return None
    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        return None
    return db.get(User, user_id)
