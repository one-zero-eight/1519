from __future__ import annotations

from src.schemas.pydantic_base import BaseSchema


class AddPatronRequest(BaseSchema):
    telegram_id: str
    "Telegram ID of the patron"
    telegram_data: dict
    "Data returned by the Telegram Login Widget"
    is_admin: bool = False
    "Grant the new patron admin rights"
