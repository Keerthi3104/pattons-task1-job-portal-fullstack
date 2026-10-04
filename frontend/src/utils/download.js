// download.js - resumes are private, so we download them with the JWT token (axios) and save as a file.
import api from "../api/axios";

export async function downloadResume(resume) {
  const response = await api.get(`/resume/${resume.id}/download`, { responseType: "blob" });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = resume.file_name;
  link.click();
  window.URL.revokeObjectURL(url);
}
