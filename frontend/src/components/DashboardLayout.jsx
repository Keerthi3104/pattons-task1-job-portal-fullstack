// DashboardLayout.jsx - sidebar + top bar used by both candidate and recruiter dashboards.
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";

const MENUS = {
  candidate: [
    { to: "/candidate", label: "Dashboard", icon: "bi-grid-1x2", end: true },
    { to: "/jobs", label: "Browse jobs", icon: "bi-search" },
    { to: "/candidate/applications", label: "My applications", icon: "bi-file-earmark-check" },
    { to: "/candidate/profile", label: "Profile & resume", icon: "bi-person-vcard" },
  ],
  recruiter: [
    { to: "/recruiter", label: "Dashboard", icon: "bi-grid-1x2", end: true },
    { to: "/recruiter/company", label: "Company profile", icon: "bi-building" },
    { to: "/recruiter/jobs/new", label: "Post a job", icon: "bi-plus-square" },
    { to: "/recruiter/jobs", label: "Manage jobs", icon: "bi-briefcase", end: true },
    { to: "/recruiter/applications", label: "Applications", icon: "bi-people" },
  ],
};

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dash">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link to="/" className="brand text-white mb-4 px-2"><i className="bi bi-briefcase-fill"></i> JobNest</Link>
        <nav className="flex-grow-1">
          {MENUS[role].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)}>
              <i className={`bi ${item.icon}`}></i> {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}><i className="bi bi-box-arrow-left"></i> Logout</button>
      </aside>
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)}></div>}

      <div className="dash-main">
        <header className="dash-top">
          <button className="btn btn-light d-lg-none" onClick={() => setOpen(true)} aria-label="Open menu">
            <i className="bi bi-list fs-5"></i>
          </button>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="text-end lh-sm d-none d-sm-block">
              <div className="fw-semibold small">{user.name}</div>
              <div className="text-muted small text-capitalize">{user.role}</div>
            </div>
            <div className="avatar-circle">{initials(user.name)}</div>
          </div>
        </header>
        <main className="dash-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
