from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db
from backend.models import User, URL, Click
from backend.schemas import (
    DashboardStats,
    AnalyticsOverview,
    TimelinePoint,
    TopLink,
    URLResponse,
)
from backend.security import get_current_user
from backend.routes.urls import to_url_response
from backend.utils import build_short_url, calculate_url_status

router = APIRouter(prefix="/api", tags=["Dashboard & Analytics"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns high-level dashboard metrics and recent URLs for the authenticated user.
    All data is computed directly from live SQLite database records.
    """
    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=7)

    # Total URLs
    total_links = db.query(func.count(URL.id)).filter(
        URL.user_id == current_user.id
    ).scalar() or 0

    # Total Clicks
    total_clicks = db.query(func.sum(URL.click_count)).filter(
        URL.user_id == current_user.id
    ).scalar() or 0

    # Active URLs (is_active=True and not expired)
    active_links = db.query(func.count(URL.id)).filter(
        URL.user_id == current_user.id,
        URL.is_active == True,
        or_(URL.expires_at == None, URL.expires_at > now),
    ).scalar() or 0

    # Clicks this week
    user_url_select = select(URL.id).where(URL.user_id == current_user.id)
    clicks_this_week = db.query(func.count(Click.id)).filter(
        Click.url_id.in_(user_url_select),
        Click.clicked_at >= week_start,
    ).scalar() or 0

    # Recent URLs (top 5)
    recent_url_records = db.query(URL).filter(
        URL.user_id == current_user.id
    ).order_by(URL.created_at.desc()).limit(5).all()

    recent_links = [to_url_response(u) for u in recent_url_records]

    return DashboardStats(
        total_links=total_links,
        total_clicks=int(total_clicks),
        active_links=active_links,
        clicks_this_week=clicks_this_week,
        recent_links=recent_links,
    )


@router.get("/analytics/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    range_param: str = Query("7d", alias="range", description="Time range: 7d, 30d, 90d"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated click analytics and timeline metrics for the authenticated user.
    """
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    week_start = now - timedelta(days=7)

    # Days to compute based on range parameter
    num_days = 7
    if range_param == "30d":
        num_days = 30
    elif range_param == "90d":
        num_days = 90

    user_url_select = select(URL.id).where(URL.user_id == current_user.id)

    # Total & recent counts
    total_clicks = db.query(func.sum(URL.click_count)).filter(
        URL.user_id == current_user.id
    ).scalar() or 0

    clicks_today = db.query(func.count(Click.id)).filter(
        Click.url_id.in_(user_url_select),
        Click.clicked_at >= today_start,
    ).scalar() or 0

    clicks_this_week = db.query(func.count(Click.id)).filter(
        Click.url_id.in_(user_url_select),
        Click.clicked_at >= week_start,
    ).scalar() or 0

    # Top clicked link
    top_url_record = db.query(URL).filter(
        URL.user_id == current_user.id
    ).order_by(URL.click_count.desc()).first()

    most_clicked_link = build_short_url(top_url_record.short_code) if top_url_record else None

    # Timeline calculation
    timeline: List[TimelinePoint] = []
    for i in range(num_days - 1, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_start = datetime(day_date.year, day_date.month, day_date.day, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)
        count = db.query(func.count(Click.id)).filter(
            Click.url_id.in_(user_url_select),
            Click.clicked_at >= day_start,
            Click.clicked_at < day_end,
        ).scalar() or 0

        timeline.append(
            TimelinePoint(
                date=day_date.isoformat(),
                day=day_date.strftime("%a") if num_days <= 7 else day_date.strftime("%d %b"),
                clicks=count,
            )
        )

    # Top links ranked
    top_records = db.query(URL).filter(
        URL.user_id == current_user.id
    ).order_by(URL.click_count.desc()).limit(5).all()

    top_links = [
        TopLink(
            id=u.id,
            short_code=u.short_code,
            short_url=build_short_url(u.short_code),
            original_url=u.original_url,
            status=calculate_url_status(u.is_active, u.expires_at),
            click_count=u.click_count,
        )
        for u in top_records
    ]

    return AnalyticsOverview(
        total_clicks=int(total_clicks),
        clicks_today=clicks_today,
        clicks_this_week=clicks_this_week,
        most_clicked_link=most_clicked_link,
        timeline=timeline,
        top_links=top_links,
    )
