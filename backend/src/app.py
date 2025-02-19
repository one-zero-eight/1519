import os
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute
from fastapi_swagger import patch_fastapi
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import FileResponse, HTMLResponse

import src.logging_  # noqa: F401
from src.config import settings
from src.logging_ import logger
from src.models import Patron, get_db_session
from src.patron import patron_auth
from src.telegram import telegram_check


@asynccontextmanager
async def lifespan(_):
    session = next(get_db_session())
    if not session.query(Patron).filter(Patron.telegram_id == settings.superadmin_telegram_id).first():
        logger.info("Creating superadmin")
        superadmin = Patron(telegram_id=settings.superadmin_telegram_id, id_admin=True)
        session.add(superadmin)
        session.commit()
    yield


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


def is_subpath(subpath: Path, path: Path) -> bool:
    """https://stackoverflow.com/a/37095733"""
    parent_path = os.path.abspath(path)
    child_path = os.path.abspath(subpath)
    return os.path.commonpath([parent_path]) == os.path.commonpath([parent_path, child_path])


@app.get("/files/{relative_path:path}", response_class=FileResponse)
def file_route(relative_path: str, request: Request, _: Patron = Depends(patron_auth)) -> FileResponse:
    path = settings.files_dir / relative_path
    if not is_subpath(path, settings.files_dir):
        raise HTTPException(status_code=404, detail="Path not in static files folder.")
    logger.info(request.headers)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    filename = path.parent.name + "_" + path.name
    ref = request.headers.get("referer")
    if ref and "/docs" in ref:  # Avoid Swagger crashing when trying to display a file
        content_disposition_type = "attachment"
    else:
        content_disposition_type = "inline"

    return FileResponse(path, filename=filename, content_disposition_type=content_disposition_type)


@app.get("/telegram-widget.html", response_class=HTMLResponse)
async def telegram_widget(request: Request):
    callback_url = request.url_for("telegram_callback")

    content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Telegram Widget</title>
</head>
<body>
    <script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="{settings.bot_username}" data-size="medium" data-onauth="onTelegramAuth(user)" data-request-access="write"></script>
    <script>
        function onTelegramAuth(user) {{
            console.log(user);
            fetch("{callback_url}" + "?" + new URLSearchParams(user), {{"method": "POST"}})
                .then(response => response.json())
                .then(data => {{
                    if (data.success) {{
                        alert("Telegram data verified successfully");
                    }} else {{
                        alert("Telegram data verification failed");
                    }}
                }})
                .catch(error => {{
                    console.error("Error:", error);
                }});
        }}
    </script>
</body>
</html>
"""

    return HTMLResponse(content)


@app.post("/telegram-callback/")
async def telegram_callback(request: Request, session: Session = Depends(get_db_session)):
    result = telegram_check(request.query_params._dict)
    if not result.success:
        raise HTTPException(status_code=403, detail="Telegram data verification failed")

    telegram_id = result.telegram_user["id"]
    existing_patron = session.query(Patron).filter(Patron.telegram_id == telegram_id).first()
    if existing_patron is not None:
        logger.info(f"Patron {existing_patron.id} authenticated")
        # update existing patron
        existing_patron.telegram_data = result.telegram_user
        session.commit()
        # and set session cookie
        request.session["patron_id"] = existing_patron.id

    return result


@app.get("/session")
def session_route(request: Request):
    return request.session


from src.applicant import router as applicant_router  # noqa: E402
from src.patron import router as patron_router  # noqa: E402

app.include_router(patron_router)
app.include_router(applicant_router)
