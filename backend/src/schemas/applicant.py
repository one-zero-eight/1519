from __future__ import annotations

import datetime

from src.schemas.pydantic_base import BaseSchema


class ApplicationResponse(BaseSchema):
    id: int
    submitted_at: datetime.datetime
    "Time when the application was submitted"
    session_id: str
    "Session ID of user who created the application"
    email: str
    "Innopolis email of the participant"
    full_name: str
    "Full name of the participant"
    cv: str | None
    "Path to the CV of the participant"
    motivational_letter: str | None
    "Path to the motivational letter of the participant"
    recommendation_letter: str | None
    "Path to the recommendation letter of the participant"
    transcript: str | None
    "Path to the transcript of the participant"
    almost_a_student: str | None
    'Path to the "Almost A student" document of the participant'
