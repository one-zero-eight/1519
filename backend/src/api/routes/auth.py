from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi_derive_responses import AutoDeriveResponsesAPIRoute
from pydantic import SecretStr
from sqlalchemy.orm import Session
from starlette.responses import HTMLResponse

import src.logging_  # noqa: F401
from src.config import settings
from src.logging_ import logger
from src.db.models import Patron
from src.dependencies import get_db_session
from src.schemas import PatronResponse
from src.api.telegram import telegram_check


router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
    route_class=AutoDeriveResponsesAPIRoute,
)

@router.get("/telegram-widget.html", response_class=HTMLResponse)
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


@router.post("/telegram-callback")
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


@router.post("/login-by-password")
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


@router.get("/session")
def session_route(request: Request) -> dict:
    return request.session
