import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { STATUSES, formatDate, getErrorMessage } from "../../utils/format";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [hasCompany, setHasCompany] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/dashboard/stats"), api.get("/applications")])
      .then(([s, a]) => {
        setStats(s.data);
        setApplications(a.data);
      })
      .catch((err) => setError(getErrorMessage(err)));
    api.get("/companies/me").catch(() => setHasCompany(false)); // 404 = no company yet
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return <Loader />;

  const total = stats.total_applications || 1; // avoid dividing by zero

  return (
    <>
      <h4 className="mb-3">Hello, {user.name.split(" ")[0]}</h4>

      {!hasCompany && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>Create your company profile first. You need it to post jobs.</span>
          <Link to="/recruiter/company" className="btn btn-sm btn-primary">Create company profile</Link>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <div className="overview-card">
            <div className="opacity-75">Applications received</div>
            <div className="big my-2">{stats.total_applications}</div>
            <Link to="/recruiter/applications" className="btn btn-light btn-sm mt-2">Review applications</Link>
          </div>
        </div>
        <div className="col-6 col-lg-2">
          <div className="stat-card">
            <div className="stat-icon"><i className="bi bi-briefcase"></i></div>
            <div className="num">{stats.total_jobs}</div>
            <div className="small text-muted">Jobs posted</div>
          </div>
        </div>
        <div className="col-6 col-lg-2">
          <div className="stat-card">
            <div className="stat-icon"><i className="bi bi-person-check"></i></div>
            <div className="num">{stats.by_status["Shortlisted"]}</div>
            <div className="small text-muted">Shortlisted</div>
          </div>
        </div>
        <div className="col-6 col-lg-2">
          <div className="stat-card">
            <div className="stat-icon"><i className="bi bi-calendar-event"></i></div>
            <div className="num">{stats.by_status["Interview"]}</div>
            <div className="small text-muted">Interviews</div>
          </div>
        </div>
        <div className="col-6 col-lg-2">
          <div className="stat-card">
            <div className="stat-icon"><i className="bi bi-patch-check"></i></div>
            <div className="num">{stats.by_status["Selected"]}</div>
            <div className="small text-muted">Selected</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card-box h-100">
            <h5 className="mb-3">Applications by status</h5>
            {STATUSES.map((s) => (
              <div key={s} className="mb-3">
                <div className="d-flex justify-content-between small mb-1"><span>{s}</span><strong>{stats.by_status[s]}</strong></div>
                <div className="progress"><div className="progress-bar" style={{ width: `${(stats.by_status[s] / total) * 100}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card-box h-100">
            <div className="d-flex justify-content-between mb-2">
              <h5 className="mb-0">Latest applications</h5>
              <Link to="/recruiter/applications" className="small">View all</Link>
            </div>
            {applications.length === 0 ? (
              <EmptyState icon="bi-people" title="No applications yet" text="When candidates apply to your jobs they will appear here.">
                <Link to="/recruiter/jobs/new" className="btn btn-primary">Post a job</Link>
              </EmptyState>
            ) : (
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead><tr><th>Candidate</th><th>Job</th><th>Applied</th><th>Status</th></tr></thead>
                  <tbody>
                    {applications.slice(0, 5).map((a) => (
                      <tr key={a.id}>
                        <td className="fw-semibold">{a.candidate.name}</td>
                        <td>{a.job.title}</td>
                        <td>{formatDate(a.applied_at)}</td>
                        <td><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
