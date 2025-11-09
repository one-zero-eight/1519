from pathlib import Path

from alembic import command
from alembic.config import Config

src = Path(__file__).resolve().parents[1]
cfg = Config(src / "alembic.ini")
command.stamp(cfg, "289e08d5b01f")
