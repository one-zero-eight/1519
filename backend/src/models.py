import datetime
from os import environ

from sqlalchemy import JSON, Date, ForeignKey, create_engine, func, text
from sqlalchemy.orm import Mapped, declarative_base, mapped_column, relationship, sessionmaker

from src.config import settings
from src.logging_ import logger

engine = create_engine(settings.database_uri.get_secret_value(), connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

with engine.connect() as conn:
    conn.execute(text("PRAGMA foreign_keys = ON"))


def get_db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


class Patron(Base):
    __tablename__ = "patron"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    telegram_id: Mapped[str] = mapped_column(unique=True)
    "Telegram ID of the patron"
    telegram_data: Mapped[dict] = mapped_column(JSON, server_default="{}")
    "Data from Telegram Login Widget"
    is_admin: Mapped[bool] = mapped_column(default=False)
    "Is the patron an admin"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    submitted_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    "Time when the applicant was submitted"
    session_id: Mapped[str] = mapped_column()
    "Session ID of user who created the applicant"
    email: Mapped[str] = mapped_column(unique=True)
    "Innopolis email of the participant"
    full_name: Mapped[str]
    "Full name of the participant"
    cv: Mapped[str | None]
    "Path to the CV of the participant"
    motivational_letter: Mapped[str | None]
    "Path to the motivational letter of the participant"
    recommendation_letter: Mapped[str | None]
    "Path to the recommendation letter of the participant"
    transcript: Mapped[str | None]
    "Path to the transcript of the participant"
    almost_a_student: Mapped[str | None]
    'Path to the "Almost A student" document of the participant'


class PatronRateApplication(Base):
    """
    Model representing a rating of a participant by a patron
    """

    __tablename__ = "patron_x_application"

    patron_id: Mapped[int] = mapped_column(ForeignKey("patron.id", ondelete="CASCADE"), primary_key=True)  # who rated
    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), primary_key=True
    )  # who was rated
    docs: Mapped[dict] = mapped_column(JSON, default={})
    "Comments and seen flags for documents"
    rate: Mapped[int] = mapped_column(default=0)
    "Rating of the participant: -1, 0, 1"
    comment: Mapped[str] = mapped_column(default="")
    "Comment about the participant"
    updated_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    "Datetime of the last update"

    application: Mapped[Application] = relationship("Application", backref="patron_x_application", viewonly=True)
    patron: Mapped[Patron] = relationship("Patron", backref="patron_x_application", viewonly=True)


class PatronRanking(Base):
    """
    Model representing a patron ranking of an applications
    """

    __tablename__ = "patron_ranking"

    patron_id: Mapped[int] = mapped_column(ForeignKey("patron.id", ondelete="CASCADE"), primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), primary_key=True)
    rank: Mapped[int] = mapped_column()
    updated_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    "Datetime of the last update"

    application: Mapped[Application] = relationship("Application", backref="patron_rankings", viewonly=True)
    patron: Mapped[Patron] = relationship("Patron", backref="patron_rankings", viewonly=True)


class PatronDailyStats(Base):
    """
    Model representing a daily activity of a patron
    """

    __tablename__ = "patron_daily_stats"

    date: Mapped[datetime.date] = mapped_column(
        Date,
        primary_key=True,
        nullable=False,
        server_default=func.current_date(),
    )
    patron_id: Mapped[int] = mapped_column(
        ForeignKey("patron.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False,
    )
    rating_count: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
    )
    ranking_count: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
    )


if environ.get("RECREATE_DATABASE") == "true":
    logger.warning("Recreating database")
    Base.metadata.drop_all(bind=engine)

Base.metadata.create_all(bind=engine)
