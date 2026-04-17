"""add email verification and password reset support

Revision ID: bc7b2edbe3cd
Revises: a6c1e3f81f4b
Create Date: 2026-01-14 02:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bc7b2edbe3cd'
down_revision = 'a6c1e3f81f4b'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user', sa.Column('email_confirmed_at', sa.DateTime(), nullable=True))
    op.add_column('user', sa.Column('last_password_change', sa.DateTime(), nullable=True))

    op.create_table(
        'email_verification_token',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=128), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_email_verification_token_token'), 'email_verification_token', ['token'], unique=True)
    op.create_index('ix_email_verification_token_user_id', 'email_verification_token', ['user_id'])

    op.create_table(
        'password_reset_token',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=128), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_password_reset_token_token'), 'password_reset_token', ['token'], unique=True)
    op.create_index('ix_password_reset_token_user_id', 'password_reset_token', ['user_id'])


def downgrade():
    op.drop_index('ix_password_reset_token_user_id', table_name='password_reset_token')
    op.drop_index(op.f('ix_password_reset_token_token'), table_name='password_reset_token')
    op.drop_table('password_reset_token')
    op.drop_index('ix_email_verification_token_user_id', table_name='email_verification_token')
    op.drop_index(op.f('ix_email_verification_token_token'), table_name='email_verification_token')
    op.drop_table('email_verification_token')
    op.drop_column('user', 'last_password_change')
    op.drop_column('user', 'email_confirmed_at')
