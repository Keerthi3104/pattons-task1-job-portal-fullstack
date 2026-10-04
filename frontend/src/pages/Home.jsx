import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import CompanyAvatar from "../components/CompanyAvatar";
import EmptyState from "../components/EmptyState";
import JobCard from "../components/JobCard";
import Loader from "../components/Loader";
import { formatSalary, getErrorMessage } from "../utils/format";

const POPULAR = ["Python", "React", "JavaScript", "SQL", "Testing", "Figma"];
const CATEGORIES = [
  { name: "Python", icon: "bi-filetype-py" },
  { name: "React", icon: "bi-filetype-jsx" },
  { name: "JavaScript", icon: "bi-filetype-js" },
  { name: "SQL", icon: "bi-database" },
  { name: "Testing", icon: "bi-bug" },
  { name: "Design", icon: "bi-palette" },
];

export default function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Runs once when the page opens: load the 8 newest jobs.
  useEffect(() => {
    api
      .get("/jobs", { params: { limit: 8 } })
      .then((res) => setJobs(res.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (location.trim()) params.set("location", location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1>Find the job that fits your skills</h1>
              <p className="text-muted fs-5 my-3">Search openings from companies hiring right now, apply in a minute and track every step.</p>
              <form className="hero-search" onSubmit={handleSearch}>
                <input className="form-control" placeholder="Job title or skill" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                <input className="form-control" placeholder="City" value={location} onChange={(e) => setLocation(e.target.value)} />
                <button className="btn btn-primary px-4" type="submit"><i className="bi bi-search me-1"></i> Search</button>
              </form>
              <div className="mt-4">
                <div className="small fw-semibold mb-2">Popular searches</div>
                <div className="d-flex flex-wrap gap-2">
                  {POPULAR.map((p) => (
                    <Link key={p} to={`/jobs?skill=${encodeURIComponent(p)}`} className="chip">{p}</Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              {jobs.length > 0 && (
                <div className="hero-visual">
                  {jobs.slice(0, 3).map((job) => (
                    <Link key={job.id} to={`/jobs/${job.id}`} className="mini-job">
                      <CompanyAvatar name={job.company?.name} size={42} />
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{job.title}</div>
                        <div className="small text-muted">{job.company?.name} · {job.location}</div>
                      </div>
                      <div className="small fw-semibold text-end d-none d-sm-block">{formatSalary(job.salary_min, job.salary_max).replace(" / year", "")}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="mb-1">Search by skill</h2>
          <p className="text-muted mb-4">Pick a skill to see matching openings.</p>
          <div className="row g-3">
            {CATEGORIES.map((c) => (
              <div key={c.name} className="col-6 col-md-4 col-lg-2">
                <Link to={`/jobs?skill=${encodeURIComponent(c.name)}`} className="category-card">
                  <div className="category-icon"><i className={`bi ${c.icon}`}></i></div>
                  {c.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container">
          <h2 className="mb-4">Latest job openings</h2>
          {loading && <Loader text="Loading jobs..." />}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && !error && jobs.length === 0 && (
            <EmptyState icon="bi-briefcase" title="No jobs posted yet" text="Recruiters can create an account and post the first job." />
          )}
          <div className="row g-3">
            {jobs.map((job) => (
              <div key={job.id} className="col-md-6 col-lg-3"><JobCard job={job} /></div>
            ))}
          </div>
          {jobs.length > 0 && <Link to="/jobs" className="btn btn-primary mt-4 px-4">View all jobs</Link>}
        </div>
      </section>
    </>
  );
}
