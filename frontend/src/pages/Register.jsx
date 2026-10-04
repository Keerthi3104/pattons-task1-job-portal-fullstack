import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/format";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "candidate" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      // Registered successfully -> log in automatically so the user doesn't type again.
      const res = await api.post("/auth/login", { email: form.email, password: form.password });
      login(res.data.access_token, res.data.user);
      navigate(res.data.user.role === "recruiter" ? "/recruiter/company" : "/candidate/profile", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-sky flex-grow-1">
      <div className="auth-wrap card-box">
        <h3 className="mb-1">Create your account</h3>
        <p className="text-muted">Choose how you want to use JobNest.</p>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <div className={`role-option ${form.role === "candidate" ? "selected" : ""}`} onClick={() => setForm({ ...form, role: "candidate" })}>
                <i className="bi bi-person"></i> I am looking for a job
              </div>
            </div>
            <div className="col-6">
              <div className={`role-option ${form.role === "recruiter" ? "selected" : ""}`} onClick={() => setForm({ ...form, role: "recruiter" })}>
                <i className="bi bi-building"></i> I am hiring
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Full name</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} required minLength={2} />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} maxLength={72} />
            <div className="form-text">At least 6 characters.</div>
          </div>
          <button className="btn btn-primary w-100" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        </form>
        <p className="text-center mt-3 mb-0 small">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
