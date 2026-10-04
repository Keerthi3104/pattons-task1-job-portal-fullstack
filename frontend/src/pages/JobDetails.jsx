import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import CompanyAvatar from "../components/CompanyAvatar";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatSalary, getErrorMessage, skillList } from "../utils/format";

export default function JobDetails() {
  const { id } = useParams(); // the :id from the URL
  const { user } = useAuth();
  const isCandidate = user?.role === "candidate";

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [application, setApplication] = useState(null); // set when the candidate already applied
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    api
      .get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch((err) => setError(getErrorMessage(err, "Job not found")))
      .finally(() => setLoading(false));
  }, [id]);

  // For candidates: load their resumes and check whether they already applied.
  useEffect(() => {
    if (!isCandidate) return;
    api.get("/resume/my").then((res) => {
      setResumes(res.data);
      if (res.data.length > 0) setResumeId(String(res.data[0].id));
    });
    api.get("/applications").then((res) => {
      setApplication(res.data.find((a) => a.job_id === Number(id)) || null);
    });
  }, [id, isCandidate]);

  const handleApply = async () => {
    setApplying(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await api.post("/applications", { job_id: Number(id), resume_id: Number(resumeId) });
      setApplication(res.data);
      setMessage({ type: "success", text: "Application submitted. Good luck!" });
    } catch (err) {
      setMessage({ type: "danger", text: getErrorMessage(err) });
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loader text="Loading job..." />;
  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div><Link to="/jobs">Back to jobs</Link></div>;

  const companyName = job.company?.name || "Company";

  return (
    <>
      <div className="page-sky">
        <div className="container d-flex align-items-center gap-3">
          <CompanyAvatar name={companyName} size={64} />
          <div>
            <h2 className="mb-1">{job.title}</h2>
            <div className="text-muted">{companyName} · {job.location || "Location not specified"} · Posted {formatDate(job.created_at)}</div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card-box mb-3">
              <h5>Job description</h5>
              <p style={{ whiteSpace: "pre-line" }}>{job.description}</p>
              <h5 className="mt-4">Skills required</h5>
              {skillList(job.skills_required).length === 0 && <p className="text-muted">Not specified</p>}
              {skillList(job.skills_required).map((s) => <span key={s} className="skill-pill">{s}</span>)}
            </div>
            {job.company?.description && (
              <div className="card-box">
                <h5>About {companyName}</h5>
                <p className="mb-1">{job.company.description}</p>
                {job.company.website && <a href={job.company.website} target="_blank" rel="noreferrer">{job.company.website}</a>}
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card-box mb-3">
              <div className="mb-2"><i className="bi bi-cash-stack text-primary me-2"></i>{formatSalary(job.salary_min, job.salary_max)}</div>
              <div className="mb-2"><i className="bi bi-briefcase text-primary me-2"></i>{job.employment_type}</div>
              <div><i className="bi bi-geo-alt text-primary me-2"></i>{job.location || "Not specified"}</div>
            </div>

            <div className="card-box">
              {!user && (
                <>
                  <p className="mb-3">Sign in as a candidate to apply for this job.</p>
                  <Link to="/login" state={{ from: `/jobs/${id}` }} className="btn btn-primary w-100 mb-2">Sign in to apply</Link>
                  <Link to="/register" className="btn btn-outline-primary w-100">Create account</Link>
                </>
              )}
              {user && !isCandidate && <p className="mb-0 text-muted">Recruiter accounts cannot apply for jobs.</p>}
              {isCandidate && (
                <>
                  {message.text && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}
                  {application ? (
                    <div>
                      <div className="mb-2 fw-semibold">You applied for this job</div>
                      <div className="mb-3">Status: <StatusBadge status={application.status} /></div>
                      <Link to="/candidate/applications" className="btn btn-outline-primary w-100">Track applications</Link>
                    </div>
                  ) : resumes.length === 0 ? (
                    <div>
                      <p>Upload a resume before applying.</p>
                      <Link to="/candidate/profile" className="btn btn-primary w-100">Upload resume</Link>
                    </div>
                  ) : (
                    <div>
                      <label className="form-label">Resume to send</label>
                      <select className="form-select mb-3" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                        {resumes.map((r) => <option key={r.id} value={r.id}>{r.file_name}</option>)}
                      </select>
                      <button className="btn btn-primary w-100" onClick={handleApply} disabled={applying}>
                        {applying ? "Submitting..." : "Apply now"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
