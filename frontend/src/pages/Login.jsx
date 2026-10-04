import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/format";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.access_token, res.data.user); // save token + user
      const home = res.data.user.role === "recruiter" ? "/recruiter" : "/candidate";
      navigate(location.state?.from || home, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-sky flex-grow-1">
      <div className="auth-wrap card-box">
        <h3 className="mb-1">Welcome back</h3>
        <p className="text-muted">Sign in to continue.</p>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <button className="btn btn-primary w-100" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <p className="text-center mt-3 mb-0 small">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}
