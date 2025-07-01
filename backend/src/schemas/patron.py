from __future__ import annotations

from src.schemas.pydantic_base import BaseSchema
from src.schemas.rating import PatronRateApplicationResponse, PatronRankingResponse


class PatronResponse(BaseSchema):
    telegram_id: str
    "Telegram ID of the patron"
    telegram_data: dict
    "Data returned by the Telegram Login Widget"
    is_admin: bool
    "Is the patron an admin"


class PatronWithRatingsAndRankings(BaseSchema):
    patron: PatronResponse
    ratings: list[PatronRateApplicationResponse]
    ranking: PatronRankingResponse
