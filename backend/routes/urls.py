from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db
from backend.models import User, URL, Click
from backend.schemas import (
    URLCreate,
    URLResponse,
    LinkAnalytics,
    TimelinePoint,
    ReferrerStat,
    DeviceStat,
)
from backend.security import get_current_user
from backend.utils import (
    generate_short_code,
    build_short_url,
    is_expired,
    calculate_url_status,
    validate_alias_rules,
)

router = APIRouter(prefix="/api/urls", tags=["URLs"])


def is_alias_available(db: Session, short_code: str) -> bool:
    """
    Checks if a short code/alias is available for a new URL.
    An alias is AVAILABLE only if NO existing (non-deleted) record in the database
    matches this short_code (case-insensitively).
    Expired and disabled links retain their alias reservation until deleted.
    """
    existing = db.query(URL).filter(func.lower(URL.short_code) == short_code.lower()).first()
    return existing is None


def to_url_response(url_obj: URL) -> URLResponse:
    """Helper to convert URL model to URLResponse schema with dynamic short_url and effective status."""
    effective_status = calculate_url_status(url_obj.is_active, url_obj.expires_at)
    return URLResponse(
        id=url_obj.id,
        user_id=url_obj.user_id,
        short_code=url_obj.short_code,
        short_url=build_short_url(url_obj.short_code),
        original_url=url_obj.original_url,
        created_at=url_obj.created_at,
        expires_at=url_obj.expires_at,
        is_active=url_obj.is_active,
        status=effective_status,
        click_count=url_obj.click_count,
    )


@router.post("", response_model=URLResponse, status_code=status.HTTP_201_CREATED)
def create_url(
    url_in: URLCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Creates a new shortened URL for the authenticated user.
    Enforces format, length, reserved keywords, profanity blocklist, and global uniqueness.
    An alias is reserved as long as the record exists (active or expired).
    Deleting a link permanently releases its alias.
    """
    if url_in.custom_alias:
        alias_clean = url_in.custom_alias.strip()

        # 1. Validate alias format, length, reserved words, and profanity blocklist
        try:
            validate_alias_rules(alias_clean)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e),
            )

        # 2. Check if custom alias is already reserved by any non-deleted URL (case-insensitive)
        if not is_alias_available(db, alias_clean):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This alias is already in use. Please choose another one.",
            )
        short_code = alias_clean
    else:
        # Generate random Base62 short code that is safe and not currently in use
        while True:
            candidate = generate_short_code(6)
            if is_alias_available(db, candidate):
                short_code = candidate
                break

    try:
        new_url = URL(
            user_id=current_user.id,
            short_code=short_code,
            original_url=url_in.original_url,
            expires_at=url_in.expires_at,
            is_active=True,
            click_count=0,
        )
        db.add(new_url)
        db.commit()
        db.refresh(new_url)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This alias is already in use. Please choose another one.",
        )

    return to_url_response(new_url)


@router.get("", response_model=List[URLResponse])
def list_urls(
    filter: Optional[str] = Query("all", description="Filter links: all, active, expired, disabled"),
    search: Optional[str] = Query(None, description="Search term for original URL or short code"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Lists URLs belonging strictly to the authenticated user.
    Supports filtering and full-text searching.
    """
    query = db.query(URL).filter(URL.user_id == current_user.id)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                URL.original_url.ilike(search_term),
                URL.short_code.ilike(search_term),
            )
        )

    now = datetime.now(timezone.utc)
    if filter == "active":
        query = query.filter(
            URL.is_active == True,
            or_(URL.expires_at == None, URL.expires_at > now),
        )
    elif filter == "expired":
        query = query.filter(
            URL.is_active == True,
            URL.expires_at != None,
            URL.expires_at <= now,
        )
    elif filter == "disabled":
        query = query.filter(
            URL.is_active == False,
        )

    urls = query.order_by(URL.created_at.desc()).all()
    return [to_url_response(u) for u in urls]


@router.get("/{url_id}", response_model=URLResponse)
def get_url(
    url_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves a single URL by ID.
    Strictly verifies that the authenticated user owns the URL.
    """
    url_obj = db.query(URL).filter(
        URL.id == url_id,
        URL.user_id == current_user.id,
    ).first()

    if not url_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found or you do not have permission to access it.",
        )

    return to_url_response(url_obj)


@router.delete("/{url_id}")
def delete_url(
    url_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Deletes a shortened URL and its associated click analytics.
    Strictly verifies ownership before deletion.
    """
    url_obj = db.query(URL).filter(
        URL.id == url_id,
        URL.user_id == current_user.id,
    ).first()

    if not url_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found or you do not have permission to delete it.",
        )

    db.delete(url_obj)
    db.commit()
    return {"message": "URL deleted successfully."}


@router.get("/{url_id}/analytics", response_model=LinkAnalytics)
def get_link_analytics(
    url_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns comprehensive analytics for a single URL owned by the current user.
    """
    url_obj = db.query(URL).filter(
        URL.id == url_id,
        URL.user_id == current_user.id,
    ).first()

    if not url_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found or you do not have permission to view its analytics.",
        )

    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    week_start = now - timedelta(days=7)
    month_start = now - timedelta(days=30)

    # Click metrics
    clicks_today = db.query(func.count(Click.id)).filter(
        Click.url_id == url_obj.id,
        Click.clicked_at >= today_start,
    ).scalar() or 0

    clicks_week = db.query(func.count(Click.id)).filter(
        Click.url_id == url_obj.id,
        Click.clicked_at >= week_start,
    ).scalar() or 0

    clicks_month = db.query(func.count(Click.id)).filter(
        Click.url_id == url_obj.id,
        Click.clicked_at >= month_start,
    ).scalar() or 0

    # 7-day timeline
    timeline: List[TimelinePoint] = []
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_start = datetime(day_date.year, day_date.month, day_date.day, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)
        count = db.query(func.count(Click.id)).filter(
            Click.url_id == url_obj.id,
            Click.clicked_at >= day_start,
            Click.clicked_at < day_end,
        ).scalar() or 0
        timeline.append(
            TimelinePoint(
                date=day_date.isoformat(),
                day=day_date.strftime("%a"),
                clicks=count,
            )
        )

    # Referrers breakdown
    all_clicks_count = max(url_obj.click_count, 1)
    referrer_rows = db.query(
        Click.referrer, func.count(Click.id).label("count")
    ).filter(
        Click.url_id == url_obj.id
    ).group_by(Click.referrer).order_by(func.count(Click.id).desc()).limit(5).all()

    top_referrers = []
    for row in referrer_rows:
        ref_name = row[0] or "Direct / None"
        if ref_name.startswith("http"):
            ref_name = ref_name.replace("https://", "").replace("http://", "").split("/")[0]
        top_referrers.append(
            ReferrerStat(
                referrer=ref_name,
                count=row[1],
                percentage=round((row[1] / all_clicks_count) * 100, 1),
            )
        )

    # Device breakdown from user agent
    mobile_count = db.query(func.count(Click.id)).filter(
        Click.url_id == url_obj.id,
        or_(
            Click.user_agent.ilike("%Mobile%"),
            Click.user_agent.ilike("%Android%"),
            Click.user_agent.ilike("%iPhone%"),
        ),
    ).scalar() or 0

    desktop_count = max(url_obj.click_count - mobile_count, 0)
    devices = [
        DeviceStat(
            device="Desktop",
            count=desktop_count,
            percentage=round((desktop_count / all_clicks_count) * 100, 1),
        ),
        DeviceStat(
            device="Mobile",
            count=mobile_count,
            percentage=round((mobile_count / all_clicks_count) * 100, 1),
        ),
    ]

    effective_status = calculate_url_status(url_obj.is_active, url_obj.expires_at)
    return LinkAnalytics(
        id=url_obj.id,
        short_code=url_obj.short_code,
        short_url=build_short_url(url_obj.short_code),
        original_url=url_obj.original_url,
        is_active=url_obj.is_active,
        status=effective_status,
        created_at=url_obj.created_at,
        expires_at=url_obj.expires_at,
        total_clicks=url_obj.click_count,
        clicks_today=clicks_today,
        clicks_this_week=clicks_week,
        clicks_this_month=clicks_month,
        timeline=timeline,
        top_referrers=top_referrers,
        devices=devices,
    )
