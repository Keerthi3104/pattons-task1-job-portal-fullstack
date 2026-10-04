# JobNest - Job Portal

A simple full-stack job portal with two roles: **Candidate** and **Recruiter**.

**Tech stack:** React (Vite) + Bootstrap · FastAPI · SQLAlchemy · PostgreSQL · JWT (PyJWT) · bcrypt

## Features
- **Candidate:** register/login, profile (skills, location), resume upload, search & filter jobs (keyword, location, skill, salary, type), apply, track application status, dashboard
- **Recruiter:** register/login, company profile, post/edit/delete jobs, view applicants, download resumes, update application status, dashboard
- JWT authentication with role-based access (candidate / recruiter)

## Project structure
```text
job-portal/
├── backend/
│   ├── app/
│   │   ├── main.py          # starts the app, CORS, includes routers
│   │   ├── config.py        # reads .env
│   │   ├── database.py      # PostgreSQL connection + session
│   │   ├── models/          # database tables (SQLAlchemy)
│   │   ├── schemas/         # request/response shapes (Pydantic)
│   │   ├── routers/         # API endpoints
│   │   ├── auth/            # password hashing, JWT, role guards
│   │   └── utils/           # resume upload helper
│   ├── uploads/resumes/     # uploaded files (git-ignored)
│   ├── seed.py              # optional demo data
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── api/             # axios setup (adds JWT token)
        ├── context/         # AuthContext (login state)
        ├── components/      # Navbar, Sidebar layout, JobCard ...
        ├── pages/           # public, candidate/, recruiter/
        └── App.jsx          # routes
```

## Run locally (Windows PowerShell)

### 1. Database
In pgAdmin 4 create an empty database named `jobportal`.

### 2. Backend
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env      # then edit .env: put your PostgreSQL password and a long random SECRET_KEY
python seed.py              # optional: demo users and jobs
uvicorn app.main:app --reload
```
API: http://localhost:8000 · Swagger docs: http://localhost:8000/docs

Tables are created automatically when the server starts.

### 3. Frontend
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```
Open http://localhost:5173

### Demo logins (after `python seed.py`)
| Role | Email | Password |
|---|---|---|
| Recruiter | recruiter@example.com | password123 |
| Candidate | candidate@example.com | password123 |

## API summary
| Method | Endpoint | Who |
|---|---|---|
| POST | /auth/register, /auth/login | Public |
| GET/PUT | /users/me | Logged in |
| POST/GET/PUT | /companies, /companies/me, /companies/{id} | Recruiter |
| GET | /jobs, /jobs/{id} | Public |
| POST/PUT/DELETE | /jobs, /jobs/{id} | Recruiter (own jobs) |
| GET | /jobs/my | Recruiter |
| POST | /resume/upload | Candidate |
| GET | /resume/my, /resume/{id}/download | Candidate / Recruiter (applicants only) |
| POST | /applications | Candidate |
| GET | /applications, /applications/{id} | Candidate (own) / Recruiter (own jobs) |
| PUT | /applications/{id}/status | Recruiter (own jobs) |
| GET | /dashboard/stats | Logged in |

## Common errors
| Error | Fix |
|---|---|
| `password authentication failed` | Wrong password in `DATABASE_URL`. Special characters in the password must be URL-encoded (`@` -> `%40`) |
| `database "jobportal" does not exist` | Create it in pgAdmin |
| Browser shows CORS error / Network Error | Backend is not running, or `FRONTEND_URL` in backend `.env` is not `http://localhost:5173` |
| `running scripts is disabled` | `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` |
| `pip install` fails on Python 3.14 | Install Python 3.13 and recreate the venv |
