// App.jsx - all the pages (routes) of the website.
import { Link, Outlet, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import JobDetails from "./pages/JobDetails";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Register from "./pages/Register";

import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import MyApplications from "./pages/candidate/MyApplications";
import Profile from "./pages/candidate/Profile";

import Applicants from "./pages/recruiter/Applicants";
import CompanyProfile from "./pages/recruiter/CompanyProfile";
import JobForm from "./pages/recruiter/JobForm";
import ManageJobs from "./pages/recruiter/ManageJobs";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";

// Public pages share the top navbar + footer.
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <div className="container text-center py-5">
      <h1 className="fw-bold">404</h1>
      <p className="text-muted">This page does not exist.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/candidate" element={<ProtectedRoute role="candidate"><DashboardLayout role="candidate" /></ProtectedRoute>}>
        <Route index element={<CandidateDashboard />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="/recruiter" element={<ProtectedRoute role="recruiter"><DashboardLayout role="recruiter" /></ProtectedRoute>}>
        <Route index element={<RecruiterDashboard />} />
        <Route path="company" element={<CompanyProfile />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="jobs/new" element={<JobForm />} />
        <Route path="jobs/:id/edit" element={<JobForm />} />
        <Route path="applications" element={<Applicants />} />
      </Route>
    </Routes>
  );
}
