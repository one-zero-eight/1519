from datetime import UTC, datetime, timedelta
from io import BytesIO

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.config import settings
from src.db.models import Application, Patron, PatronDailyStats, PatronRanking, PatronRateApplication, TimeWindow
from src.dependencies import admin_auth, get_current_timewindow, get_db_session
from src.dependencies.timewindow import get_last_timewindow
from src.schemas import (
    AddPatronRequest,
    ApplicationRankingStats,
    ApplicationResponse,
    CreateTimeWindowRequest,
    DailyApplicationStats,
    DailyPatronStats,
    EditTimeWindowRequest,
    OverallStats,
    PatronRankingResponse,
    PatronRateApplicationResponse,
    PatronResponse,
    PatronStats,
    PatronWithRatingsAndRankings,
    Rating,
    TimeWindowResponse,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    route_class=AutoDeriveResponsesAPIRoute,
)


@router.post("/add-patron", status_code=status.HTTP_201_CREATED)
def add_patron(
    data: AddPatronRequest, admin: Patron = Depends(admin_auth), session: Session = Depends(get_db_session)
) -> PatronResponse:
    if data.is_admin and admin.telegram_id != settings.superadmin_telegram_id:
        raise HTTPException(status_code=403, detail="Only superadmin can add admin patrons")

    existing_patron = session.query(Patron).filter(Patron.telegram_id == data.telegram_id).first()
    if existing_patron:
        raise HTTPException(status_code=403, detail="Patron with such Telegram id already exists")

    new_patron = Patron(
        telegram_id=data.telegram_id,
        telegram_data=data.telegram_data,
        is_admin=data.is_admin,
    )
    session.add(new_patron)
    session.commit()

    return PatronResponse.model_validate(new_patron, from_attributes=True)


@router.delete("/delete-patron/{telegram_id}")
def delete_patron(telegram_id: str, admin: Patron = Depends(admin_auth), session: Session = Depends(get_db_session)):
    if telegram_id == admin.telegram_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    if telegram_id == settings.superadmin_telegram_id:
        raise HTTPException(status_code=403, detail="Superadmin cannot be deleted")

    patron = session.query(Patron).filter(Patron.telegram_id == telegram_id).first()
    if not patron:
        raise HTTPException(status_code=404, detail="Patron not found")

    if patron.is_admin and admin.telegram_id != settings.superadmin_telegram_id:
        raise HTTPException(status_code=403, detail="Only superadmin can delete admin patrons")

    session.delete(patron)
    session.commit()

    return {"status": "success", "message": f"Patron with Telegram ID {telegram_id} has been deleted"}


@router.get("/patrons")
def get_all_patrons(
    admin: Patron = Depends(admin_auth), session: Session = Depends(get_db_session)
) -> list[PatronWithRatingsAndRankings]:
    patrons = session.query(Patron).all()
    result = []

    for patron in patrons:
        db_ratings = session.query(PatronRateApplication).filter(PatronRateApplication.patron_id == patron.id).all()
        rated_by_patron = [PatronRateApplicationResponse.model_validate(r, from_attributes=True) for r in db_ratings]

        ranked_applications = (
            session.query(PatronRanking).filter_by(patron_id=admin.id).order_by(PatronRanking.rank).all()
        )

        if ranked_applications:
            application_ids = [r.application_id for r in ranked_applications]
            db_applications = session.query(Application).filter(Application.id.in_(application_ids)).all()
            applications = [ApplicationResponse.model_validate(a, from_attributes=True) for a in db_applications]
            id_x_application = {a.id: a for a in applications}
            ranking_response = PatronRankingResponse(
                patron_id=patron.id,
                applications=[id_x_application[app_id] for app_id in application_ids],
            )
        else:
            ranking_response = PatronRankingResponse(patron_id=patron.id, applications=[])

        result.append(
            PatronWithRatingsAndRankings(
                patron=PatronResponse.model_validate(patron, from_attributes=True),
                ratings=rated_by_patron,
                ranking=ranking_response,
            )
        )

    return [PatronWithRatingsAndRankings.model_validate(patron_data, from_attributes=True) for patron_data in result]


@router.get("/applications/ranking")
def get_applications_ranking(
    show_last_timewindow: bool = True,
    show_only_current: bool = False,
    current_timewindow: TimeWindow | None = Depends(get_current_timewindow),
    last_timewindow: TimeWindow | None = Depends(get_last_timewindow),
    _: Patron = Depends(admin_auth),
    session: Session = Depends(get_db_session),
) -> list[ApplicationRankingStats]:
    if show_only_current and show_last_timewindow:
        raise HTTPException(400, "You can only set one of `show_last_timewindow`, `show_only_current`")
    if show_only_current and current_timewindow is None:
        raise HTTPException(400, "No current timewindow")
    if show_last_timewindow and last_timewindow is None:
        raise HTTPException(400, "No last timewindow")

    applications = session.query(Application).all()
    if show_only_current:
        applications = list(
            filter(
                lambda application: current_timewindow.start <= application.submitted_at <= current_timewindow.end,
                applications,
            )
        )
    if show_last_timewindow:
        applications = list(
            filter(
                lambda application: last_timewindow.start <= application.submitted_at <= last_timewindow.end,
                applications,
            )
        )

    result = []

    rrf_const = 60  # 60 is a common constant for rrf

    for application in applications:
        rankings = session.query(PatronRanking).filter(PatronRanking.application_id == application.id).all()

        rrf_score = 0
        if rankings:
            rrf_score = sum(1 / (rrf_const + ranking.rank + 1) for ranking in rankings)

        votes = session.query(PatronRateApplication).filter(PatronRateApplication.application_id == application.id).all()
        positive_votes = sum(1 for v in votes if v.rate == Rating.POSITIVE)
        negative_votes = sum(1 for v in votes if v.rate == Rating.NEGATIVE)
        neutral_votes = sum(1 for v in votes if v.rate == Rating.NEUTRAL)
        unrated = sum(1 for v in votes if v.rate == Rating.UNRATED)
        total_votes = len(votes) - unrated

        result.append(
            ApplicationRankingStats(
                application=ApplicationResponse.model_validate(application, from_attributes=True),
                rrf_score=rrf_score,
                positive_votes=positive_votes,
                negative_votes=negative_votes,
                neutral_votes=neutral_votes,
                total_votes=total_votes
            )
        )

    result.sort(key=lambda x: x.rrf_score, reverse=True)
    return [ApplicationRankingStats.model_validate(application, from_attributes=True) for application in result]


@router.get("/applications/export")
def export_applications(
    show_last_timewindow: bool = True,
    show_only_current: bool = False,
    current_timewindow: TimeWindow | None = Depends(get_current_timewindow),
    last_timewindow: TimeWindow | None = Depends(get_last_timewindow),
    _: Patron = Depends(admin_auth),
    session: Session = Depends(get_db_session),
) -> StreamingResponse:
    applications = session.query(Application).all()
    all_rankings = session.query(PatronRanking).all()
    all_patrons = session.query(Patron).all()

    if show_only_current and show_last_timewindow:
        raise HTTPException(400, "You can only set one of `show_last_timewindow`, `show_only_current`")
    if show_only_current and current_timewindow is None:
        raise HTTPException(400, "No current timewindow")
    if show_last_timewindow and last_timewindow is None:
        raise HTTPException(400, "No last timewindow")

    if show_only_current:
        applications = list(
            filter(
                lambda application: current_timewindow.start <= application.submitted_at <= current_timewindow.end,
                applications,
            )
        )
        all_rankings = list(
            filter(
                lambda ranking: current_timewindow.start <= ranking.application.submitted_at <= current_timewindow.end,
                all_rankings,
            )
        )
    if show_last_timewindow:
        applications = list(
            filter(
                lambda application: last_timewindow.start <= application.submitted_at <= last_timewindow.end,
                applications,
            )
        )
        all_rankings = list(
            filter(
                lambda ranking: last_timewindow.start <= ranking.application.submitted_at <= last_timewindow.end,
                all_rankings,
            )
        )

    applicants_data = []

    rrf_const = 60 # 60 is a common constant for rrf

    for application in applications:
        rankings = filter(lambda ranking: ranking.application_id == application.id, all_rankings)

        rrf_score = 0
        if rankings:
            rrf_score = sum(1 / (rrf_const + ranking.rank + 1) for ranking in rankings)

        votes = session.query(PatronRateApplication).filter(PatronRateApplication.application_id == application.id).all()
        positive_votes = sum(1 for v in votes if v.rate == Rating.POSITIVE)
        negative_votes = sum(1 for v in votes if v.rate == Rating.NEGATIVE)
        neutral_votes = sum(1 for v in votes if v.rate == Rating.NEUTRAL)

        applicants_data.append(
            {
                "ID": application.id,
                "Email": application.email,
                "Full Name": application.full_name,
                "Submitted At": application.submitted_at,
                "RRF Score": rrf_score,
                "Positive Votes": positive_votes,
                "Negative Votes": negative_votes,
                "Neutral Votes": neutral_votes,
                "Total Votes": len(votes),
                "Has CV": bool(application.cv),
                "Has Transcript": bool(application.transcript),
                "Has Motivational Letter": bool(application.motivational_letter),
                "Has Recommendation Letter": bool(application.recommendation_letter),
                "Has Almost A Student": bool(application.almost_a_student),
            }
        )

    applicants_df = pd.DataFrame(applicants_data)
    applicants_df = applicants_df.sort_values("RRF Score", ascending=False)

    rankings_data = []

    for patron in all_patrons:
        ranks = session.query(PatronRanking).filter(PatronRanking.patron_id == patron.id).all()
        ranks.sort(key=lambda x: x.rank)

        row = {"patron": patron.telegram_data.get("username", f"id: {patron.id}")}
        for i, ranking in enumerate(ranks, start=1):
            application = session.query(Application).filter(Application.id == ranking.application_id).one()
            row[str(i)] = application.email
        rankings_data.append(row)

    rankings_df = pd.DataFrame(rankings_data)


    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        applicants_df.to_excel(writer, sheet_name='Applications Ranking', index=False)
        rankings_df.to_excel(writer, sheet_name='Rankings', index=False)

    output.seek(0)

    filename = f"applications_ranking_{datetime.now(UTC).strftime('%Y_%m_%d__%H_%M_%S')}.xlsx"
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )


@router.delete("/applications/delete/{application_id}")
def delete_application(
    application_id: str,
    session: Session = Depends(get_db_session),
    _: Patron = Depends(admin_auth),
):
    application = session.query(Application).get(application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    session.delete(application)
    session.commit()
    return {"status": "success", "message": f"Application with ID {application_id} has been deleted"}


@router.get("/stats")
def get_statistics(
    _: Patron = Depends(admin_auth),
    session: Session = Depends(get_db_session),
    days: int = Query(30, description="Number of days to include in the activity charts"),
) -> OverallStats:
    end_date = datetime.now(UTC)
    start_date = end_date - timedelta(days=days)

    total_patrons = session.query(Patron).count()
    total_applications = session.query(Application).filter(Application.submitted_at >= start_date).count()

    applications_query = (
        session.query(func.date(Application.submitted_at).label("date"), func.count(Application.id).label("count"))
        .filter(func.date(Application.submitted_at) >= start_date)
        .group_by(func.date(Application.submitted_at))
        .order_by(func.date(Application.submitted_at))
    )

    applications_by_day = [
        DailyApplicationStats(date=row.date, applications_received=row.count) for row in applications_query
    ]

    patron_activity_query = (
        session.query(
            PatronDailyStats.date,
            func.sum(PatronDailyStats.rating_count).label("rating_count"),
            func.sum(PatronDailyStats.ranking_count).label("ranking_count"),
        )
        .filter(PatronDailyStats.date >= start_date.date())
        .group_by(PatronDailyStats.date)
        .order_by(PatronDailyStats.date)
    )

    patron_activity_by_day = [
        DailyPatronStats(
            date=row.date,
            rating_count=row.rating_count,
            ranking_count=row.ranking_count
        )
        for row in patron_activity_query
    ]

    stats = OverallStats(
        total_patrons=total_patrons,
        total_applications=total_applications,
        patron_activity_by_day=patron_activity_by_day,
        applications_by_day=applications_by_day,
    )

    return OverallStats.model_validate(stats, from_attributes=True)


@router.get("/patron-stats/{telegram_id}")
def get_patron_stats_route(
    telegram_id: str,
    _: Patron = Depends(admin_auth),
    session: Session = Depends(get_db_session),
    days: int = Query(30, description="Number of days to include in the activity charts"),
) -> PatronStats:
    patron = session.query(Patron).filter(Patron.telegram_id == telegram_id).first()
    if not patron:
        raise HTTPException(status_code=404, detail="Patron not found")

    total_ratings = session.query(PatronRateApplication).filter(PatronRateApplication.patron_id == patron.id).count()

    end_date = datetime.now(UTC).date()
    start_date = end_date - timedelta(days=days)

    activity_query = (
        session.query(PatronDailyStats.date, PatronDailyStats.rating_count, PatronDailyStats.ranking_count)
        .filter(PatronDailyStats.patron_id == patron.id, PatronDailyStats.date >= start_date)
        .order_by(PatronDailyStats.date)
    )

    activity_by_day = [
        DailyPatronStats(date=row.date, rating_count=row.rating_count, ranking_count=row.ranking_count)
        for row in activity_query
    ]

    stats = PatronStats(
        patron_id=patron.id,
        total_ratings=total_ratings,
        activity_by_day=activity_by_day
    )

    return PatronStats.model_validate(stats, from_attributes=True)


@router.put("/promote")
def promote_patron(
    patron_telegram_id: str,
    is_admin: bool,
    admin: Patron = Depends(admin_auth),
    session: Session = Depends(get_db_session),
) -> PatronResponse:
    """
    Change admin status of existing patron. Only accessible by superadmins
    """
    if admin.telegram_id != settings.superadmin_telegram_id:
        raise HTTPException(status_code=403, detail="Only superadmin can promote patrons")

    if admin.telegram_id == patron_telegram_id:
        raise HTTPException(status_code=403, detail="Cannot change your own admin status")

    patron = session.query(Patron).filter(Patron.telegram_id == patron_telegram_id).first()
    if patron is None:
        raise HTTPException(status_code=404, detail="Patron not found")

    patron.is_admin = is_admin
    session.commit()
    return PatronResponse.model_validate(patron, from_attributes=True)


@router.post("/create-timewindow", status_code=status.HTTP_201_CREATED)
def create_timewindow_route(
    data: CreateTimeWindowRequest,
    _: Patron = Depends(admin_auth),
    session: Session = Depends(get_db_session),
) -> TimeWindowResponse:
    """
    Create timewindow during which applications can be sent
    """
    if data.start >= data.end:
        raise HTTPException(status_code=400, detail="Timewindow start must be before end")

    overlapping = session.query(TimeWindow).filter(
        TimeWindow.start <= data.end,
        TimeWindow.end >= data.start
    ).first()

    if overlapping:
        raise HTTPException(status_code=400, detail=f"New time window overlaps with existing one ({overlapping.title}, start: {overlapping.start}, end: {overlapping.end})")

    new_timewindow = TimeWindow(
        title=data.title,
        start=data.start,
        end=data.end,
    )
    session.add(new_timewindow)
    session.commit()
    return TimeWindowResponse.model_validate(new_timewindow, from_attributes=True)


@router.get("/timewindows")
def get_timewindows(
    _: Patron = Depends(admin_auth),
    session: Session = Depends(get_db_session),
) -> list[TimeWindowResponse]:
    timewindows = session.query(TimeWindow).all()
    return [TimeWindowResponse.model_validate(tw, from_attributes=True) for tw in timewindows]


@router.delete("/timewindows/{timewindow_id}")
def delete_timewindow(
    timewindow_id: str,
    _: Patron = Depends(admin_auth),
    session: Session = Depends(get_db_session),
):
    timewindow = session.query(TimeWindow).get(timewindow_id)
    if not timewindow:
        raise HTTPException(status_code=404, detail="Timewindow not found")

    session.delete(timewindow)
    session.commit()
    return {"status": "success", "message": f"Timewindow with ID {timewindow_id} has been deleted"}


@router.patch("/timewindows/{timewindow_id}")
def update_timewindow(
    timewindow_id: int,
    data: EditTimeWindowRequest,
    _: Patron = Depends(admin_auth),
    session: Session = Depends(get_db_session),
) -> TimeWindowResponse:
    timewindow = session.query(TimeWindow).get(timewindow_id)
    if not timewindow:
        raise HTTPException(status_code=404, detail="Timewindow not found")

    if data.start >= data.end:
        raise HTTPException(status_code=400, detail="Timewindow start must be before end")

    overlapping = session.query(TimeWindow).filter(
        TimeWindow.id != timewindow_id,
        TimeWindow.start <= (data.end or timewindow.end),
        TimeWindow.end >= (data.start or timewindow.start),
    ).first()

    if overlapping:
        raise HTTPException(status_code=400, detail=f"New time window overlaps with existing one ({overlapping.title}, start: {overlapping.start}, end: {overlapping.end})")

    if data.title is not None:
        timewindow.title = data.title
    if data.start is not None:
        timewindow.start = data.start
    if data.end is not None:
        timewindow.end = data.end

    session.commit()
    return TimeWindowResponse.model_validate(timewindow, from_attributes=True)
