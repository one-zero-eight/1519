from __future__ import annotations

from src.schemas.applicant import ApplicationResponse
from src.schemas.pydantic_base import BaseSchema


class Docs(BaseSchema):
    """
    Comments and seen flags for patron process of application
    """

    cv_comments: str = ""
    cv_seen: bool = False

    motivational_letter_comments: str = ""
    motivational_letter_seen: bool = False

    recommendation_letter_comments: str = ""
    recommendation_letter_seen: bool = False

    transcript_comments: str = ""
    transcript_seen: bool = False

    almost_a_student_comments: str = ""
    almost_a_student_seen: bool = False


class PatronRateApplicationResponse(BaseSchema):
    patron_id: int
    "ID of the patron who rated"
    application_id: int
    "ID of the rated application"
    comment: str = ""
    "Comment for whole application"
    docs: Docs = Docs()
    "Per-document comments/flags"
    rate: int
    "Rating value"


class PatronRankingResponse(BaseSchema):
    patron_id: int
    """ID of the patron who produced this ranking"""

    applications: list[ApplicationResponse]
    """Applications listed in ranked order"""
