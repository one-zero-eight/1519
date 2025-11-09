from __future__ import annotations

import datetime

from src.schemas.pydantic_base import BaseSchema


class TimeWindowResponse(BaseSchema):
    id: int
    title: str
    start: datetime.date
    end: datetime.date


class CreateTimeWindowRequest(BaseSchema):
    title: str
    start: datetime.date
    end: datetime.date
