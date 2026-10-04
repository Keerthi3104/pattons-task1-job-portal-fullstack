import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { STATUSES, formatDate, getErrorMessage } from "../../utils/format";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [resumeCount, setResumeCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    // Promise.all = run 3 API calls at the same time and wait for all of them
    Promise.all([api.get("/dashboard/stats"), api.get("/applications"), api.get("/resume/my")])
      .then(([s, a, r]) => {
        setStats(s.data);
        setApplications(a.data);
        setResumeCount(r.data.length);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return <Loader />;

  const needsProfile = resumeCount === 0 || !user.skills || !user.location;

  return (
    <>
      <h4 className="mb-3">Hello, {user.name.split(" ")[0]}</h4>

      {needsProfile && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span>Complete your profile: add your skills, location and a resume so recruiters can find you.</span>
          <Link to="/candidate/profile" className="btn btn-sm btn-primary">Complete profile</Link>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <div className="overview-card">
            <div className="opacity-75">Total applications</div>
            <div className="big my-2">{stats.total_applications}</div>
            <Link to="/jobs" className="btn btn-light btn-sm mt-2">Find more jobs</Link>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="row g-3">
            {STATUSES.map((s) => (
              <div key={s} className="col-6 col-md-4">
                <div className="stat-card">
                  <div className="num">{stats.by_status[s]}</div>
                  <div className="small text-muted">{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-box">
        <div className="d-flex justify-content-between mb-2">
          <h5 className="mb-0">Recent applications</h5>
          <Link to="/candidate/applications" className="small">View all</Link>
        </div>
        {applications.length === 0 ? (
          <EmptyState icon="bi-file-earmark-text" title="No applications yet" text="Find a job you like and apply in one click.">
            <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>
          </EmptyState>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Job</th><th>Company</th><th>Applied on</th><th>Status</th></tr></thead>
              <tbody>
                {applications.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td><Link to={`/jobs/${a.job_id}`} className="fw-semibold text-decoration-none">{a.job.title}</Link></td>
                    <td>{a.job.company?.name}</td>
                    <td>{formatDate(a.applied_at)}</td>
                    <td><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
