# dashboard.py - numbers shown on the dashboards
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.application import Application
from app.models.job import Job
from app.models.user import User
from app.schemas.application import StatusType
from typing import get_args

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
ALL_STATUSES = list(get_args(StatusType))


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Application)
    total_jobs = None
    if current_user.role == "candidate":
        query = query.filter(Application.candidate_id == current_user.id)
    else:
        if not current_user.company:
            return {"total_jobs": 0, "total_applications": 0, "by_status": {s: 0 for s in ALL_STATUSES}}
        total_jobs = db.query(Job).filter(Job.company_id == current_user.company.id).count()
        query = query.join(Job, Application.job_id == Job.id).filter(Job.company_id == current_user.company.id)

    applications = query.all()
    by_status = {s: 0 for s in ALL_STATUSES}
    for a in applications:
        by_status[a.status] = by_status.get(a.status, 0) + 1
    return {"total_jobs": total_jobs, "total_applications": len(applications), "by_status": by_status}
