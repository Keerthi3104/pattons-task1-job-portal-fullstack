from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=False)
    skills_required = Column(Text)  # comma separated
    location = Column(String(100), index=True)
    salary_min = Column(Integer)  # per year, in rupees
    salary_max = Column(Integer)
    employment_type = Column(String(30), default="Full-time")
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="jobs")
    # If a job is deleted, its applications are deleted too (cascade).
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    @property
    def applications_count(self):
        return len(self.applications)
