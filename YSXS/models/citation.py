from __future__ import annotations

from ..extensions import db
from ..utils.datetimes import utc_now


class CitationFormat(db.Model):
    __tablename__ = 'citation_format'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    code = db.Column(db.String(64), unique=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.String(255))
    template = db.Column(db.Text, nullable=False)
    is_system = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now)

    def to_dict(self):
        is_system = bool(self.is_system)
        key = self.code if is_system and self.code else f'custom_{self.id}'
        return {
            'key': key,
            'db_id': None if is_system else self.id,
            'name': self.name,
            'description': self.description,
            'template': self.template,
            'type': '系统' if is_system else '自定义',
        }


class BatchCitation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doc_id = db.Column(db.Integer, db.ForeignKey('document.id'), nullable=False)
    added_at = db.Column(db.DateTime, default=utc_now)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'doc_id', name='uq_batch_user_doc'),
    )


__all__ = [
    'CitationFormat',
    'BatchCitation',
]
