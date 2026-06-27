from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """The shared declarative base. Every ORM model inherits from this,
    and SQLAlchemy/Alembic discover all tables through it."""
    pass
