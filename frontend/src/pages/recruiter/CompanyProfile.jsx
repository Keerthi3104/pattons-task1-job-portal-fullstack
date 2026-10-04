import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import { getErrorMessage } from "../../utils/format";

export default function CompanyProfile() {
  const [company, setCompany] = useState(null); // null = company not created yet
  const [form, setForm] = useState({ name: "", description: "", website: "", location: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    api
      .get("/companies/me")
      .then((res) => {
        setCompany(res.data);
        setForm({
          name: res.data.name || "",
          description: res.data.description || "",
          website: res.data.website || "",
          location: res.data.location || "",
        });
      })
      .catch(() => {}) // 404 means "no company yet", so we show an empty form
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = company ? await api.put(`/companies/${company.id}`, form) : await api.post("/companies", form);
      setCompany(res.data);
      setMessage({ type: "success", text: company ? "Company profile updated" : "Company profile created. You can post jobs now." });
    } catch (err) {
      setMessage({ type: "danger", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <h4 className="mb-3">Company profile</h4>
      <form className="card-box" style={{ maxWidth: 640 }} onSubmit={handleSubmit}>
        {message.text && <div className={`alert alert-${message.type} py-2`}>{message.text}</div>}
        <div className="mb-3">
          <label className="form-label">Company name</label>
          <input className="form-control" name="name" value={form.name} onChange={handleChange} required minLength={2} />
        </div>
        <div className="mb-3">
          <label className="form-label">About the company</label>
          <textarea className="form-control" rows={4} name="description" value={form.description} onChange={handleChange} />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Website</label>
            <input className="form-control" name="website" value={form.website} onChange={handleChange} placeholder="https://example.com" />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Location</label>
            <input className="form-control" name="location" value={form.location} onChange={handleChange} />
          </div>
        </div>
        <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : company ? "Save changes" : "Create company"}</button>
      </form>
    </>
  );
}
