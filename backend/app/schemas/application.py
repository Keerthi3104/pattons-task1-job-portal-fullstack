from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.job import JobOut
from app.schemas.resume import ResumeOut
from app.schemas.user import UserOut

StatusType = Literal["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"]


class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: Optional[int] = None  # if empty we use the candidate's latest resume


class StatusUpdate(BaseModel):
    status: StatusType


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    candidate_id: int
    resume_id: Optional[int] = None
    status: str
    applied_at: datetime
    job: JobOut
    candidate: UserOut
    resume: Optional[ResumeOut] = None
