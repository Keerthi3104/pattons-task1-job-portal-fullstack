# file_upload.py - saves an uploaded resume safely on disk
import os
import uuid

from fastapi import HTTPException, UploadFile

from app.config import settings

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def save_resume_file(file: UploadFile) -> str:
    """Validates the file, saves it with a random name and returns the saved path."""
    extension = os.path.splitext(file.filename or "")[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF, DOC or DOCX files are allowed")

    content = file.file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File is too large (max 5 MB)")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Random name: two users uploading "resume.pdf" will not overwrite each other.
    saved_name = f"{uuid.uuid4().hex}{extension}"
    saved_path = os.path.join(settings.UPLOAD_DIR, saved_name)
    with open(saved_path, "wb") as f:
        f.write(content)
    return saved_path
