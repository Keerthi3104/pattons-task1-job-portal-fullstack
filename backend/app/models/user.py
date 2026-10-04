from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """One table for both candidates and recruiters. The 'role' column tells them apart."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)  # "candidate" or "recruiter"
    phone = Column(String(20))
    location = Column(String(100))
    skills = Column(Text)  # comma separated, e.g. "Python, React, SQL"
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="owner", uselist=False)
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate")
