"""
Centralized Alias Restrictions, System Routes, Format Rules, and Profanity Filter for SHRNK.
"""
import re
from typing import Set

# Minimum and maximum length constraints for custom aliases
MIN_ALIAS_LENGTH = 3
MAX_ALIAS_LENGTH = 64

# Strict URL path safe characters: alphanumeric, hyphens, and underscores
ALIAS_FORMAT_REGEX = re.compile(r"^[a-zA-Z0-9_-]+$")

# Centralized list of reserved system routes, authentication paths, and API endpoints
RESERVED_ALIASES: Set[str] = {
    # Authentication & Session
    "login",
    "signin",
    "signup",
    "register",
    "logout",
    "auth",
    "forgot",
    "forgot-password",
    "reset",
    "reset-password",
    # Dashboard & Application Views
    "dashboard",
    "overview",
    "links",
    "analytics",
    "settings",
    "profile",
    "account",
    "user",
    "users",
    # System, API, Health & Admin
    "api",
    "admin",
    "health",
    "status",
    "ping",
    "metrics",
    "docs",
    "redoc",
    "openapi.json",
    # Static Assets & Metadata
    "static",
    "assets",
    "public",
    "uploads",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
    "manifest.json",
    # Pages, Legal & Support
    "terms",
    "privacy",
    "legal",
    "help",
    "support",
    "about",
    "features",
    "contact",
    "pricing",
    "home",
    "app",
    "null",
    "undefined",
}

# Centralized profanity and inappropriate words blocklist
BLOCKED_WORDS: Set[str] = {
    # Adult / Exploitation
    "porn",
    "porno",
    "pornography",
    "xxx",
    "sex",
    "sexy",
    "nude",
    "nudes",
    "nsfw",
    "erotic",
    "hentai",
    "milf",
    "boobs",
    "tits",
    "vagina",
    "penis",
    "dick",
    "cock",
    "pussy",
    "asshole",
    "blowjob",
    "dildo",
    "orgasm",
    "anal",
    "clitoris",
    "masturbate",
    "ejaculation",
    "stripper",
    # Vulgar profanities
    "fuck",
    "fucking",
    "fucker",
    "motherfucker",
    "shit",
    "shitty",
    "bullshit",
    "bitch",
    "bitches",
    "cunt",
    "bastard",
    "slut",
    "whore",
    "twat",
    "wanker",
    "douche",
    "jackass",
    # Hate speech, Extremism, Slurs
    "nazi",
    "hitler",
    "terrorist",
    "jihad",
    "suicide",
    "faggot",
    "fag",
    "nigga",
    "nigger",
    "chink",
    "spic",
    "kike",
    "retard",
    # Malware & Abuse
    "phishing",
    "malware",
    "ransomware",
    "spyware",
    "virus",
}


def is_profane_or_blocked(alias: str) -> bool:
    """
    Checks if an alias contains blocked or profane words (case-insensitively).
    Uses token-based and normalization matching to prevent false positives on innocent words
    (e.g., 'classic', 'assistant', 'document' will NOT be falsely blocked).
    """
    if not alias:
        return False

    normalized = alias.lower().strip()

    # 1. Exact match on normalized full string
    if normalized in BLOCKED_WORDS:
        return True

    # 2. Match without non-alphanumeric separators (e.g. 'f_u_c_k' -> 'fuck')
    stripped_separators = re.sub(r"[-_]+", "", normalized)
    if stripped_separators in BLOCKED_WORDS:
        return True

    # 3. Token-based matching (splitting on hyphens, underscores, and digits)
    tokens = re.split(r"[-_\d]+", normalized)
    for token in tokens:
        if token and token in BLOCKED_WORDS:
            return True

    # 4. Check for high-severity core terms anywhere in stripped string
    high_severity_terms = {
        "fuck", "porn", "nigger", "nigga", "faggot", "hitler", "nazi", "cunt", "motherfucker"
    }
    for term in high_severity_terms:
        if term in stripped_separators:
            return True

    return False
