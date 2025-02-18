from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute
from sqlalchemy.orm import Session

from src.models import Application, Patron, PatronRateApplication, get_db_session
from src.schemas import ApplicationResponse, Docs, PatronRateApplicationResponse, PatronResponse

router = APIRouter(
    prefix="/patron",
    tags=["Patron"],
    route_class=AutoDeriveResponsesAPIRoute,
)


async def patron_auth(request: Request, session: Session = Depends(get_db_session)) -> Patron:
    patron_id = request.session.get("patron_id")
    if patron_id is None:
        raise HTTPException(status_code=403, detail="Only patrons can access this endpoint")
    patron_obj = session.query(Patron).get(patron_id)
    if patron_obj is None:
        raise HTTPException(status_code=403, detail="Patron with such id not found")
    return patron_obj


@router.get("/me")
def get_me_route(patron: Patron = Depends(patron_auth)) -> PatronResponse:
    return PatronResponse.model_validate(patron, from_attributes=True)


@router.get("/me/rated-applications/", generate_unique_id_function=lambda _: "get_rated_applications")
def get_rated_applications_route(
    patron: Patron = Depends(patron_auth), session: Session = Depends(get_db_session)
) -> list[PatronRateApplicationResponse]:
    rated_by_patron = session.query(PatronRateApplication).filter(PatronRateApplication.patron_id == patron.id).all()
    return [PatronRateApplicationResponse.model_validate(r, from_attributes=True) for r in rated_by_patron]


@router.get("/applications/", generate_unique_id_function=lambda _: "get_all_applications")
def get_all_applications_route(
    _: Patron = Depends(patron_auth), session: Session = Depends(get_db_session)
) -> list[ApplicationResponse]:
    all_applications = session.query(Application).order_by(Application.submitted_at).all()

    return [ApplicationResponse.model_validate(a, from_attributes=True) for a in all_applications]


@router.get("/applications/{application_id}/", generate_unique_id_function=lambda _: "get_application")
def get_application_route(
    application_id: int, _: Patron = Depends(patron_auth), session: Session = Depends(get_db_session)
) -> ApplicationResponse:
    application = session.query(Application).get(application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationResponse.model_validate(application, from_attributes=True)


@router.post("/rate-application/{application_id}/", generate_unique_id_function=lambda _: "rate_application")
def rate_application_route(
    application_id: int,
    docs: Docs = Docs(),
    rate: int = 0,
    patron: Patron = Depends(patron_auth),
    session: Session = Depends(get_db_session),
) -> PatronRateApplicationResponse:
    application = session.query(Application).get(application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    existing_rate = (
        session.query(PatronRateApplication)
        .filter(
            PatronRateApplication.application_id == application_id,
            PatronRateApplication.patron_id == patron.id,
        )
        .first()
    )
    if existing_rate is not None:
        existing_rate.rate = rate
        existing_rate.docs = docs.model_dump(exclude_defaults=True)
        rate_obj = existing_rate
    else:
        rate_obj = PatronRateApplication(
            application_id=application_id,
            patron_id=patron.id,
            rate=rate,
            docs=docs.model_dump(exclude_defaults=True),
        )
        session.add(rate_obj)

    session.commit()
    return PatronRateApplicationResponse.model_validate(rate_obj, from_attributes=True)
