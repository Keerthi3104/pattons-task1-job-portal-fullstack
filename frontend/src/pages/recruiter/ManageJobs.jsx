import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { formatDate, formatSalary, getErrorMessage } from "../../utils/format";

export default function ManageJobs() {
  const location = useLocation();
  const [jobs, setJobs] = useState(null);
  const [message, setMessage] = useState(location.state?.message ? { type: "success", text: location.state.message } : null);

  useEffect(() => {
    api.get("/jobs/my")
      .then((res) => setJobs(res.data))
      .catch((err) => setMessage({ type: "danger", text: getErrorMessage(err) }));
  }, []);

  const handleDelete = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? Its applications will be deleted too.`)) return;
    try {
      await api.delete(`/jobs/${job.id}`);
      setJobs(jobs.filter((j) => j.id !== job.id)); // remove it from the screen
      setMessage({ type: "success", text: "Job deleted" });
    } catch (err) {
      setMessage({ type: "danger", text: getErrorMessage(err) });
    }
  };

  if (!jobs && !message) return <Loader />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Manage jobs</h4>
        <Link to="/recruiter/jobs/new" className="btn btn-primary"><i className="bi bi-plus-lg me-1"></i>Post a job</Link>
      </div>
      {message && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}

      {jobs && jobs.length === 0 ? (
        <EmptyState icon="bi-briefcase" title="You have not posted any jobs" text="Post your first job to start receiving applications.">
          <Link to="/recruiter/jobs/new" className="btn btn-primary">Post a job</Link>
        </EmptyState>
      ) : (
        jobs && (
          <div className="card-box p-0">
            <div className="table-responsive">
              <table className="table mb-0">
                <thead><tr><th>Job</th><th>Type</th><th>Salary</th><th>Posted</th><th>Applicants</th><th className="text-end">Actions</th></tr></thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <Link to={`/jobs/${job.id}`} className="fw-semibold text-decoration-none">{job.title}</Link>
                        <div className="small text-muted">{job.location}</div>
                      </td>
                      <td>{job.employment_type}</td>
                      <td className="small">{formatSalary(job.salary_min, job.salary_max)}</td>
                      <td>{formatDate(job.created_at)}</td>
                      <td><Link to={`/recruiter/applications?job_id=${job.id}`}>{job.applications_count}</Link></td>
                      <td className="text-end text-nowrap">
                        <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn btn-sm btn-outline-primary me-2">Edit</Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(job)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </>
  );
}
