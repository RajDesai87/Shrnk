import sqlite3
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

# Determine database engine parameters based on database dialect
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

# Create SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

# Enable Foreign Key support in SQLite (disabled by default in SQLite)
if is_sqlite:
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Declarative Base for ORM models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session per request
    and ensures the session is closed afterward.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _ensure_sqlite_unique_index():
    """
    Ensures that urls.short_code has a unique case-insensitive index in SQLite to guarantee
    that an alias cannot be claimed if it is currently in use by any non-deleted URL record.
    """
    if not is_sqlite:
        return

    db_path = settings.DATABASE_URL.replace("sqlite:///", "").replace("sqlite://", "")
    if not db_path:
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        # Create case-insensitive unique index
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_urls_short_code_nocase ON urls (short_code COLLATE NOCASE);")
        conn.commit()
        conn.close()
    except Exception:
        pass


def init_db():
    """
    Initializes the database schema.
    Creates all tables defined in Base.metadata if they do not already exist.
    Does NOT destroy or overwrite existing tables or data.
    """
    # Import all models to register them with Base.metadata before creating tables
    import backend.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_unique_index()


if __name__ == "__main__":
    print(f"Initializing SHRNK database using: {settings.DATABASE_URL}")
    init_db()
    print("Database tables initialized successfully.")
