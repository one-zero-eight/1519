import datetime

from fastapi import Depends
from sqlalchemy.orm import Session

from src.db.models import TimeWindow
from src.dependencies.db_session import get_db_session


def get_current_timewindow(session: Session = Depends(get_db_session)) -> TimeWindow | None:
    """
    Returns timewindow related to current date
    """
    today = datetime.date.today()
    return session.query(TimeWindow).filter(TimeWindow.start <= today, today <= TimeWindow.end).first()
