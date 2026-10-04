# main.py - the starting point of the backend
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (loads all tables)
from app.config import settings
from app.database import Base, engine
from app.routers import applications, auth, companies, dashboard, jobs, resume, users

# Creates the tables in PostgreSQL if they don't exist yet.
Base.metadata.create_all(bind=engine)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="Job Portal API", version="1.0.0")

# CORS: lets the React app (running on port 5173) call this API (running on port 8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth.router, users.router, companies.router, jobs.router, resume.router, applications.router, dashboard.router):
    app.include_router(r)


@app.get("/", tags=["Health"])
def home():
    return {"message": "Job Portal API is running. Open /docs to test the APIs."}
