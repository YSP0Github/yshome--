from __future__ import annotations

import secrets
import string
from datetime import timedelta

from flask_login import UserMixin
from werkzeug.security import generate_password_hash

from ..extensions import db
from ..utils.datetimes import format_cn_time, utc_now


favorite = db.Table(
    'favorite',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('document_id', db.Integer, db.ForeignKey('document.id'), primary_key=True),
    db.Column('favorited_at', db.DateTime, default=utc_now)
)


class AdminAuthKey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(64), unique=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now)
    expires_at = db.Column(db.DateTime)
    is_used = db.Column(db.Boolean, default=False)
    used_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    used_at = db.Column(db.DateTime)

    creator = db.relationship(
        'User',
        backref=db.backref('auth_keys', lazy=True),
        foreign_keys=[created_by]
    )
    user = db.relationship(
        'User',
        foreign_keys=[used_by],
        backref=db.backref('used_auth_keys', lazy=True)
    )

    def is_expired(self) -> bool:
        return bool(self.expires_at and self.expires_at < utc_now())

    def is_valid(self) -> bool:
        return not self.is_expired() and not self.is_used

    @classmethod
    def verify_auth_key(cls, auth_key: str):
        if not isinstance(auth_key, str) or not auth_key.strip():
            return False, "授权密钥不能为空且必须是字符串", None
        key_record = cls.query.filter_by(key=auth_key.strip()).first()
        if not key_record:
            return False, "授权密钥不存在", None
        if key_record.is_used:
            return False, "授权密钥已被使用（单次有效）", None
        if key_record.expires_at and utc_now() > key_record.expires_at:
            return False, f"授权密钥已过期（过期时间：{format_cn_time(key_record.expires_at)}）", None
        return True, "密钥验证通过", key_record


class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    target = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, default=utc_now)

    user = db.relationship('User', backref=db.backref('activities', lazy=True))


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    custom_id = db.Column(db.String(20), unique=True, nullable=False)
    role = db.Column(db.String(20), default='user')
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now)
    avatar = db.Column(db.String(120))
    status = db.Column(db.String(20), default='正常')
    email_confirmed_at = db.Column(db.DateTime, nullable=True)
    last_password_change = db.Column(db.DateTime, nullable=True)

    favorites = db.relationship(
        'Document',
        secondary=favorite,
        backref=db.backref('favorited_by', lazy='dynamic'),
        lazy='dynamic'
    )
    email_tokens = db.relationship(
        'EmailVerificationToken',
        backref='user',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )
    password_reset_tokens = db.relationship(
        'PasswordResetToken',
        backref='user',
        lazy='dynamic',
        cascade='all, delete-orphan'
    )

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)
        self.last_password_change = utc_now()

    @property
    def is_email_confirmed(self) -> bool:
        return self.email_confirmed_at is not None

    def is_super_admin(self) -> bool:
        return self.role == 'super admin'

    def generate_auth_key(self, expires_hours: int = 24) -> str:
        if not self.is_super_admin():
            raise PermissionError("只有超级管理员可以生成授权密钥")
        alphabet = string.ascii_letters + string.digits
        auth_key = ''.join(secrets.choice(alphabet) for _ in range(32))
        expires_at = utc_now() + timedelta(hours=expires_hours)
        new_key = AdminAuthKey(
            key=auth_key,
            created_by=self.id,
            expires_at=expires_at
        )
        db.session.add(new_key)
        db.session.commit()
        return auth_key

    @property
    def is_active(self) -> bool:  # type: ignore[override]
        return self.status == '正常'

    def is_not_active(self) -> bool:
        return self.status in {'异常', '封禁'}


class EmailVerificationToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    token = db.Column(db.String(128), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)


class PasswordResetToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    token = db.Column(db.String(128), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)


__all__ = [
    'favorite',
    'AdminAuthKey',
    'ActivityLog',
    'User',
    'EmailVerificationToken',
    'PasswordResetToken',
]
