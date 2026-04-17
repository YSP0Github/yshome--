from __future__ import annotations

from ..extensions import db
from ..utils.datetimes import utc_now


class BroadcastMessage(db.Model):
    __table_args__ = (
        db.Index('ix_broadcast_message_is_active_created_at', 'is_active', 'created_at'),
    )

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    creator = db.relationship(
        'User',
        backref=db.backref('broadcast_messages', lazy='dynamic'),
        foreign_keys=[created_by],
    )


class BroadcastReceipt(db.Model):
    __table_args__ = (
        db.UniqueConstraint('broadcast_id', 'user_id', name='uq_broadcast_receipt_broadcast_user'),
        db.Index('ix_broadcast_receipt_user_seen_at', 'user_id', 'seen_at'),
    )

    id = db.Column(db.Integer, primary_key=True)
    broadcast_id = db.Column(db.Integer, db.ForeignKey('broadcast_message.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    seen_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    hidden_at = db.Column(db.DateTime, nullable=True)

    broadcast = db.relationship(
        'BroadcastMessage',
        backref=db.backref('receipts', lazy='dynamic', cascade='all, delete-orphan'),
        foreign_keys=[broadcast_id],
    )
    user = db.relationship(
        'User',
        backref=db.backref('broadcast_receipts', lazy='dynamic', cascade='all, delete-orphan'),
        foreign_keys=[user_id],
    )


__all__ = [
    'BroadcastMessage',
    'BroadcastReceipt',
]
