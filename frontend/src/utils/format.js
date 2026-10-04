// format.js - small helper functions used in many pages
export const STATUSES = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"];
export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];

export function formatSalary(min, max) {
  const lakh = (n) => `₹${+(n / 100000).toFixed(1)}L`;
  if (min && max) return `${lakh(min)} - ${lakh(max)} / year`;
  if (max) return `Up to ${lakh(max)} / year`;
  if (min) return `From ${lakh(min)} / year`;
  return "Not disclosed";
}

export function formatDate(value) {
  if (!value) return "";
  // The server sends UTC time without a "Z", so we add it before converting.
  const date = new Date(value.endsWith("Z") ? value : value + "Z");
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function skillList(text) {
  return text ? text.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

// Turns an API error into a message we can show to the user.
export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d) => d.msg).join(", ");
  if (err?.message === "Network Error") return "Cannot reach the server. Is the backend running?";
  return fallback;
}

export function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}
