from os import environ

from src.db import Base, engine
from src.db.models.applicant import Application
from src.db.models.patron import Patron
from src.db.models.rating import PatronRanking, PatronRateApplication
from src.db.models.statistics import PatronDailyStats
from src.db.models.timewindow import TimeWindow
from src.logging_ import logger

__all__ = [
    "Base",
    "Application",
    "Patron",
    "PatronRateApplication",
    "PatronRanking",
    "PatronDailyStats",
    "TimeWindow",
]

if environ.get("RECREATE_DATABASE") == "true":
    logger.warning("Recreating database")
    Base.metadata.drop_all(bind=engine)

Base.metadata.create_all(bind=engine)
