from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# The engine manages a pool of real connections to Postgres. Created once.
engine = create_engine(settings.database_url, echo=False, future=True)

# A factory that produces new Session objects. autoflush/autocommit off so
# we control exactly when changes hit the database.
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: yields one session per request, always closed.

    Routes declare `db: Session = Depends(get_db)` to receive it.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
