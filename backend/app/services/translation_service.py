from datetime import datetime, timezone

from app.db.session import SessionLocal
from app.models.translation import Translation
from app.services.ai import get_ai_provider


def run_translation(translation_id: int) -> None:
    """Background task: run the AI on a pending translation and persist the result.

    Runs after the HTTP response is sent, so it opens its OWN DB session
    (the request's session is already closed).
    """
    db = SessionLocal()
    try:
        translation = db.get(Translation, translation_id)
        if translation is None:
            return

        translation.status = "processing"
        db.commit()

        output = get_ai_provider().translate_code(
            translation.source_language, translation.input_code
        )

        translation.python_code = output.python_code
        translation.explanation = output.explanation
        translation.algorithm = output.algorithm
        translation.time_complexity = output.time_complexity
        translation.space_complexity = output.space_complexity
        translation.resources = {
            "leetcode": output.leetcode_problems,
            "videos": output.video_topics,
        }
        translation.status = "completed"
        translation.completed_at = datetime.now(timezone.utc)
        db.commit()
    except Exception as exc:  # noqa: BLE001 — record any failure on the row
        db.rollback()
        translation = db.get(Translation, translation_id)
        if translation is not None:
            translation.status = "failed"
            translation.error = str(exc)[:500]
            db.commit()
    finally:
        db.close()
