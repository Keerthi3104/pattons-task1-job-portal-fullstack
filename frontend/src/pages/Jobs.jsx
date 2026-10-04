import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";
import JobCard from "../components/JobCard";
import Loader from "../components/Loader";
import { EMPLOYMENT_TYPES, getErrorMessage } from "../utils/format";

const EMPTY = { keyword: "", location: "", skill: "", min_salary: "", employment_type: "" };

export default function Jobs() {
  // The filters live in the URL (?keyword=python&location=chennai) so a search can be shared or refreshed.
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState(EMPTY);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Whenever the URL changes: fill the form from the URL and call the API.
  useEffect(() => {
    const params = Object.fromEntries(searchParams);
    setForm({ ...EMPTY, ...params });
    setLoading(true);
    setError("");
    let cancelled = false;
    api
      .get("/jobs", { params })
      .then((res) => !cancelled && setJobs(res.data))
      .catch((err) => !cancelled && setError(getErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [searchParams]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = {};
    Object.entries(form).forEach(([key, value]) => {
      if (String(value).trim()) clean[key] = String(value).trim();
    });
    setSearchParams(clean);
  };

  return (
    <>
      <div className="page-sky">
        <div className="container">
          <h2 className="mb-1">Find jobs</h2>
          <p className="text-muted mb-0">{loading ? "Searching..." : `${jobs.length} job${jobs.length === 1 ? "" : "s"} found`}</p>
        </div>
      </div>
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-3">
            <form className="card-box" onSubmit={handleSubmit}>
              <h6 className="mb-3">Filters</h6>
              <div className="mb-3">
                <label className="form-label">Job title or keyword</label>
                <input className="form-control" name="keyword" value={form.keyword} onChange={handleChange} placeholder="e.g. developer" />
              </div>
              <div className="mb-3">
                <label className="form-label">Location</label>
                <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Chennai" />
              </div>
              <div className="mb-3">
                <label className="form-label">Skill</label>
                <input className="form-control" name="skill" value={form.skill} onChange={handleChange} placeholder="e.g. Python" />
              </div>
              <div className="mb-3">
                <label className="form-label">Minimum salary</label>
                <select className="form-select" name="min_salary" value={form.min_salary} onChange={handleChange}>
                  <option value="">Any</option>
                  <option value="200000">₹2L+ per year</option>
                  <option value="400000">₹4L+ per year</option>
                  <option value="600000">₹6L+ per year</option>
                  <option value="1000000">₹10L+ per year</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Employment type</label>
                <select className="form-select" name="employment_type" value={form.employment_type} onChange={handleChange}>
                  <option value="">Any</option>
                  {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <button className="btn btn-primary w-100 mb-2">Apply filters</button>
              <button type="button" className="btn btn-outline-secondary w-100" onClick={() => setSearchParams({})}>Clear all</button>
            </form>
          </div>

          <div className="col-lg-9">
            {loading && <Loader text="Searching jobs..." />}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && jobs.length === 0 && (
              <EmptyState icon="bi-search" title="No jobs match your search" text="Try a different keyword or remove some filters.">
                <button className="btn btn-primary" onClick={() => setSearchParams({})}>Clear filters</button>
              </EmptyState>
            )}
            <div className="row g-3">
              {!loading && jobs.map((job) => (
                <div key={job.id} className="col-md-6 col-xl-4"><JobCard job={job} /></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
