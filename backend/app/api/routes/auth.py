from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Create an account: hash the password, store the user, return a token."""
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Email already registered"
        )

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone=payload.phone,
        age=payload.age,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(user=UserOut.model_validate(user), access_token=token)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Verify credentials and return a token. Generic error avoids user enumeration."""
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user.id)
    return AuthResponse(user=UserOut.model_validate(user), access_token=token)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    """Return the user identified by the Bearer token."""
    return current_user
