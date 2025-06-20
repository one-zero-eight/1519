"""
Check Telegram WebAppData and LoginWidgetData in Python with FastAPI.

Source: https://gist.github.com/dantetemplar/68e09e3674bf6ce72e23b89b2091d159
License: MIT License
Author: Ruslan Belkov
"""

import hashlib
import hmac
import time

from pydantic import BaseModel

from src.config import settings


class VerificationResult(BaseModel):
    success: bool
    telegram_user: dict | None = None

def telegram_check(params: dict) -> VerificationResult:
    """
    Verify telegram data

    https://core.telegram.org/widgets/login#checking-authorization
    """
    if "hash" not in params or "auth_date" not in params:
        return VerificationResult(success=False)

    # params = {k: v[0] for k, v in parse_qs(quoted_string).items()}
    received_hash = params["hash"]
    auth_date = int(params["auth_date"])
    to_hash = "\n".join([f"{k}={v}" for k, v in sorted(params.items()) if k != "hash"])
    encoded_telegram_data = to_hash.encode("utf-8").decode("unicode-escape").encode("ISO-8859-1")

    secret_key = hashlib.sha256(settings.bot_token.get_secret_value().encode()).digest()
    evaluated_hash = hmac.new(secret_key, encoded_telegram_data, hashlib.sha256).hexdigest()

    if time.time() - auth_date > 86400:
        return VerificationResult(success=False)  # Data is older than 24 hours

    success = hmac.compare_digest(evaluated_hash, received_hash)

    if success:
        user = {k: v for k, v in params.items() if k not in ["hash", "auth_date"]}
        return VerificationResult(success=True, telegram_user=user)
    else:
        return VerificationResult(success=False)  # Data is not from Telegram
