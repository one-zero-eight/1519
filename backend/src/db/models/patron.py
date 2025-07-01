from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db import Base

if TYPE_CHECKING:
    from src.db.models.applicant import Application
    from src.db.models.rating import PatronRateApplication, PatronRanking
    from src.db.models.statistics import PatronDailyStats


class Patron(Base):
    __tablename__ = "patron"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    telegram_id: Mapped[str] = mapped_column(unique=True)
    "Telegram ID of the patron"
    telegram_data: Mapped[dict] = mapped_column(JSON, server_default="{}")
    "Data from Telegram Login Widget"
    is_admin: Mapped[bool] = mapped_column(default=False)
    "Is the patron an admin"

    ratings: Mapped[list["PatronRateApplication"]] = relationship(
        "PatronRateApplication",
        back_populates="patron",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    rankings: Mapped[list["PatronRanking"]] = relationship(
        "PatronRanking",
        back_populates="patron",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    rated_applications: Mapped[list["Application"]] = relationship(
        "Application",
        secondary="patron_x_application",
        viewonly=True,
        lazy="selectin",
        overlaps="ratings,application",
    )
    ranked_applications: Mapped[list["Application"]] = relationship(
        "Application",
        secondary="patron_ranking",
        viewonly=True,
        lazy="selectin",
        overlaps="rankings,application",
    )

    daily_stats: Mapped[list["PatronDailyStats"]] = relationship(
        "PatronDailyStats",
        back_populates="patron",
        cascade="all, delete-orphan",
        order_by="desc(PatronDailyStats.date)",
        lazy="selectin",
    )
