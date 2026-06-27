from datetime import datetime

from sqlalchemy import ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # NULLABLE now (Phase 7 reconciliation) so standalone notes are allowed.
    translation_id: Mapped[int | None] = mapped_column(
        ForeignKey("translations.id", ondelete="CASCADE"), nullable=True, index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)  # added
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)  # added

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="notes")
    translation: Mapped["Translation | None"] = relationship(back_populates="notes")

    __table_args__ = (Index("ix_notes_translation_id", "translation_id"),)
