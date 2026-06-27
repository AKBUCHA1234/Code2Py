from datetime import datetime

from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    # username dropped in Phase 7 reconciliation — email is the identifier.
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    # nullable in DB (existing rows predate these), required at the API on signup.
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    age: Mapped[int | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    # Convenience back-references (1:N).
    translations: Mapped[list["Translation"]] = relationship(back_populates="user")
    notes: Mapped[list["Note"]] = relationship(back_populates="user")
