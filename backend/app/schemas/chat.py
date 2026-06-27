from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ChatRequest(BaseModel):
    """Body for POST /translate/{id}/chat — just the user's question."""
    message: str


class ChatMessageOut(BaseModel):
    """One stored message. role is 'user' or 'assistant'."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    translation_id: int
    role: str
    content: str
    created_at: datetime


class ChatListResponse(BaseModel):
    """GET /translate/{id}/chat — the conversation, oldest first."""
    items: list[ChatMessageOut]
