import base64

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_optional
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.translation import Translation
from app.models.user import User
from app.schemas.translation import (
    ImageExtractionResponse,
    TranslateRequest,
    TranslationDetail,
    TranslationJob,
    TranslationResult,
)
from app.services.ai import get_ai_provider
from app.services.translation_service import run_translation

# Reject oversized uploads early (vision APIs cap image size anyway).
_MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5 MB

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


@router.post("/extract-image", response_model=ImageExtractionResponse)
@limiter.limit("10/minute")
def extract_image(request: Request, file: UploadFile = File(...)):
    """Read source code out of an uploaded image using a multimodal model.

    Returns the transcribed code + detected language. is_code is False when the
    image isn't recognizable code — the frontend uses that to warn instead of
    feeding garbage into the translator.
    """
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    raw = file.file.read()
    if len(raw) > _MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 5 MB).")

    image_b64 = base64.b64encode(raw).decode("ascii")
    try:
        result = get_ai_provider().extract_code_from_image(image_b64, file.content_type)
    except NotImplementedError:
        raise HTTPException(
            status_code=501, detail="Image reading isn't available on this server."
        )
    except Exception:
        raise HTTPException(
            status_code=502, detail="Could not read the image. Try a clearer screenshot."
        )

    return ImageExtractionResponse(
        is_code=result.is_code, language=result.language, code=result.code
    )


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
