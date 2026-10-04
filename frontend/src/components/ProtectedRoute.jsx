// ProtectedRoute.jsx - blocks pages for people who are not logged in or have the wrong role.
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Not logged in -> go to login, and remember where the user wanted to go.
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (role && user.role !== role) {
    // Logged in but wrong role (e.g. candidate opening a recruiter page).
    return <Navigate to={user.role === "recruiter" ? "/recruiter" : "/candidate"} replace />;
  }
  return children;
}
