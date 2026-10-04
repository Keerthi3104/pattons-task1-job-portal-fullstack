import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { downloadResume } from "../../utils/download";
import { formatDate, getErrorMessage } from "../../utils/format";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    location: user.location || "",
    skills: user.skills || "",
  });
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeMsg, setResumeMsg] = useState({ type: "", text: "" });

  const loadResumes = () => api.get("/resume/my").then((res) => setResumes(res.data));
  useEffect(() => { loadResumes(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg({ type: "", text: "" });
    try {
      const res = await api.put("/users/me", form);
      updateUser(res.data); // keep the saved user in sync
      setProfileMsg({ type: "success", text: "Profile saved" });
    } catch (err) {
      setProfileMsg({ type: "danger", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setResumeMsg({ type: "", text: "" });
    try {
      const data = new FormData(); // FormData is how files are sent to the server
      data.append("file", file);
      await api.post("/resume/upload", data);
      setFile(null);
      e.target.reset();
      setResumeMsg({ type: "success", text: "Resume uploaded" });
      loadResumes();
    } catch (err) {
      setResumeMsg({ type: "danger", text: getErrorMessage(err) });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (resume) => {
    try {
      await downloadResume(resume);
    } catch (err) {
      setResumeMsg({ type: "danger", text: getErrorMessage(err, "Could not download the file") });
    }
  };

  return (
    <>
      <h4 className="mb-3">Profile & resume</h4>
      <div className="row g-4">
        <div className="col-lg-6">
          <form className="card-box" onSubmit={saveProfile}>
            <h5 className="mb-3">Personal details</h5>
            {profileMsg.text && <div className={`alert alert-${profileMsg.type} py-2`}>{profileMsg.text}</div>}
            <div className="mb-3">
              <label className="form-label">Full name</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} required minLength={2} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" value={user.email} disabled />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Location</label>
                <input className="form-control" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Chennai" />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Skills</label>
              <input className="form-control" name="skills" value={form.skills} onChange={handleChange} placeholder="Python, React, SQL" />
              <div className="form-text">Separate skills with commas.</div>
            </div>
            <button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
          </form>
        </div>

        <div className="col-lg-6">
          <div className="card-box">
            <h5 className="mb-3">My resumes</h5>
            {resumeMsg.text && <div className={`alert alert-${resumeMsg.type} py-2`}>{resumeMsg.text}</div>}
            <form onSubmit={uploadResume} className="mb-3">
              <label className="form-label">Upload a resume (PDF, DOC or DOCX, max 5 MB)</label>
              <div className="input-group">
                <input className="form-control" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
                <button className="btn btn-primary" disabled={!file || uploading}>{uploading ? "Uploading..." : "Upload"}</button>
              </div>
            </form>
            {resumes.length === 0 ? (
              <p className="text-muted mb-0">No resume uploaded yet.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {resumes.map((r) => (
                  <li key={r.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-file-earmark-text text-primary me-2"></i>{r.file_name}
                      <div className="small text-muted">Uploaded {formatDate(r.uploaded_at)}</div>
                    </div>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownload(r)}>Download</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
