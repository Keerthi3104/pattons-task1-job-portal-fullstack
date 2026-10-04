# applications.py - apply for jobs, view applications, update status
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_candidate, require_recruiter
from app.database import get_db
from app.models.application import Application
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationOut, StatusUpdate

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("", response_model=ApplicationOut, status_code=201)
def apply_for_job(data: ApplicationCreate, db: Session = Depends(get_db), candidate: User = Depends(require_candidate)):
    job = db.get(Job, data.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    already = db.query(Application).filter(Application.job_id == job.id, Application.candidate_id == candidate.id).first()
    if already:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    if data.resume_id:
        resume = db.get(Resume, data.resume_id)
        if not resume or resume.user_id != candidate.id:
            raise HTTPException(status_code=400, detail="Invalid resume")
    else:
        resume = db.query(Resume).filter(Resume.user_id == candidate.id).order_by(Resume.uploaded_at.desc()).first()
    if not resume:
        raise HTTPException(status_code=400, detail="Please upload a resume before applying")

    application = Application(job_id=job.id, candidate_id=candidate.id, resume_id=resume.id, status="Applied")
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("", response_model=List[ApplicationOut])
def list_applications(
    job_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Candidate -> own applications. Recruiter -> applications received for their jobs."""
    query = db.query(Application)
    if current_user.role == "candidate":
        query = query.filter(Application.candidate_id == current_user.id)
    else:
        if not current_user.company:
            return []
        query = query.join(Job, Application.job_id == Job.id).filter(Job.company_id == current_user.company.id)
        if job_id:
            query = query.filter(Application.job_id == job_id)
    return query.order_by(Application.applied_at.desc()).all()


def _can_view(application: Application, user: User) -> bool:
    if user.role == "candidate":
        return application.candidate_id == user.id
    return bool(user.company) and application.job.company_id == user.company.id


@router.get("/{application_id}", response_model=ApplicationOut)
def get_application(application_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if not _can_view(application, current_user):
        raise HTTPException(status_code=403, detail="You cannot view this application")
    return application


@router.put("/{application_id}/status", response_model=ApplicationOut)
def update_status(
    application_id: int, data: StatusUpdate, db: Session = Depends(get_db), recruiter: User = Depends(require_recruiter)
):
    application = db.get(Application, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if not _can_view(application, recruiter):  # is this application for one of MY jobs?
        raise HTTPException(status_code=403, detail="This application is not for your job")
    application.status = data.status
    db.commit()
    db.refresh(application)
    return application
