from src.api.routes.admin import router as admin_router
from src.api.routes.applicant import router as applicant_router
from src.api.routes.auth import router as auth_router
from src.api.routes.files import router as files_router
from src.api.routes.patron import router as patron_router

__all__ = [
    "admin_router",
    "applicant_router",
    "auth_router",
    "files_router",
    "patron_router",
]
