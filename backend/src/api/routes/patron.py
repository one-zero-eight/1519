import datetime

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute
from sqlalchemy.orm import Session

from src.db.models import Application, Patron, PatronDailyStats, PatronRanking, PatronRateApplication, TimeWindow
from src.dependencies import get_current_timewindow, get_db_session, patron_auth
from src.dependencies.timewindow import get_last_timewindow
from src.schemas import (
    ApplicationResponse,
    Docs,
    PatronRankingResponse,
    PatronRateApplicationResponse,
    PatronResponse,
    Rating,
)

router = APIRouter(
    prefix="/patron",
    tags=["Patron"],
    route_class=AutoDeriveResponsesAPIRoute,
)


def update_daily_stats(session: Session, patron_id: int, rating_increment: int = 0, ranking_increment: int = 0):
    today = datetime.datetime.now(datetime.UTC).date()

    stats = (
        session.query(PatronDailyStats)
        .filter(PatronDailyStats.patron_id == patron_id, PatronDailyStats.date == today)
        .first()
    )

    if stats:
        stats.rating_count += rating_increment
        stats.ranking_count += ranking_increment
    else:
        stats = PatronDailyStats(
            patron_id=patron_id, rating_count=rating_increment, ranking_count=ranking_increment
        )
        session.add(stats)


@router.get("/me")
def get_me_route(patron: Patron = Depends(patron_auth)) -> PatronResponse:
    return PatronResponse.model_validate(patron, from_attributes=True)


@router.get("/me/rated-applications", generate_unique_id_function=lambda _: "get_rated_applications")
def get_rated_applications_route(
    show_only_current: bool = False,
    show_last_timewindow: bool = True,
    current_timewindow: TimeWindow | None = Depends(get_current_timewindow),
    last_timewindow: TimeWindow | None = Depends(get_last_timewindow),
    patron: Patron = Depends(patron_auth),
    session: Session = Depends(get_db_session),
) -> list[PatronRateApplicationResponse]:
    if show_only_current and show_last_timewindow:
        raise HTTPException(400, "You can only set one of `show_last_timewindow`, `show_only_current`")
    if show_only_current and current_timewindow is None:
        raise HTTPException(400, "No current timewindow")
    if show_last_timewindow and last_timewindow is None:
        raise HTTPException(400, "No last timewindow")

    rated_by_patron = session.query(PatronRateApplication).filter(PatronRateApplication.patron_id == patron.id).all()
    if show_only_current:
        rated_by_patron = list(filter(lambda rate: current_timewindow.start <= rate.application.submitted_at <= current_timewindow.end, rated_by_patron))
    if show_last_timewindow:
        rated_by_patron = list(filter(lambda rate: last_timewindow.start <= rate.application.submitted_at <= last_timewindow.end, rated_by_patron))
    return [PatronRateApplicationResponse.model_validate(r, from_attributes=True) for r in rated_by_patron]


@router.get("/applications", generate_unique_id_function=lambda _: "get_all_applications")
def get_all_applications_route(
    show_last_timewindow: bool = True,
    show_only_current: bool = False,
    current_timewindow: TimeWindow | None = Depends(get_current_timewindow),
    last_timewindow: TimeWindow | None = Depends(get_last_timewindow),
    _: Patron = Depends(patron_auth),
    session: Session = Depends(get_db_session),
) -> list[ApplicationResponse]:
    if show_only_current and show_last_timewindow:
        raise HTTPException(400, "You can only set one of `show_last_timewindow`, `show_only_current`")
    if show_only_current and current_timewindow is None:
        raise HTTPException(400, "No current timewindow")
    if show_last_timewindow and last_timewindow is None:
        raise HTTPException(400, "No last timewindow")

    all_applications = session.query(Application).order_by(Application.submitted_at).all()
    if show_only_current:
        all_applications = list(filter(lambda application: current_timewindow.start <= application.submitted_at <= current_timewindow.end, all_applications))
    if show_last_timewindow:
        all_applications = list(filter(lambda application: last_timewindow.start <= application.submitted_at <= last_timewindow.end, all_applications))
    return [ApplicationResponse.model_validate(a, from_attributes=True) for a in all_applications]


@router.get("/applications/{application_id}", generate_unique_id_function=lambda _: "get_application")
def get_application_route(
    application_id: int, _: Patron = Depends(patron_auth),
    session: Session = Depends(get_db_session),
) -> ApplicationResponse:
    application = session.query(Application).get(application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return ApplicationResponse.model_validate(application, from_attributes=True)


@router.post("/rate-application/{application_id}", generate_unique_id_function=lambda _: "rate_application")
def rate_application_route(
    application_id: int,
    comment: str = "",
    docs: Docs = Docs(),
    rate: Rating = Rating.UNRATED,
    patron: Patron = Depends(patron_auth),
    session: Session = Depends(get_db_session),
) -> PatronRateApplicationResponse:
    application = session.query(Application).get(application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    existing_rate: PatronRateApplication | None = (
        session.query(PatronRateApplication)
        .filter(
            PatronRateApplication.application_id == application_id,
            PatronRateApplication.patron_id == patron.id,
        )
        .first()
    )
    if existing_rate is not None:
        existing_rate.rate = rate
        existing_rate.comment = comment
        existing_rate.docs = docs.model_dump(exclude_defaults=True)
        rate_obj = existing_rate
    else:
        rate_obj = PatronRateApplication(
            application_id=application_id,
            patron_id=patron.id,
            comment=comment,
            rate=rate,
            docs=docs.model_dump(exclude_defaults=True),
        )
        session.add(rate_obj)

    update_daily_stats(session, patron.id, rating_increment=1)

    session.commit()
    return PatronRateApplicationResponse.model_validate(rate_obj, from_attributes=True)


def _get_ranking_logic(
    patron: Patron,
    session: Session,
    show_last_timewindow: bool = False,
    show_only_current: bool = False,
    current_timewindow: TimeWindow | None = None,
    last_timewindow: TimeWindow | None = None,
) -> PatronRankingResponse:
    if show_only_current and show_last_timewindow:
        raise HTTPException(400, "You can only set one of `show_last_timewindow`, `show_only_current`")
    if show_only_current and current_timewindow is None:
        raise HTTPException(400, "No current timewindow")
    if show_last_timewindow and last_timewindow is None:
        raise HTTPException(400, "No last timewindow")

    ranked_applications = (
        session.query(PatronRanking)
        .filter_by(patron_id=patron.id)
        .order_by(PatronRanking.rank)
        .all()
    )
    if not ranked_applications:
        return PatronRankingResponse(patron_id=patron.id, applications=[])

    if show_only_current:
        ranked_applications = list(filter(lambda rank: current_timewindow.start <= rank.application.submitted_at <= current_timewindow.end, ranked_applications))
    if show_last_timewindow:
        ranked_applications = list(filter(lambda rank: last_timewindow.start <= rank.application.submitted_at <= last_timewindow.end, ranked_applications))

    application_ids = [r.application_id for r in ranked_applications]
    db_applications = session.query(Application).filter(Application.id.in_(application_ids)).all()
    applications = [ApplicationResponse.model_validate(a, from_attributes=True) for a in db_applications]
    id_x_application = {a.id: a for a in applications}
    return PatronRankingResponse(
        patron_id=patron.id,
        applications=[id_x_application[app_id] for app_id in application_ids],
    )


@router.get("/ranking")
def get_ranking_route(
    show_last_timewindow: bool = True,
    show_only_current: bool = False,
    current_timewindow: TimeWindow | None = Depends(get_current_timewindow),
    last_timewindow: TimeWindow | None = Depends(get_last_timewindow),
    patron: Patron = Depends(patron_auth),
    session: Session = Depends(get_db_session),
) -> PatronRankingResponse:
    return _get_ranking_logic(
        patron=patron,
        session=session,
        show_last_timewindow=show_last_timewindow,
        show_only_current=show_only_current,
        current_timewindow=current_timewindow,
        last_timewindow=last_timewindow,
    )


@router.put("/ranking")
def put_ranking_route(
    application_ids: list[int] = Body(embed=True),
    patron: Patron = Depends(patron_auth),
    session: Session = Depends(get_db_session),
) -> PatronRankingResponse:
    existing_applications = session.query(Application).filter(Application.id.in_(application_ids)).all()
    if len(existing_applications) != len(application_ids):
        nonexistent = set(application_ids) - {a.id for a in existing_applications}
        raise HTTPException(status_code=400, detail=f"Some applications do not exist: {nonexistent}")

    session.query(PatronRanking).filter(PatronRanking.patron_id == patron.id).delete()
    for rank, application_id in enumerate(application_ids):
        session.add(PatronRanking(patron_id=patron.id, application_id=application_id, rank=rank))

    update_daily_stats(session, patron.id, ranking_increment=1)
    session.commit()

    return _get_ranking_logic(patron=patron, session=session, show_last_timewindow=True)
