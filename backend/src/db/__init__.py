from __future__ import annotations

from sqlalchemy import create_engine, text
from sqlalchemy.orm import (
    sessionmaker,
)

from src.config import settings

engine = create_engine(
    settings.database_uri.get_secret_value(),
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

with engine.connect() as conn:
    conn.execute(text("PRAGMA foreign_keys = ON"))
