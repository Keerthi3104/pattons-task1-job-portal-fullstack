// Step-by-step progress line: Applied -> Under Review -> Shortlisted -> Interview -> Selected
const STEPS = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected"];

export default function StatusTracker({ status }) {
  if (status === "Rejected") {
    return <div className="text-danger small fw-semibold"><i className="bi bi-x-circle me-1"></i>Application not selected</div>;
  }
  const current = STEPS.indexOf(status);
  return (
    <div className="tracker">
      {STEPS.map((step, index) => (
        <div key={step} className={`tracker-step ${index <= current ? "done" : ""}`}>
          <div className="tracker-dot"></div>
          {step}
        </div>
      ))}
    </div>
  );
}
