from __future__ import annotations

import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db import Base

if TYPE_CHECKING:
    from src.db.models.applicant import Application
    from src.db.models.patron import Patron


class PatronRateApplication(Base):
    """
    Model representing a rating of a participant by a patron
    """

    __tablename__ = "patron_x_application"

    patron_id: Mapped[int] = mapped_column(ForeignKey("patron.id", ondelete="CASCADE"), primary_key=True)
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), primary_key=True
    )  # who was rated
    docs: Mapped[dict] = mapped_column(JSON, default={})
    "Comments and seen flags for documents"
    rate: Mapped[int] = mapped_column(default=0)
    "Rating of the participant: -1, 0, 1"
    comment: Mapped[str] = mapped_column(default="")
    "Comment about the participant"
    updated_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    "Datetime of the last update"

    application: Mapped["Application"] = relationship("Application", backref="patron_x_application", viewonly=True)
    patron: Mapped["Patron"] = relationship("Patron", backref="patron_x_application", viewonly=True)


class PatronRanking(Base):
    """
    Model representing a patron ranking of an applications
    """

    __tablename__ = "patron_ranking"

    patron_id: Mapped[int] = mapped_column(ForeignKey("patron.id", ondelete="CASCADE"), primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), primary_key=True)
    rank: Mapped[int] = mapped_column()
    updated_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    "Datetime of the last update"

    application: Mapped["Application"] = relationship("Application", backref="patron_rankings", viewonly=True)
    patron: Mapped["Patron"] = relationship("Patron", backref="patron_rankings", viewonly=True)
