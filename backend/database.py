import os
import time
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, DateTime, func, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Load environment variables from .env
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

# Normalize postgres:// to postgresql:// (Neon / Heroku standard compatibility)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

is_postgres = DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgresql+psycopg2://")

if is_postgres:
    # Neon Serverless Postgres engine with pre-ping and SSL
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10
    )
    db_type = "Neon PostgreSQL"
else:
    # Graceful fallback to local SQLite if DATABASE_URL is not configured yet
    fallback_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agrigenius_users.db")
    engine = create_engine(
        f"sqlite:///{fallback_path}",
        connect_args={"check_same_thread": False}
    )
    db_type = "SQLite (Local Fallback - Set DATABASE_URL in .env to connect Neon DB)"

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="farmer", nullable=False)
    phone = Column(String(50), nullable=True)
    dob = Column(String(50), nullable=True)
    place = Column(String(255), nullable=True)
    country = Column(String(100), default="India", nullable=True)
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    village = Column(String(150), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

def init_db():
    """Create tables if they do not exist and ensure columns exist."""
    try:
        Base.metadata.create_all(bind=engine)
        
        # Ensure additional user fields exist in Neon Postgres
        with engine.connect() as conn:
            columns_to_check = [
                ("name", "VARCHAR(255)"),
                ("phone", "VARCHAR(50)"),
                ("dob", "VARCHAR(50)"),
                ("place", "VARCHAR(255)"),
                ("country", "VARCHAR(100)"),
                ("state", "VARCHAR(100)"),
                ("district", "VARCHAR(100)"),
                ("village", "VARCHAR(150)")
            ]
            for col_name, col_type in columns_to_check:
                try:
                    if is_postgres:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_type};"))
                    else:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};"))
                    conn.commit()
                except Exception:
                    # Column already exists or table is up to date
                    pass

        print(f"[Database] Initialized successfully using {db_type}")
    except Exception as e:
        print(f"[Database] Table creation error: {e}")

def get_db():
    """FastAPI dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_db_health() -> Dict[str, Any]:
    """Test connection and return status, latency, host, and user count."""
    start_time = time.time()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            latency_ms = round((time.time() - start_time) * 1000, 2)
            
            # Mask database host for security display
            masked_host = "local_sqlite"
            if is_postgres:
                try:
                    parts = DATABASE_URL.split("@")
                    if len(parts) > 1:
                        host_part = parts[1].split("/")[0]
                        masked_host = host_part[:6] + "***" + host_part[-10:] if len(host_part) > 16 else host_part
                    else:
                        masked_host = "neon.tech"
                except Exception:
                    masked_host = "neon.tech (connected)"

            # Count total users
            with SessionLocal() as session:
                user_count = session.query(User).count()

            return {
                "status": "connected",
                "type": db_type,
                "is_neon": is_postgres,
                "host": masked_host,
                "latency_ms": latency_ms,
                "total_users": user_count
            }
    except Exception as err:
        return {
            "status": "error",
            "type": db_type,
            "is_neon": is_postgres,
            "error": str(err),
            "total_users": 0
        }

# Automatically initialize schema on module load
init_db()

