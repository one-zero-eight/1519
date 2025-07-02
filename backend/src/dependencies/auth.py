from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from src.config import settings
from src.db.models import Patron
from src.dependencies.db_session import get_db_session


async def patron_auth(request: Request, session: Session = Depends(get_db_session)) -> Patron:
    patron_id = request.session.get("patron_id")
    if patron_id is None:
        raise HTTPException(status_code=403, detail="Only patrons can access this endpoint")
    patron_obj = session.query(Patron).get(patron_id)
    if patron_obj is None:
        raise HTTPException(status_code=403, detail="Patron with such id not found")
    return patron_obj


async def admin_auth(request: Request, session: Session = Depends(get_db_session)) -> Patron:
    patron_id = request.session.get("patron_id")
    if patron_id is None:
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")

    patron_obj = session.query(Patron).get(patron_id)
    if patron_obj is None:
        raise HTTPException(status_code=403, detail="Patron with such id not found")

    if not patron_obj.is_admin and patron_obj.telegram_id != settings.superadmin_telegram_id:
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")

    return patron_obj
