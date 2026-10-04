// Shown when a list has no items. It always tells the user what to do next.
export default function EmptyState({ icon = "bi-inbox", title, text, children }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`}></i>
      <h5>{title}</h5>
      {text && <p className="text-muted mb-3">{text}</p>}
      {children}
    </div>
  );
}
