from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.company import CompanyOut


class JobCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    description: str = Field(min_length=10)
    skills_required: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = Field(default=None, ge=0)
    salary_max: Optional[int] = Field(default=None, ge=0)
    employment_type: str = "Full-time"


class JobUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=150)
    description: Optional[str] = Field(default=None, min_length=10)
    skills_required: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = Field(default=None, ge=0)
    salary_max: Optional[int] = Field(default=None, ge=0)
    employment_type: Optional[str] = None


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    title: str
    description: str
    skills_required: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    employment_type: Optional[str] = None
    created_at: Optional[datetime] = None
    company: Optional[CompanyOut] = None


class JobWithCount(JobOut):
    applications_count: int = 0
