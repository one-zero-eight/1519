from __future__ import annotations

import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db import Base

if TYPE_CHECKING:
    from src.db.models.applicant import Application


class TimeWindow(Base):
    """
    Model represents timewindow of scholarships
    """

    __tablename__ = "timewindows"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    title: Mapped[str] = mapped_column(
        nullable=False,
    )

    start: Mapped[datetime.date] = mapped_column(
        Date,
        nullable=False,
    )
    end: Mapped[datetime.date] = mapped_column(
        Date,
        nullable=False,
    )

    applications: Mapped[list[Application]] = relationship(
        "Application",
        back_populates="timewindow",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
