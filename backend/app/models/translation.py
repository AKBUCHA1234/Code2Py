from datetime import datetime

from sqlalchemy import ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Translation(Base):
    __tablename__ = "translations"

    id: Mapped[int] = mapped_column(primary_key=True)
    # NULLABLE: MVP allows anonymous translations. SET NULL keeps the row if
    # the owning user is deleted (Phase 4 rule).
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Input (renamed to match the API contract).
    source_language: Mapped[str] = mapped_column(String(10), nullable=False)
    input_code: Mapped[str] = mapped_column(Text, nullable=False)

    # Output — all NULL until the AI finishes (status drives this).
    python_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    algorithm: Mapped[str | None] = mapped_column(String(100), nullable=True)  # added
    time_complexity: Mapped[str | None] = mapped_column(String(50), nullable=True)
    space_complexity: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # State machine: pending -> processing -> completed | failed.
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="pending")
    error: Mapped[str | None] = mapped_column(Text, nullable=True)  # added
    # learning resources: {"leetcode": [...titles], "videos": [...topics]}
    resources: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # added

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)  # added

    user: Mapped["User | None"] = relationship(back_populates="translations")
    notes: Mapped[list["Note"]] = relationship(back_populates="translation")
    chat_messages: Mapped[list["ChatMessage"]] = relationship(back_populates="translation")

    __table_args__ = (Index("ix_translations_created_at", "created_at"),)
