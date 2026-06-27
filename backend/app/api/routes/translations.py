from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.translation import Translation
from app.models.user import User
from app.schemas.translation import TranslationListResponse

router = APIRouter(prefix="/translations", tags=["history"])


@router.get("", response_model=TranslationListResponse)
def list_translations(
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    language: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List the current user's analyses, newest first, paginated."""
    # Base filter: only this user's rows.
    conditions = [Translation.user_id == current_user.id]
    if language:
        conditions.append(Translation.source_language == language)

    total = db.scalar(
        select(func.count()).select_from(Translation).where(*conditions)
    )
    items = db.scalars(
        select(Translation)
        .where(*conditions)
        .order_by(Translation.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()

    return TranslationListResponse(
        items=items, total=total or 0, limit=limit, offset=offset
    )


@router.delete("/{translation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_translation(
    translation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete one of the user's analyses. 404 if missing OR not theirs (enumeration-safe)."""
    translation = db.get(Translation, translation_id)
    if translation is None or translation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Translation not found")
    db.delete(translation)
    db.commit()
    return None
