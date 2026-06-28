from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_optional
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.translation import Translation
from app.models.user import User
from app.schemas.translation import (
    TranslateRequest,
    TranslationDetail,
    TranslationJob,
    TranslationResult,
)
from app.services.translation_service import run_translation

router = APIRouter(prefix="/translate", tags=["translate"])


@router.post("", response_model=TranslationJob, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit("10/minute")
def create_translation(
    request: Request,
    payload: TranslateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Persist a pending job, then kick off the AI in the background.

    Returns 202 immediately; the client polls GET /translate/{id} for the result.
    Attaches the owner if logged in; stays anonymous (user_id NULL) otherwise.
    """
    translation = Translation(
        source_language=payload.source_language,
        input_code=payload.code,
        status="pending",
        user_id=current_user.id if current_user else None,
    )
    db.add(translation)      # stage the INSERT
    db.commit()              # write to Postgres
    db.refresh(translation)  # reload DB-generated fields (id, created_at)

    # Run the model AFTER the response is sent — keeps the request snappy.
    background_tasks.add_task(run_translation, translation.id)
    return translation       # serialized via TranslationJob (from_attributes)


@router.get("/{translation_id}", response_model=TranslationDetail)
def get_translation(translation_id: int, db: Session = Depends(get_db)):
    """Fetch a job's status and, once completed, its result."""
    translation = db.get(Translation, translation_id)
    if translation is None:
        raise HTTPException(status_code=404, detail="Translation not found")

    # The result object only exists once the analysis is done.
    result = None
    if translation.status == "completed":
        res = translation.resources or {}
        result = TranslationResult(
            python_code=translation.python_code,
            explanation=translation.explanation,
            algorithm=translation.algorithm,
            time_complexity=translation.time_complexity,
            space_complexity=translation.space_complexity,
            leetcode=res.get("leetcode", []),
            videos=res.get("videos", []),
        )

    return TranslationDetail(
        id=translation.id,
        status=translation.status,
        source_language=translation.source_language,
        result=result,
        error=translation.error,
        created_at=translation.created_at,
        completed_at=translation.completed_at,
    )
