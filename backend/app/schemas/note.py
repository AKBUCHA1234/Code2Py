from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NoteCreate(BaseModel):
    """Body for POST /notes. translation_id links the note to an analysis."""
    title: str
    content: str
    category: str | None = None
    translation_id: int | None = None


class NoteUpdate(BaseModel):
    """Body for PATCH /notes/{id} — all fields optional (partial update)."""
    title: str | None = None
    content: str | None = None
    category: str | None = None


class NoteOut(BaseModel):
    """A note as returned to the client."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    category: str | None = None
    translation_id: int | None = None
    created_at: datetime
    updated_at: datetime


class NoteListResponse(BaseModel):
    """Paginated envelope for GET /notes."""
    items: list[NoteOut]
    total: int
    limit: int
    offset: int
