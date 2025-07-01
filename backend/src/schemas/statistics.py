from __future__ import annotations

import datetime

from src.schemas.pydantic_base import BaseSchema
from src.schemas.applicant import ApplicationResponse


class ApplicationRankingStats(BaseSchema):
    application: ApplicationResponse
    rrf_score: float
    positive_votes: int
    negative_votes: int
    neutral_votes: int
    total_votes: int


class DailyPatronStats(BaseSchema):
    date: datetime.date
    rating_count: int
    ranking_count: int


class DailyApplicationStats(BaseSchema):
    date: datetime.date
    applications_received: int


class OverallStats(BaseSchema):
    total_patrons: int
    total_applications: int
    patron_activity_by_day: list[DailyPatronStats]
    applications_by_day: list[DailyApplicationStats]


class PatronStats(BaseSchema):
    patron_id: int
    total_ratings: int
    activity_by_day: list[DailyPatronStats]
