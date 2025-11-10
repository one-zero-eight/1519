from __future__ import annotations

import datetime

from src.schemas.pydantic_base import BaseSchema


class TimeWindowResponse(BaseSchema):
    id: int
    title: str
    start: datetime.datetime
    end: datetime.datetime


class CreateTimeWindowRequest(BaseSchema):
    title: str
    start: datetime.datetime
    end: datetime.datetime


class EditTimeWindowRequest(BaseSchema):
    title: str | None = None
    start: datetime.datetime | None = None
    end: datetime.datetime | None = None
