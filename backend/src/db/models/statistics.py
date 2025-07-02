from __future__ import annotations

import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db import Base

if TYPE_CHECKING:
    from src.db.models.patron import Patron


class PatronDailyStats(Base):
    """
    Model representing a daily activity of a patron
    """

    __tablename__ = "patron_daily_stats"

    date: Mapped[datetime.date] = mapped_column(
        Date,
        primary_key=True,
        nullable=False,
        server_default=func.current_date(),
    )
    patron_id: Mapped[int] = mapped_column(
        ForeignKey("patron.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    rating_count: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
    )
    ranking_count: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
    )

    patron: Mapped[Patron] = relationship(
        "Patron", back_populates="daily_stats", lazy="joined"
    )
