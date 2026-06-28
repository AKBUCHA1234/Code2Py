from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TranslateRequest(BaseModel):
    """Body for POST /translate. source_language is one of c, cpp, java."""
    source_language: str
    code: str


class TranslationResult(BaseModel):
    """The analysis fields, present only once status == completed."""
    python_code: str
    explanation: str
    algorithm: str
    time_complexity: str
    space_complexity: str
    leetcode: list[str] = []   # LeetCode problem titles
    videos: list[str] = []     # YouTube search topics


class ImageExtractionResponse(BaseModel):
    """Result of POST /translate/extract-image — code read out of an image."""
    is_code: bool        # False when the image isn't recognizable source code
    language: str        # detected language: c | cpp | java | other
    code: str            # the transcribed code ("" when is_code is False)


class TranslationJob(BaseModel):
    """POST /translate response — the freshly created job (status: pending)."""
    model_config = ConfigDict(from_attributes=True)  # allow building from an ORM object

    id: int
    status: str
    source_language: str
    created_at: datetime


class TranslationDetail(BaseModel):
    """GET /translate/{id} response — same shape whether pending or done."""
    id: int
    status: str
    source_language: str
    result: TranslationResult | None = None
    error: str | None = None
    created_at: datetime
    completed_at: datetime | None = None


class TranslationSummary(BaseModel):
    """A lean row for the history list — no heavy code/explanation fields."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    source_language: str
    algorithm: str | None = None
    status: str
    created_at: datetime


class TranslationListResponse(BaseModel):
    """Paginated envelope for GET /translations (shared shape across the API)."""
    items: list[TranslationSummary]
    total: int
    limit: int
    offset: int
