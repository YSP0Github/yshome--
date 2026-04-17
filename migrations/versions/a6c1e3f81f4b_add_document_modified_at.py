"""add document modified_at column"""

revision = "a6c1e3f81f4b"
down_revision = "0d0e7d20ee58"
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column('document', sa.Column('modified_at', sa.DateTime(), nullable=True))
    op.execute('UPDATE document SET modified_at = upload_time')


def downgrade():
    op.drop_column('document', 'modified_at')
