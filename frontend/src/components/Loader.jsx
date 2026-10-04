export default function Loader({ text = "Loading..." }) {
  return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border text-primary mb-2" role="status" />
      <div>{text}</div>
    </div>
  );
}
