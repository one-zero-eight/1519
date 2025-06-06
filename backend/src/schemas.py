import datetime

from src.pydantic_base import BaseSchema


class PatronResponse(BaseSchema):
    telegram_id: str
    "Telegram ID of the patron"
    telegram_data: dict
    "Data from Telegram Login Widget"
    is_admin: bool
    "Is the patron an admin"


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
    "Who rated"
    application_id: int
    "Who was rated"
    comment: str = ""
    "Comment for whole application"
    docs: Docs = Docs()
    "Comments and seen flags for documents"
    rate: int
    "Rating value"


class PatronRankingResponse(BaseSchema):
    patron_id: int
    "Who ranked"
    applications: list[ApplicationResponse]
    "Who was ranked, in order"


class AddPatronRequest(BaseSchema):
    telegram_id: str
    "Telegram ID of the patron"
    telegram_data: dict
    "Data from Telegram Login Widget"
    is_admin: bool = False
    "Is the patron an admin"


class PatronWithRatingsAndRankings(BaseSchema):
    patron: PatronResponse
    ratings: list[PatronRateApplicationResponse]
    ranking: PatronRankingResponse


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
