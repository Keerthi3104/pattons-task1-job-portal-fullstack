# jobs.py - create, search, view, edit, delete jobs
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth.dependencies import require_recruiter
from app.database import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobCreate, JobOut, JobUpdate, JobWithCount

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("", response_model=JobOut, status_code=201)
def create_job(data: JobCreate, db: Session = Depends(get_db), recruiter: User = Depends(require_recruiter)):
    if not recruiter.company:
        raise HTTPException(status_code=400, detail="Create your company profile before posting jobs")
    if data.salary_min and data.salary_max and data.salary_min > data.salary_max:
        raise HTTPException(status_code=400, detail="Minimum salary cannot be more than maximum salary")
    job = Job(company_id=recruiter.company.id, **data.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("", response_model=List[JobOut])
def list_jobs(
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    skill: Optional[str] = None,
    min_salary: Optional[int] = Query(default=None, ge=0),
    employment_type: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    skip: int = 0,
    db: Session = Depends(get_db),
):
    """Public API. Every filter is optional - we add a filter only if the user sent it."""
    query = db.query(Job)
    if keyword:
        like = f"%{keyword}%"
        query = query.filter(or_(Job.title.ilike(like), Job.description.ilike(like), Job.skills_required.ilike(like)))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if skill:
        query = query.filter(Job.skills_required.ilike(f"%{skill}%"))
    if min_salary is not None:
        query = query.filter(Job.salary_max >= min_salary)  # jobs that pay at least this much
    if employment_type:
        query = query.filter(Job.employment_type == employment_type)
    return query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()


# "/my" before "/{job_id}" for the same reason as companies.
@router.get("/my", response_model=List[JobWithCount])
def my_jobs(recruiter: User = Depends(require_recruiter)):
    if not recruiter.company:
        return []
    return sorted(recruiter.company.jobs, key=lambda j: j.created_at, reverse=True)


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


def _get_own_job(job_id: int, db: Session, recruiter: User) -> Job:
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not recruiter.company or job.company_id != recruiter.company.id:
        raise HTTPException(status_code=403, detail="This is not your job posting")
    return job


@router.put("/{job_id}", response_model=JobOut)
def update_job(job_id: int, data: JobUpdate, db: Session = Depends(get_db), recruiter: User = Depends(require_recruiter)):
    job = _get_own_job(job_id, db, recruiter)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db), recruiter: User = Depends(require_recruiter)):
    job = _get_own_job(job_id, db, recruiter)
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}
