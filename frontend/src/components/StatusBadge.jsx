// Coloured label for an application status. The colours are defined in index.css.
export default function StatusBadge({ status }) {
  const cls = "status-" + status.toLowerCase().replace(" ", "-");
  return <span className={`status-badge ${cls}`}>{status}</span>;
}
