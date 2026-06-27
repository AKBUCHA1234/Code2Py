from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """One-way bcrypt hash (random salt baked in). Store this — never the plaintext."""
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Return True if the plaintext matches the stored bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def create_access_token(user_id: int) -> str:
    """Mint a signed JWT. 'sub' = user id, 'exp' = expiry from config."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> int | None:
    """Verify a JWT's signature/expiry and return its user id, or None if invalid."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None
