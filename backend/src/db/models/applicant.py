from __future__ import annotations

import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.models import Base

if TYPE_CHECKING:
    from src.db.models.patron import Patron
    from src.db.models.rating import PatronRanking, PatronRateApplication
    from src.db.models.timewindow import TimeWindow


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    submitted_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    "Time when the application was submitted"

    session_id: Mapped[str] = mapped_column()
    "Session ID of user who created the application"

    email: Mapped[str] = mapped_column(index=True)
    "Innopolis email of the participant"
    full_name: Mapped[str]
    "Full name of the participant"

    cv: Mapped[str | None]
    "Path to the CV of the participant"
    motivational_letter: Mapped[str | None]
    "Path to the motivational letter of the participant"
    recommendation_letter: Mapped[str | None]
    "Path to the recommendation letter of the participant"
    transcript: Mapped[str | None]
    "Path to the transcript of the participant"
    almost_a_student: Mapped[str | None]
    'Path to the "Almost A student" document of the participant'

    timewindow_id: Mapped[int] = mapped_column(
        ForeignKey("timewindows.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    "ID of Timewindow application belongs to"

    timewindow: Mapped[TimeWindow] = relationship(
        "TimeWindow",
        back_populates="applications",
        lazy="selectin",
    )

    ratings: Mapped[list[PatronRateApplication]] = relationship(
        "PatronRateApplication",
        back_populates="application",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    rankings: Mapped[list[PatronRanking]] = relationship(
        "PatronRanking",
        back_populates="application",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    raters: Mapped[list[Patron]] = relationship(
        "Patron",
        secondary="patron_x_application",
        viewonly=True,
        lazy="selectin",
        overlaps="ratings,patron",
    )
    rankers: Mapped[list[Patron]] = relationship(
        "Patron",
        secondary="patron_ranking",
        viewonly=True,
        lazy="selectin",
        overlaps="rankings,patron",
    )
