import secrets
import string
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse
from backend.config import settings
from backend.alias_rules import (
    RESERVED_ALIASES,
    BLOCKED_WORDS,
    ALIAS_FORMAT_REGEX,
    MIN_ALIAS_LENGTH,
    MAX_ALIAS_LENGTH,
    is_profane_or_blocked,
)

# Characters used for generating compact, shareable short codes (Base62)
BASE62_ALPHABET = string.ascii_letters + string.digits


def validate_alias_rules(alias: str) -> None:
    """
    Validates custom alias format, length, reserved system routes, and profanity blocklist.
    Raises ValueError with user-friendly messages on violation.
    Order of checks:
    1. Format check
    2. Length check
    3. Reserved system aliases
    4. Profanity & blocked words filter
    """
    if not alias:
        return

    alias_clean = alias.strip()

    # 1. Format check
    if not ALIAS_FORMAT_REGEX.match(alias_clean):
        raise ValueError("Alias can only contain letters, numbers, hyphens, and underscores.")

    # 2. Length check
    if len(alias_clean) < MIN_ALIAS_LENGTH or len(alias_clean) > MAX_ALIAS_LENGTH:
        raise ValueError(f"Alias must be between {MIN_ALIAS_LENGTH} and {MAX_ALIAS_LENGTH} characters long.")

    # 3. Reserved system routes (case-insensitive)
    if alias_clean.lower() in RESERVED_ALIASES:
        raise ValueError("This alias is reserved and cannot be used.")

    # 4. Profanity & inappropriate words (case-insensitive)
    if is_profane_or_blocked(alias_clean):
        raise ValueError("This alias cannot be used. Please choose another one.")


def generate_short_code(length: int = 6) -> str:
    """
    Generates a secure, random short code of specified length using Base62 characters.
    Ensures generated short codes do not collide with reserved aliases or blocked terms.
    """
    while True:
        code = "".join(secrets.choice(BASE62_ALPHABET) for _ in range(length))
        code_lower = code.lower()
        if code_lower not in RESERVED_ALIASES and not is_profane_or_blocked(code_lower):
            return code


def build_short_url(short_code: str) -> str:
    """
    Centralized helper to construct the canonical public short URL dynamically.
    Reads the base URL from application configuration (BASE_URL) at runtime.
    This value is NEVER stored in the database.
    """
    base_clean = settings.BASE_URL.rstrip("/")
    return f"{base_clean}/{short_code}"


def is_expired(expires_at: Optional[datetime]) -> bool:
    """
    Safely checks if an expiration datetime has passed.
    Handles both timezone-naive (SQLite standard) and timezone-aware datetimes.
    """
    if not expires_at:
        return False
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at < datetime.now(timezone.utc)


def calculate_url_status(is_active: bool, expires_at: Optional[datetime]) -> str:
    """
    Dynamically computes the effective URL status using server time:
    - 'DISABLED' if is_active is False
    - 'EXPIRED' if expires_at has passed
    - 'ACTIVE' otherwise
    """
    if not is_active:
        return "DISABLED"
    if expires_at and is_expired(expires_at):
        return "EXPIRED"
    return "ACTIVE"


def normalize_email(email: str) -> str:
    """
    Normalizes email addresses to lowercase and strips surrounding whitespace.
    """
    return email.strip().lower()


def normalize_url(url: str) -> str:
    """
    Ensures that a URL has a valid protocol (defaults to https://).
    Strictly validates that the protocol is http or https and rejects dangerous schemes (javascript:, data:, etc.).
    """
    url = url.strip()
    if not url:
        raise ValueError("Original URL cannot be empty.")

    # Check for explicit dangerous or non-web protocols
    if ":" in url:
        potential_scheme = url.split(":", 1)[0].lower()
        if potential_scheme not in ("http", "https") and "/" not in potential_scheme:
            raise ValueError(f"Invalid URL protocol '{potential_scheme}:'. Only http:// and https:// destinations are permitted.")

    if not (url.startswith("http://") or url.startswith("https://")):
        url = f"https://{url}"

    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("Invalid URL: must be a valid http or https web destination.")

    return url
