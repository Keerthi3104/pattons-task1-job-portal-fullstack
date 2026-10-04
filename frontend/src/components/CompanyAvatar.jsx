// Square logo made from the company's first letter. The colour depends on the name.
const COLORS = ["#0F62D6", "#0A2540", "#1F8A70", "#C2410C", "#7C3AED", "#BE185D", "#0E7490"];

export default function CompanyAvatar({ name = "?", size = 48 }) {
  const index = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % COLORS.length;
  return (
    <div className="company-avatar" style={{ width: size, height: size, background: COLORS[index], fontSize: size * 0.4 }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}
