import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile menu open/closed

  const dashboardPath = user?.role === "recruiter" ? "/recruiter" : "/candidate";

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg site-nav">
      <div className="container">
        <Link to="/" className="brand">
          <i className="bi bi-briefcase-fill"></i> JobNest
        </Link>
        <button className="navbar-toggler border-0" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          <i className="bi bi-list fs-2"></i>
        </button>
        <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item"><NavLink to="/" end className="nav-link" onClick={() => setOpen(false)}>Home</NavLink></li>
            <li className="nav-item"><NavLink to="/jobs" className="nav-link" onClick={() => setOpen(false)}>Find Jobs</NavLink></li>
          </ul>
          <div className="d-flex gap-2 align-items-center">
            {user ? (
              <>
                <Link to={dashboardPath} className="btn btn-primary btn-sm px-3" onClick={() => setOpen(false)}>Dashboard</Link>
                <button className="btn btn-outline-secondary btn-sm px-3" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary btn-sm px-3" onClick={() => setOpen(false)}>Sign in</Link>
                <Link to="/register" className="btn btn-primary btn-sm px-3" onClick={() => setOpen(false)}>Create account</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
