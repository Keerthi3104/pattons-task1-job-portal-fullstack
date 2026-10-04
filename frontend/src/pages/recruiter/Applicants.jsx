import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import { downloadResume } from "../../utils/download";
import { STATUSES, formatDate, getErrorMessage, skillList } from "../../utils/format";

export default function Applicants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const jobId = searchParams.get("job_id") || "";

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState(null);
  const [selected, setSelected] = useState(null); // application shown in the popup
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api.get("/jobs/my").then((res) => setJobs(res.data));
  }, []);

  // Reload the applications whenever the job filter changes.
  useEffect(() => {
    setApplications(null);
    api
      .get("/applications", { params: jobId ? { job_id: jobId } : {} })
      .then((res) => setApplications(res.data))
      .catch((err) => { setApplications([]); setMessage({ type: "danger", text: getErrorMessage(err) }); });
  }, [jobId]);

  const changeStatus = async (application, status) => {
    try {
      const res = await api.put(`/applications/${application.id}/status`, { status });
      setApplications(applications.map((a) => (a.id === application.id ? res.data : a)));
      setMessage({ type: "success", text: `${application.candidate.name} moved to "${status}"` });
    } catch (err) {
      setMessage({ type: "danger", text: getErrorMessage(err) });
    }
  };

  const handleDownload = async (resume) => {
    try {
      await downloadResume(resume);
    } catch (err) {
      setMessage({ type: "danger", text: getErrorMessage(err, "Could not download the resume") });
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h4 className="mb-0">Applications</h4>
        <select
          className="form-select w-auto"
          value={jobId}
          onChange={(e) => setSearchParams(e.target.value ? { job_id: e.target.value } : {})}
        >
          <option value="">All jobs</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>
      {message && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}

      {!applications && <Loader />}
      {applications && applications.length === 0 && (
        <EmptyState icon="bi-people" title="No applications yet" text="Applications to your jobs will appear here.">
          <Link to="/recruiter/jobs" className="btn btn-primary">Manage jobs</Link>
        </EmptyState>
      )}
      {applications && applications.length > 0 && (
        <div className="card-box p-0">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Candidate</th><th>Job</th><th>Applied</th><th>Resume</th><th>Status</th></tr></thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <button className="btn btn-link p-0 fw-semibold text-decoration-none" onClick={() => setSelected(a)}>{a.candidate.name}</button>
                      <div className="small text-muted">{a.candidate.email}</div>
                    </td>
                    <td>{a.job.title}</td>
                    <td>{formatDate(a.applied_at)}</td>
                    <td>
                      {a.resume ? (
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownload(a.resume)}>
                          <i className="bi bi-download me-1"></i>Resume
                        </button>
                      ) : "-"}
                    </td>
                    <td>
                      <select className="form-select form-select-sm" style={{ minWidth: 140 }} value={a.status} onChange={(e) => changeStatus(a, e.target.value)}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop-custom" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="mb-0">{selected.candidate.name}</h5>
                <div className="text-muted small">Applied for {selected.job.title}</div>
              </div>
              <button className="btn-close" onClick={() => setSelected(null)} aria-label="Close"></button>
            </div>
            <div className="mb-2"><i className="bi bi-envelope text-primary me-2"></i>{selected.candidate.email}</div>
            <div className="mb-2"><i className="bi bi-telephone text-primary me-2"></i>{selected.candidate.phone || "Not provided"}</div>
            <div className="mb-3"><i className="bi bi-geo-alt text-primary me-2"></i>{selected.candidate.location || "Not provided"}</div>
            <div className="fw-semibold mb-1">Skills</div>
            <div className="mb-3">
              {skillList(selected.candidate.skills).length === 0 && <span className="text-muted">Not provided</span>}
              {skillList(selected.candidate.skills).map((s) => <span key={s} className="skill-pill">{s}</span>)}
            </div>
            {selected.resume && (
              <button className="btn btn-primary" onClick={() => handleDownload(selected.resume)}>
                <i className="bi bi-download me-1"></i>Download resume
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
