from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

# NOTE: email is typed as `str` for now. When we build real auth we'll
# upgrade to Pydantic's EmailStr (needs the email-validator package) so
# malformed addresses are rejected automatically.


class RegisterRequest(BaseModel):
    """Body for POST /auth/register."""
    email: str
    password: str
    phone: str = Field(min_length=5, max_length=20)
    age: int = Field(ge=10, le=120)


class LoginRequest(BaseModel):
    """Body for POST /auth/login."""
    email: str
    password: str


class UserOut(BaseModel):
    """A user as returned to the client. Note: no password field, ever."""
    model_config = ConfigDict(from_attributes=True)  # serialize from an ORM User

    id: int
    email: str
    phone: str | None = None
    age: int | None = None
    created_at: datetime


class AuthResponse(BaseModel):
    """Returned by register and login: the user plus their JWT."""
    user: UserOut
    access_token: str
    token_type: str = "bearer"
