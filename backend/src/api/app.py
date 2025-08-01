import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute
from fastapi_swagger import patch_fastapi
from starlette.middleware.sessions import SessionMiddleware

import src.logging_  # noqa: F401
from src.api.lifespan import lifespan
from src.config import settings

app = FastAPI(docs_url=None, swagger_ui_oauth2_redirect_url=None, root_path=settings.app_root_path, lifespan=lifespan)
app.router.route_class = AutoDeriveResponsesAPIRoute
patch_fastapi(app)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=settings.cors_allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Session middleware configuration
@app.middleware("http")
async def ensure_session_middleware(request: Request, call_next):
    if "session_id" not in request.session:
        request.session["session_id"] = str(uuid.uuid4())
    response = await call_next(request)
    return response


class PartitionedSessionMiddleware(SessionMiddleware):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.security_flags += "; partitioned"


app.add_middleware(
    PartitionedSessionMiddleware,
    secret_key=settings.session_secret_key.get_secret_value(),
    path="/",
    same_site="none",
    https_only=True,
)

from src.api.routes import (  # noqa: E402
    admin_router,
    applicant_router,
    auth_router,
    files_router,
    patron_router,
)

app.include_router(admin_router)
app.include_router(applicant_router)
app.include_router(auth_router)
app.include_router(files_router)
app.include_router(patron_router)
