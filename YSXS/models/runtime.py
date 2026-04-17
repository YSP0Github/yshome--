from __future__ import annotations

from ..extensions import db
from ..utils.datetimes import utc_now


class RuntimeMetricSnapshot(db.Model):
    __tablename__ = 'runtime_metric_snapshot'

    id = db.Column(db.Integer, primary_key=True)
    captured_at = db.Column(db.DateTime, default=utc_now, index=True)
    sample_window_seconds = db.Column(db.Integer, default=60)
    total_users = db.Column(db.Integer, default=0)
    online_users = db.Column(db.Integer, default=0)
    total_documents = db.Column(db.Integer, default=0)
    total_data_bytes = db.Column(db.BigInteger, default=0)
    total_recent_bytes = db.Column(db.BigInteger, default=0)
    current_bandwidth_bps = db.Column(db.Float, default=0)
    bandwidth_limit_bps = db.Column(db.Float, default=0)
    avg_data_per_user_bytes = db.Column(db.Float, default=0)
    avg_bandwidth_per_online_user_bps = db.Column(db.Float, default=0)
    per_user_count = db.Column(db.Integer, default=0)


class AIUsageLog(db.Model):
    __tablename__ = 'ai_usage_log'

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=utc_now, index=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True, index=True)
    scene = db.Column(db.String(64), nullable=False, default='general', index=True)
    model = db.Column(db.String(120), nullable=True)
    wire_api = db.Column(db.String(32), nullable=True)
    usage_source = db.Column(db.String(20), nullable=False, default='reported')
    prompt_tokens = db.Column(db.Integer, nullable=False, default=0)
    completion_tokens = db.Column(db.Integer, nullable=False, default=0)
    total_tokens = db.Column(db.Integer, nullable=False, default=0, index=True)
    request_chars = db.Column(db.Integer, nullable=False, default=0)
    response_chars = db.Column(db.Integer, nullable=False, default=0)

    user = db.relationship('User', backref=db.backref('ai_usage_logs', lazy='dynamic'))


__all__ = ['RuntimeMetricSnapshot', 'AIUsageLog']
