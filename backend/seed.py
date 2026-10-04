# seed.py - OPTIONAL: adds demo users and jobs so the UI is not empty.
# Run from the backend folder:  python seed.py
from app.auth.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Company, Job, User

Base.metadata.create_all(bind=engine)
db = SessionLocal()

if db.query(User).filter(User.email == "recruiter@example.com").first():
    print("Demo data already exists.")
else:
    recruiter = User(name="Demo Recruiter", email="recruiter@example.com",
                     password_hash=hash_password("password123"), role="recruiter")
    candidate = User(name="Demo Candidate", email="candidate@example.com",
                     password_hash=hash_password("password123"), role="candidate",
                     location="Chennai", skills="Python, React, SQL")
    db.add_all([recruiter, candidate])
    db.commit()

    company = Company(owner_id=recruiter.id, name="TechNova Solutions", location="Chennai",
                      website="https://example.com", description="A product company building web apps.")
    db.add(company)
    db.commit()

    jobs = [
        ("Python Backend Developer", "Build REST APIs with FastAPI and PostgreSQL for our products.", "Python, FastAPI, PostgreSQL", "Chennai", 400000, 700000, "Full-time"),
        ("React Frontend Developer", "Create responsive user interfaces using React and Bootstrap.", "React, JavaScript, CSS", "Bengaluru", 350000, 650000, "Full-time"),
        ("Full Stack Intern", "Learn and contribute to React + FastAPI projects with a mentor.", "React, Python, Git", "Remote", 120000, 240000, "Internship"),
        ("Data Analyst", "Analyse business data and build dashboards for the team.", "SQL, Excel, Python", "Coimbatore", 300000, 500000, "Full-time"),
        ("QA Engineer", "Write test cases and automate API testing.", "Testing, Postman, Python", "Chennai", 280000, 450000, "Contract"),
        ("UI/UX Designer", "Design clean user flows and prototypes for web apps.", "Figma, UI Design, CSS", "Remote", 320000, 600000, "Part-time"),
    ]
    for t, d, s, l, mn, mx, e in jobs:
        db.add(Job(company_id=company.id, title=t, description=d, skills_required=s, location=l,
                   salary_min=mn, salary_max=mx, employment_type=e))
    db.commit()
    print("Demo data added. Login: recruiter@example.com / password123  or  candidate@example.com / password123")
db.close()
