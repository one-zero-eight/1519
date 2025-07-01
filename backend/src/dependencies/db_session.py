from collections.abc import Generator

from src.db import SessionLocal


def get_db_session() -> Generator:
    """Yield a DB session and close it afterwards."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
