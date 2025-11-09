"""change timewindow limits to datetimes

Revision ID: 7e518ef7f36a
Revises: 289e08d5b01f
Create Date: 2025-11-09 20:13:55.257268
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7e518ef7f36a"
down_revision: str | None = "289e08d5b01f"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("timewindows", recreate="always") as batch_op:
        batch_op.add_column(sa.Column("start_dt", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("end_dt", sa.DateTime(), nullable=True))

    op.execute("""
        UPDATE timewindows
        SET start_dt = datetime(start || ' 00:00:00'),
            end_dt   = datetime(end   || ' 23:59:59')
    """)

    with op.batch_alter_table("timewindows", recreate="always") as batch_op:
        batch_op.alter_column("start_dt", existing_type=sa.DateTime(), nullable=False)
        batch_op.alter_column("end_dt", existing_type=sa.DateTime(), nullable=False)
        batch_op.drop_column("start")
        batch_op.drop_column("end")
        batch_op.alter_column("start_dt", new_column_name="start")
        batch_op.alter_column("end_dt", new_column_name="end")


def downgrade() -> None:
    with op.batch_alter_table("timewindows", recreate="always") as batch_op:
        batch_op.add_column(sa.Column("start_date", sa.DATE(), nullable=True))
        batch_op.add_column(sa.Column("end_date", sa.DATE(), nullable=True))

    op.execute("""
        UPDATE timewindows
        SET start_date = date(start),
            end_date   = date(end)
    """)

    with op.batch_alter_table("timewindows", recreate="always") as batch_op:
        batch_op.alter_column("start_date", existing_type=sa.DATE(), nullable=False)
        batch_op.alter_column("end_date", existing_type=sa.DATE(), nullable=False)
        batch_op.drop_column("start")
        batch_op.drop_column("end")
        batch_op.alter_column("start_date", new_column_name="start")
        batch_op.alter_column("end_date", new_column_name="end")
