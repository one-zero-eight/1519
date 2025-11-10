from __future__ import annotations

import datetime

from pydantic import field_validator

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

    @field_validator("start", "end")
    @classmethod
    def force_utc(cls, v: datetime.datetime) -> datetime.datetime:
        return v.astimezone(datetime.UTC)


class EditTimeWindowRequest(BaseSchema):
    title: str | None = None
    start: datetime.datetime | None = None
    end: datetime.datetime | None = None

    @field_validator("start", "end")
    @classmethod
    def force_utc(cls, v: datetime.datetime) -> datetime.datetime:
        return v.astimezone(datetime.UTC)
