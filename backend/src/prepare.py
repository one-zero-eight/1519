import secrets
import shutil
import webbrowser
from pathlib import Path

import httpx
import yaml

BASE_DIR = Path(__file__).resolve().parents[1]
SETTINGS_TEMPLATE = BASE_DIR / "settings.example.yaml"
SETTINGS_FILE = BASE_DIR / "settings.yaml"
PRE_COMMIT_CONFIG = BASE_DIR / ".pre-commit-config.yaml"
BOT_FATHER_URL = "https://t.me/BotFather"


def get_settings():
    """
    Load and return the settings from `settings.yaml` if it exists.
    """
    if not SETTINGS_FILE.exists():
        raise RuntimeError("❌ No `settings.yaml` found.")

    try:
        with open(SETTINGS_FILE) as f:
            return yaml.safe_load(f) or {}
    except Exception as e:
        raise RuntimeError("❌ No `settings.yaml` found.") from e


def ensure_settings_file():
    """
    Ensure `settings.yaml` exists. If not, copy `settings.yaml.example`.
    """
    if not SETTINGS_TEMPLATE.exists():
        print("❌ No `settings.yaml.example` found. Skipping copying.")
        return

    if SETTINGS_FILE.exists():
        print("✅ `settings.yaml` exists.")
        return

    shutil.copy(SETTINGS_TEMPLATE, SETTINGS_FILE)
    print(f"✅ Copied `{SETTINGS_TEMPLATE}` to `{SETTINGS_FILE}`")


def check_and_prompt_bot_token():
    """
    Ensure the token is set in `settings.yaml`. If missing, request token from user.
    """
    settings = get_settings()
    bot_token = settings.get("bot_token")

    if not bot_token or bot_token == "...":
        print("⚠️ `bot_token` is missing in `settings.yaml`.")
        print(f"  ➡️ Generate a token in @BotFather: {BOT_FATHER_URL}")
        webbrowser.open(BOT_FATHER_URL)
        token = input("  🔑 Please paste the generated token below (or press Enter to skip):\n  > ").strip()

        if token:
            try:
                with open(SETTINGS_FILE) as f:
                    as_text = f.read()
                as_text = as_text.replace("bot_token: null", f"bot_token: {token}")
                as_text = as_text.replace("bot_token: ...", f"bot_token: {token}")
                with open(SETTINGS_FILE, "w") as f:
                    f.write(as_text)
                print("  ✅ `bot_token` has been updated in `settings.yaml`.")
            except Exception as e:
                print(f"  ❌ Error updating `settings.yaml`: {e}")
        else:
            print("  ⚠️ Token was not provided. Please manually update `settings.yaml` later.")
    else:
        print("✅ `bot_token` is specified.")


def check_and_prompt_bot_username():
    """
    Ensure the username is set in `settings.yaml`. If missing, request token from user.
    """
    settings = get_settings()
    bot_username = settings.get("bot_username")
    bot_token = settings.get("bot_token")

    if not bot_username or bot_username == "...":
        print("⚠️ `bot_username` is missing in `settings.yaml`.")
        if bot_token and bot_token != "...":
            try:
                r = httpx.get(f"https://api.telegram.org/bot{bot_token}/getMe")
                r.raise_for_status()
                bot_username = r.json()["result"]["username"]
                with open(SETTINGS_FILE) as f:
                    as_text = f.read()
                as_text = as_text.replace("bot_username: null", f"bot_username: {bot_username}")
                as_text = as_text.replace("bot_username: ...", f"bot_username: {bot_username}")
                with open(SETTINGS_FILE, "w") as f:
                    f.write(as_text)
                print("  ✅ `bot_username` has been updated in `settings.yaml`.")
            except Exception as e:
                print(f"  ❌ Error updating `settings.yaml`: {e}")
        else:
            print("  ⚠️ Bot username was not provided. Please manually update `settings.yaml` later.")
    else:
        print("✅ `bot_username` is specified.")


def check_and_generate_session_secret_key():
    """
    Ensure the session_secret_key is set in `settings.yaml`. If missing, generate random one
    """
    settings = get_settings()
    session_secret_key = settings.get("session_secret_key")

    if not session_secret_key or session_secret_key == "...":
        print("⚠️ `session_secret_key` is missing in `settings.yaml`.")
        print("  ➡️ Generate a random one")
        secret = secrets.token_hex(32)
        try:
            with open(SETTINGS_FILE) as f:
                as_text = f.read()
            as_text = as_text.replace("session_secret_key: null", f"session_secret_key: {secret}")
            as_text = as_text.replace("session_secret_key: ...", f"session_secret_key: {secret}")
            with open(SETTINGS_FILE, "w") as f:
                f.write(as_text)
            print("  ✅ `session_secret_key` has been updated in `settings.yaml`.")
        except Exception as e:
            print(f"  ❌ Error updating `settings.yaml`: {e}")

    else:
        print("✅ `session_secret_key` is specified.")


def prepare():
    """
    Prepare the project for the first run.
    """
    ensure_settings_file()
    check_and_prompt_bot_token()
    check_and_prompt_bot_username()
    check_and_generate_session_secret_key()
