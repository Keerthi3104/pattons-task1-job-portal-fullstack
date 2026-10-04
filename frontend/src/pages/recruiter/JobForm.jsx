import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import { EMPLOYMENT_TYPES, getErrorMessage } from "../../utils/format";

const EMPTY = { title: "", description: "", skills_required: "", location: "", salary_min: "", salary_max: "", employment_type: "Full-time" };

// This ONE form is used for both "Post a job" (no id in the URL) and "Edit job" (id in the URL).
export default function JobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [noCompany, setNoCompany] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api
        .get(`/jobs/${id}`)
        .then((res) => {
          const j = res.data;
          setForm({
            title: j.title,
            description: j.description,
            skills_required: j.skills_required || "",
            location: j.location || "",
            salary_min: j.salary_min ?? "",
            salary_max: j.salary_max ?? "",
            employment_type: j.employment_type || "Full-time",
          });
        })
        .catch((err) => setError(getErrorMessage(err)))
        .finally(() => setLoading(false));
    } else {
      api.get("/companies/me").catch(() => setNoCompany(true));
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    // The API expects numbers (or null), but inputs give us text.
    const payload = {
      ...form,
      salary_min: form.salary_min === "" ? null : Number(form.salary_min),
      salary_max: form.salary_max === "" ? null : Number(form.salary_max),
    };
    try {
      if (isEdit) await api.put(`/jobs/${id}`, payload);
      else await api.post("/jobs", payload);
      navigate("/recruiter/jobs", { state: { message: isEdit ? "Job updated" : "Job posted" } });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <h4 className="mb-3">{isEdit ? "Edit job" : "Post a job"}</h4>
      {noCompany && (
        <div className="alert alert-warning">
          You need a company profile before posting jobs. <Link to="/recruiter/company">Create it now</Link>
        </div>
      )}
      <form className="card-box" style={{ maxWidth: 760 }} onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <div className="mb-3">
          <label className="form-label">Job title</label>
          <input className="form-control" name="title" value={form.title} onChange={handleChange} required minLength={2} />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={6} name="description" value={form.description} onChange={handleChange} required minLength={10} />
        </div>
        <div className="mb-3">
          <label className="form-label">Skills required</label>
          <input className="form-control" name="skills_required" value={form.skills_required} onChange={handleChange} placeholder="Python, FastAPI, PostgreSQL" />
          <div className="form-text">Separate skills with commas.</div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Location</label>
            <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Chennai" />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Employment type</label>
            <select className="form-select" name="employment_type" value={form.employment_type} onChange={handleChange}>
              {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Minimum salary (₹ per year)</label>
            <input className="form-control" type="number" min="0" name="salary_min" value={form.salary_min} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Maximum salary (₹ per year)</label>
            <input className="form-control" type="number" min="0" name="salary_max" value={form.salary_max} onChange={handleChange} />
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : isEdit ? "Save changes" : "Post job"}</button>
          <Link to="/recruiter/jobs" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </form>
    </>
  );
}
