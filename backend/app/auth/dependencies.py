# dependencies.py - "guards" that protect our APIs
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.security import decode_access_token
from app.database import get_db
from app.models.user import User

# Reads the "Authorization: Bearer <token>" header. Swagger shows an Authorize button because of this.
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Reads the token, verifies it and returns the logged-in user from the database."""
    error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise error
    user = db.get(User, user_id)
    if user is None:
        raise error
    return user


def require_role(role: str):
    """Role guard: require_role('recruiter') allows only recruiters, others get 403."""
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != role:
            raise HTTPException(status_code=403, detail=f"Only {role}s can do this")
        return current_user
    return checker


require_candidate = require_role("candidate")
require_recruiter = require_role("recruiter")
