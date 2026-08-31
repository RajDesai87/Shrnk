import os
from pathlib import Path
from dotenv import load_dotenv

# Locate the root directory and .env file
ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT_DIR / ".env"

# Load environment variables from .env if present
load_dotenv(dotenv_path=ENV_PATH)

class Settings:
    """
    Application Settings
    Configured to load from .env with secure fallback defaults.
    Migrating to PostgreSQL only requires changing DATABASE_URL in .env.
    """
    PROJECT_NAME: str = "SHRNK"
    VERSION: str = "1.0.0"
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./shrnk.db")
    
    # Security / JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-jwt-key-change-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # App URLs - Dynamic Base URL used at runtime to construct public short URLs
    BASE_URL: str = os.getenv("BASE_URL", os.getenv("VITE_BASE_URL", "http://localhost:8000"))


settings = Settings()
