from __future__ import annotations

from ..extensions import db
from ..utils.datetimes import utc_now

DEFAULT_CATEGORY_TEMPLATES = [
    ('computer', '计算机'),
    ('ai', '人工智能'),
    ('math', '数学'),
    ('physics', '物理'),
    ('geology', '地质'),
    ('geophysics', '地球物理'),
    ('geochemistry', '地球化学'),
    ('geography', '地理'),
    ('geoinformatics', '地理信息'),
    ('geostatistics', '地质统计'),
    ('biology', '生物'),
    ('other', '其他'),
]


class Category(db.Model):
    __table_args__ = (
        db.UniqueConstraint('owner_id', 'value', name='uq_category_owner_value'),
        db.Index('ix_category_owner_id', 'owner_id')
    )

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    value = db.Column(db.String(50), nullable=False)
    label = db.Column(db.String(100), nullable=False)

    owner = db.relationship('User', backref=db.backref('categories', lazy='dynamic'))


class DocType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.String(50), unique=True, nullable=False)
    label = db.Column(db.String(100), nullable=False)


class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    authors = db.Column(db.String(255), nullable=False)
    journal = db.Column(db.String(255))
    year = db.Column(db.Integer)
    volume = db.Column(db.String(50))
    issue = db.Column(db.String(50))
    pages = db.Column(db.String(50))
    abstract = db.Column(db.Text)
    remark = db.Column(db.Text, nullable=True)
    ai_summary = db.Column(db.Text, nullable=True)
    ai_summary_updated_at = db.Column(db.DateTime, nullable=True)
    keywords = db.Column(db.String(255))
    category = db.Column(db.String(100))
    tags = db.Column(db.String(255))
    doi = db.Column(db.String(100))
    view_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=utc_now)
    upload_time = db.Column(db.DateTime, default=utc_now)
    modified_at = db.Column(db.DateTime, default=utc_now)
    url = db.Column(db.String(512), nullable=True)
    editor = db.Column(db.String(100))
    publisher = db.Column(db.String(100))
    venue = db.Column(db.String(255))
    booktitle = db.Column(db.String(255))
    category_count = db.Column(db.Integer, default=0)
    file_name = db.Column(db.String(255))
    file_path = db.Column(db.String(512))
    file_size = db.Column(db.Integer)
    file_type = db.Column(db.String(50))
    doc_type = db.Column(db.String(50))
    thesis_degree = db.Column(db.String(16))
    is_shared = db.Column(db.Boolean, default=False)

    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    owner = db.relationship(
        'User',
        foreign_keys=[owner_id],
        backref=db.backref('owned_documents', lazy=True)
    )

    share_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    share_by = db.relationship(
        'User',
        foreign_keys=[share_by_id],
        backref=db.backref('shared_documents', lazy=True)
    )

    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category_obj = db.relationship('Category', backref='documents')

    doc_type_id = db.Column(db.Integer, db.ForeignKey('doc_type.id'))
    doc_type_obj = db.relationship('DocType', backref='documents')


class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doc_id = db.Column(db.Integer, db.ForeignKey('document.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'doc_id', name='uq_note_user_doc'),
    )


__all__ = [
    'DEFAULT_CATEGORY_TEMPLATES',
    'Category',
    'DocType',
    'Document',
    'Note',
]
