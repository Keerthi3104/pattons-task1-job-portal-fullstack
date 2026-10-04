# Importing all models here makes sure SQLAlchemy knows every table before creating them.
from app.models.application import Application  # noqa: F401
from app.models.company import Company  # noqa: F401
from app.models.job import Job  # noqa: F401
from app.models.resume import Resume  # noqa: F401
from app.models.user import User  # noqa: F401
