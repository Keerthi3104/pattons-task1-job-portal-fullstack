# companies.py - recruiter's company profile
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import require_recruiter
from app.database import get_db
from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyOut, CompanyUpdate

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post("", response_model=CompanyOut, status_code=201)
def create_company(data: CompanyCreate, db: Session = Depends(get_db), recruiter: User = Depends(require_recruiter)):
    if recruiter.company:
        raise HTTPException(status_code=400, detail="You already have a company profile")
    company = Company(owner_id=recruiter.id, **data.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


# NOTE: "/me" must be written BEFORE "/{company_id}", otherwise FastAPI treats "me" as an id.
@router.get("/me", response_model=CompanyOut)
def get_my_company(recruiter: User = Depends(require_recruiter)):
    if not recruiter.company:
        raise HTTPException(status_code=404, detail="Company profile not created yet")
    return recruiter.company


@router.get("/{company_id}", response_model=CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/{company_id}", response_model=CompanyOut)
def update_company(
    company_id: int, data: CompanyUpdate, db: Session = Depends(get_db), recruiter: User = Depends(require_recruiter)
):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    if company.owner_id != recruiter.id:  # ownership check
        raise HTTPException(status_code=403, detail="This is not your company")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company
