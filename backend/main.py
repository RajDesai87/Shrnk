from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, Depends, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import init_db, get_db, SessionLocal
from backend.models import URL, Click
from backend.seed import seed_demo_user
from backend.routes.auth import router as auth_router
from backend.routes.urls import router as urls_router
from backend.routes.dashboard import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and tables
    init_db()
    
    # Seed demo development user (user1@gmail.com / Password@123)
    db = SessionLocal()
    try:
        seed_demo_user(db)
    finally:
        db.close()
        
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SHRNK - Fast, Minimalist, Neo-Brutalist URL Shortener API",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        settings.BASE_URL.rstrip("/"),
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth_router)
app.include_router(urls_router)
app.include_router(dashboard_router)


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


# ==============================================================================
# Public Short URL Redirection Endpoint
# GET /{short_code}
# ==============================================================================

from sqlalchemy import or_
from backend.utils import is_expired

@app.get("/{short_code}", tags=["Redirect"], response_class=RedirectResponse)
def redirect_short_url(
    short_code: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Public URL Redirection:
    1. Finds the currently active, non-expired URL for the given short_code.
    2. Atomically increments click_count and records Click event for analytics.
    3. Redirects visitor to the original URL.
    4. If only expired/disabled historical records exist, returns clear 410 Gone.
    5. If no records exist, returns 404 Not Found.
    """
    now = datetime.now(timezone.utc)
    
    # 1. Query for the currently ACTIVE, non-expired record (case-insensitive)
    active_url = db.query(URL).filter(
        func.lower(URL.short_code) == short_code.lower(),
        URL.is_active == True,
        or_(URL.expires_at == None, URL.expires_at > now),
    ).order_by(URL.created_at.desc()).first()

    if active_url:
        # Record click event and increment counter safely
        try:
            active_url.click_count += 1
            client_ip = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
            referrer = request.headers.get("referer")

            click_event = Click(
                url_id=active_url.id,
                ip_address=client_ip,
                user_agent=user_agent,
                referrer=referrer,
            )
            db.add(click_event)
            db.commit()
        except Exception:
            db.rollback()

        return RedirectResponse(
            url=active_url.original_url,
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        )

    # 2. Check for historical records to provide informative response (case-insensitive)
    historical_url = db.query(URL).filter(
        func.lower(URL.short_code) == short_code.lower()
    ).order_by(URL.created_at.desc()).first()

    if historical_url:
        if is_expired(historical_url.expires_at):
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="THIS LINK HAS EXPIRED. The shortened URL you're trying to access is no longer active.",
            )
        if not historical_url.is_active:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This shortened link has been deactivated by its owner.",
            )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="The shortened link was not found.",
    )
