import os
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute
from fastapi_swagger import patch_fastapi
from pydantic import SecretStr
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import FileResponse, HTMLResponse

import src.logging_  # noqa: F401
from src.config import settings
from src.logging_ import logger
from src.models import Patron, get_db_session
from src.patron import patron_auth
from src.schemas import PatronResponse
from src.telegram import telegram_check


@asynccontextmanager
async def lifespan(_):
    session = next(get_db_session())
    if not session.query(Patron).filter(Patron.telegram_id == settings.superadmin_telegram_id).first():
        logger.info("Creating superadmin")
        superadmin = Patron(telegram_id=settings.superadmin_telegram_id, is_admin=True)
        session.add(superadmin)
        session.commit()

    if settings.default_patrons:
        existent_patrons = session.query(Patron).filter(Patron.telegram_id.in_(settings.default_patrons)).all()
        nonexistent_patrons = set(settings.default_patrons) - {p.telegram_id for p in existent_patrons}
        if nonexistent_patrons:
            logger.info("Creating default patrons")
            for telegram_id in nonexistent_patrons:
                patron = Patron(telegram_id=telegram_id)
                session.add(patron)
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
    me_url       = request.url_for("get_me_route")


    content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Telegram Widget</title>
        <style>
            /* Only to make the JSON look nicer */
            #me_json {{
                white-space: pre-wrap;
                background:#f6f8fa;
                padding:1em;
                border-radius:4px;
                font-family: monospace;
            }}
        </style>
    </head>
    <body>

        <!-- User may paste an invite key here -->
        <input type="text" id="invite_secret" name="invite_secret" placeholder="Invite key">

        <!-- Telegram login button -->
        <script async src="https://telegram.org/js/telegram-widget.js?22"
                data-telegram-login="{settings.bot_username}"
                data-size="medium"
                data-onauth="onTelegramAuth(user)"
                data-request-access="write"></script>

        <!-- Placeholder that will show /me -->
        <h3>Your /me JSON:</h3>
        <div id="me_json">⚠️ Not logged in yet</div>  <!-- NEW -->

        <script>
            // URL that receives the Telegram login data
            const callbackURL = "{callback_url}";
            // URL of the /me endpoint
            const meURL       = "{me_url}";

            function onTelegramAuth(user) {{
                // attach invite_secret if present
                const invite_secret = document.getElementById('invite_secret').value.trim();
                if (invite_secret) {{
                    user.invite_secret = invite_secret;
                }}

                // send Telegram auth data to the backend
                fetch(`${{callbackURL}}?${{new URLSearchParams(user)}}`, {{
                    method: "POST",
                    credentials: "include"      // so the cookie gets set
                }})
                .then(response => {{
                    if (response.ok) {{
                        alert("Telegram data verified successfully");
                        // ‼️  NOW pull /me and render it
                        fetchMe();
                    }} else {{
                        alert("Telegram data verification failed");
                    }}
                }})
                .catch(err => console.error("Error:", err));
            }}

            // NEW helper that calls /me and puts the json in the DOM
            function fetchMe() {{
                fetch(meURL, {{ credentials: "include" }})  // send cookie
                    .then(r => {{
                        if (!r.ok) throw new Error(r.status);
                        return r.json();
                    }})
                    .then(data => {{
                        document.getElementById("me_json").textContent =
                              JSON.stringify(data, null, 2);
                    }})
                    .catch(err => {{
                        document.getElementById("me_json").textContent =
                              "Could not load /me ➜ " + err;
                    }});
            }}

            // If the user already has a valid session cookie (re‐visit),
            // we can show /me immediately on page load.
            window.addEventListener("DOMContentLoaded", fetchMe);   // NEW
        </script>
    </body>
    </html>
    """
    return HTMLResponse(
        content,
        headers={"Content-Security-Policy": "frame-ancestors *"}
    )


@app.post("/telegram-callback/")
async def telegram_callback(request: Request, invite_secret: str | None = None, session: Session = Depends(get_db_session)) -> PatronResponse | None:
    _dict = request.query_params._dict.copy()
    _dict.pop("invite_secret", None)
    result = telegram_check(_dict)
    if not result.success:
        raise HTTPException(status_code=403, detail="Telegram data verification failed")

    telegram_id = result.telegram_user["id"]
    patron = session.query(Patron).filter(Patron.telegram_id == telegram_id).first()
    if patron is not None:
        logger.info(f"Patron {patron.id} authenticated")
        # update existing patron
        patron.telegram_data = result.telegram_user
        session.commit()
        # and set session cookie
        request.session["patron_id"] = patron.id
    else:
        if invite_secret != settings.invite_secret_string.get_secret_value():
            raise HTTPException(status_code=403, detail="Invalid invite string")

        if not result.telegram_user:
            raise HTTPException(status_code=403, detail="No telegram data received")

        new_patron = Patron(
            telegram_id=result.telegram_user["id"],
            telegram_data=result.telegram_user,
            is_admin=False,
        )
        session.add(new_patron)
        session.commit()
        patron = new_patron

    return PatronResponse.model_validate(patron, from_attributes=True) if patron else None


@app.post("/login-by-password/")
async def login_by_password(request: Request, telegram_id: str, password: SecretStr, session: Session = Depends(get_db_session)) -> PatronResponse | None:
    existing_patron = session.query(Patron).filter(Patron.telegram_id == telegram_id).first()
    if existing_patron is not None:
        if f"{telegram_id}_{settings.secret_key.get_secret_value()}" == password.get_secret_value():
            logger.info(f"Patron {existing_patron.id} authenticated")
            request.session["patron_id"] = existing_patron.id
            return PatronResponse.model_validate(existing_patron, from_attributes=True)
        else:
            logger.info(f"Patron {existing_patron.id} incorrect password")
    return None


@app.get("/session")
def session_route(request: Request) -> dict:
    return request.session


from src.admin import router as admin_router  # noqa: E402
from src.applicant import router as applicant_router  # noqa: E402
from src.patron import router as patron_router  # noqa: E402

app.include_router(admin_router)
app.include_router(patron_router)
app.include_router(applicant_router)
