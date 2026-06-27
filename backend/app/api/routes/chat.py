from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_optional
from app.db.session import get_db
from app.models.chat_message import ChatMessage
from app.models.translation import Translation
from app.models.user import User
from app.schemas.chat import ChatListResponse, ChatMessageOut, ChatRequest
from app.services.ai import get_ai_provider

# Nested under /translate — a conversation always belongs to one analysis.
router = APIRouter(prefix="/translate", tags=["chat"])


def _build_context(translation: Translation) -> str:
    """Assemble the analysis context the model needs to answer follow-ups."""
    return (
        f"Original {translation.source_language} code:\n{translation.input_code}\n\n"
        f"Python translation:\n{translation.python_code or '(not ready)'}\n\n"
        f"Explanation:\n{translation.explanation or '(not ready)'}"
    )


@router.post(
    "/{translation_id}/chat",
    response_model=ChatMessageOut,
    status_code=status.HTTP_201_CREATED,
)
def post_chat_message(
    translation_id: int,
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Save the question, ask the AI (with context + history), store + return the reply."""
    translation = db.get(Translation, translation_id)
    if translation is None:
        raise HTTPException(status_code=404, detail="Translation not found")

    user_id = current_user.id if current_user else None

    # Replay prior turns so the (stateless) model "remembers" the conversation.
    prior = db.scalars(
        select(ChatMessage)
        .where(ChatMessage.translation_id == translation_id)
        .order_by(ChatMessage.created_at)
    ).all()
    history = [{"role": m.role, "content": m.content} for m in prior]

    answer = get_ai_provider().chat(
        context=_build_context(translation),
        history=history,
        question=payload.message,
    )

    db.add(
        ChatMessage(
            translation_id=translation_id, user_id=user_id,
            role="user", content=payload.message,
        )
    )
    assistant = ChatMessage(
        translation_id=translation_id, user_id=user_id,
        role="assistant", content=answer,
    )
    db.add(assistant)
    db.commit()
    db.refresh(assistant)
    return assistant


@router.get("/{translation_id}/chat", response_model=ChatListResponse)
def list_chat_messages(
    translation_id: int,
    db: Session = Depends(get_db),
):
    """Return the conversation for an analysis, oldest first."""
    if db.get(Translation, translation_id) is None:
        raise HTTPException(status_code=404, detail="Translation not found")

    items = db.scalars(
        select(ChatMessage)
        .where(ChatMessage.translation_id == translation_id)
        .order_by(ChatMessage.created_at)
    ).all()
    return ChatListResponse(items=items)
