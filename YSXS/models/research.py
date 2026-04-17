from __future__ import annotations

import json
import re

from ..extensions import db
from ..utils.datetimes import utc_now

DEFAULT_MORNING_REPORT_KEYWORDS = [
    "moonquake",
    "deep moonquake",
    "lunar seismic",
    "lunar seismology",
    "lunar interior",
    "月震",
    "月震 深部结构",
]


def _default_keywords_text() -> str:
    return "\n".join(DEFAULT_MORNING_REPORT_KEYWORDS)


def _default_enabled_sources_text() -> str:
    return "openalex,crossref,arxiv"


class MorningReportSettings(db.Model):
    __table_args__ = (
        db.UniqueConstraint('user_id', name='uq_morning_report_settings_user'),
        db.Index('ix_morning_report_settings_user_id', 'user_id'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    enabled = db.Column(db.Boolean, nullable=False, default=True)
    keywords_text = db.Column(db.Text, nullable=False, default=_default_keywords_text)
    enabled_sources_text = db.Column(db.String(120), nullable=False, default=_default_enabled_sources_text)
    strict_filter_enabled = db.Column(db.Boolean, nullable=False, default=True)
    exclude_keywords_text = db.Column(db.Text, nullable=False, default="")
    paper_pool_size = db.Column(db.Integer, nullable=False, default=12)
    lookback_days = db.Column(db.Integer, nullable=False, default=30)
    auto_run_enabled = db.Column(db.Boolean, nullable=False, default=True)
    auto_run_hour = db.Column(db.Integer, nullable=False, default=8)
    popup_enabled = db.Column(db.Boolean, nullable=False, default=True)
    last_popup_seen_date = db.Column(db.String(10))
    last_run_started_at = db.Column(db.DateTime)
    last_run_finished_at = db.Column(db.DateTime)
    last_error = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    owner = db.relationship(
        'User',
        backref=db.backref('research_settings', uselist=False, lazy=True),
        foreign_keys=[user_id],
    )

    def keyword_list(self) -> list[str]:
        raw = self.keywords_text or ""
        parts = re.split(r"[\n\r;,，；]+", raw)
        seen: set[str] = set()
        keywords: list[str] = []
        for part in parts:
            keyword = str(part or "").strip()
            normalized = keyword.lower()
            if not keyword or normalized in seen:
                continue
            seen.add(normalized)
            keywords.append(keyword)
        return keywords

    def enabled_source_list(self) -> list[str]:
        raw = self.enabled_sources_text or ""
        parts = re.split(r"[\n\r,;，；]+", raw)
        normalized: list[str] = []
        seen: set[str] = set()
        for part in parts:
            value = str(part or "").strip().lower()
            if value not in {"openalex", "crossref", "arxiv", "ads"} or value in seen:
                continue
            seen.add(value)
            normalized.append(value)
        return normalized or ["openalex", "crossref", "arxiv"]

    def exclude_keyword_list(self) -> list[str]:
        raw = self.exclude_keywords_text or ""
        parts = re.split(r"[\n\r,;，；]+", raw)
        cleaned: list[str] = []
        seen: set[str] = set()
        for part in parts:
            value = str(part or "").strip()
            lower = value.lower()
            if not value or lower in seen:
                continue
            seen.add(lower)
            cleaned.append(value)
        return cleaned


class MorningReportRun(db.Model):
    __table_args__ = (
        db.UniqueConstraint('user_id', 'report_date', name='uq_morning_report_run_user_date'),
        db.Index('ix_morning_report_run_user_date', 'user_id', 'report_date'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    report_date = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    trigger_source = db.Column(db.String(20), nullable=False, default='manual')
    keywords_snapshot = db.Column(db.Text)
    paper_pool_size = db.Column(db.Integer, nullable=False, default=12)
    paper_count = db.Column(db.Integer, nullable=False, default=0)
    headline = db.Column(db.String(255))
    generated_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)
    last_error = db.Column(db.Text)

    owner = db.relationship(
        'User',
        backref=db.backref('morning_report_runs', lazy='dynamic'),
        foreign_keys=[user_id],
    )

    papers = db.relationship(
        'MorningReportPaper',
        backref='run',
        lazy=True,
        cascade='all, delete-orphan',
        order_by='MorningReportPaper.rank.asc()',
    )

    def keyword_list(self) -> list[str]:
        raw = self.keywords_snapshot or ""
        return [item.strip() for item in raw.splitlines() if item.strip()]


class MorningReportPaper(db.Model):
    __table_args__ = (
        db.Index('ix_morning_report_paper_run_id', 'run_id'),
        db.Index('ix_morning_report_paper_user_id', 'user_id'),
        db.Index('ix_morning_report_paper_doi', 'doi'),
    )

    id = db.Column(db.Integer, primary_key=True)
    run_id = db.Column(db.Integer, db.ForeignKey('morning_report_run.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rank = db.Column(db.Integer, nullable=False, default=1)
    source = db.Column(db.String(50), nullable=False, default='openalex')
    source_key = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(500), nullable=False)
    authors = db.Column(db.Text)
    journal = db.Column(db.String(255))
    year = db.Column(db.Integer)
    published_at = db.Column(db.String(20))
    doi = db.Column(db.String(100))
    url = db.Column(db.String(512))
    pdf_url = db.Column(db.String(512))
    abstract = db.Column(db.Text)
    keywords_matched = db.Column(db.Text)
    topics_json = db.Column(db.Text)
    relevance_score = db.Column(db.Float, nullable=False, default=0.0)
    citation_count = db.Column(db.Integer, nullable=False, default=0)
    ai_summary = db.Column(db.Text)
    ai_summary_updated_at = db.Column(db.DateTime)
    imported_document_id = db.Column(db.Integer, db.ForeignKey('document.id'))
    imported_at = db.Column(db.DateTime)
    raw_json = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    owner = db.relationship(
        'User',
        backref=db.backref('morning_report_papers', lazy='dynamic'),
        foreign_keys=[user_id],
    )
    imported_document = db.relationship('Document', foreign_keys=[imported_document_id])

    def author_list(self) -> list[str]:
        raw = self.authors or ""
        return [item.strip() for item in re.split(r"[;\n]+", raw) if item.strip()]

    def topic_list(self) -> list[str]:
        if not self.topics_json:
            return []
        try:
            data = json.loads(self.topics_json)
        except json.JSONDecodeError:
            return []
        if not isinstance(data, list):
            return []
        return [str(item).strip() for item in data if str(item).strip()]


__all__ = [
    'DEFAULT_MORNING_REPORT_KEYWORDS',
    'MorningReportSettings',
    'MorningReportRun',
    'MorningReportPaper',
]
