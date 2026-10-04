import { Link } from "react-router-dom";
import CompanyAvatar from "./CompanyAvatar";
import { formatDate, formatSalary } from "../utils/format";

export default function JobCard({ job }) {
  const companyName = job.company?.name || "Company";
  return (
    <Link to={`/jobs/${job.id}`} className="job-card">
      <span className="job-chip">
        <i className="bi bi-briefcase me-1"></i>
        {job.employment_type}
      </span>
      <h3 className="job-title">{job.title}</h3>
      <div className="job-meta"><i className="bi bi-geo-alt"></i> {job.location || "Location not specified"}</div>
      <div className="job-meta"><i className="bi bi-cash-stack"></i> {formatSalary(job.salary_min, job.salary_max)}</div>
      <div className="job-card-bottom">
        <div>
          <div className="small text-muted">{formatDate(job.created_at)}</div>
          <div className="fw-semibold small">{companyName}</div>
        </div>
        <CompanyAvatar name={companyName} />
      </div>
    </Link>
  );
}
