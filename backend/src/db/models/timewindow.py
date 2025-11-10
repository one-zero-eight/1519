from __future__ import annotations

import datetime
from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.models import Base
from src.db.models.types import UTCDateTime

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

    start: Mapped[datetime.datetime] = mapped_column(
        UTCDateTime,
        nullable=False,
    )
    end: Mapped[datetime.datetime] = mapped_column(
        UTCDateTime,
        nullable=False,
    )

    applications: Mapped[list[Application]] = relationship(
        "Application",
        back_populates="timewindow",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
