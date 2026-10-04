# database.py - creates the connection between FastAPI and PostgreSQL
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# The engine is the actual connection to the database.
# (check_same_thread is only needed if someone tests with SQLite.)
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

# Each request gets its own "session" (a short conversation with the database).
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All model classes (tables) inherit from this Base.
Base = declarative_base()


def get_db():
    """Dependency: open a session for a request, always close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
