# Import all models here so SQLAlchemy registers them on `Base.metadata`
# and Alembic autogenerate can discover every table in one place.
from app.models.chat_message import ChatMessage
from app.models.note import Note
from app.models.translation import Translation
from app.models.user import User

__all__ = ["User", "Translation", "Note", "ChatMessage"]
