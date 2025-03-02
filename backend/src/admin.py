from datetime import datetime, timedelta
from io import BytesIO

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.config import settings
from src.models import Application, Patron, PatronRanking, PatronRateApplication, get_db_session
from src.schemas import (
    AddPatronRequest,
    ApplicationRankingStats,
    ApplicationResponse,
    DailyApplicationStats,
    DailyPatronStats,
    OverallStats,
    PatronRankingResponse,
    PatronRateApplicationResponse,
    PatronResponse,
    PatronStats,
    PatronWithRatingsAndRankings,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    route_class=AutoDeriveResponsesAPIRoute,
)


async def admin_auth(request: Request, session: Session = Depends(get_db_session)) -> Patron:
    patron_id = request.session.get("patron_id")
    if patron_id is None:
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")

    patron_obj = session.query(Patron).get(patron_id)
    if patron_obj is None:
        raise HTTPException(status_code=403, detail="Patron with such id not found")

    if not patron_obj.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can access this endpoint")

    return patron_obj


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
    _: Patron = Depends(admin_auth), session: Session = Depends(get_db_session)
) -> list[ApplicationRankingStats]:
    applications = session.query(Application).all()
    result = []

    rrf_const = 60  # 60 is a common constant for rrf

    for application in applications:
        rankings = session.query(PatronRanking).filter(PatronRanking.application_id == application.id).all()

        rrf_score = 0
        if rankings:
            rrf_score = sum(1 / (rrf_const + ranking.rank + 1) for ranking in rankings)

        votes = session.query(PatronRateApplication).filter(PatronRateApplication.application_id == application.id).all()
        positive_votes = sum(1 for v in votes if v.rate == 1)
        negative_votes = sum(1 for v in votes if v.rate == -1)
        neutral_votes = sum(1 for v in votes if v.rate == 0)
        total_votes = len(votes)

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
    _: Patron = Depends(admin_auth),
    session: Session = Depends(get_db_session)
) -> StreamingResponse:
    applications = session.query(Application).all()
    data = []

    rrf_const = 60 # 60 is a common constant for rrf

    for application in applications:
        rankings = session.query(PatronRanking).filter(PatronRanking.application_id == application.id).all()

        rrf_score = 0
        if rankings:
            rrf_score = sum(1 / (rrf_const + ranking.rank + 1) for ranking in rankings)

        votes = session.query(PatronRateApplication).filter(PatronRateApplication.application_id == application.id).all()
        positive_votes = sum(1 for v in votes if v.rate == 1)
        negative_votes = sum(1 for v in votes if v.rate == -1)
        neutral_votes = sum(1 for v in votes if v.rate == 0)

        data.append({
            'ID': application.id,
            'Email': application.email,
            'Full Name': application.full_name,
            'Submitted At': application.submitted_at,
            'RRF Score': rrf_score,
            'Positive Votes': positive_votes,
            'Negative Votes': negative_votes,
            'Neutral Votes': neutral_votes,
            'Total Votes': len(votes),
            'Has CV': bool(application.cv),
            'Has Transcript': bool(application.transcript),
            'Has Motivational Letter': bool(application.motivational_letter),
            'Has Recommendation Letter': bool(application.recommendation_letter),
            'Has Almost A Student': bool(application.almost_a_student),
        })

    df = pd.DataFrame(data)
    df = df.sort_values('RRF Score', ascending=False)

    output = BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, sheet_name='Applications Ranking', index=False)

    output.seek(0)

    filename = f"applications_ranking_{datetime.now().strftime('%Y_%m_%d__%H_%M_%S')}.xlsx"
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }

    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                             headers=headers)


@router.get("/stats")
def get_statistics(
    _: Patron = Depends(admin_auth),
    session: Session = Depends(get_db_session),
    days: int = Query(30, description="Number of days to include in the activity charts")
) -> OverallStats:
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    total_patrons = session.query(Patron).count()
    total_applications = session.query(Application).filter(Application.submitted_at >= start_date).count()

    applications_query = (
        session.query(
            func.date(Application.submitted_at).label('date'),
            func.count(Application.id).label('count')
        )
        .filter(func.date(Application.submitted_at) >= start_date)
        .group_by(func.date(Application.submitted_at))
        .order_by(func.date(Application.submitted_at))
    )

    applications_by_day = [
        DailyApplicationStats(date=row.date, applications_received=row.count)
        for row in applications_query
    ]

    patron_rating_activity = (
        session.query(
            func.date(PatronRateApplication.updated_at).label('date'),
            func.count().label('count')
        )
        .filter(func.date(PatronRateApplication.updated_at) >= start_date)
        .group_by(func.date(PatronRateApplication.updated_at))
    )

    rating_counts = {row.date: row.count for row in patron_rating_activity}

    patron_ranking_activity = (
        session.query(
            func.date(PatronRanking.updated_at).label('date'),
            func.count(func.distinct(PatronRanking.patron_id)).label('count')
        )
        .filter(func.date(PatronRanking.updated_at) >= start_date)
        .group_by(func.date(PatronRanking.updated_at))
    )

    ranking_counts = {row.date: row.count for row in patron_ranking_activity}

    all_dates = set(rating_counts.keys()) | set(ranking_counts.keys())

    patron_activity_by_day = [
        DailyPatronStats(
            date=date,
            rating_count=rating_counts.get(date, 0),
            ranking_count=ranking_counts.get(date, 0)
        )
        for date in sorted(all_dates)
    ]

    stats = OverallStats(
        total_patrons=total_patrons,
        total_applications=total_applications,
        patron_activity_by_day=patron_activity_by_day,
        applications_by_day=applications_by_day
    )

    return OverallStats.model_validate(stats, from_attributes=True)


@router.get("/patron-stats/{telegram_id}")
def get_patron_stats_route(
        telegram_id: int,
        _: Patron = Depends(admin_auth),
        session: Session = Depends(get_db_session),
        days: int = Query(30, description="Number of days to include in the activity charts")
) -> PatronStats:
    patron = session.query(Patron).filter(Patron.telegram_id == telegram_id).first()
    if not patron:
        raise HTTPException(status_code=404, detail="Patron not found")

    total_ratings = session.query(PatronRateApplication).filter(PatronRateApplication.patron_id == patron.id).count()

    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)

    patron_rating_activity = (
        session.query(
            func.date(PatronRateApplication.updated_at).label('date'),
            func.count().label('count')
        )
        .filter(
            PatronRateApplication.patron_id == patron.id,
            func.date(PatronRateApplication.updated_at) >= start_date
        )
        .group_by(func.date(PatronRateApplication.updated_at))
    )

    rating_counts = {row.date: row.count for row in patron_rating_activity}

    patron_ranking_activity = (
        session.query(
            func.date(PatronRanking.updated_at).label('date'),
            func.count(func.distinct(PatronRanking.patron_id)).label('count')
        )
        .filter(
            PatronRanking.patron_id == patron.id,
            func.date(PatronRanking.updated_at) >= start_date
        )
        .group_by(func.date(PatronRanking.updated_at))
    )

    ranking_counts = {row.date: row.count for row in patron_ranking_activity}

    all_dates = set(rating_counts.keys()) | set(ranking_counts.keys())

    activity_by_day = [
        DailyPatronStats(
            date=date,
            rating_count=rating_counts.get(date, 0),
            ranking_count=ranking_counts.get(date, 0) # since each patron has only one current rating, 1 here means that it's the date of the last ranking
        )
        for date in sorted(all_dates)
    ]

    stats = PatronStats(
        patron_id=patron.id,
        total_ratings=total_ratings,
        activity_by_day=activity_by_day
    )

    return PatronStats.model_validate(stats, from_attributes=True)
