export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
        <span><strong>JobNest</strong> - a simple full-stack job portal</span>
        <span className="text-muted">Built with React, FastAPI and PostgreSQL</span>
      </div>
    </footer>
  );
}
