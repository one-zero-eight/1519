from contextlib import asynccontextmanager

import src.logging_  # noqa: F401
from src.config import settings
from src.db.models import Patron
from src.dependencies import get_db_session
from src.logging_ import logger


@asynccontextmanager
async def lifespan(_):
    session = next(get_db_session())
    if not session.query(Patron).filter(Patron.telegram_id == settings.superadmin_telegram_id).first():
        logger.info("Creating superadmin")
        superadmin = Patron(telegram_id=settings.superadmin_telegram_id, is_admin=True)
        session.add(superadmin)
        session.commit()

    if settings.default_patrons:
        existent_patrons = session.query(Patron).filter(Patron.telegram_id.in_(settings.default_patrons)).all()
        nonexistent_patrons = set(settings.default_patrons) - {p.telegram_id for p in existent_patrons}
        if nonexistent_patrons:
            logger.info("Creating default patrons")
            for telegram_id in nonexistent_patrons:
                patron = Patron(telegram_id=telegram_id)
                session.add(patron)
            session.commit()
    yield
