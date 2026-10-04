# resume.py - upload and download resumes
import os
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_candidate
from app.database import get_db
from app.models.application import Application
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeOut
from app.utils.file_upload import save_resume_file

router = APIRouter(prefix="/resume", tags=["Resume"])


@router.post("/upload", response_model=ResumeOut, status_code=201)
def upload_resume(
    file: UploadFile = File(...), db: Session = Depends(get_db), candidate: User = Depends(require_candidate)
):
    saved_path = save_resume_file(file)
    resume = Resume(user_id=candidate.id, file_name=file.filename, file_path=saved_path)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/my", response_model=List[ResumeOut])
def my_resumes(db: Session = Depends(get_db), candidate: User = Depends(require_candidate)):
    return db.query(Resume).filter(Resume.user_id == candidate.id).order_by(Resume.uploaded_at.desc()).all()


@router.get("/{resume_id}/download")
def download_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.get(Resume, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    allowed = resume.user_id == current_user.id  # the owner can always download
    if not allowed and current_user.role == "recruiter" and current_user.company:
        # A recruiter can download it only if the candidate applied to one of THEIR jobs with it.
        allowed = (
            db.query(Application)
            .join(Job, Application.job_id == Job.id)
            .filter(Application.resume_id == resume_id, Job.company_id == current_user.company.id)
            .first()
            is not None
        )
    if not allowed:
        raise HTTPException(status_code=403, detail="You cannot access this resume")
    if not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="File is missing on the server")
    return FileResponse(resume.file_path, filename=resume.file_name)
