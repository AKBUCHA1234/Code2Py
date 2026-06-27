from datetime import datetime

from sqlalchemy import ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    # NULLABLE now (Phase 7 reconciliation) so chat works on anonymous analyses.
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    # NOT NULL: a message always belongs to one translation (nested resource).
    translation_id: Mapped[int] = mapped_column(
        ForeignKey("translations.id", ondelete="CASCADE"), nullable=False, index=True
    )

    role: Mapped[str] = mapped_column(String(20), nullable=False)  # 'user' | 'assistant'
    content: Mapped[str] = mapped_column(Text, nullable=False)
    # No updated_at — chat messages are immutable (Phase 4 decision).
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    translation: Mapped["Translation"] = relationship(back_populates="chat_messages")

    __table_args__ = (
        Index("ix_chat_messages_user_created", "user_id", "created_at"),
    )
