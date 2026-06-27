from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.note import Note
from app.models.user import User
from app.schemas.note import NoteCreate, NoteListResponse, NoteOut, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


def _get_owned_note(note_id: int, db: Session, user: User) -> Note:
    """Fetch a note that belongs to `user`, or raise an enumeration-safe 404."""
    note = db.get(Note, note_id)
    if note is None or note.user_id != user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = Note(
        user_id=current_user.id,
        title=payload.title,
        content=payload.content,
        category=payload.category,
        translation_id=payload.translation_id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("", response_model=NoteListResponse)
def list_notes(
    q: str | None = None,
    category: str | None = None,
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conditions = [Note.user_id == current_user.id]
    if category:
        conditions.append(Note.category == category)
    if q:
        like = f"%{q}%"
        conditions.append(or_(Note.title.ilike(like), Note.content.ilike(like)))

    total = db.scalar(select(func.count()).select_from(Note).where(*conditions))
    items = db.scalars(
        select(Note)
        .where(*conditions)
        .order_by(Note.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return NoteListResponse(items=items, total=total or 0, limit=limit, offset=offset)


@router.get("/{note_id}", response_model=NoteOut)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_note(note_id, db, current_user)


@router.patch("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = _get_owned_note(note_id, db, current_user)
    # Apply only the fields the client actually sent (partial update).
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = _get_owned_note(note_id, db, current_user)
    db.delete(note)
    db.commit()
    return None
