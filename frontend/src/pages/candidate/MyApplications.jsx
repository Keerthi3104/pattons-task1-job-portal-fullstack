import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import CompanyAvatar from "../../components/CompanyAvatar";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import StatusBadge from "../../components/StatusBadge";
import StatusTracker from "../../components/StatusTracker";
import { formatDate, getErrorMessage } from "../../utils/format";

export default function MyApplications() {
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/applications")
      .then((res) => setApplications(res.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!applications) return <Loader />;

  return (
    <>
      <h4 className="mb-3">My applications</h4>
      {applications.length === 0 ? (
        <EmptyState icon="bi-file-earmark-text" title="You have not applied to any job yet" text="Your applications and their status will show up here.">
          <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>
        </EmptyState>
      ) : (
        <div className="d-flex flex-column gap-3">
          {applications.map((a) => (
            <div key={a.id} className="card-box">
              <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                <CompanyAvatar name={a.job.company?.name} />
                <div className="flex-grow-1">
                  <Link to={`/jobs/${a.job_id}`} className="fw-bold text-decoration-none fs-6">{a.job.title}</Link>
                  <div className="small text-muted">{a.job.company?.name} · {a.job.location} · Applied on {formatDate(a.applied_at)}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <StatusTracker status={a.status} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
