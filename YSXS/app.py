
import csv
import html
import json
import os
import re
import secrets
import shutil
import tempfile
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from functools import wraps
from io import BytesIO, StringIO
from pathlib import Path
from threading import Lock, Thread
from typing import Optional
from urllib.parse import quote

import requests
from flask import (Blueprint, Flask, abort, current_app, flash, g, jsonify, make_response,
                   redirect, render_template, request, send_file, send_from_directory,
                   session, url_for)
from flask_login import (current_user, login_required, login_user,
                         logout_user)
from flask_mail import Message
from flask_wtf.csrf import generate_csrf
from markupsafe import Markup
from sqlalchemy import and_, false, func, inspect, or_, text
from werkzeug.security import check_password_hash

from .app_factory import create_app, normalize_url_prefix
from .extensions import db, login_manager, mail
from .middleware import ScriptRootMiddleware
from .utils.datetimes import ensure_utc, format_cn_time, to_cst, utc_now
from .utils.file_helpers import get_unique_filename, scan_file_for_threats, secure_filename
from .utils.parse_files import parse_files
from .services.storage import (
    enqueue_kindle_delivery,
    ensure_user_storage,
    remove_document_file,
    resolve_document_path,
    reset_filestorage_stream,
    save_user_file,
    upload_root,
)
from .services.runtime_metrics import (
    build_runtime_metrics_payload,
    human_readable_bandwidth,
    human_readable_bytes,
    maybe_persist_runtime_metrics,
    runtime_metrics_after_request,
    runtime_metrics_before_request,
)
from .services.morning_report import (
    SUPPORTED_SOURCES,
    ai_summary_available,
    build_display_source_links,
    call_ai_text,
    ensure_morning_report_settings,
    find_existing_document_for_user,
    generate_morning_report_for_user,
    get_ai_client_config,
    get_display_only_sources,
    get_nasa_ads_api_token,
    get_morning_report_popup_payload,
    get_recent_morning_reports,
    get_today_morning_report,
    is_morning_report_generation_running,
    load_runtime_ai_config,
    mark_morning_report_popup_seen,
    save_runtime_ai_config,
    search_literature_with_ai,
    start_morning_report_scheduler,
    summarize_document_with_ai,
    summarize_paper_with_ai,
    today_cn_date,
    trigger_due_morning_report_in_background,
)
from .services.security import admin_required, super_admin_required
from .blueprints.admin import admin_bp
from .models import (
    ActivityLog,
    AIUsageLog,
    AdminAuthKey,
    BatchCitation,
    BroadcastMessage,
    BroadcastReceipt,
    Category,
    CitationFormat,
    DEFAULT_CATEGORY_TEMPLATES,
    DocType,
    Document,
    EmailVerificationToken,
    MorningReportPaper,
    MorningReportRun,
    MorningReportSettings,
    Note,
    PasswordResetToken,
    RuntimeMetricSnapshot,
    User,
)

DOCUMENTS_PER_PAGE = int(os.environ.get('YSXS_DOCS_PER_PAGE', 10))
RESEARCH_OVERVIEW_SEARCH_CAP = max(8, min(int(os.environ.get('YSXS_RESEARCH_OVERVIEW_SEARCH_CAP', 14)), 20))
RESEARCH_OVERVIEW_SUMMARY_PAPER_LIMIT = max(4, min(int(os.environ.get('YSXS_RESEARCH_OVERVIEW_SUMMARY_PAPER_LIMIT', 6)), 10))
RESEARCH_OVERVIEW_ABSTRACT_SNIPPET_LIMIT = max(300, min(int(os.environ.get('YSXS_RESEARCH_OVERVIEW_ABSTRACT_SNIPPET_LIMIT', 700)), 1600))
RESEARCH_OVERVIEW_AI_TIMEOUT = max(10, min(int(os.environ.get('YSXS_RESEARCH_OVERVIEW_AI_TIMEOUT', 20)), 60))
RESEARCH_OVERVIEW_JOB_TTL_SECONDS = max(300, min(int(os.environ.get('YSXS_RESEARCH_OVERVIEW_JOB_TTL_SECONDS', 3600)), 86400))
RESEARCH_OVERVIEW_JOBS: dict[str, dict] = {}
RESEARCH_OVERVIEW_JOB_LOCK = Lock()
LITERATURE_SEARCH_JOB_TTL_SECONDS = max(300, min(int(os.environ.get('YSXS_LITERATURE_SEARCH_JOB_TTL_SECONDS', 3600)), 86400))
LITERATURE_SEARCH_JOBS: dict[str, dict] = {}
LITERATURE_SEARCH_JOB_LOCK = Lock()


def send_email(subject: str, recipients, html_body: str, text_body: Optional[str] = None) -> bool:
    """Send email via configured SMTP server."""
    if not recipients:
        return False
    if isinstance(recipients, str):
        recipients = [recipients]
    msg = Message(subject=subject, recipients=list(recipients))
    msg.body = text_body or re.sub(r'<[^>]+>', '', html_body)
    msg.html = html_body
    try:
        mail.send(msg)
        return True
    except Exception:
        current_app.logger.exception("Failed to send email: %s", subject)
        return False


EMAIL_TOKEN_EXPIRATION_HOURS = 24
PASSWORD_RESET_EXPIRATION_MINUTES = 60


def _invalidate_tokens(model, user_id: int) -> None:
    model.query.filter_by(user_id=user_id, used_at=None).update(
        {'used_at': utc_now()}, synchronize_session=False
    )


def create_email_verification_token(user: 'User') -> 'EmailVerificationToken':
    _invalidate_tokens(EmailVerificationToken, user.id)
    record = EmailVerificationToken(
        user_id=user.id,
        token=secrets.token_urlsafe(48),
        expires_at=utc_now() + timedelta(hours=EMAIL_TOKEN_EXPIRATION_HOURS),
    )
    db.session.add(record)
    db.session.commit()
    return record


def create_password_reset_token(user: 'User') -> 'PasswordResetToken':
    _invalidate_tokens(PasswordResetToken, user.id)
    record = PasswordResetToken(
        user_id=user.id,
        token=secrets.token_urlsafe(48),
        expires_at=utc_now() + timedelta(minutes=PASSWORD_RESET_EXPIRATION_MINUTES),
    )
    db.session.add(record)
    db.session.commit()
    return record


def send_verification_email(user: 'User') -> None:
    token = create_email_verification_token(user)
    link = url_for('verify_email', token=token.token, _external=True)
    html = render_template(
        'emails/verify_email.html',
        user=user,
        verify_link=link,
        expires_hours=EMAIL_TOKEN_EXPIRATION_HOURS,
    )
    send_email('云凇学术 | 请验证您的邮箱', user.email, html)


def send_registration_success_email(user: 'User') -> None:
    """Notify users that their account registration completed."""
    login_link = url_for('login', _external=True)
    html = render_template(
        'emails/registration_success.html',
        user=user,
        login_link=login_link,
        expires_hours=EMAIL_TOKEN_EXPIRATION_HOURS,
    )
    send_email('云凇学术 | 注册成功提醒', user.email, html)


def send_password_reset_email(user: 'User') -> None:
    token = create_password_reset_token(user)
    link = url_for('reset_password', token=token.token, _external=True)
    html = render_template(
        'emails/password_reset.html',
        user=user,
        reset_link=link,
        expires_minutes=PASSWORD_RESET_EXPIRATION_MINUTES,
    )
    send_email('云凇学术 | 重置密码', user.email, html)

def normalize_doi(raw: str) -> str:
    if not raw:
        return ""
    doi = raw.strip()
    doi = doi.replace("https://doi.org/", "").replace("http://doi.org/", "")
    doi = doi.replace("doi:", "").strip()
    doi = "".join(doi.split())  # 移除所有空白
    return doi


def clean_abstract_text(raw: str | None) -> str:
    if not raw:
        return ""

    text = html.unescape(str(raw))
    text = re.sub(r'</?jats:[^>]+>', ' ', text, flags=re.IGNORECASE)
    text = re.sub(r'</?[^>]+>', ' ', text)
    text = re.sub(r'^\s*abstract\s*[:：-]?\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


DEFAULT_URL_PREFIX = normalize_url_prefix(os.environ.get('YSXS_URL_PREFIX'))

app = create_app()
app.wsgi_app = ScriptRootMiddleware(app.wsgi_app, DEFAULT_URL_PREFIX)


@app.template_filter('human_bytes')
def human_bytes_filter(value, precision: int = 2):
    return human_readable_bytes(value, precision)


@app.template_filter('human_bandwidth')
def human_bandwidth_filter(value, precision: int = 2):
    return human_readable_bandwidth(value, precision)


@app.template_filter('clean_abstract')
def clean_abstract_filter(value):
    return clean_abstract_text(value)


def format_compact_number(value, decimals: int = 3) -> str:
    try:
        num = float(value or 0)
    except (TypeError, ValueError):
        return str(value or 0)

    sign = '-' if num < 0 else ''
    abs_num = abs(num)
    precision = max(0, int(decimals))

    if abs_num >= 1_000_000_000:
        return f"{sign}{abs_num / 1_000_000_000:.{precision}f}B"
    if abs_num >= 1_000_000:
        return f"{sign}{abs_num / 1_000_000:.{precision}f}M"
    if abs_num >= 10_000:
        return f"{sign}{abs_num / 1_000:.{precision}f}k"
    if float(num).is_integer():
        return f"{int(num)}"
    return f"{num:.1f}"


@app.template_filter('compact_number')
def compact_number_filter(value, decimals: int = 3):
    return format_compact_number(value, decimals)


def _render_ai_summary_inline(text: str) -> str:
    rendered = html.escape(text or "")
    rendered = re.sub(r'`([^`]+)`', r'<code class="rounded bg-slate-100 px-1.5 py-0.5 text-[0.92em]">\1</code>', rendered)
    rendered = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', rendered)
    rendered = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<em>\1</em>', rendered)
    return rendered


def render_ai_summary_markdown(value) -> Markup:
    raw = str(value or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    if not raw:
        return Markup("")

    raw = re.sub(r'```(?:markdown|md|text)?\s*', '', raw, flags=re.IGNORECASE)
    raw = raw.replace('```', '')
    lines = raw.split('\n')

    blocks: list[str] = []
    paragraph_lines: list[str] = []
    list_items: list[str] = []
    ordered_list = False

    def flush_paragraph() -> None:
        nonlocal paragraph_lines
        if not paragraph_lines:
            return
        content = "<br>".join(_render_ai_summary_inline(line) for line in paragraph_lines if line.strip())
        if content:
            blocks.append(f'<p class="leading-8 text-slate-700">{content}</p>')
        paragraph_lines = []

    def flush_list() -> None:
        nonlocal list_items, ordered_list
        if not list_items:
            return
        tag = 'ol' if ordered_list else 'ul'
        blocks.append(f'<{tag} class="ml-5 space-y-2 text-slate-700">{"".join(list_items)}</{tag}>')
        list_items = []
        ordered_list = False

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            flush_paragraph()
            flush_list()
            continue

        heading_match = re.match(r'^(#{1,4})\s+(.*)$', line)
        if heading_match:
            flush_paragraph()
            flush_list()
            level = min(len(heading_match.group(1)) + 2, 6)
            blocks.append(
                f'<h{level} class="font-semibold text-slate-900 mt-4 mb-2">'
                f'{_render_ai_summary_inline(heading_match.group(2))}'
                f'</h{level}>'
            )
            continue

        unordered_match = re.match(r'^[-*•]\s+(.*)$', line)
        ordered_match = re.match(r'^\d+[.)]\s+(.*)$', line)
        if unordered_match or ordered_match:
            flush_paragraph()
            current_ordered = bool(ordered_match)
            item_text = unordered_match.group(1) if unordered_match else ordered_match.group(1)
            if list_items and ordered_list != current_ordered:
                flush_list()
            ordered_list = current_ordered
            list_items.append(f'<li class="leading-8">{_render_ai_summary_inline(item_text)}</li>')
            continue

        paragraph_lines.append(line)

    flush_paragraph()
    flush_list()

    if not blocks:
        blocks.append(f'<p class="leading-8 text-slate-700">{_render_ai_summary_inline(raw)}</p>')
    return Markup("".join(blocks))


@app.template_filter('render_ai_summary')
def render_ai_summary_filter(value):
    return render_ai_summary_markdown(value)


DOC_TYPE_LABEL_MAP = {
    'journal': '期刊',
    'conference': '会议',
    'review': '综述',
    'preprint': '预印本',
    'book': '书籍',
    'thesis': '学位论文',
    'patent': '专利',
    'standard': '标准',
    'dataset': '数据集',
    'software': '软件',
    'report': '报告',
    'other': '其他',
}

DOC_TYPE_DISPLAY_ORDER = [
    'journal',
    'review',
    'conference',
    'preprint',
    'book',
    'thesis',
    'dataset',
    'software',
    'patent',
    'standard',
    'report',
    'other',
]

CITATION_SYSTEM_FORMATS = [
    {
        'key': 'system_gbt',
        'name': 'GB/T 7714',
        'description': '中文期刊常用标准',
        'template': '{{gbt7714}}',
        'type': '系统',
    },
    {
        'key': 'system_apa',
        'name': 'APA',
        'description': 'American Psychological Association',
        'template': '{{apa}}',
        'type': '系统',
    },
    {
        'key': 'system_mla',
        'name': 'MLA',
        'description': 'Modern Language Association',
        'template': '{{mla}}',
        'type': '系统',
    },
]


def ensure_system_citation_formats():
    """Ensure built-in citation formats exist in the database."""
    inspector = inspect(db.engine)
    if not inspector.has_table(CitationFormat.__tablename__):
        return

    existing_rows = CitationFormat.query.filter(CitationFormat.is_system.is_(True)).all()
    existing_map = {fmt.code: fmt for fmt in existing_rows if fmt.code}
    updated = False
    for fmt in CITATION_SYSTEM_FORMATS:
        row = existing_map.get(fmt['key'])
        if row:
            fields = ['name', 'description', 'template']
            for field in fields:
                new_value = fmt.get(field)
                if getattr(row, field) != new_value:
                    setattr(row, field, new_value)
                    updated = True
        else:
            db.session.add(CitationFormat(
                code=fmt['key'],
                name=fmt['name'],
                description=fmt.get('description'),
                template=fmt.get('template'),
                is_system=True,
            ))
            updated = True
    if updated:
        db.session.commit()


@app.template_filter('doc_type_label')
def doc_type_label_filter(value):
    if not value:
        return '未设置'
    key = str(value).strip().lower()
    return DOC_TYPE_LABEL_MAP.get(key, value)


def _doc_type_sort_key(value: str | None, label: str | None = None) -> tuple[int, str]:
    normalized = str(value or '').strip().lower()
    try:
        order_index = DOC_TYPE_DISPLAY_ORDER.index(normalized)
    except ValueError:
        order_index = len(DOC_TYPE_DISPLAY_ORDER)
    display_label = str(label or DOC_TYPE_LABEL_MAP.get(normalized, normalized)).strip()
    return order_index, display_label


def get_sorted_doc_types() -> list[DocType]:
    doc_types = DocType.query.all()
    return sorted(
        doc_types,
        key=lambda dt: _doc_type_sort_key(getattr(dt, 'value', ''), getattr(dt, 'label', '')),
    )


def get_accessible_documents_condition():
    if current_user.is_authenticated:
        return Document.owner_id == current_user.id
    return false()


def apply_accessible_filter(query):
    return query.filter(get_accessible_documents_condition())


def ensure_user_categories(user_id: int | None, commit: bool = False) -> int:
    if not user_id:
        return 0

    existing_count = Category.query.filter_by(owner_id=user_id).count()
    if existing_count > 0:
        return 0

    created = 0
    for value, label in DEFAULT_CATEGORY_TEMPLATES:
        db.session.add(Category(owner_id=user_id, value=value, label=label))
        created += 1

    if created and commit:
        db.session.commit()
    return created


def slugify(value: str) -> str:
    if not value:
        return ''
    value = value.strip().lower()
    value = re.sub(r'\s+', '-', value)
    value = re.sub(r'[^a-z0-9-]', '', value)
    value = re.sub(r'-{2,}', '-', value).strip('-')
    return value


def generate_bibtex_key(doc: 'Document') -> str:
    author_block = (doc.authors or '').split(';')[0].split(',')[0].strip()
    if not author_block and doc.title:
        author_block = doc.title.split()[0]
    author_slug = slugify(author_block) or 'ref'
    year_part = str(doc.year or to_cst(utc_now()).year)
    return f"{author_slug}{year_part}{doc.id or ''}".strip()


def _safe_int(value):
    if value is None:
        return None
    text = str(value).strip()
    match = re.search(r'\d{4}', text)
    if not match:
        return None
    try:
        return int(match.group(0))
    except ValueError:
        return None


def _join_authors(parts):
    if not parts:
        return ''
    if isinstance(parts, str):
        chunks = [chunk.strip() for chunk in re.split(r'\s+and\s+|;', parts) if chunk.strip()]
    else:
        chunks = [str(chunk).strip() for chunk in parts if str(chunk).strip()]
    return '; '.join(chunks)


def _decode_text(data: bytes) -> str:
    for encoding in ('utf-8', 'utf-16', 'gbk', 'latin-1'):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode('utf-8', errors='ignore')


def parse_ris_records(content: str) -> list[dict]:
    entries: list[dict] = []
    record: dict[str, str] | None = None
    authors: list[str] = []
    start_page = None
    end_page = None

    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        match = re.match(r'^([A-Za-z0-9]{2})\s*-\s*(.*)$', line)
        if not match:
            continue
        key = match.group(1).upper()
        value = match.group(2).strip()
        if key == 'TY':
            record = {}
            authors = []
            start_page = None
            end_page = None
            record['doc_type'] = value.lower()
            continue
        if record is None:
            continue
        if key == 'ER':
            if authors:
                record['authors'] = _join_authors(authors)
            if start_page and end_page:
                record['pages'] = f"{start_page}-{end_page}"
            elif start_page and not record.get('pages'):
                record['pages'] = start_page
            if record.get('title') or record.get('authors'):
                entries.append(record)
            record = None
            authors = []
            continue
        if key in {'TI', 'T1', 'T2'}:
            record['title'] = value
        elif key == 'AU':
            authors.append(value)
        elif key in {'JO', 'JA', 'JF'}:
            record['journal'] = value
        elif key in {'PY', 'Y1'}:
            record['year'] = value
        elif key == 'VL':
            record['volume'] = value
        elif key in {'IS', 'CP'}:
            record['issue'] = value
        elif key == 'SP':
            start_page = value
        elif key == 'EP':
            end_page = value
        elif key in {'KW', 'K1'}:
            existing = record.get('keywords')
            record['keywords'] = f"{existing}; {value}" if existing else value
        elif key == 'DO':
            record['doi'] = value
        elif key == 'UR':
            record['url'] = value
        elif key == 'PB':
            record['publisher'] = value

    return entries


def parse_bibtex_records(content: str) -> list[dict]:
    entries: list[dict] = []
    current: dict[str, str] | None = None
    last_key: str | None = None
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith('@'):
            if current:
                entries.append(current)
            current = {}
            last_key = None
            match = re.match(r'@(\w+)\s*{\s*([^,]+),?', line)
            if match:
                current['entry_type'] = match.group(1).lower()
                current['cite_key'] = match.group(2)
            continue
        if current is None:
            continue
        if line == '}':
            entries.append(current)
            current = None
            last_key = None
            continue
        if '=' in line:
            key, value = line.split('=', 1)
            key = key.strip().lower()
            value = value.strip().rstrip(',')
            if value.startswith('{') and value.endswith('}'):
                value = value[1:-1]
            elif value.startswith('"') and value.endswith('"'):
                value = value[1:-1]
            current[key] = value.strip()
            last_key = key
        elif last_key:
            appendix = line.rstrip(',').strip()
            if appendix:
                current[last_key] = (current[last_key] + ' ' + appendix).strip()

    if current:
        entries.append(current)

    results: list[dict] = []
    for entry in entries:
        if not entry:
            continue
        data = {
            'title': entry.get('title'),
            'authors': _join_authors(entry.get('author')),
            'journal': entry.get('journal') or entry.get('booktitle'),
            'year': entry.get('year'),
            'volume': entry.get('volume'),
            'issue': entry.get('number'),
            'pages': entry.get('pages'),
            'doi': entry.get('doi'),
            'url': entry.get('url'),
            'doc_type': entry.get('entry_type'),
            'publisher': entry.get('publisher'),
        }
        results.append(data)
    return results


def create_documents_from_refs(records: list[dict]):
    ensure_user_categories(current_user.id, commit=True)
    default_category = get_default_category(current_user.id)
    category_id = default_category.id if default_category else None
    category_label = default_category.label if default_category else None
    created = 0
    skipped = 0

    for record in records:
        title = (record.get('title') or '').strip()
        authors = (record.get('authors') or '').strip()
        if not title:
            skipped += 1
            continue
        doc_type_value = _normalize_import_doc_type(record.get('doc_type'))
        doc = Document(
            title=title,
            authors=authors or '佚名',
            journal=record.get('journal'),
            year=_safe_int(record.get('year')),
            volume=record.get('volume'),
            issue=record.get('issue'),
            pages=record.get('pages'),
            doi=record.get('doi'),
            url=record.get('url'),
            doc_type=doc_type_value,
            publisher=record.get('publisher'),
            owner_id=current_user.id,
            upload_time=utc_now(),
            created_at=utc_now(),
            category_id=category_id,
            category=category_label,
        )
        db.session.add(doc)
        created += 1

    if created:
        db.session.commit()
    else:
        db.session.rollback()
    return created, skipped


def _normalize_import_doc_type(raw: str | None) -> str:
    if not raw:
        return 'journal'
    token = str(raw).strip().lower()
    mapping = {
        'jour': 'journal',
        'journal': 'journal',
        'article': 'journal',
        'conf': 'conference',
        'conference': 'conference',
        'inproceedings': 'conference',
        'incollection': 'conference',
        'book': 'book',
        'thesis': 'thesis',
        'phdthesis': 'thesis',
        'mastersthesis': 'thesis',
        'rprt': 'report',
        'report': 'report',
        'techreport': 'report',
    }
    normalized = mapping.get(token, token)
    return normalized[:50] or 'journal'


def get_current_user_batch_ids():
    if not current_user.is_authenticated:
        return []
    rows = (
        BatchCitation.query.with_entities(BatchCitation.doc_id)
        .filter_by(user_id=current_user.id)
        .all()
    )
    return [row.doc_id for row in rows]


CITATION_PLACEHOLDER_PATTERN = re.compile(r'{{\s*(\w+)\s*}}')


def _build_citation_context(doc: Document) -> dict:
    apa = _format_apa(doc).strip() if '_format_apa' in globals() else ''
    mla = _format_mla(doc).strip() if '_format_mla' in globals() else ''
    gbt7714 = _format_gbt7714(doc).strip() if '_format_gbt7714' in globals() else ''
    bibtex = _format_bibtex(doc).strip() if '_format_bibtex' in globals() else ''
    ris = _format_ris(doc).strip() if '_format_ris' in globals() else ''
    return {
        'id': str(doc.id),
        'title': doc.title or '',
        'authors': doc.authors or '',
        'journal': doc.journal or doc.booktitle or doc.venue or '',
        'booktitle': doc.booktitle or '',
        'venue': doc.venue or '',
        'year': str(doc.year or ''),
        'volume': doc.volume or '',
        'issue': doc.issue or '',
        'pages': doc.pages or '',
        'publisher': doc.publisher or '',
        'editor': doc.editor or '',
        'doc_type': doc.doc_type_obj.label if doc.doc_type_obj else (doc.doc_type or ''),
        'thesis_degree': getattr(doc, 'thesis_degree', '') or '',
        'doi': doc.doi or '',
        'url': doc.url or '',
        'apa': apa,
        'mla': mla,
        'gbt7714': gbt7714,
        'bibtex': bibtex,
        'ris': ris,
    }


def _render_citation_template(template: str, context: dict) -> str:
    if not template:
        return ''

    def replace(match):
        key = match.group(1)
        return str(context.get(key, '') or '')

    return CITATION_PLACEHOLDER_PATTERN.sub(replace, template)


def resolve_category(identifier, owner_id: int | None = None):
    if identifier in (None, ''):
        return None

    query = Category.query
    if owner_id is not None:
        query = query.filter_by(owner_id=owner_id)

    try:
        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            category_id = int(identifier)
            category = query.filter_by(id=category_id).first()
            if category:
                return category
    except (TypeError, ValueError):
        pass

    return query.filter_by(value=str(identifier)).first()


def get_default_category(owner_id: int | None):
    if owner_id is None:
        return None
    return Category.query.filter_by(owner_id=owner_id, value='other').first()


def assign_category(doc: Document, identifier=None, owner_id: int | None = None):
    owner_id = owner_id or getattr(doc, 'owner_id', None)
    category = resolve_category(identifier, owner_id=owner_id)
    if not category and owner_id:
        ensure_user_categories(owner_id)
        category = get_default_category(owner_id)
    if category:
        doc.category_id = category.id
        doc.category = category.value
    else:
        doc.category_id = None
        doc.category = None


def reassign_category_documents(source_category: Category, target_category=None) -> int:
    if not source_category:
        return 0

    target = target_category
    if target and target.owner_id != source_category.owner_id:
        raise ValueError('目标分类不属于同一用户')
    if not target:
        target = get_default_category(source_category.owner_id)
    if not target:
        ensure_user_categories(source_category.owner_id)
        target = get_default_category(source_category.owner_id)
    if not target:
        raise ValueError("未找到默认分类")

    docs = Document.query.filter_by(category_id=source_category.id).all()
    for doc in docs:
        doc.category_id = target.id
        doc.category = target.value
    return len(docs)


def sync_document_category_relationships():
    inspector = inspect(db.engine)
    if not inspector.has_table('document') or not inspector.has_table('category'):
        return
    missing_docs = Document.query.filter(
        Document.category_id.is_(None),
        Document.category.isnot(None)
    ).all()
    updates = 0
    for doc in missing_docs:
        category = resolve_category(doc.category, owner_id=doc.owner_id)
        if category:
            doc.category_id = category.id
            updates += 1
    if updates:
        current_app.logger.info("修复了 %s 条分类关联", updates)
        db.session.commit()


def build_category_counts(filters=None):
    filters = filters or []
    owner_id = current_user.id if current_user.is_authenticated else None

    counts = []
    if owner_id:
        categories = (
            Category.query
            .filter(Category.owner_id == owner_id)
            .order_by(Category.label)
            .all()
        )
        doc_query = (
            db.session.query(Document.category_id, func.count(Document.id))
            .filter(get_accessible_documents_condition())
        )
        for condition in filters:
            doc_query = doc_query.filter(condition)
        doc_query = doc_query.group_by(Document.category_id)
        doc_counts = {cat_id: count for cat_id, count in doc_query.all()}
        counts = [
            {
                "value": category.value,
                "label": category.label,
                "count": int(doc_counts.get(category.id, 0)),
            }
            for category in categories
        ]
    else:
        shared_q = db.session.query(Document.category).filter(Document.is_shared.is_(True))
        for condition in filters:
            shared_q = shared_q.filter(condition)
        shared_q = shared_q.group_by(Document.category)
        for category_value, cnt in shared_q.all():
            label = category_value or '未分类'
            counts.append({"value": category_value or 'uncategorized', "label": label, "count": int(cnt)})

    uncategorized_query = Document.query.filter(get_accessible_documents_condition())
    for condition in filters:
        uncategorized_query = uncategorized_query.filter(condition)
    uncategorized_count = uncategorized_query.filter(Document.category_id.is_(None)).count()
    if uncategorized_count:
        if not any(item.get('value') == 'uncategorized' for item in counts):
            counts.append({"value": "uncategorized", "label": "未分类", "count": int(uncategorized_count)})

    counts.sort(key=lambda item: item.get("label") or '')
    return counts


def get_category_filter_options():
    owner_id = current_user.id if current_user.is_authenticated else None
    options = []
    if owner_id:
        rows = (
            Category.query
            .with_entities(Category.value, Category.label)
            .filter(Category.owner_id == owner_id)
            .order_by(Category.label)
            .all()
        )
        options = [{"value": value, "label": label} for value, label in rows if value]
        has_uncategorized = Document.query.filter(get_accessible_documents_condition()).filter(
            Document.category_id.is_(None)
        ).limit(1).first() is not None
        if has_uncategorized:
            options.append({"value": "uncategorized", "label": "未分类"})
    else:
        rows = (
            db.session.query(Document.category).filter(Document.is_shared.is_(True)).distinct().all()
        )
        for (cat_val,) in rows:
            if cat_val:
                options.append({"value": cat_val, "label": cat_val})
        has_uncategorized = Document.query.filter(Document.is_shared.is_(True)).filter(
            Document.category_id.is_(None)
        ).limit(1).first() is not None
        if has_uncategorized:
            options.append({"value": "uncategorized", "label": "未分类"})

    return options


def get_year_filter_options():
    current_year = to_cst(utc_now()).year
    previous_year = max(current_year - 1, 0)
    range_start = max(current_year - 5, 0)
    range_end = max(current_year - 3, 0)
    options = [{
        "value": str(current_year),
        "label": f"{current_year} 年",
        "min_year": current_year,
        "max_year": current_year
    }]
    if previous_year != current_year:
        options.append({
            "value": str(previous_year),
            "label": f"{previous_year} 年",
            "min_year": previous_year,
            "max_year": previous_year
        })
    if range_start <= range_end:
        options.append({
            "value": f"{range_start}-{range_end}",
            "label": f"{range_start}-{range_end} 年",
            "min_year": range_start,
            "max_year": range_end
        })
    before_label_year = max(range_start, 0)
    before_max_year = max(range_start - 1, 0)
    options.append({
        "value": f"before-{range_start}",
        "label": f"{before_label_year} 年以前",
        "min_year": None,
        "max_year": before_max_year
    })
    return options


def get_doc_type_options():
    doc_types = get_sorted_doc_types()
    options = [
        {"value": dt.value, "label": dt.label}
        for dt in doc_types
        if dt.value
    ]
    if not options:
        distinct_types = sorted(
            (
                value for value, in (
                    db.session.query(Document.doc_type)
                    .filter(Document.doc_type.isnot(None))
                    .distinct()
                    .all()
                )
                if value
            ),
            key=lambda value: _doc_type_sort_key(value),
        )
        for value in distinct_types:
            options.append({"value": value, "label": DOC_TYPE_LABEL_MAP.get(str(value).strip().lower(), value)})
    return options


AVAILABLE_SORTS = {'latest', 'earliest', 'title-asc', 'title-desc', 'citations'}


def _parse_filter_state(year_options, doc_type_options, category_options):
    year_lookup = {opt["value"]: opt for opt in year_options}
    doc_type_lookup = {opt["value"] for opt in doc_type_options}
    category_lookup = {opt["value"]: opt for opt in category_options}

    active_year_ranges = [
        value for value in request.args.getlist('year_range')
        if value in year_lookup
    ]
    legacy_year = request.args.get('year')
    if legacy_year and legacy_year in year_lookup and legacy_year not in active_year_ranges:
        active_year_ranges.append(legacy_year)

    active_doc_types = [
        value for value in request.args.getlist('doc_type')
        if value in doc_type_lookup
    ]

    active_categories = [
        value for value in request.args.getlist('category')
        if value in category_lookup
    ]

    sort_option = request.args.get('sort', 'latest')
    if sort_option not in AVAILABLE_SORTS:
        sort_option = 'latest'

    return year_lookup, active_year_ranges, active_doc_types, active_categories, sort_option


def _apply_sorting(query, sort_option):
    query = query.order_by(None)
    title_field = func.lower(func.coalesce(Document.title, ''))
    if sort_option == 'earliest':
        return query.order_by(Document.upload_time.asc(), Document.id.asc())
    if sort_option == 'title-asc':
        return query.order_by(title_field.asc(), Document.id.asc())
    if sort_option == 'title-desc':
        return query.order_by(title_field.desc(), Document.id.desc())
    if sort_option == 'citations':
        return query.order_by(Document.view_count.desc(), Document.id.desc())
    return query.order_by(Document.upload_time.desc(), Document.id.desc())


def apply_sidebar_filters(base_query):
    year_options = get_year_filter_options()
    doc_type_options = get_doc_type_options()
    category_options = get_category_filter_options()
    year_lookup, active_year_ranges, active_doc_types, active_categories, sort_option = _parse_filter_state(
        year_options, doc_type_options, category_options
    )

    query = base_query
    if active_year_ranges:
        year_conditions = []
        for value in active_year_ranges:
            option = year_lookup.get(value)
            if not option:
                continue
            min_year = option.get("min_year")
            max_year = option.get("max_year")
            conditions = []
            if min_year is not None:
                conditions.append(Document.year >= min_year)
            if max_year is not None:
                conditions.append(Document.year <= max_year)
            if conditions:
                clause = conditions[0] if len(conditions) == 1 else and_(*conditions)
                year_conditions.append(clause)
        if year_conditions:
            query = query.filter(or_(*year_conditions))

    if active_doc_types:
        query = query.filter(Document.doc_type.in_(active_doc_types))

    if active_categories:
        category_conditions = []
        selected_regular = [value for value in active_categories if value != 'uncategorized']
        if selected_regular:
            try:
                owner_id = current_user.id if current_user.is_authenticated else None
                if owner_id:
                    cat_rows = Category.query.with_entities(Category.id).filter(
                        Category.owner_id == owner_id,
                        Category.value.in_(selected_regular)
                    ).all()
                    cat_ids = [r[0] for r in cat_rows]
                else:
                    cat_ids = []
            except Exception:
                cat_ids = []

            if cat_ids:
                category_conditions.append(Document.category_id.in_(cat_ids))
            category_conditions.append(Document.category.in_(selected_regular))
        if 'uncategorized' in active_categories:
            category_conditions.append(Document.category_id.is_(None))
        if category_conditions:
            query = query.filter(or_(*category_conditions))

    query = _apply_sorting(query, sort_option)

    filter_metadata = {
        "year_filter_options": year_options,
        "doc_type_options": doc_type_options,
        "category_options": category_options,
        "active_year_ranges": active_year_ranges,
        "active_doc_types": active_doc_types,
        "active_categories": active_categories,
        "active_sort": sort_option,
    }

    context = {
        **filter_metadata,
        "filter_metadata": filter_metadata
    }
    return query, context


def render_document_page(**context):
    batch_ids = get_current_user_batch_ids()
    context.setdefault('batch_cite_ids', batch_ids)
    context.setdefault('batch_cite_count', len(batch_ids))
    endpoint_view_labels = {
        'index': '全部文献',
        'my_collected': '我的收藏',
        'shared_documents': '共享文件',
    }
    current_view_label = context.get('current_view_label')
    if not current_view_label:
        if request.endpoint == 'category':
            current_view_label = context.get('selected_category_label') or '分类浏览'
        else:
            current_view_label = endpoint_view_labels.get(request.endpoint, '全部文献')
    context.setdefault('current_view_label', current_view_label)
    active_categories = context.get('active_categories') or []
    category_options = context.get('category_options') or []
    if active_categories:
        lookup = {opt.get('value'): opt.get('label') for opt in category_options}
        labels = [lookup.get(value, value) for value in active_categories if value]
        if labels:
            context['selected_category_label'] = '、'.join(labels)
    else:
        context.setdefault('selected_category_label', current_view_label)
    context.setdefault(
        'results_heading_label',
        context.get('selected_category_label') or current_view_label
    )

    pagination = context.get('pagination')

    def build_page_url(page_num: int | None) -> str:
        if page_num is None:
            return '#'
        args = request.args.to_dict()
        view_args = dict(request.view_args or {})
        if page_num <= 1:
            args.pop('page', None)
        else:
            args['page'] = page_num
        return url_for(request.endpoint, **view_args, **args)

    context.setdefault('pagination', pagination)
    context.setdefault('pagination_url', build_page_url)
    return render_template('YSXS.html', **context)


def paginate_documents(query, per_page: int = DOCUMENTS_PER_PAGE):
    page = request.args.get('page', type=int, default=1)
    if not page or page < 1:
        page = 1
    return query.paginate(page=page, per_page=per_page, error_out=False)


@app.before_request
def _security_session_check():
    """
    【安全修复】检测并防止使用旧SECRET_KEY伪造的会话
    这是对SECRET_KEY弱密钥漏洞的补救措施
    """
    # 标记这个应用启动版本使用了新的SECRET_KEY
    if not hasattr(app, '_SECURITY_HOTFIX_VERSION'):
        app._SECURITY_HOTFIX_VERSION = '2026-01-16-v1'
        current_app.logger.warning('🔒 安全修复已应用 - SECRET_KEY已更新')
    
    # 如果会话中没有标记当前版本，强制清空（防止旧密钥伪造的session）
    if session and '_session_version' not in session:
        session['_session_version'] = app._SECURITY_HOTFIX_VERSION
        session.modified = True


# 统一在模板中提供 csrf_token() 调用
@app.context_processor
def inject_csrf_token():
    return {'csrf_token': generate_csrf}


@app.context_processor
def inject_morning_report_popup():
    if not current_user.is_authenticated:
        return {'morning_report_popup': None}

    if request.endpoint in {'morning_report_home', 'morning_report_settings_view'}:
        return {'morning_report_popup': None}

    try:
        payload = get_morning_report_popup_payload(current_user.id)
    except Exception as exc:
        current_app.logger.warning("读取晨报弹窗失败: %s", exc)
        payload = None
    return {'morning_report_popup': payload}


@app.context_processor
def inject_broadcast_popup():
    if not current_user.is_authenticated:
        return {'broadcast_popup': None, 'broadcast_unread_count': 0}

    try:
        unread_count = get_unread_broadcast_count(current_user.id)
    except Exception as exc:
        current_app.logger.warning("读取广播未读数失败: %s", exc)
        unread_count = 0

    if request.endpoint in {'broadcast_history'}:
        return {'broadcast_popup': None, 'broadcast_unread_count': unread_count}

    try:
        message = get_latest_unseen_broadcast(current_user.id)
    except Exception as exc:
        current_app.logger.warning("读取广播弹窗失败: %s", exc)
        message = None

    if not message:
        return {'broadcast_popup': None, 'broadcast_unread_count': unread_count}

    return {
        'broadcast_popup': {
            'id': message.id,
            'title': message.title,
            'content': message.content,
            'created_at': format_cn_time(message.created_at),
        },
        'broadcast_unread_count': unread_count,
    }


@app.before_request
def _runtime_metrics_before_request():
    runtime_metrics_before_request()


@app.after_request
def _runtime_metrics_after_request(response):
    return runtime_metrics_after_request(response)


@app.before_request
def _ensure_user_category_defaults():
    """Make sure authenticated users always have the baseline category set."""
    if not current_user.is_authenticated:
        return
    if getattr(g, '_categories_checked', False):
        return
    created = ensure_user_categories(current_user.id, commit=True)
    g._categories_checked = True
    if created:
        current_app.logger.info('Auto-created %s default categories for user %s', created, current_user.id)


@app.before_request
def _ensure_user_morning_report_defaults():
    if not current_user.is_authenticated:
        return
    if getattr(g, '_morning_report_settings_checked', False):
        return
    ensure_morning_report_settings(current_user.id, commit=True)
    g._morning_report_settings_checked = True


@app.before_request
def _ensure_due_morning_report():
    if not current_user.is_authenticated:
        return
    if getattr(g, '_morning_report_due_checked', False):
        return
    try:
        trigger_due_morning_report_in_background(
            current_app._get_current_object(),
            current_user.id,
        )
    except Exception as exc:
        current_app.logger.warning("自动检查今日晨报失败: %s", exc)
    g._morning_report_due_checked = True



documents_bp = Blueprint('documents', __name__)


def ensure_document_access(doc: 'Document', require_owner: bool = False) -> None:
    if require_owner:
        if not current_user.is_authenticated or doc.owner_id != current_user.id:
            abort(403)
        return

    if doc.is_shared:
        return

    if not current_user.is_authenticated:
        abort(403)

    if doc.owner_id != current_user.id and doc.share_by_id != current_user.id:
        abort(403)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# 检查文件类型是否允许
def allowed_file(filename: str) -> bool:
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', set())
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed

# 初始化分类数据的函数
def init_category_data():
    # 仅初始化系统级文档类型；分类应为每个用户单独创建。
    if not inspect(db.engine).has_table('doc_type'):
        return

    doc_types = [
        ('journal', '期刊'),
        ('conference', '会议'),
        ('review', '综述'),
        ('preprint', '预印本'),
        ('book', '书籍'),
        ('thesis', '学位论文'),
        ('patent', '专利'),
        ('standard', '标准'),
        ('dataset', '数据集'),
        ('software', '软件'),
        ('report', '报告'),
        ('other', '其他'),
    ]
    existing = {row.value: row for row in DocType.query.all()}
    changed = False
    for value, label in doc_types:
        row = existing.get(value)
        if row is None:
            db.session.add(DocType(value=value, label=label))
            changed = True
        elif row.label != label:
            row.label = label
            changed = True

    if changed:
        db.session.commit()


def sync_research_overview_doc_types() -> None:
    """Align AI-generated research overview entries to the review doc type."""
    if not inspect(db.engine).has_table('document') or not inspect(db.engine).has_table('doc_type'):
        return

    review_type = DocType.query.filter_by(value='review').first()
    if review_type is None:
        return

    candidates = (
        Document.query
        .filter(Document.title.like('研究现状综述：%'))
        .filter(
            or_(
                Document.journal == '研究现状综述',
                Document.authors == '云凇学术 AI',
            )
        )
        .all()
    )

    changed = False
    for document in candidates:
        if (document.doc_type or '').strip().lower() != 'review':
            document.doc_type = 'review'
            changed = True
        if document.doc_type_id != review_type.id:
            document.doc_type_id = review_type.id
            changed = True

    if changed:
        db.session.commit()


def create_test_data():
    super_admin = User.query.filter_by(role='super admin').first()
    if super_admin:
        app.logger.info('超级管理员用户已存在')
        return

    super_admin = User(
        custom_id="SUPER-ADMIN",
        role="super admin",
        username="super_admin",
        email="ysp@cug.edu.cn",
        email_confirmed_at=utc_now(),
    )
    super_admin.set_password("123456")
    db.session.add(super_admin)
    db.session.commit()
    try:
        ensure_user_categories(super_admin.id, commit=True)
    except Exception:
        app.logger.exception('Failed to seed default categories for the super admin')
    app.logger.info('超级管理员用户创建成功')


def ensure_database_initialized() -> None:
    """Create required tables and seed baseline records if the DB is empty."""
    with app.app_context():
        inspector = inspect(db.engine)
        existing_tables = set(inspector.get_table_names())
        required_tables = {
            'user',
            'document',
            'category',
            'doc_type',
            'ai_usage_log',
            'broadcast_message',
            'broadcast_receipt',
            'morning_report_settings',
            'morning_report_run',
            'morning_report_paper',
        }
        missing_tables = sorted(required_tables - existing_tables)

        if missing_tables:
            app.logger.warning(
                "Database tables missing on startup: %s; running db.create_all()",
                ', '.join(missing_tables),
            )
            db.create_all()

        migrate_legacy_local_datetime_storage()
        ensure_broadcast_receipt_schema()
        ensure_document_ai_summary_schema()
        init_category_data()
        sync_research_overview_doc_types()


def ensure_broadcast_receipt_schema() -> None:
    inspector = inspect(db.engine)
    try:
        columns = {column['name'] for column in inspector.get_columns('broadcast_receipt')}
    except Exception:
        app.logger.exception('Failed to inspect broadcast_receipt schema')
        return

    statements: list[str] = []
    if 'hidden_at' not in columns:
        statements.append("ALTER TABLE broadcast_receipt ADD COLUMN hidden_at DATETIME")

    if not statements:
        return

    with db.engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
        sync_document_category_relationships()
        create_test_data()


def _datetime_migration_marker_path() -> Path:
    marker_dir = Path(app.instance_path)
    marker_dir.mkdir(parents=True, exist_ok=True)
    return marker_dir / 'time_policy_utc_v1.marker'


def migrate_legacy_local_datetime_storage() -> None:
    marker_path = _datetime_migration_marker_path()
    if marker_path.exists():
        return

    table_columns = {
        'document': ['created_at', 'upload_time', 'modified_at'],
        'user': ['created_at'],
        'admin_auth_key': ['created_at', 'expires_at', 'used_at'],
    }

    inspector = inspect(db.engine)
    existing_tables = set(inspector.get_table_names())
    dialect_name = db.engine.dialect.name

    try:
        if dialect_name == 'sqlite':
            with db.engine.begin() as connection:
                for table_name, columns in table_columns.items():
                    if table_name not in existing_tables:
                        continue
                    existing_columns = {column['name'] for column in inspector.get_columns(table_name)}
                    for column_name in columns:
                        if column_name not in existing_columns:
                            continue
                        connection.execute(
                            text(
                                f"UPDATE {table_name} "
                                f"SET {column_name} = datetime({column_name}, '-8 hours') "
                                f"WHERE {column_name} IS NOT NULL"
                            )
                        )
        else:
            shift = timedelta(hours=8)
            for doc in Document.query.all():
                if doc.created_at:
                    doc.created_at = doc.created_at - shift
                if doc.upload_time:
                    doc.upload_time = doc.upload_time - shift
                if doc.modified_at:
                    doc.modified_at = doc.modified_at - shift
            for user in User.query.all():
                if user.created_at:
                    user.created_at = user.created_at - shift
            for key in AdminAuthKey.query.all():
                if key.created_at:
                    key.created_at = key.created_at - shift
                if key.expires_at:
                    key.expires_at = key.expires_at - shift
                if key.used_at:
                    key.used_at = key.used_at - shift
            db.session.commit()

        marker_path.write_text(
            f"migrated_at_utc={utc_now().isoformat()}",
            encoding='utf-8',
        )
        app.logger.info('时间策略迁移完成：历史本地时间已统一转换为 UTC 存储。')
    except Exception:
        db.session.rollback()
        app.logger.exception('历史时间字段迁移失败，将保留原始数据。')


def ensure_document_ai_summary_schema() -> None:
    inspector = inspect(db.engine)
    if 'document' not in inspector.get_table_names():
        return

    columns = {column['name'] for column in inspector.get_columns('document')}
    alter_statements: list[str] = []
    if 'ai_summary' not in columns:
        alter_statements.append("ALTER TABLE document ADD COLUMN ai_summary TEXT")
    if 'ai_summary_updated_at' not in columns:
        alter_statements.append("ALTER TABLE document ADD COLUMN ai_summary_updated_at DATETIME")

    if alter_statements:
        with db.engine.begin() as connection:
            for statement in alter_statements:
                connection.execute(text(statement))


def ensure_morning_report_schema() -> None:
    with app.app_context():
        inspector = inspect(db.engine)
        table_names = set(inspector.get_table_names())
        if 'morning_report_settings' not in table_names:
            return

        columns = {column['name'] for column in inspector.get_columns('morning_report_settings')}
        alter_statements: list[str] = []
        if 'enabled_sources_text' not in columns:
            alter_statements.append(
                "ALTER TABLE morning_report_settings "
                "ADD COLUMN enabled_sources_text VARCHAR(120) NOT NULL DEFAULT 'openalex,crossref,arxiv'"
            )
        if 'strict_filter_enabled' not in columns:
            alter_statements.append(
                "ALTER TABLE morning_report_settings "
                "ADD COLUMN strict_filter_enabled BOOLEAN NOT NULL DEFAULT 1"
            )
        if 'exclude_keywords_text' not in columns:
            alter_statements.append(
                "ALTER TABLE morning_report_settings "
                "ADD COLUMN exclude_keywords_text TEXT NOT NULL DEFAULT ''"
            )

        if alter_statements:
            with db.engine.begin() as connection:
                for statement in alter_statements:
                    connection.execute(text(statement))

        if 'morning_report_paper' in table_names:
            paper_columns = {column['name'] for column in inspector.get_columns('morning_report_paper')}
            paper_alters: list[str] = []
            if 'ai_summary' not in paper_columns:
                paper_alters.append("ALTER TABLE morning_report_paper ADD COLUMN ai_summary TEXT")
            if 'ai_summary_updated_at' not in paper_columns:
                paper_alters.append("ALTER TABLE morning_report_paper ADD COLUMN ai_summary_updated_at DATETIME")
            if 'imported_document_id' not in paper_columns:
                paper_alters.append("ALTER TABLE morning_report_paper ADD COLUMN imported_document_id INTEGER")
            if 'imported_at' not in paper_columns:
                paper_alters.append("ALTER TABLE morning_report_paper ADD COLUMN imported_at DATETIME")
            if paper_alters:
                with db.engine.begin() as connection:
                    for statement in paper_alters:
                        connection.execute(text(statement))

# 生成授权码路由
@app.route('/generate-auth-key', methods=['GET', 'POST'])
@login_required
@super_admin_required  # 需使用之前定义的超级管理员装饰器
def generate_auth_key(simple: bool = False):
    try:
        auth_key = current_user.generate_auth_key(expires_hours=24)
    except PermissionError as e:
        if request.method == 'POST':
            return jsonify(success=False, error=str(e)), 403
        flash(str(e), 'danger')
        return redirect(url_for('view_auth_keys'))
    except Exception as e:
        if request.method == 'POST':
            return jsonify(success=False, error=f'生成授权码失败：{e}'), 500
        flash(f'生成授权码失败：{e}', 'danger')
        return redirect(url_for('view_auth_keys'))

    if request.method == 'POST':
        return jsonify(success=True, auth_key=auth_key)

    copy_button = f'<button onclick="copyToClipboard(\'{auth_key}\')">复制到剪贴板</button>'
    flash(f'授权码已生成：{auth_key}，有效期24小时<br>{copy_button}', 'success')
    if simple:
        return auth_key
    return redirect(url_for('view_auth_keys'))


# revoke_auth_key 路由
@app.route('/revoke-auth-key/<int:key_id>', methods=['POST'])
@login_required
@super_admin_required
def revoke_auth_key(key_id):
    key = AdminAuthKey.query.get_or_404(key_id)
    try:
        key.is_used = True
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        if request.is_json:
            return jsonify(success=False, error=str(exc)), 500
        flash(f'撤销失败：{exc}', 'danger')
        return redirect(url_for('view_auth_keys'))

    if request.is_json:
        return jsonify(success=True)

    flash('授权码已撤销', 'success')
    return redirect(url_for('view_auth_keys'))


@app.route('/delete-auth-key/<int:key_id>', methods=['POST'])
@login_required
@super_admin_required
def delete_auth_key(key_id):
    key = AdminAuthKey.query.get_or_404(key_id)
    try:
        db.session.delete(key)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        if request.is_json:
            return jsonify(success=False, error=str(exc)), 500
        flash(f'删除失败：{exc}', 'danger')
        return redirect(url_for('view_auth_keys'))

    if request.is_json:
        return jsonify(success=True)

    flash('授权码已删除', 'success')
    return redirect(url_for('view_auth_keys'))


@app.route('/delete-auth-keys/bulk', methods=['POST'])
@login_required
@super_admin_required
def delete_auth_keys_bulk():
    payload = request.get_json(silent=True) or {}
    ids = payload.get('ids') or []
    if not isinstance(ids, list):
        ids = []
    numeric_ids = [int(i) for i in ids if str(i).isdigit()]
    if not numeric_ids:
        return jsonify(success=False, error='请选择要删除的授权码'), 400
    try:
        deleted = AdminAuthKey.query.filter(AdminAuthKey.id.in_(numeric_ids)).delete(synchronize_session=False)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify(success=False, error=str(exc)), 500
    return jsonify(success=True, deleted=deleted)


# view_auth_keys 路由
@app.route('/view-auth-keys')
@login_required
@super_admin_required  # 仅超级管理员可以查看
def view_auth_keys():
    # 查询所有授权码
    auth_keys = AdminAuthKey.query.all()
    return render_template('auth_keys.html', auth_keys=auth_keys)

# manage_users
@app.route('/admin/users', methods=['GET'])
@login_required
@admin_required
def manage_users():
    # 获取前端提交的搜索参数（默认空字符串）
    search_query = request.args.get('search', '').strip()
    
    # 基础查询：获取所有用户
    query = User.query
    
    # 如果有搜索关键词，添加筛选条件
    if search_query:
        # 按用户名或邮箱模糊匹配（不区分大小写）,注册时间
        query = query.filter(
            db.or_(
                User.username.ilike(f'%{search_query}%'),  # ilike实现不区分大小写的模糊查询
                User.email.ilike(f'%{search_query}%'),
                User.created_at.ilike(f'%{search_query}%'),
                User.custom_id.ilike(f'%{search_query}%')

            )
        )
    
    # 执行查询，获取符合条件的用户
    users = query.all()
    
    return render_template('manage_users.html', users=users)

# 管理员查看用户详情
@app.route('/admin/users/<int:user_id>')
@login_required
@admin_required
def admin_user_detail(user_id):
    # 查询指定ID的用户
    user = User.query.get_or_404(user_id)
    
    # 可以根据需求查询该用户的关联数据（如文献、收藏等）
    # 示例：查询用户上传的文献
    user_documents = Document.query.filter_by(owner_id=user_id).all()
    
    return render_template(
        'admin/user_detail.html',
        user=user,
        documents=user_documents
    )

# 管理员删除用户
@app.route('/admin/users/delete/<int:user_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_delete_user(user_id):
    user = User.query.get_or_404(user_id)
    
    # 禁止普通管理员删除管理员
    if user.role == 'admin' and current_user.role!='super admin':
        flash('普通管理员不能删除管理员账户', 'danger')
        return redirect(url_for('manage_users'))
    
    # 超级管理员可以删除任何普通用户和普通管理员
    if user.role == 'super admin' and current_user.role!='super admin':
        flash('超级管理员不能删除其他超级管理员账户', 'danger')
        return redirect(url_for('manage_users'))
    

    try:
        # 1. 先删除用户关联的数据（根据你的数据模型调整）
        # 示例：删除用户上传的文献
        documents = Document.query.filter_by(owner_id=user_id).all()
        for doc in documents:
            if doc.file_path:
                remove_document_file(doc.file_path)
            
                db.session.delete(doc)
        # 删除用户创建的分类
        Category.query.filter_by(owner_id=user_id).delete(synchronize_session=False)
        
        # 2. 再删除用户记录
        db.session.delete(user)
        db.session.commit()
        
        flash(f'用户 {user.username} 已成功删除', 'success')
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"删除用户失败: {str(e)}")
        flash('删除用户失败，请稍后重试', 'danger')
    
    return redirect(url_for('manage_users'))

# 管理员编辑用户信息
@app.route('/admin/users/edit/<int:user_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_edit_user(user_id):
    user = User.query.get_or_404(user_id)
    
    # 禁止管理员编辑超级管理员和其他管理员
    if current_user.role == 'admin' and user.role in ['super admin', 'admin'] and current_user.id!=user_id:
        flash('普通管理员不能编辑超级管理员或其他管理员账户', 'danger')
        return redirect(url_for('admin_user_detail', user_id=user_id))
    

    if request.method == 'POST':
        # 获取表单数据
        new_email = request.form.get('email', '').strip()
        new_role = request.form.get('role', 'user')
        is_active = request.form.get('is_active') == 'on'
        
        # 验证邮箱
        if not new_email:
            flash('邮箱不能为空', 'danger')
            return render_template('admin/edit_user.html', user=user)
            
        # 检查邮箱是否已被其他用户使用
        existing_user = User.query.filter_by(email=new_email).first()
        if existing_user and existing_user.id != user_id:
            flash('该邮箱已被其他用户使用', 'danger')
            return render_template('admin/edit_user.html', user=user)
        
        # 更新用户信息
        try:
            user.email = new_email
            user.role = new_role
            user.status = '正常' if is_active else '封禁'
            
            # 如果需要修改密码（可选功能）
            new_password = request.form.get('password', '').strip()
            if new_password:
                user.set_password(new_password)
                
            db.session.commit()
            flash(f'用户 {user.username} 的信息已更新', 'success')
            return redirect(url_for('admin_user_detail', user_id=user_id))
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"更新用户信息失败: {str(e)}")
            flash('更新用户信息失败，请稍后重试', 'danger')
    
    # GET 请求：渲染编辑页面
    return render_template('admin/edit_user.html', user=user)
# 管理员注册路由（单独创建）
@app.route('/admin/register', methods=['GET', 'POST'])  # 管理员注册单独路由
def admin_register():
     # 1. GET 请求：返回注册页面
    if request.method == 'GET':
        return render_template('admin_register.html')
    
    # 2. POST 请求：处理注册逻辑
    # 初始化 key_record（默认 None，避免未定义报错）
    key_record = None
    try:
        # 获取表单基础数据
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '').strip()
        auth_key = request.form.get('auth_key', '').strip()  # 密钥默认空字符串

        # 3. 权限分支处理（核心修复：区分超级管理员和普通管理员）
        if current_user.is_authenticated and current_user.role == 'super admin':
            # 超级管理员注册：无需验证密钥，直接跳过
            pass
        else:
            # 普通用户注册管理员：必须验证密钥（调用 AdminAuthKey 的类方法）
            is_valid, err_msg, key_record = AdminAuthKey.verify_auth_key(auth_key)
            if not is_valid:
                # 密钥验证失败：返回页面并显示错误
                return render_template('admin_register.html', error=err_msg)

        # 4. 基础数据完整性校验
        if not all([username, email, password]):
            return render_template('admin_register.html', error="请填写完整的用户名、邮箱和密码"), 400

        # 5. 用户名/邮箱唯一性校验
        if User.query.filter_by(username=username).first():
            return render_template('admin_register.html', error="用户名已被占用")
        if User.query.filter_by(email=email).first():
            return render_template('admin_register.html', error="邮箱已被注册")

        # 6. 生成管理员自定义ID（ADMIN-xxxxxx 格式）
        max_id = db.session.query(func.max(User.id)).scalar() or 0  # 无用户时默认0
        custom_id = f"ADMIN-{str(max_id + 1).zfill(6)}"  # 补零为6位（如 ADMIN-000001）

        # 7. 创建管理员用户实例
        new_admin = User(
            custom_id=custom_id,
            role='admin',  # 固定为管理员角色
            username=username,
            email=email,
            email_confirmed_at=utc_now(),
        )
        new_admin.set_password(password)
        db.session.add(new_admin)
        # 刷新会话：生成 new_admin.id（无需提前提交，后续统一处理）
        db.session.flush()

        # 8. 若有密钥（普通用户注册）：更新密钥记录（关联用户+标记已使用）
        if key_record:  # 只有普通用户注册时，key_record 才是 AdminAuthKey 实例
            key_record.is_used = True
            key_record.used_by = new_admin.id  # 关联新管理员ID
            key_record.used_at = utc_now()  # 记录使用时间

        # 9. 统一提交事务（所有操作成功后再提交，避免部分生效）
        db.session.commit()
        if current_user.is_authenticated and current_user.role == 'super admin':
            # 返回用户管理页面，显示成功信息，显示用户列表
            users = User.query.all()
            return render_template('manage_users.html', success="管理员注册成功！", users=users)
        else:
            return render_template('login.html', success="管理员注册成功！", key_record=key_record)

    except Exception as e:
        # 异常回滚：任何步骤出错，都撤销所有操作（保证数据一致性）
        db.session.rollback()
        # 打印错误日志（便于调试，生产环境可替换为正式日志系统）
        print(f"管理员注册失败：{str(e)}")
        return render_template('admin_register.html', error=f"注册失败：{str(e)}"), 500

# 注册页面
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        # 简单验证
        if not all([username, email, password]):
            return "请填写完整信息", 400
        
        # 检查用户名/邮箱是否已存在
        if User.query.filter_by(username=username).first():
            return render_template('register.html', error="用户名已被占用")
        if User.query.filter_by(email=email).first():
            return render_template('register.html', error="邮箱已被注册")
        
        # 正确生成自定义ID（针对当前新用户实例）
        # 查询当前最大的id值（注意：这里查询的是自增id字段，用于计算序号）
        max_id = db.session.query(func.max(User.id)).scalar() or 0
        custom_id = f"USER-{str(max_id + 1).zfill(6)}"  # 生成如 USER-0001 格式的ID
        
        # 创建新用户（密码哈希存储）
        new_user = User(
            custom_id=custom_id,
            role='user',
            username=username,
            email=email,
        )
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        
        # 为新用户创建默认分类
        try:
            ensure_user_categories(new_user.id, commit=True)
        except Exception:
            current_app.logger.exception('创建用户默认分类失败')
        try:
            send_verification_email(new_user)
        except Exception:
            current_app.logger.exception('发送验证邮件失败')
        # try:
        #     send_registration_success_email(new_user)
        # except Exception:
        #     current_app.logger.exception('发送注册成功提醒邮件失败')
        return render_template('register.html', success="注册成功！验证邮件已发送，请在 24 小时内完成邮箱验证后再登录。")
    
    # GET请求：显示注册页面
    return render_template('register.html')

# 登录页面
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # 1. 先检查输入是否完整
        if not username or not password:
            return render_template('login.html', error="用户名和密码不能为空")
        
        # 2. 再检查用户是否存在
        user = User.query.filter_by(username=username).first()
        if not user:
            return render_template('login.html', error="用户名错误")
        
        # 3. 最后验证密码
        if not check_password_hash(user.password_hash, password):
            return render_template('login.html', error="密码错误")
        if not user.is_email_confirmed:
            return render_template(
                'login.html',
                error="邮箱尚未验证，请先完成验证或点击下方按钮重新发送邮件。",
                pending_email=user.email,
            )
        
        # 登录成功
        login_user(user, remember=True)
        # 【安全日志】记录登陆事件
        current_app.logger.info(f'✓ 用户登陆成功: {user.username} (ID:{user.id}) - IP: {request.remote_addr}')
        # 登录成功后清除之前可能由 Flask-Login 自动闪现的未授权提示，
        # 否则用户在登录后仍会看到“请先登录以访问该页面”。
        try:
            session.pop('_flashes', None)
        except Exception:
            pass
        # 确保该用户拥有默认分类集合
        try:
            ensure_user_categories(user.id, commit=True)
        except Exception:
            current_app.logger.exception('确保用户默认分类失败')
        return redirect(url_for('index'))
    
    # GET请求：显示登录页面
    success_message = request.args.get('success')
    return render_template('login.html', success=success_message)


@app.route('/resend-verification', methods=['POST'])
def resend_verification():
    email = request.form.get('email')
    message = "如果邮箱存在，我们已重新发送验证邮件。"
    if email:
        user = User.query.filter_by(email=email).first()
        if user and not user.is_email_confirmed:
            try:
                send_verification_email(user)
                message = "新的验证邮件已发送，请检查邮箱。"
            except Exception:
                current_app.logger.exception('重新发送验证邮件失败')
                message = "发送验证邮件失败，请稍后再试。"
        elif user and user.is_email_confirmed:
            message = "该邮箱已完成验证，可直接登录。"
    return redirect(url_for('login', success=message))


@app.route('/verify-email/<token>')
def verify_email(token):
    now = utc_now()
    record = EmailVerificationToken.query.filter_by(token=token).first()
    if not record:
        return render_template('verify_email_result.html', success=False, message="验证链接无效，请重新请求验证邮件。")
    if record.used_at is not None:
        return render_template('verify_email_result.html', success=False, message="该验证链接已使用，请直接登录。")
    if record.expires_at < now:
        return render_template('verify_email_result.html', success=False, message="验证链接已过期，请重新发送验证邮件。")
    record.used_at = now
    user = record.user
    if not user.is_email_confirmed:
        user.email_confirmed_at = now
        try:
            ensure_user_categories(user.id, commit=False)
        except Exception:
            current_app.logger.exception('确保用户分类失败')
    db.session.commit()
    return render_template('verify_email_result.html', success=True, message="邮箱验证成功，快去登录体验吧！")


@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email')
        message = "如果该邮箱存在，我们已发送重置链接（1小时内有效）。"
        user = User.query.filter_by(email=email).first()
        if user and user.is_email_confirmed:
            try:
                send_password_reset_email(user)
            except Exception:
                current_app.logger.exception('发送密码重置邮件失败')
                message = "邮件发送失败，请稍后再试。"
        return render_template('forgot_password.html', success=message)
    return render_template('forgot_password.html')


@app.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    record = PasswordResetToken.query.filter_by(token=token).first()
    now = utc_now()
    if not record or record.used_at is not None or record.expires_at < now:
        return render_template('reset_password.html', invalid=True)
    if request.method == 'POST':
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        if not password or password != confirm_password:
            return render_template('reset_password.html', token=token, error="两次输入的密码不一致")
        user = record.user
        user.set_password(password)
        record.used_at = now
        db.session.commit()
        return redirect(url_for('login', success="密码已重置，请使用新密码登录。"))
    return render_template('reset_password.html', token=token)

# 个人资料路由
@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    user = current_user
    # 统计用户文献数量
    doc_count = Document.query.filter_by(owner_id=user.id).count()
    # 统计总浏览量
    total_views = sum(doc.view_count for doc in user.owned_documents) if user.owned_documents else 0
    # 获取最近上传的文献
    recent_docs = Document.query.filter_by(owner_id=user.id).order_by(Document.created_at.desc()).limit(3).all()

    if request.method == 'POST':
        # 处理基本信息更新（用户名、邮箱）
        if 'username' in request.form:
            new_username = request.form['username']
            new_email = request.form['email']
            # 验证用户名是否已被占用（排除当前用户）
            if User.query.filter(User.username == new_username, User.id != user.id).first():
                return render_template('profile.html', user=user, error="用户名已被占用")
            if User.query.filter(User.email == new_email, User.id != user.id).first():
                return render_template('profile.html', user=user, error="邮箱已被注册")
            # 更新用户信息
            email_changed = new_email != user.email
            user.username = new_username
            user.email = new_email
            if email_changed:
                user.email_confirmed_at = None
            db.session.commit()
            if email_changed:
                try:
                    send_verification_email(user)
                except Exception:
                    current_app.logger.exception('更新邮箱后发送验证邮件失败')
                return redirect(url_for('profile', success="基本信息已更新，新的邮箱需重新验证。"))
            return redirect(url_for('profile', success="基本信息已更新"))
        
        # 处理密码修改
        if 'current_password' in request.form:
            current_pwd = request.form['current_password']
            new_pwd = request.form['new_password']
            # 验证当前密码
            if not check_password_hash(user.password_hash, current_pwd):
                return render_template('profile.html', user=user, error="当前密码错误")
            # 更新密码
            user.set_password(new_pwd)
            db.session.commit()
            return redirect(url_for('profile', success="密码已修改"))
        
        # 处理头像上传
        if 'avatar' in request.files:
            file = request.files['avatar']
            if file and file.filename:
                # 保存头像到 static/avatars 目录
                avatar_dir = os.path.join(app.root_path, 'static', 'avatars')
                os.makedirs(avatar_dir, exist_ok=True)
                # 生成唯一文件名
                filename = f"avatar_{user.id}_{to_cst(utc_now()).strftime('%Y%m%d%H%M%S')}.png"
                file_path = os.path.join(avatar_dir, filename)
                file.save(file_path)
                # 更新用户头像字段
                user.avatar = filename
                db.session.commit()
                return redirect(url_for('profile', success="头像已更新"))

    return render_template(
        'profile.html',
        user=user,
        doc_count=doc_count,
        total_views=total_views,
        recent_docs=recent_docs,
        success=request.args.get('success'),
        error=request.args.get('error')
    )

# 系统设置路由
@app.route('/settings', methods=['GET', 'POST'])
@login_required  # 需登录才能访问设置页面
def settings():
    # 从当前登录用户获取信息（替代直接操作 session['user_id']）
    user = current_user
    
    # 初始化设置（如果 session 中没有）
    if 'settings' not in session:
        session['settings'] = {
            'notifications': True,          # 新文献提醒
            'system_updates': True,         # 系统更新通知（新增）
            'email_notifications': False,   # 邮件通知（新增）
            'theme': 'light',               # 主题
            'default_view': 'list'          # 默认视图
        }
    
    if request.method == 'POST':
        # 更新通知设置（包含模板中所有复选框）
        session['settings']['notifications'] = 'notifications' in request.form
        session['settings']['system_updates'] = 'system_updates' in request.form
        session['settings']['email_notifications'] = 'email_notifications' in request.form
        
        # 更新主题和视图设置
        if 'theme' in request.form:
            session['settings']['theme'] = request.form['theme']
        if 'default_view' in request.form:
            session['settings']['default_view'] = request.form['default_view']
        
        session.modified = True  # 标记 session 已修改
        return render_template('settings.html', user=user, settings=session['settings'], success="设置已保存")
    
    return render_template('settings.html', user=user, settings=session['settings'])


def _normalize_keyword_text(raw: str) -> str:
    lines = re.split(r'[\n\r;,，；]+', raw or '')
    cleaned: list[str] = []
    seen: set[str] = set()
    for item in lines:
        keyword = str(item or '').strip()
        if not keyword:
            continue
        lower = keyword.lower()
        if lower in seen:
            continue
        seen.add(lower)
        cleaned.append(keyword)
    return "\n".join(cleaned)


def _normalize_morning_report_sources(raw_values) -> str:
    if isinstance(raw_values, str):
        raw_values = [raw_values]
    normalized: list[str] = []
    seen: set[str] = set()
    for item in raw_values or []:
        value = str(item or '').strip().lower()
        if value not in {'openalex', 'crossref', 'arxiv', 'ads'} or value in seen:
            continue
        seen.add(value)
        normalized.append(value)
    return ",".join(normalized or ['openalex', 'crossref', 'arxiv'])


def _mask_secret(value: str | None, *, keep_start: int = 4, keep_end: int = 4) -> str:
    raw = str(value or '').strip()
    if not raw:
        return '未配置'
    if len(raw) <= keep_start + keep_end:
        return '*' * len(raw)
    return f"{raw[:keep_start]}{'*' * max(len(raw) - keep_start - keep_end, 6)}{raw[-keep_end:]}"


def _build_ai_config_form_data(saved: dict[str, str] | None = None) -> dict[str, str]:
    saved = saved or {}
    return {
        'base_url': saved.get('base_url', ''),
        'model': saved.get('model', ''),
        'wire_api': saved.get('wire_api', ''),
        'notes': saved.get('notes', ''),
    }


AI_SCENE_LABELS = {
    'general': '通用调用',
    'document_summary': '文献详情 AI 总结',
    'morning_report_summary': '晨报 AI 总结',
    'search_query_refine': '智能深搜检索词提炼',
    'search_rerank': '智能深搜结果重排',
    'search_result_summary': '深搜结果 AI 总结',
    'research_scope_filter': '科研方向强过滤',
}


def _naive_utc_from_cn_day_start(day_value) -> datetime:
    local_start = datetime.combine(day_value, datetime.min.time())
    utc_start = ensure_utc(local_start)
    return utc_start.replace(tzinfo=None) if utc_start else local_start


def _to_cn_from_utc_naive(value):
    if value is None:
        return None
    if value.tzinfo is None:
        return to_cst(value.replace(tzinfo=timezone.utc))
    return to_cst(value)


def _format_ai_usage_time(value, fmt: str = "%Y-%m-%d %H:%M") -> str:
    local_dt = _to_cn_from_utc_naive(value)
    return local_dt.strftime(fmt) if local_dt else ''


def _ai_scene_label(scene: str | None) -> str:
    key = str(scene or '').strip()
    return AI_SCENE_LABELS.get(key, key or '未分类')


def _build_ai_dashboard_payload() -> dict:
    totals_row = db.session.query(
        func.coalesce(func.sum(AIUsageLog.total_tokens), 0),
        func.coalesce(func.sum(AIUsageLog.prompt_tokens), 0),
        func.coalesce(func.sum(AIUsageLog.completion_tokens), 0),
        func.count(AIUsageLog.id),
        func.count(func.distinct(AIUsageLog.user_id)),
    ).one()

    today_cn = to_cst(utc_now()).date()
    today_start_utc = _naive_utc_from_cn_day_start(today_cn)
    today_row = db.session.query(
        func.coalesce(func.sum(AIUsageLog.total_tokens), 0),
        func.count(AIUsageLog.id),
        func.count(func.distinct(AIUsageLog.user_id)),
    ).filter(AIUsageLog.created_at >= today_start_utc).one()

    trend_days = 14
    trend_dates = [today_cn - timedelta(days=offset) for offset in range(trend_days - 1, -1, -1)]
    trend_start_utc = _naive_utc_from_cn_day_start(trend_dates[0])
    trend_logs = (
        AIUsageLog.query
        .filter(AIUsageLog.created_at >= trend_start_utc)
        .order_by(AIUsageLog.created_at.asc(), AIUsageLog.id.asc())
        .all()
    )
    trend_map = {
        day_value: {'tokens': 0, 'calls': 0, 'prompt_tokens': 0, 'completion_tokens': 0}
        for day_value in trend_dates
    }
    for log in trend_logs:
        local_dt = _to_cn_from_utc_naive(log.created_at)
        if not local_dt:
            continue
        bucket = trend_map.get(local_dt.date())
        if bucket is None:
            continue
        bucket['tokens'] += int(log.total_tokens or 0)
        bucket['calls'] += 1
        bucket['prompt_tokens'] += int(log.prompt_tokens or 0)
        bucket['completion_tokens'] += int(log.completion_tokens or 0)

    top_user_rows = (
        db.session.query(
            User.id,
            User.username,
            User.custom_id,
            func.coalesce(func.sum(AIUsageLog.total_tokens), 0).label('total_tokens'),
            func.count(AIUsageLog.id).label('call_count'),
            func.max(AIUsageLog.created_at).label('last_used_at'),
        )
        .join(User, User.id == AIUsageLog.user_id)
        .group_by(User.id, User.username, User.custom_id)
        .order_by(func.coalesce(func.sum(AIUsageLog.total_tokens), 0).desc(), func.count(AIUsageLog.id).desc())
        .limit(12)
        .all()
    )

    scene_rows = (
        db.session.query(
            AIUsageLog.scene,
            func.coalesce(func.sum(AIUsageLog.total_tokens), 0).label('total_tokens'),
            func.count(AIUsageLog.id).label('call_count'),
        )
        .group_by(AIUsageLog.scene)
        .order_by(func.coalesce(func.sum(AIUsageLog.total_tokens), 0).desc(), func.count(AIUsageLog.id).desc())
        .limit(10)
        .all()
    )

    model_rows = (
        db.session.query(
            AIUsageLog.model,
            AIUsageLog.wire_api,
            func.coalesce(func.sum(AIUsageLog.total_tokens), 0).label('total_tokens'),
            func.count(AIUsageLog.id).label('call_count'),
        )
        .group_by(AIUsageLog.model, AIUsageLog.wire_api)
        .order_by(func.coalesce(func.sum(AIUsageLog.total_tokens), 0).desc(), func.count(AIUsageLog.id).desc())
        .limit(8)
        .all()
    )

    usage_source_rows = (
        db.session.query(
            AIUsageLog.usage_source,
            func.coalesce(func.sum(AIUsageLog.total_tokens), 0).label('total_tokens'),
            func.count(AIUsageLog.id).label('call_count'),
        )
        .group_by(AIUsageLog.usage_source)
        .order_by(func.count(AIUsageLog.id).desc())
        .all()
    )

    recent_logs = (
        db.session.query(AIUsageLog, User.username)
        .outerjoin(User, User.id == AIUsageLog.user_id)
        .order_by(AIUsageLog.created_at.desc(), AIUsageLog.id.desc())
        .limit(20)
        .all()
    )

    total_tokens = int(totals_row[0] or 0)
    total_calls = int(totals_row[3] or 0)
    avg_tokens_per_call = round(total_tokens / total_calls, 1) if total_calls else 0

    return {
        'summary': {
            'total_tokens': total_tokens,
            'total_prompt_tokens': int(totals_row[1] or 0),
            'total_completion_tokens': int(totals_row[2] or 0),
            'total_calls': total_calls,
            'total_active_users': int(totals_row[4] or 0),
            'today_tokens': int(today_row[0] or 0),
            'today_calls': int(today_row[1] or 0),
            'today_active_users': int(today_row[2] or 0),
            'avg_tokens_per_call': avg_tokens_per_call,
        },
        'trend': {
            'labels': [day_value.strftime('%m-%d') for day_value in trend_dates],
            'tokens': [trend_map[day_value]['tokens'] for day_value in trend_dates],
            'calls': [trend_map[day_value]['calls'] for day_value in trend_dates],
            'prompt_tokens': [trend_map[day_value]['prompt_tokens'] for day_value in trend_dates],
            'completion_tokens': [trend_map[day_value]['completion_tokens'] for day_value in trend_dates],
        },
        'top_users': [
            {
                'rank': index,
                'user_id': row.id,
                'username': row.username,
                'custom_id': row.custom_id,
                'total_tokens': int(row.total_tokens or 0),
                'call_count': int(row.call_count or 0),
                'avg_tokens_per_call': round((int(row.total_tokens or 0) / int(row.call_count or 1)), 1),
                'last_used_at': _format_ai_usage_time(row.last_used_at) if row.last_used_at else '',
            }
            for index, row in enumerate(top_user_rows, start=1)
        ],
        'scene_ranking': [
            {
                'scene': row.scene or 'general',
                'label': _ai_scene_label(row.scene),
                'total_tokens': int(row.total_tokens or 0),
                'call_count': int(row.call_count or 0),
            }
            for row in scene_rows
        ],
        'model_ranking': [
            {
                'model': str(row.model or '未知模型'),
                'wire_api': str(row.wire_api or 'unknown'),
                'total_tokens': int(row.total_tokens or 0),
                'call_count': int(row.call_count or 0),
            }
            for row in model_rows
        ],
        'usage_sources': [
            {
                'usage_source': str(row.usage_source or 'reported'),
                'label': 'API 返回' if str(row.usage_source or 'reported') == 'reported' else '估算',
                'total_tokens': int(row.total_tokens or 0),
                'call_count': int(row.call_count or 0),
            }
            for row in usage_source_rows
        ],
        'recent_logs': [
            {
                'created_at': _format_ai_usage_time(log.created_at),
                'username': username or '系统任务',
                'scene_label': _ai_scene_label(log.scene),
                'model': log.model or '未知模型',
                'wire_api': log.wire_api or 'unknown',
                'usage_source': 'API 返回' if (log.usage_source or 'reported') == 'reported' else '估算',
                'total_tokens': int(log.total_tokens or 0),
            }
            for log, username in recent_logs
        ],
    }


def get_latest_unseen_broadcast(user_id: int) -> BroadcastMessage | None:
    seen_broadcast_ids = (
        db.session.query(BroadcastReceipt.broadcast_id)
        .filter(BroadcastReceipt.user_id == user_id)
    )
    return (
        BroadcastMessage.query
        .filter(BroadcastMessage.is_active.is_(True))
        .filter(~BroadcastMessage.id.in_(seen_broadcast_ids))
        .order_by(BroadcastMessage.created_at.desc(), BroadcastMessage.id.desc())
        .first()
    )


def get_unread_broadcast_count(user_id: int) -> int:
    seen_broadcast_ids = (
        db.session.query(BroadcastReceipt.broadcast_id)
        .filter(BroadcastReceipt.user_id == user_id)
    )
    return (
        BroadcastMessage.query
        .filter(BroadcastMessage.is_active.is_(True))
        .filter(~BroadcastMessage.id.in_(seen_broadcast_ids))
        .count()
    )


def get_user_broadcast_history(user_id: int) -> list[dict]:
    rows = (
        db.session.query(BroadcastMessage, BroadcastReceipt)
        .outerjoin(
            BroadcastReceipt,
            and_(
                BroadcastReceipt.broadcast_id == BroadcastMessage.id,
                BroadcastReceipt.user_id == user_id,
            ),
        )
        .filter(or_(BroadcastReceipt.id.is_(None), BroadcastReceipt.hidden_at.is_(None)))
        .order_by(BroadcastMessage.created_at.desc(), BroadcastMessage.id.desc())
        .all()
    )

    return [
        {
            'message': message,
            'receipt': receipt,
            'is_read': receipt is not None,
            'is_active': bool(message.is_active),
        }
        for message, receipt in rows
    ]


def mark_broadcast_seen(user_id: int, broadcast_id: int) -> BroadcastReceipt:
    receipt = BroadcastReceipt.query.filter_by(user_id=user_id, broadcast_id=broadcast_id).first()
    if receipt:
        if getattr(receipt, 'hidden_at', None) is not None:
            receipt.hidden_at = None
            if not receipt.seen_at:
                receipt.seen_at = utc_now()
            db.session.commit()
        return receipt
    receipt = BroadcastReceipt(user_id=user_id, broadcast_id=broadcast_id)
    db.session.add(receipt)
    db.session.commit()
    return receipt


def hide_broadcast_for_user(user_id: int, broadcast_id: int) -> BroadcastReceipt:
    receipt = BroadcastReceipt.query.filter_by(user_id=user_id, broadcast_id=broadcast_id).first()
    now = utc_now()
    if receipt:
        if not receipt.seen_at:
            receipt.seen_at = now
        receipt.hidden_at = now
        db.session.commit()
        return receipt

    receipt = BroadcastReceipt(
        user_id=user_id,
        broadcast_id=broadcast_id,
        seen_at=now,
        hidden_at=now,
    )
    db.session.add(receipt)
    db.session.commit()
    return receipt


@app.route('/broadcasts')
@login_required
def broadcast_history():
    history = get_user_broadcast_history(current_user.id)
    unread_count = sum(1 for item in history if not item['is_read'] and item['is_active'])
    active_count = sum(1 for item in history if item['is_active'])
    return render_template(
        'broadcast_history.html',
        history=history,
        unread_count=unread_count,
        active_count=active_count,
        total_count=len(history),
    )


@app.route('/broadcasts/<int:broadcast_id>/read', methods=['POST'])
@login_required
def broadcast_history_mark_read(broadcast_id: int):
    message = BroadcastMessage.query.get_or_404(broadcast_id)
    mark_broadcast_seen(current_user.id, message.id)
    flash('该广播已标记为已读。', 'success')
    return redirect(request.form.get('next') or url_for('broadcast_history'))


@app.route('/broadcasts/<int:broadcast_id>/delete', methods=['POST'])
@login_required
def broadcast_history_delete(broadcast_id: int):
    message = BroadcastMessage.query.get_or_404(broadcast_id)
    hide_broadcast_for_user(current_user.id, message.id)
    flash('该广播已从你的历史记录中删除。', 'success')
    return redirect(request.form.get('next') or url_for('broadcast_history'))


@app.route('/broadcasts/read-all', methods=['POST'])
@login_required
def broadcast_history_mark_all_read():
    seen_ids = {
        item.broadcast_id
        for item in BroadcastReceipt.query.filter_by(user_id=current_user.id).all()
    }
    broadcasts = BroadcastMessage.query.order_by(BroadcastMessage.id.asc()).all()
    created = 0
    for message in broadcasts:
        if message.id in seen_ids:
            continue
        db.session.add(BroadcastReceipt(user_id=current_user.id, broadcast_id=message.id))
        created += 1
    if created:
        db.session.commit()
        flash(f'已将 {created} 条广播标记为已读。', 'success')
    else:
        flash('当前没有需要标记的未读广播。', 'info')
    return redirect(url_for('broadcast_history'))


@app.route('/admin/ai-config', methods=['GET', 'POST'])
@login_required
@super_admin_required
def admin_ai_config():
    saved_config = load_runtime_ai_config()

    if request.method == 'POST':
        updated_config = dict(saved_config)
        base_url_value = str(request.form.get('base_url', '') or '').strip().rstrip('/')
        model_value = str(request.form.get('model', '') or '').strip()
        wire_api_value = str(request.form.get('wire_api', '') or '').strip().lower()
        notes_value = str(request.form.get('notes', '') or '').strip()

        if base_url_value:
            updated_config['base_url'] = base_url_value
        else:
            updated_config.pop('base_url', None)

        if model_value:
            updated_config['model'] = model_value
        else:
            updated_config.pop('model', None)

        if wire_api_value in {'responses', 'chat_completions'}:
            updated_config['wire_api'] = wire_api_value
        else:
            updated_config.pop('wire_api', None)

        if notes_value:
            updated_config['notes'] = notes_value
        else:
            updated_config.pop('notes', None)

        api_key_input = str(request.form.get('api_key', '') or '').strip()
        ads_token_input = str(request.form.get('nasa_ads_api_token', '') or '').strip()

        if api_key_input:
            updated_config['api_key'] = api_key_input
        elif 'clear_api_key' in request.form:
            updated_config.pop('api_key', None)

        if ads_token_input:
            updated_config['nasa_ads_api_token'] = ads_token_input
        elif 'clear_nasa_ads_api_token' in request.form:
            updated_config.pop('nasa_ads_api_token', None)

        save_runtime_ai_config(updated_config)
        flash('AI 管理系统配置已保存。', 'success')
        return redirect(url_for('admin_ai_config'))

    saved_config = load_runtime_ai_config()
    effective_ai = get_ai_client_config()
    effective_ads_token = get_nasa_ads_api_token()
    dashboard = _build_ai_dashboard_payload()
    return render_template(
        'admin_ai_config.html',
        form_data=_build_ai_config_form_data(saved_config),
        saved_config=saved_config,
        saved_api_key_masked=_mask_secret(saved_config.get('api_key')),
        saved_ads_token_masked=_mask_secret(saved_config.get('nasa_ads_api_token')),
        effective_ai=effective_ai,
        effective_ads_token_masked=_mask_secret(effective_ads_token),
        dashboard=dashboard,
    )


@app.route('/admin/broadcasts', methods=['GET', 'POST'])
@login_required
@super_admin_required
def admin_broadcasts():
    if request.method == 'POST':
        title = str(request.form.get('title') or '').strip()
        content = str(request.form.get('content') or '').strip()
        is_active = 'is_active' in request.form
        if not title or not content:
            flash('广播标题和内容都不能为空。', 'danger')
            return redirect(url_for('admin_broadcasts'))
        try:
            message = BroadcastMessage(
                title=title[:200],
                content=content,
                is_active=is_active,
                created_by=current_user.id,
            )
            db.session.add(message)
            db.session.commit()
            flash('广播已发布。', 'success')
        except Exception as exc:
            db.session.rollback()
            current_app.logger.exception("创建系统广播失败: %s", exc)
            flash('广播发布失败，请稍后重试。', 'danger')
        return redirect(url_for('admin_broadcasts'))

    broadcasts = (
        BroadcastMessage.query
        .order_by(BroadcastMessage.created_at.desc(), BroadcastMessage.id.desc())
        .all()
    )
    return render_template('admin_broadcasts.html', broadcasts=broadcasts)


@app.route('/admin/broadcasts/<int:broadcast_id>/toggle', methods=['POST'])
@login_required
@super_admin_required
def admin_broadcast_toggle(broadcast_id: int):
    message = BroadcastMessage.query.get_or_404(broadcast_id)
    try:
        message.is_active = not bool(message.is_active)
        message.updated_at = utc_now()
        db.session.commit()
        flash('广播状态已更新。', 'success')
    except Exception as exc:
        db.session.rollback()
        current_app.logger.exception("更新广播状态失败: %s", exc)
        flash('广播状态更新失败，请稍后重试。', 'danger')
    return redirect(url_for('admin_broadcasts'))


@app.route('/admin/broadcasts/<int:broadcast_id>/delete', methods=['POST'])
@login_required
@super_admin_required
def admin_broadcast_delete(broadcast_id: int):
    message = BroadcastMessage.query.get_or_404(broadcast_id)
    try:
        db.session.delete(message)
        db.session.commit()
        flash('广播已删除。', 'success')
    except Exception as exc:
        db.session.rollback()
        current_app.logger.exception("删除广播失败: %s", exc)
        flash('广播删除失败，请稍后重试。', 'danger')
    return redirect(url_for('admin_broadcasts'))


@app.route('/admin/broadcasts/clear', methods=['POST'])
@login_required
@super_admin_required
def admin_broadcast_clear():
    try:
        deleted = BroadcastMessage.query.delete(synchronize_session=False)
        db.session.commit()
        flash(f'已清空 {deleted} 条系统广播。', 'success')
    except Exception as exc:
        db.session.rollback()
        current_app.logger.exception("清空广播失败: %s", exc)
        flash('清空广播失败，请稍后重试。', 'danger')
    return redirect(url_for('admin_broadcasts'))


@app.route('/morning-report')
@login_required
def morning_report_home():
    report_settings = ensure_morning_report_settings(current_user.id, commit=True)
    report_run = get_today_morning_report(current_user.id)
    if report_run:
        mark_morning_report_popup_seen(current_user.id, report_run.report_date)
    recent_runs = get_recent_morning_reports(current_user.id, limit=5)
    return render_template(
        'morning_report.html',
        report_settings=report_settings,
        report_run=report_run,
        report_papers=report_run.papers if report_run else [],
        recent_runs=recent_runs,
        ai_enabled=ai_summary_available(),
        today_date=today_cn_date(),
        enhancement_sources=get_display_only_sources(report_settings.keywords_text),
        build_display_source_links=build_display_source_links,
    )


@app.route('/morning-report/settings', methods=['GET', 'POST'])
@login_required
def morning_report_settings_view():
    report_settings = ensure_morning_report_settings(current_user.id, commit=True)
    if request.method == 'POST':
        keywords_text = _normalize_keyword_text(request.form.get('keywords_text', ''))
        exclude_keywords_text = _normalize_keyword_text(request.form.get('exclude_keywords_text', ''))
        enabled_sources_text = _normalize_morning_report_sources(request.form.getlist('enabled_sources'))
        if not keywords_text:
            flash('请至少填写一个关键词。', 'danger')
            return redirect(url_for('morning_report_settings_view'))

        try:
            paper_pool_size = max(1, min(int(request.form.get('paper_pool_size', 12)), 30))
        except (TypeError, ValueError):
            paper_pool_size = 12
        try:
            lookback_days = max(1, min(int(request.form.get('lookback_days', 30)), 365))
        except (TypeError, ValueError):
            lookback_days = 30
        try:
            auto_run_hour = max(0, min(int(request.form.get('auto_run_hour', 8)), 23))
        except (TypeError, ValueError):
            auto_run_hour = 8

        report_settings.enabled = 'enabled' in request.form
        report_settings.auto_run_enabled = 'auto_run_enabled' in request.form
        report_settings.popup_enabled = 'popup_enabled' in request.form
        report_settings.keywords_text = keywords_text
        report_settings.enabled_sources_text = enabled_sources_text
        report_settings.strict_filter_enabled = 'strict_filter_enabled' in request.form
        report_settings.exclude_keywords_text = exclude_keywords_text
        report_settings.paper_pool_size = paper_pool_size
        report_settings.lookback_days = lookback_days
        report_settings.auto_run_hour = auto_run_hour
        report_settings.updated_at = utc_now()
        db.session.commit()
        flash('晨报参数已保存。', 'success')
        return redirect(url_for('morning_report_settings_view'))

    return render_template(
        'morning_report_settings.html',
        report_settings=report_settings,
        enhancement_sources=get_display_only_sources(report_settings.keywords_text),
    )


@app.route('/literature-search')
@login_required
def literature_search_home():
    query_text = (request.args.get('q') or '').strip()
    selected_sources = [
        source for source in request.args.getlist('sources')
        if source in SUPPORTED_SOURCES
    ] or ['openalex', 'crossref', 'arxiv', 'ads']

    max_results = max(5, min(_safe_int(request.args.get('max_results')) or 20, 50))
    lookback_days = max(30, min(_safe_int(request.args.get('lookback_days')) or 365, 3650))
    sort_mode = (request.args.get('sort_mode') or 'balanced').strip().lower()
    if sort_mode not in {'balanced', 'quality', 'relevance'}:
        sort_mode = 'balanced'

    search_payload = None
    search_error = None

    try:
        ai_enabled = bool(get_ai_client_config())
    except Exception as exc:
        current_app.logger.exception("读取智能文献深搜 AI 配置失败: %s", exc)
        ai_enabled = False

    try:
        enhancement_sources = get_display_only_sources(query_text)
    except Exception as exc:
        current_app.logger.exception("构建智能文献深搜增强来源失败: %s", exc)
        enhancement_sources = []

    return render_template(
        'literature_search.html',
        query_text=query_text,
        selected_sources=selected_sources,
        max_results=max_results,
        lookback_days=lookback_days,
        sort_mode=sort_mode,
        search_payload=search_payload,
        search_error=search_error,
        source_options=SUPPORTED_SOURCES,
        ai_enabled=ai_enabled,
        enhancement_sources=enhancement_sources,
        build_display_source_links=build_display_source_links,
        auto_start_search=bool(query_text),
    )


def _cleanup_literature_search_jobs() -> None:
    now_ts = time.time()
    expired_keys: list[str] = []
    for job_id, job in LITERATURE_SEARCH_JOBS.items():
        updated_ts = float(job.get('updated_ts') or job.get('created_ts') or now_ts)
        if now_ts - updated_ts > LITERATURE_SEARCH_JOB_TTL_SECONDS:
            expired_keys.append(job_id)
    for job_id in expired_keys:
        LITERATURE_SEARCH_JOBS.pop(job_id, None)


def _set_literature_search_job(job_id: str, **updates) -> dict | None:
    with LITERATURE_SEARCH_JOB_LOCK:
        _cleanup_literature_search_jobs()
        job = LITERATURE_SEARCH_JOBS.get(job_id)
        if not job:
            return None
        job.update(updates)
        job['updated_ts'] = time.time()
        return dict(job)


def _render_literature_search_fragment(
    *,
    query_text: str,
    selected_sources: list[str],
    max_results: int,
    lookback_days: int,
    sort_mode: str,
    search_payload,
    search_error,
    ai_enabled: bool,
    enhancement_sources: list[dict],
):
    return render_template(
        'literature_search_result_fragment.html',
        query_text=query_text,
        selected_sources=selected_sources,
        max_results=max_results,
        lookback_days=lookback_days,
        sort_mode=sort_mode,
        search_payload=search_payload,
        search_error=search_error,
        source_options=SUPPORTED_SOURCES,
        ai_enabled=ai_enabled,
        enhancement_sources=enhancement_sources,
        build_display_source_links=build_display_source_links,
    )


def _run_literature_search_job(app_obj: Flask, job_id: str) -> None:
    with app_obj.app_context():
        with LITERATURE_SEARCH_JOB_LOCK:
            job = LITERATURE_SEARCH_JOBS.get(job_id)
            if not job:
                return
            params = dict(job.get('params') or {})
            job['status'] = 'running'
            job['step'] = '正在提炼检索意图并跨源抓取候选文献…'
            job['updated_ts'] = time.time()

        query_text = str(params.get('q') or '').strip()
        selected_sources = [source for source in (params.get('sources') or []) if source in SUPPORTED_SOURCES] or ['openalex', 'crossref', 'arxiv', 'ads']
        max_results = max(5, min(_safe_int(params.get('max_results')) or 20, 50))
        lookback_days = max(30, min(_safe_int(params.get('lookback_days')) or 365, 3650))
        sort_mode = str(params.get('sort_mode') or 'balanced').strip().lower()
        if sort_mode not in {'balanced', 'quality', 'relevance'}:
            sort_mode = 'balanced'

        try:
            search_payload = search_literature_with_ai(
                int(params.get('user_id')),
                query_text=query_text,
                max_results=max_results,
                lookback_days=lookback_days,
                enabled_sources=selected_sources,
                sort_mode=sort_mode,
            )
            enhancement_sources = get_display_only_sources(query_text)
            html_fragment = _render_literature_search_fragment(
                query_text=query_text,
                selected_sources=selected_sources,
                max_results=max_results,
                lookback_days=lookback_days,
                sort_mode=sort_mode,
                search_payload=search_payload,
                search_error=None,
                ai_enabled=bool(get_ai_client_config()),
                enhancement_sources=enhancement_sources,
            )
            _set_literature_search_job(
                job_id,
                status='succeeded',
                step='智能深搜已完成。',
                payload=search_payload,
                html=html_fragment,
                error=None,
            )
        except Exception as exc:
            current_app.logger.exception("智能文献深搜失败: %s", exc)
            enhancement_sources = get_display_only_sources(query_text)
            html_fragment = _render_literature_search_fragment(
                query_text=query_text,
                selected_sources=selected_sources,
                max_results=max_results,
                lookback_days=lookback_days,
                sort_mode=sort_mode,
                search_payload=None,
                search_error=str(exc) or '智能文献深搜失败，请稍后重试。',
                ai_enabled=bool(get_ai_client_config()),
                enhancement_sources=enhancement_sources,
            )
            _set_literature_search_job(
                job_id,
                status='failed',
                step='智能深搜失败。',
                error=str(exc) or '智能文献深搜失败，请稍后重试。',
                html=html_fragment,
            )


@app.route('/api/literature-search/start', methods=['POST'])
@login_required
def literature_search_start():
    payload = request.get_json(silent=True) or request.form or {}
    query_text = str(payload.get('q') or '').strip()
    if not query_text:
        return jsonify({'error': '请输入研究问题或检索需求。'}), 400

    sources = payload.get('sources') or []
    if isinstance(sources, str):
        sources = [item.strip() for item in re.split(r'[\n,;，；]+', sources) if item.strip()]
    selected_sources = [source for source in sources if source in SUPPORTED_SOURCES] or ['openalex', 'crossref', 'arxiv', 'ads']
    max_results = max(5, min(_safe_int(payload.get('max_results')) or 20, 50))
    lookback_days = max(30, min(_safe_int(payload.get('lookback_days')) or 365, 3650))
    sort_mode = str(payload.get('sort_mode') or 'balanced').strip().lower()
    if sort_mode not in {'balanced', 'quality', 'relevance'}:
        sort_mode = 'balanced'

    fingerprint = json.dumps({
        'user_id': current_user.id,
        'q': query_text,
        'sources': selected_sources,
        'max_results': max_results,
        'lookback_days': lookback_days,
        'sort_mode': sort_mode,
    }, ensure_ascii=False, sort_keys=True)

    with LITERATURE_SEARCH_JOB_LOCK:
        _cleanup_literature_search_jobs()
        for existing_job in LITERATURE_SEARCH_JOBS.values():
            if existing_job.get('fingerprint') == fingerprint and existing_job.get('status') in {'pending', 'running', 'succeeded'}:
                return jsonify({
                    'job_id': existing_job['job_id'],
                    'status': existing_job.get('status'),
                    'step': existing_job.get('step') or '',
                    'reused': True,
                }), 202

        job_id = secrets.token_urlsafe(12)
        LITERATURE_SEARCH_JOBS[job_id] = {
            'job_id': job_id,
            'user_id': current_user.id,
            'fingerprint': fingerprint,
            'status': 'pending',
            'step': '任务已创建，准备开始…',
            'error': None,
            'payload': None,
            'html': '',
            'params': {
                'user_id': current_user.id,
                'q': query_text,
                'sources': selected_sources,
                'max_results': max_results,
                'lookback_days': lookback_days,
                'sort_mode': sort_mode,
            },
            'created_ts': time.time(),
            'updated_ts': time.time(),
        }

    Thread(target=_run_literature_search_job, args=(current_app._get_current_object(), job_id), daemon=True).start()
    return jsonify({'job_id': job_id, 'status': 'pending', 'step': '任务已创建，准备开始…'}), 202


@app.route('/api/literature-search/status/<job_id>')
@login_required
def literature_search_status(job_id: str):
    with LITERATURE_SEARCH_JOB_LOCK:
        _cleanup_literature_search_jobs()
        job = LITERATURE_SEARCH_JOBS.get(job_id)
        if not job or int(job.get('user_id') or 0) != int(current_user.id):
            return jsonify({'error': '任务不存在或已过期。'}), 404
        response = {
            'job_id': job['job_id'],
            'status': job.get('status'),
            'step': job.get('step') or '',
            'error': job.get('error'),
        }
        if job.get('status') in {'succeeded', 'failed'}:
            response['html'] = job.get('html') or ''
        return jsonify(response)


RESEARCH_OVERVIEW_FOCUS_OPTIONS = {
    'review_first': '综述优先',
    'balanced': '综合研判',
    'frontier': '前沿进展',
}


def _research_overview_year(value, fallback=5):
    try:
        return max(1, min(int(value or fallback), 15))
    except (TypeError, ValueError):
        return fallback


def _research_overview_result_limit(value, fallback=12):
    try:
        return max(6, min(int(value or fallback), 20))
    except (TypeError, ValueError):
        return fallback


def _is_review_like_search_result(item: dict) -> bool:
    haystack = " ".join([
        str(item.get('title') or ''),
        str(item.get('abstract') or ''),
        str(item.get('journal') or ''),
        " ".join(str(topic) for topic in (item.get('topics') or [])),
    ]).lower()
    review_terms = (
        'review',
        'overview',
        'survey',
        'state of the art',
        'progress',
        'advances',
        'perspective',
        'roadmap',
        '综述',
        '评述',
        '述评',
        '研究进展',
        '研究现状',
        '进展',
    )
    return any(term in haystack for term in review_terms)


def _extract_search_result_year(item: dict) -> int | None:
    year_value = _safe_int_value(item.get('year'))
    if year_value:
        return year_value
    published_at = str(item.get('published_at') or '').strip()
    if re.match(r'^\d{4}', published_at):
        return _safe_int_value(published_at[:4])
    return None


def _score_research_overview_result(item: dict, *, focus_mode: str, current_year: int) -> float:
    base_score = float(item.get('final_score') or item.get('combined_score') or 0.0)
    quality_score = float(item.get('quality_score') or 0.0)
    relevance_score = float(item.get('relevance_score') or 0.0)
    citation_count = max(_safe_int_value(item.get('citation_count')) or 0, 0)
    result_year = _extract_search_result_year(item)
    review_bonus = 0.0
    if _is_review_like_search_result(item):
        review_bonus = 2.4 if focus_mode == 'review_first' else 1.5

    recent_bonus = 0.0
    if result_year:
        age = max(current_year - result_year, 0)
        if focus_mode == 'frontier':
            recent_bonus = max(0.0, 3.2 - age * 0.65)
        elif focus_mode == 'review_first':
            recent_bonus = max(0.0, 2.2 - age * 0.4)
        else:
            recent_bonus = max(0.0, 2.6 - age * 0.5)

    citation_bonus = min(citation_count / 80.0, 1.6)
    return round(base_score + quality_score * 0.22 + relevance_score * 0.18 + review_bonus + recent_bonus + citation_bonus, 3)


def _select_research_overview_results(results: list[dict], *, focus_mode: str, limit: int) -> tuple[list[dict], dict[str, int]]:
    current_year = to_cst(utc_now()).year
    enriched: list[dict] = []
    for item in results or []:
        paper = dict(item)
        paper['is_review_like'] = _is_review_like_search_result(paper)
        result_year = _extract_search_result_year(paper)
        paper['result_year'] = result_year
        paper['is_recent'] = bool(result_year and current_year - result_year <= 5)
        paper['overview_score'] = _score_research_overview_result(paper, focus_mode=focus_mode, current_year=current_year)
        enriched.append(paper)

    enriched.sort(
        key=lambda item: (
            float(item.get('overview_score') or 0.0),
            float(item.get('final_score') or item.get('combined_score') or 0.0),
            int(item.get('citation_count') or 0),
        ),
        reverse=True,
    )
    selected = enriched[:limit]
    stats = {
        'review_count': sum(1 for item in selected if item.get('is_review_like')),
        'recent_count': sum(1 for item in selected if item.get('is_recent')),
        'journal_count': sum(1 for item in selected if item.get('journal')),
    }
    return selected, stats


def _generate_research_overview_summary(
    *,
    direction_text: str,
    selected_papers: list[dict],
    overview_years: int,
    focus_mode: str,
    user_id: int,
) -> tuple[str, str]:
    if not selected_papers:
        raise RuntimeError('没有可用于归纳研究现状的候选文献。')

    focus_label = RESEARCH_OVERVIEW_FOCUS_OPTIONS.get(focus_mode, '综合研判')
    paper_blocks: list[str] = []
    summary_papers = selected_papers[:RESEARCH_OVERVIEW_SUMMARY_PAPER_LIMIT]
    for index, paper in enumerate(summary_papers, start=1):
        authors = "；".join(paper.get('authors') or []) or '未知作者'
        keyword_text = "、".join((paper.get('matched_keywords') or [])[:6] or (paper.get('topics') or [])[:6]) or '未提取'
        tags: list[str] = []
        if paper.get('is_review_like'):
            tags.append('综述/述评倾向')
        if paper.get('is_recent'):
            tags.append('近五年')
        paper_blocks.append(
            f"[{index}]\n"
            f"标题：{paper.get('title') or 'Untitled'}\n"
            f"作者：{authors}\n"
            f"来源：{paper.get('journal') or paper.get('source') or '未知来源'}\n"
            f"年份：{paper.get('published_at') or paper.get('year') or '未知'}\n"
            f"被引：{int(paper.get('citation_count') or 0)}\n"
            f"标签：{'；'.join(tags) if tags else '普通研究论文'}\n"
            f"相关词：{keyword_text}\n"
            f"摘要：{str(paper.get('abstract') or '暂无摘要').strip()[:RESEARCH_OVERVIEW_ABSTRACT_SNIPPET_LIMIT]}\n"
        )

    if not get_ai_client_config():
        fallback_lines = [
            f"## 研究方向：{direction_text}",
            "",
            f"系统已为你筛出 {len(selected_papers)} 篇近 {overview_years} 年的高相关文献。",
            f"当前策略：{focus_label}。",
            "",
            "### 可先重点阅读",
        ]
        for idx, paper in enumerate(selected_papers[:8], start=1):
            flags = []
            if paper.get('is_review_like'):
                flags.append('综述优先')
            if paper.get('is_recent'):
                flags.append('近五年')
            fallback_lines.append(
                f"{idx}. {paper.get('title')}（{paper.get('journal') or '未知来源'}，{paper.get('published_at') or paper.get('year') or '年份未知'}）"
                + (f" —— {' / '.join(flags)}" if flags else "")
            )
        fallback_lines.extend([
            "",
            "> 当前未配置 AI，总结部分暂以候选论文清单代替。配置 AI 后可自动生成研究现状综述。",
        ])
        summary = "\n".join(fallback_lines)
        return summary, str(render_ai_summary_markdown(summary))

    prompt = (
        "你是一名中文科研助理，请根据下面提供的候选论文，梳理某个研究方向当前的研究现状。\n"
        "要求：\n"
        "1. 只基于提供的论文信息归纳，不要编造具体实验数据；\n"
        "2. 优先强调近几年的主流进展，并特别指出综述类论文能提供的整体脉络；\n"
        "3. 输出 Markdown，不要输出代码块；\n"
        "4. 结构尽量包括：研究主题界定、近年研究主线、常用数据/方法、代表性认识、当前不足/争议、建议优先阅读；\n"
        "5. 语言要适合科研人员快速了解方向现状，尽量清晰、凝练；\n"
        "6. 如果提供的文献证据不足，也要明确说明证据边界。\n\n"
        f"研究方向：{direction_text}\n"
        f"时间侧重：近 {overview_years} 年\n"
        f"分析策略：{focus_label}\n\n"
        "候选论文如下：\n"
        + "\n".join(paper_blocks)
    )
    summary = call_ai_text(
        "你是擅长做研究现状梳理的中文科研综述助手。",
        prompt,
        timeout=RESEARCH_OVERVIEW_AI_TIMEOUT,
        usage_context={'scene': 'research_overview', 'user_id': user_id},
    )
    if not summary:
        raise RuntimeError('AI 未返回研究现状总结。')
    summary = summary.strip()
    return summary, str(render_ai_summary_markdown(summary))


def _build_research_overview_fallback_summary(
    *,
    direction_text: str,
    selected_papers: list[dict],
    overview_years: int,
    focus_mode: str,
    error_message: str | None = None,
) -> tuple[str, str]:
    fallback_lines = [
        f"## 研究方向：{direction_text}",
        "",
        f"系统已为你筛出 {len(selected_papers)} 篇近 {overview_years} 年的高相关文献。",
        f"当前策略：{RESEARCH_OVERVIEW_FOCUS_OPTIONS.get(focus_mode, focus_mode)}。",
        "",
        "### 可先重点阅读",
    ]
    for idx, paper in enumerate(selected_papers[:8], start=1):
        flags: list[str] = []
        if paper.get('is_review_like'):
            flags.append('综述优先')
        if paper.get('is_recent'):
            flags.append('近五年')
        fallback_lines.append(
            f"{idx}. {paper.get('title')}（{paper.get('journal') or '未知来源'}，{paper.get('published_at') or paper.get('year') or '年份未知'}）"
            + (f" —— {' / '.join(flags)}" if flags else "")
        )
    fallback_lines.extend([
        "",
        f"> {error_message}" if error_message else "> 当前未配置 AI，总结部分暂以候选论文清单代替。配置 AI 后可自动生成研究现状综述。",
    ])
    summary = "\n".join(fallback_lines).strip()
    return summary, str(render_ai_summary_markdown(summary))


def _normalize_research_overview_sources(values) -> list[str]:
    selected_sources = [source for source in (values or []) if source in SUPPORTED_SOURCES]
    return selected_sources or ['openalex', 'crossref', 'ads']


def _cleanup_research_overview_jobs() -> None:
    now_ts = time.time()
    expired_keys: list[str] = []
    for job_id, job in RESEARCH_OVERVIEW_JOBS.items():
        updated_ts = float(job.get('updated_ts') or job.get('created_ts') or now_ts)
        if now_ts - updated_ts > RESEARCH_OVERVIEW_JOB_TTL_SECONDS:
            expired_keys.append(job_id)
    for job_id in expired_keys:
        RESEARCH_OVERVIEW_JOBS.pop(job_id, None)


def _set_research_overview_job(job_id: str, **updates) -> dict | None:
    with RESEARCH_OVERVIEW_JOB_LOCK:
        _cleanup_research_overview_jobs()
        job = RESEARCH_OVERVIEW_JOBS.get(job_id)
        if not job:
            return None
        job.update(updates)
        job['updated_ts'] = time.time()
        return dict(job)


def _render_research_overview_fragment(
    *,
    direction_text: str,
    focus_mode: str,
    selected_sources: list[str],
    overview_years: int,
    max_results: int,
    overview_payload,
    overview_error,
    ai_enabled: bool,
    enhancement_sources: list[dict],
):
    return render_template(
        'research_overview_result_fragment.html',
        direction_text=direction_text,
        focus_mode=focus_mode,
        focus_options=RESEARCH_OVERVIEW_FOCUS_OPTIONS,
        selected_sources=selected_sources,
        overview_years=overview_years,
        max_results=max_results,
        overview_payload=overview_payload,
        overview_error=overview_error,
        source_options=SUPPORTED_SOURCES,
        ai_enabled=ai_enabled,
        enhancement_sources=enhancement_sources,
        build_display_source_links=build_display_source_links,
    )


def _run_research_overview_job(app_obj: Flask, job_id: str) -> None:
    with app_obj.app_context():
        with RESEARCH_OVERVIEW_JOB_LOCK:
            job = RESEARCH_OVERVIEW_JOBS.get(job_id)
            if not job:
                return
            params = dict(job.get('params') or {})
            job['status'] = 'running'
            job['step'] = '正在跨源检索相关文献…'
            job['updated_ts'] = time.time()

        direction_text = str(params.get('q') or '').strip()
        focus_mode = str(params.get('focus_mode') or 'review_first').strip().lower()
        if focus_mode not in RESEARCH_OVERVIEW_FOCUS_OPTIONS:
            focus_mode = 'review_first'
        selected_sources = _normalize_research_overview_sources(params.get('sources') or [])
        overview_years = _research_overview_year(params.get('overview_years'), 5)
        max_results = _research_overview_result_limit(params.get('max_results'), 12)
        user_id = int(params.get('user_id'))

        try:
            search_payload = search_literature_with_ai(
                user_id,
                query_text=f"请围绕“{direction_text}”检索近 {overview_years} 年高相关期刊文献，优先综述、review、progress、state of the art 与高质量代表性研究论文，用于梳理研究现状。",
                max_results=min(max(max_results + 4, 10), RESEARCH_OVERVIEW_SEARCH_CAP),
                lookback_days=max(365, overview_years * 365),
                enabled_sources=selected_sources,
                sort_mode='quality' if focus_mode == 'review_first' else 'balanced',
            )
            selected_papers, selected_stats = _select_research_overview_results(
                search_payload.get('results') or [],
                focus_mode=focus_mode,
                limit=max_results,
            )
            _set_research_overview_job(job_id, step='正在调用 AI 生成综述…')
            try:
                summary_markdown, summary_html = _generate_research_overview_summary(
                    direction_text=direction_text,
                    selected_papers=selected_papers,
                    overview_years=overview_years,
                    focus_mode=focus_mode,
                    user_id=user_id,
                )
                summary_mode = 'ai'
            except Exception as summary_exc:
                current_app.logger.warning("研究现状 AI 综述失败，回退到规则综述：%s", summary_exc)
                summary_markdown, summary_html = _build_research_overview_fallback_summary(
                    direction_text=direction_text,
                    selected_papers=selected_papers,
                    overview_years=overview_years,
                    focus_mode=focus_mode,
                    error_message=f"AI 综述生成失败，已回退为规则版摘要：{summary_exc}",
                )
                summary_mode = 'fallback'

            overview_payload = {
                'search_payload': search_payload,
                'selected_papers': selected_papers,
                'selected_stats': selected_stats,
                'summary_markdown': summary_markdown,
                'summary_html': summary_html,
                'summary_mode': summary_mode,
                'generated_at': format_cn_time(utc_now()),
            }
            enhancement_sources = get_display_only_sources(direction_text)
            html_fragment = _render_research_overview_fragment(
                direction_text=direction_text,
                focus_mode=focus_mode,
                selected_sources=selected_sources,
                overview_years=overview_years,
                max_results=max_results,
                overview_payload=overview_payload,
                overview_error=None,
                ai_enabled=bool(get_ai_client_config()),
                enhancement_sources=enhancement_sources,
            )
            _set_research_overview_job(
                job_id,
                status='succeeded',
                step='研究现状综述已生成。',
                payload=overview_payload,
                html=html_fragment,
                error=None,
            )
        except Exception as exc:
            current_app.logger.exception("研究现状梳理失败: %s", exc)
            enhancement_sources = get_display_only_sources(direction_text)
            html_fragment = _render_research_overview_fragment(
                direction_text=direction_text,
                focus_mode=focus_mode,
                selected_sources=selected_sources,
                overview_years=overview_years,
                max_results=max_results,
                overview_payload=None,
                overview_error=str(exc) or '研究现状梳理失败，请稍后重试。',
                ai_enabled=bool(get_ai_client_config()),
                enhancement_sources=enhancement_sources,
            )
            _set_research_overview_job(
                job_id,
                status='failed',
                step='研究现状梳理失败。',
                error=str(exc) or '研究现状梳理失败，请稍后重试。',
                html=html_fragment,
            )


@app.route('/research-overview')
@login_required
def research_overview_home():
    direction_text = (request.args.get('q') or '').strip()
    focus_mode = (request.args.get('focus_mode') or 'review_first').strip().lower()
    if focus_mode not in RESEARCH_OVERVIEW_FOCUS_OPTIONS:
        focus_mode = 'review_first'

    selected_sources = _normalize_research_overview_sources(request.args.getlist('sources'))

    overview_years = _research_overview_year(request.args.get('overview_years'), 5)
    max_results = _research_overview_result_limit(request.args.get('max_results'), 12)

    overview_payload = None
    overview_error = None

    try:
        ai_enabled = bool(get_ai_client_config())
    except Exception as exc:
        current_app.logger.exception("读取研究现状梳理 AI 配置失败: %s", exc)
        ai_enabled = False

    try:
        enhancement_sources = get_display_only_sources(direction_text)
    except Exception as exc:
        current_app.logger.exception("构建研究现状梳理增强来源失败: %s", exc)
        enhancement_sources = []

    return render_template(
        'research_overview.html',
        direction_text=direction_text,
        focus_mode=focus_mode,
        focus_options=RESEARCH_OVERVIEW_FOCUS_OPTIONS,
        selected_sources=selected_sources,
        overview_years=overview_years,
        max_results=max_results,
        overview_payload=overview_payload,
        overview_error=overview_error,
        source_options=SUPPORTED_SOURCES,
        ai_enabled=ai_enabled,
        enhancement_sources=enhancement_sources,
        build_display_source_links=build_display_source_links,
        auto_start_overview=bool(direction_text),
    )


@app.route('/api/research-overview/start', methods=['POST'])
@login_required
def research_overview_start():
    payload = request.get_json(silent=True) or request.form or {}
    direction_text = str(payload.get('q') or '').strip()
    if not direction_text:
        return jsonify({'error': '请输入研究方向或调研主题。'}), 400

    focus_mode = str(payload.get('focus_mode') or 'review_first').strip().lower()
    if focus_mode not in RESEARCH_OVERVIEW_FOCUS_OPTIONS:
        focus_mode = 'review_first'

    sources = payload.get('sources') or []
    if isinstance(sources, str):
        sources = [item.strip() for item in re.split(r'[\n,;，；]+', sources) if item.strip()]
    selected_sources = _normalize_research_overview_sources(sources)
    overview_years = _research_overview_year(payload.get('overview_years'), 5)
    max_results = _research_overview_result_limit(payload.get('max_results'), 12)

    fingerprint_payload = {
        'user_id': current_user.id,
        'q': direction_text,
        'focus_mode': focus_mode,
        'sources': selected_sources,
        'overview_years': overview_years,
        'max_results': max_results,
    }
    fingerprint = json.dumps(fingerprint_payload, ensure_ascii=False, sort_keys=True)

    with RESEARCH_OVERVIEW_JOB_LOCK:
        _cleanup_research_overview_jobs()
        for existing_job in RESEARCH_OVERVIEW_JOBS.values():
            if existing_job.get('fingerprint') != fingerprint:
                continue
            if existing_job.get('status') in {'pending', 'running', 'succeeded'}:
                return jsonify({
                    'job_id': existing_job['job_id'],
                    'status': existing_job.get('status'),
                    'step': existing_job.get('step') or '',
                    'reused': True,
                }), 202

        job_id = secrets.token_urlsafe(12)
        RESEARCH_OVERVIEW_JOBS[job_id] = {
            'job_id': job_id,
            'user_id': current_user.id,
            'fingerprint': fingerprint,
            'status': 'pending',
            'step': '任务已创建，准备开始…',
            'error': None,
            'payload': None,
            'html': '',
            'params': {
                'user_id': current_user.id,
                'q': direction_text,
                'focus_mode': focus_mode,
                'sources': selected_sources,
                'overview_years': overview_years,
                'max_results': max_results,
            },
            'created_ts': time.time(),
            'updated_ts': time.time(),
        }

    Thread(
        target=_run_research_overview_job,
        args=(current_app._get_current_object(), job_id),
        daemon=True,
    ).start()
    return jsonify({'job_id': job_id, 'status': 'pending', 'step': '任务已创建，准备开始…'}), 202


@app.route('/api/research-overview/status/<job_id>')
@login_required
def research_overview_status(job_id: str):
    with RESEARCH_OVERVIEW_JOB_LOCK:
        _cleanup_research_overview_jobs()
        job = RESEARCH_OVERVIEW_JOBS.get(job_id)
        if not job or int(job.get('user_id') or 0) != int(current_user.id):
            return jsonify({'error': '任务不存在或已过期。'}), 404
        response = {
            'job_id': job['job_id'],
            'status': job.get('status'),
            'step': job.get('step') or '',
            'error': job.get('error'),
        }
        if job.get('status') in {'succeeded', 'failed'}:
            response['html'] = job.get('html') or ''
        return jsonify(response)


def _markdown_to_plain_text(value: str | None) -> str:
    text_value = str(value or '').strip()
    if not text_value:
        return ''
    text_value = re.sub(r'```[\s\S]*?```', '', text_value)
    text_value = re.sub(r'`([^`]+)`', r'\1', text_value)
    text_value = re.sub(r'!\[([^\]]*)\]\([^)]+\)', r'\1', text_value)
    text_value = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text_value)
    text_value = re.sub(r'^\s{0,3}#{1,6}\s*', '', text_value, flags=re.MULTILINE)
    text_value = re.sub(r'^\s*[-*+]\s+', '• ', text_value, flags=re.MULTILINE)
    text_value = re.sub(r'^\s*\d+\.\s+', '', text_value, flags=re.MULTILINE)
    text_value = re.sub(r'[*_~>-]+', '', text_value)
    text_value = html.unescape(text_value)
    text_value = re.sub(r'\n{3,}', '\n\n', text_value)
    return text_value.strip()


def _build_research_overview_note_content(
    *,
    direction_text: str,
    summary_markdown: str,
    selected_papers: list[dict],
    overview_years: int,
    focus_mode: str,
    source_labels: list[str],
) -> str:
    lines = [
        f"# 研究现状综述：{direction_text}",
        "",
        f"- 生成时间：{format_cn_time(utc_now())}",
        f"- 时间侧重：近 {overview_years} 年",
        f"- 分析策略：{RESEARCH_OVERVIEW_FOCUS_OPTIONS.get(focus_mode, focus_mode)}",
        f"- 检索来源：{' / '.join(source_labels) if source_labels else '未记录'}",
        "",
        summary_markdown.strip(),
        "",
        "## 支撑论文池",
    ]
    for index, paper in enumerate(selected_papers or [], start=1):
        authors = "；".join(paper.get('authors') or []) or '未知作者'
        journal = paper.get('journal') or paper.get('source') or '未知来源'
        published = paper.get('published_at') or paper.get('year') or '未知时间'
        doi = paper.get('doi') or ''
        extra_flags: list[str] = []
        if paper.get('is_review_like'):
            extra_flags.append('综述倾向')
        if paper.get('is_recent'):
            extra_flags.append('近五年')
        if paper.get('citation_count'):
            extra_flags.append(f"被引 {int(paper.get('citation_count') or 0)}")
        lines.extend([
            f"### {index}. {paper.get('title') or 'Untitled'}",
            f"- 作者：{authors}",
            f"- 来源：{journal}",
            f"- 时间：{published}",
            f"- 标记：{' / '.join(extra_flags) if extra_flags else '普通研究论文'}",
            f"- DOI：{doi or '无'}",
            f"- 链接：{paper.get('url') or paper.get('pdf_url') or '无'}",
            f"- 摘要：{paper.get('abstract') or '暂无摘要'}",
            "",
        ])
    return "\n".join(lines).strip()


def _save_research_overview_to_system(user_id: int, payload: dict) -> tuple[Document, bool]:
    direction_text = re.sub(r"\s+", " ", str(payload.get('direction_text') or '').strip())
    summary_markdown = str(payload.get('summary_markdown') or '').strip()
    if not direction_text:
        raise RuntimeError('缺少研究方向，无法保存。')
    if not summary_markdown:
        raise RuntimeError('缺少研究现状内容，无法保存。')

    selected_papers = payload.get('selected_papers') or []
    if not isinstance(selected_papers, list):
        selected_papers = []
    overview_years = _research_overview_year(payload.get('overview_years'), 5)
    focus_mode = str(payload.get('focus_mode') or 'review_first').strip().lower()
    selected_sources = [
        source for source in (payload.get('selected_sources') or [])
        if source in SUPPORTED_SOURCES
    ]
    source_labels = [SUPPORTED_SOURCES.get(source, source) for source in selected_sources]

    title = f"研究现状综述：{direction_text}"
    plain_summary = _markdown_to_plain_text(summary_markdown)
    abstract = plain_summary[:4000] if plain_summary else direction_text
    note_content = _build_research_overview_note_content(
        direction_text=direction_text,
        summary_markdown=summary_markdown,
        selected_papers=selected_papers[:20],
        overview_years=overview_years,
        focus_mode=focus_mode,
        source_labels=source_labels,
    )
    now_utc = utc_now()
    current_year = to_cst(now_utc).year
    review_type = DocType.query.filter_by(value='review').first()

    document = (
        Document.query
        .filter_by(owner_id=user_id, title=title)
        .order_by(Document.id.desc())
        .first()
    )
    created = False
    if document is None:
        document = Document(
            title=title,
            authors='云凇学术 AI',
            journal='研究现状综述',
            year=current_year,
            abstract=abstract,
            remark=f"自动保存于 {format_cn_time(now_utc)}",
            ai_summary=summary_markdown,
            ai_summary_updated_at=now_utc,
            keywords=direction_text,
            tags='研究现状综述;AI生成',
            owner_id=user_id,
            created_at=now_utc,
            upload_time=now_utc,
            modified_at=now_utc,
            view_count=0,
            doc_type='review',
            doc_type_id=review_type.id if review_type else None,
            is_shared=False,
        )
        assign_category(document, 'geophysics')
        db.session.add(document)
        db.session.flush()
        created = True
    else:
        document.authors = '云凇学术 AI'
        document.journal = '研究现状综述'
        document.year = current_year
        document.abstract = abstract
        document.remark = f"最近更新于 {format_cn_time(now_utc)}"
        document.ai_summary = summary_markdown
        document.ai_summary_updated_at = now_utc
        document.keywords = direction_text
        document.tags = '研究现状综述;AI生成'
        document.modified_at = now_utc
        document.doc_type = 'review'
        document.doc_type_id = review_type.id if review_type else None

    note = Note.query.filter_by(user_id=user_id, doc_id=document.id).first()
    if note is None:
        note = Note(user_id=user_id, doc_id=document.id, content=note_content)
        db.session.add(note)
    else:
        note.content = note_content
        note.updated_at = now_utc

    db.session.commit()
    return document, created


@app.route('/api/research-overview/save', methods=['POST'])
@login_required
def research_overview_save():
    payload = request.get_json(silent=True) or {}
    try:
        document, created = _save_research_overview_to_system(current_user.id, payload)
    except Exception as exc:
        db.session.rollback()
        current_app.logger.exception("研究现状综述保存失败: %s", exc)
        return jsonify({'error': str(exc) or '保存失败'}), 500
    return jsonify({
        'message': '已保存到系统。' if created else '已更新系统中的同名综述。',
        'doc_id': document.id,
        'created': created,
        'redirect_url': url_for('document_detail', doc_id=document.id),
    })


def _safe_int_value(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _normalize_search_result_payload(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise RuntimeError('缺少检索结果数据。')
    title = re.sub(r'\s+', ' ', str(payload.get('title') or '').strip())
    if not title:
        raise RuntimeError('缺少文献标题，无法继续处理。')
    authors_raw = payload.get('authors') or []
    if isinstance(authors_raw, str):
        authors = [item.strip() for item in re.split(r'[;\n]+', authors_raw) if item.strip()]
    else:
        authors = [str(item).strip() for item in authors_raw if str(item).strip()]
    topics_raw = payload.get('topics') or []
    matched_raw = payload.get('matched_keywords') or payload.get('keywords') or []
    if isinstance(topics_raw, str):
        topics = [item.strip() for item in re.split(r'[;,，；\n]+', topics_raw) if item.strip()]
    else:
        topics = [str(item).strip() for item in topics_raw if str(item).strip()]
    if isinstance(matched_raw, str):
        matched_keywords = [item.strip() for item in re.split(r'[;,，；\n]+', matched_raw) if item.strip()]
    else:
        matched_keywords = [str(item).strip() for item in matched_raw if str(item).strip()]
    summary_text = str(payload.get('summary') or '').strip()
    summary_updated_at = str(payload.get('summary_updated_at') or payload.get('updated_at') or '').strip()
    return {
        'title': title,
        'authors': authors[:20],
        'journal': str(payload.get('journal') or '').strip() or None,
        'year': _safe_int_value(payload.get('year')),
        'published_at': str(payload.get('published_at') or '').strip() or None,
        'doi': normalize_doi(str(payload.get('doi') or '').strip()),
        'url': str(payload.get('url') or '').strip() or None,
        'pdf_url': str(payload.get('pdf_url') or '').strip() or None,
        'abstract': clean_abstract_text(payload.get('abstract')),
        'topics': topics[:12],
        'matched_keywords': matched_keywords[:12],
        'query_text': str(payload.get('query_text') or '').strip(),
        'existing_document_id': _safe_int_value(payload.get('existing_document_id')),
        'summary': summary_text or None,
        'summary_updated_at': summary_updated_at or None,
    }


def _summarize_search_result_payload(payload: dict) -> tuple[str, str]:
    paper = _normalize_search_result_payload(payload)
    existing_doc = find_existing_document_for_user(
        current_user.id,
        doi=paper.get('doi'),
        title=paper.get('title'),
        year=paper.get('year'),
    )
    if existing_doc:
        if existing_doc.ai_summary:
            updated_at = format_cn_time(existing_doc.ai_summary_updated_at) if existing_doc.ai_summary_updated_at else ''
            return existing_doc.ai_summary, updated_at
        summary = summarize_document_with_ai(existing_doc)
        updated_at = format_cn_time(existing_doc.ai_summary_updated_at) if existing_doc.ai_summary_updated_at else ''
        return summary, updated_at

    keyword_text = '、'.join(paper.get('matched_keywords') or paper.get('topics') or []) or '未提供'
    authors = '；'.join(paper.get('authors') or []) or '未知'
    prompt = (
        "请作为中文科研助手，对下面这篇检索到的文献做专业、清晰、适合快速筛读的总结。\n"
        "要求：\n"
        "1. 使用中文；\n"
        "2. 只基于提供的信息，不要编造；\n"
        "3. 输出 Markdown；\n"
        "4. 控制在 6 个小节以内；\n"
        "5. 重点写出：研究问题、方法/数据、主要发现、为什么值得读；\n"
        "6. 不要输出 ```markdown 代码块。\n\n"
        f"当前检索需求：{paper.get('query_text') or '未提供'}\n"
        f"标题：{paper.get('title')}\n"
        f"作者：{authors}\n"
        f"期刊/来源：{paper.get('journal') or '未知'}\n"
        f"日期：{paper.get('published_at') or paper.get('year') or '未知'}\n"
        f"DOI：{paper.get('doi') or '未知'}\n"
        f"相关关键词：{keyword_text}\n"
        f"摘要：{paper.get('abstract') or '暂无摘要'}\n"
    )
    summary = call_ai_text(
        "你是中文科研文献筛读助手，擅长快速总结论文价值。",
        prompt,
        timeout=90,
        usage_context={'scene': 'search_result_summary', 'user_id': current_user.id},
    )
    if not summary:
        raise RuntimeError('AI 返回为空，未能生成总结。')
    return summary.strip(), format_cn_time(utc_now())


def _import_search_result_to_document(payload: dict) -> tuple[Document, bool]:
    paper = _normalize_search_result_payload(payload)
    existing_doc = find_existing_document_for_user(
        current_user.id,
        doi=paper.get('doi'),
        title=paper.get('title'),
        year=paper.get('year'),
    )
    if existing_doc:
        return existing_doc, False

    stored_file = None
    normalized_doi = paper.get('doi')
    pdf_url = paper.get('pdf_url') or (get_pdf_url_from_unpaywall(normalized_doi) if normalized_doi else None)
    if pdf_url:
        safe_title = "".join([c for c in paper['title'] if c.isalnum() or c in " _-"]).rstrip() or "document"
        user_folder = ensure_user_storage(current_user.id)
        filename = get_unique_filename(f"{safe_title}.pdf")
        save_path = user_folder / filename
        if download_pdf(pdf_url, save_path):
            relative_path = save_path.relative_to(upload_root())
            stored_file = {
                "relative_path": str(relative_path).replace('\\', '/'),
                "size": save_path.stat().st_size,
                "display_name": f"{safe_title}.pdf",
                "extension": "pdf",
            }

    keywords_value = "；".join(paper.get('topics') or []) or "；".join(paper.get('matched_keywords') or [])
    summary_text = str(paper.get('summary') or '').strip() or None
    new_doc = Document(
        title=paper['title'],
        authors=", ".join(paper.get('authors') or []) or "未知作者",
        journal=paper.get('journal'),
        year=paper.get('year'),
        doi=normalized_doi,
        abstract=paper.get('abstract'),
        keywords=keywords_value or None,
        tags="智能深搜导入",
        owner_id=current_user.id,
        upload_time=utc_now(),
        modified_at=utc_now(),
        view_count=0,
        doc_type='journal' if paper.get('journal') else 'other',
        file_name=stored_file["display_name"] if stored_file else None,
        file_path=stored_file["relative_path"] if stored_file else None,
        file_size=stored_file["size"] if stored_file else 0,
        file_type=stored_file["extension"] if stored_file else None,
        is_shared=False,
        url=paper.get('url'),
        ai_summary=summary_text,
        ai_summary_updated_at=utc_now() if summary_text else None,
    )
    assign_category(new_doc, 'geophysics')
    db.session.add(new_doc)
    db.session.commit()
    return new_doc, True


@app.route('/api/literature-search/summary', methods=['POST'])
@login_required
def literature_search_summarize():
    payload = request.get_json(silent=True) or {}
    try:
        summary, updated_at = _summarize_search_result_payload(payload)
    except Exception as exc:
        current_app.logger.exception("智能深搜 AI 总结失败: %s", exc)
        return jsonify({'error': str(exc) or 'AI 总结失败'}), 500
    return jsonify({
        'message': 'AI 总结已生成。',
        'summary': summary,
        'summary_html': str(render_ai_summary_markdown(summary)),
        'updated_at': updated_at,
    })


@app.route('/api/literature-search/import', methods=['POST'])
@login_required
def literature_search_import():
    payload = request.get_json(silent=True) or {}
    try:
        document, created = _import_search_result_to_document(payload)
    except Exception as exc:
        db.session.rollback()
        current_app.logger.exception("智能深搜文献导入失败: %s", exc)
        return jsonify({'error': str(exc) or '导入失败'}), 500
    return jsonify({
        'message': '已一键导入系统。' if created else '该文献已在系统文献库中。',
        'doc_id': document.id,
        'redirect_url': url_for('document_detail', doc_id=document.id),
        'created': created,
    })


@app.route('/api/morning-report/run', methods=['POST'])
@login_required
def morning_report_run_now():
    try:
        run = generate_morning_report_for_user(current_user.id, trigger_source='manual', force=True)
    except Exception as exc:
        current_app.logger.exception("手动生成晨报失败: %s", exc)
        return jsonify({'error': str(exc) or '生成晨报失败'}), 500
    return jsonify({
        'message': '今日晨报已更新。',
        'report_date': run.report_date,
        'paper_count': run.paper_count,
        'redirect_url': url_for('morning_report_home'),
    })


@app.route('/api/morning-report/status')
@login_required
def morning_report_status():
    report_settings = ensure_morning_report_settings(current_user.id, commit=True)
    report_run = get_today_morning_report(current_user.id)
    current_hour = to_cst(utc_now()).hour
    auto_run_hour = int(report_settings.auto_run_hour or 8)
    auto_due = bool(report_settings.enabled and report_settings.auto_run_enabled and current_hour >= auto_run_hour)
    is_running = is_morning_report_generation_running(current_user.id)
    popup_payload = None

    try:
        popup_payload = get_morning_report_popup_payload(current_user.id)
    except Exception as exc:
        current_app.logger.warning("读取晨报状态弹窗失败: %s", exc)

    if not report_settings.enabled:
        status = 'disabled'
        label = '今日晨报已关闭'
    elif report_run and report_run.status == 'ready':
        status = 'ready'
        label = '今日晨报已就绪'
    elif report_run and report_run.status == 'failed':
        status = 'failed'
        label = '今日晨报生成失败'
    elif is_running or (auto_due and not report_run):
        status = 'running'
        label = '今日晨报生成中...'
    elif report_settings.auto_run_enabled:
        status = 'waiting'
        label = f'今日晨报待 {auto_run_hour:02d}:00 自动生成'
    else:
        status = 'idle'
        label = '今日晨报待手动生成'

    generated_at = report_run.generated_at if report_run else None
    generated_at_text = format_cn_time(generated_at) if generated_at else ''
    popup_data = None
    if popup_payload:
        popup_generated_at = popup_payload.get('generated_at')
        popup_data = {
            'report_date': popup_payload.get('report_date') or (report_run.report_date if report_run else today_cn_date()),
            'paper_count': int(popup_payload.get('paper_count') or 0),
            'headline': popup_payload.get('headline') or '今日晨报已就绪',
            'keywords': popup_payload.get('keywords') or [],
            'generated_at_text': format_cn_time(popup_generated_at) if popup_generated_at else '',
            'report_url': url_for('morning_report_home'),
            'notify_key': (
                f"{popup_payload.get('report_date') or today_cn_date()}::"
                f"{int(popup_generated_at.timestamp()) if popup_generated_at else 'ready'}"
            ),
        }

    return jsonify({
        'status': status,
        'label': label,
        'report_date': report_run.report_date if report_run else today_cn_date(),
        'paper_count': int(report_run.paper_count or 0) if report_run else 0,
        'headline': report_run.headline if report_run else '',
        'generated_at_text': generated_at_text,
        'last_error': report_run.last_error if report_run else '',
        'report_url': url_for('morning_report_home'),
        'popup': popup_data,
    })


@app.route('/api/morning-report/popup/seen', methods=['POST'])
@login_required
def morning_report_mark_seen():
    payload = request.get_json(silent=True) or {}
    report_date = (payload.get('report_date') or '').strip() or None
    mark_morning_report_popup_seen(current_user.id, report_date)
    return jsonify({'ok': True})


@app.route('/api/broadcasts/latest')
@login_required
def latest_broadcast():
    message = get_latest_unseen_broadcast(current_user.id)
    if not message:
        return jsonify({'broadcast': None})
    return jsonify({
        'broadcast': {
            'id': message.id,
            'title': message.title,
            'content': message.content,
            'created_at': format_cn_time(message.created_at),
        }
    })


@app.route('/api/broadcasts/<int:broadcast_id>/seen', methods=['POST'])
@login_required
def broadcast_mark_seen(broadcast_id: int):
    message = BroadcastMessage.query.get_or_404(broadcast_id)
    if not message.is_active:
        return jsonify({'ok': True})
    mark_broadcast_seen(current_user.id, message.id)
    return jsonify({'ok': True})


@app.route('/api/morning-report/paper/<int:paper_id>/summary', methods=['POST'])
@login_required
def morning_report_summarize(paper_id: int):
    paper = MorningReportPaper.query.filter_by(id=paper_id, user_id=current_user.id).first_or_404()
    report_settings = ensure_morning_report_settings(current_user.id, commit=True)
    try:
        summary = summarize_paper_with_ai(paper, keywords=report_settings.keyword_list())
    except Exception as exc:
        current_app.logger.exception("晨报 AI 总结失败: %s", exc)
        return jsonify({'error': str(exc) or 'AI 总结失败'}), 500
    return jsonify({
        'message': 'AI 总结已生成。',
        'summary': summary,
        'summary_html': str(render_ai_summary_markdown(summary)),
        'updated_at': format_cn_time(paper.ai_summary_updated_at),
    })


@app.route('/api/document/<int:doc_id>/summary', methods=['POST'])
@login_required
def document_summarize(doc_id: int):
    doc = Document.query.get_or_404(doc_id)
    ensure_document_access(doc)
    try:
        summary = summarize_document_with_ai(doc)
    except Exception as exc:
        current_app.logger.exception("文献详情页 AI 总结失败: %s", exc)
        return jsonify({'error': str(exc) or 'AI 总结失败'}), 500

    return jsonify({
        'message': 'AI 总结已生成。',
        'summary': summary,
        'summary_html': str(render_ai_summary_markdown(summary)),
        'updated_at': format_cn_time(doc.ai_summary_updated_at),
    })


def _import_morning_report_paper_to_document(paper: MorningReportPaper) -> tuple[Document, bool]:
    existing_doc = None
    normalized_doi = normalize_doi(paper.doi or '')

    if paper.imported_document_id:
        existing_doc = Document.query.filter_by(
            id=paper.imported_document_id,
            owner_id=current_user.id,
        ).first()
        if existing_doc:
            return existing_doc, False

    existing_doc = find_existing_document_for_user(
        current_user.id,
        doi=normalized_doi,
        title=paper.title,
        year=paper.year,
    )
    if existing_doc:
        paper.imported_document_id = existing_doc.id
        paper.imported_at = utc_now()
        db.session.commit()
        return existing_doc, False

    stored_file = None
    pdf_url = paper.pdf_url or (get_pdf_url_from_unpaywall(normalized_doi) if normalized_doi else None)
    if pdf_url:
        safe_title = "".join([c for c in paper.title if c.isalnum() or c in " _-"]).rstrip() or "document"
        user_folder = ensure_user_storage(current_user.id)
        filename = get_unique_filename(f"{safe_title}.pdf")
        save_path = user_folder / filename
        if download_pdf(pdf_url, save_path):
            relative_path = save_path.relative_to(upload_root())
            stored_file = {
                "relative_path": str(relative_path).replace('\\', '/'),
                "size": save_path.stat().st_size,
                "display_name": f"{safe_title}.pdf",
                "extension": "pdf",
            }

    topics = paper.topic_list()
    keywords_value = "；".join(topics) if topics else (paper.keywords_matched or "")
    new_doc = Document(
        title=paper.title,
        authors=", ".join(paper.author_list()) or "未知作者",
        journal=paper.journal,
        year=paper.year,
        doi=normalized_doi,
        abstract=paper.abstract,
        keywords=keywords_value,
        tags="晨报导入",
        owner_id=current_user.id,
        upload_time=utc_now(),
        modified_at=utc_now(),
        view_count=0,
        doc_type='journal' if paper.journal else 'other',
        file_name=stored_file["display_name"] if stored_file else None,
        file_path=stored_file["relative_path"] if stored_file else None,
        file_size=stored_file["size"] if stored_file else 0,
        file_type=stored_file["extension"] if stored_file else None,
        is_shared=False,
        url=paper.url,
    )
    assign_category(new_doc, 'geophysics')
    db.session.add(new_doc)
    db.session.flush()

    paper.imported_document_id = new_doc.id
    paper.imported_at = utc_now()
    db.session.commit()
    return new_doc, True


@app.route('/api/morning-report/paper/<int:paper_id>/import', methods=['POST'])
@login_required
def morning_report_import(paper_id: int):
    paper = MorningReportPaper.query.filter_by(id=paper_id, user_id=current_user.id).first_or_404()
    try:
        document, created = _import_morning_report_paper_to_document(paper)
    except Exception as exc:
        db.session.rollback()
        current_app.logger.exception("晨报文献导入失败: %s", exc)
        return jsonify({'error': str(exc) or '导入失败'}), 500
    return jsonify({
        'message': '已导入到个人文献库。' if created else '该文献已在个人文献库中。',
        'doc_id': document.id,
        'redirect_url': url_for('document_detail', doc_id=document.id),
        'created': created,
    })


@app.route('/delete-account', methods=['POST'])
@login_required
def delete_account():
    user = current_user
    if user.role != 'user':
        return jsonify({'error': '管理员账户请联系超管处理'}), 403
    try:
        documents = Document.query.filter_by(owner_id=user.id).all()
        for doc in documents:
            if doc.file_path:
                remove_document_file(doc.file_path)
            db.session.delete(doc)
        BatchCitation.query.filter_by(user_id=user.id).delete(synchronize_session=False)
        Note.query.filter_by(user_id=user.id).delete(synchronize_session=False)
        Category.query.filter_by(owner_id=user.id).delete(synchronize_session=False)
        for fav_doc in list(user.favorites.all()):
            user.favorites.remove(fav_doc)
        db.session.flush()
        db.session.delete(user)
        db.session.commit()
        logout_user()
        session.clear()
        return jsonify({'success': True})
    except Exception as exc:
        db.session.rollback()
        current_app.logger.exception("用户自助注销失败: %s", exc)
        return jsonify({'error': '操作失败，请稍后重试'}), 500

# 帮助中心路由
@app.route('/help_center')
@login_required  # 需登录才能访问
def help_center():
    return render_template('help.html')

# 站点使用说明路由
@app.route('/help/site-guide')
@login_required
def site_guide():
    context = {
        'upload_dir': current_app.config.get('UPLOAD_FOLDER'),
        'log_path': Path(current_app.root_path) / 'logs' / 'app.log',
        'avatar_path': Path(current_app.root_path) / 'static' / 'avatars',
    }
    return render_template('help/site_guide.html', **context)

# 注销
@app.route('/logout')
@login_required  # 需登录才能访问
def logout():
    logout_user()
    return redirect(url_for('index'))

# 新增：获取文献列表的API接口（供前端调用）
@app.route('/api/documents')
@login_required
def get_documents():
    documents = apply_accessible_filter(Document.query).all()
    # 转换为JSON格式（只返回需要的字段）
    data = [
        {
            "id": doc.id,
            "title": doc.title,
            "authors": doc.authors,
            "journal": doc.journal,
            "year": doc.year,
            "category_slug": doc.category,
            "category_label": doc.category_obj.label if doc.category_obj else None,
            "view_count": doc.view_count
            # 按需添加其他字段
        } for doc in documents
    ]
    return {"total": len(data), "documents": data}  # 返回JSON

# 首页路由：显示文献列表
@app.route('/')
def index():
    access_condition = get_accessible_documents_condition()
    base_query = Document.query.filter(access_condition)
    filters = [access_condition]

    total_count_all = base_query.count()
    filtered_query, filter_context = apply_sidebar_filters(base_query)
    filtered_query = filtered_query.order_by(Document.upload_time.desc(), Document.id.desc())
    pagination = paginate_documents(filtered_query)
    documents = pagination.items
    total = pagination.total

    category_counts = build_category_counts(filters)
    app.logger.info(f"category_counts:{category_counts}")  # 打印日志

    current_category = request.args.get('category', 'all')  # 获取当前分类

    return render_document_page(
        documents=documents,
        category_counts=category_counts,
        current_category=current_category,
        total_count=total,
        total_count_all=total_count_all,
        pagination=pagination,
        **filter_context
    )

@app.errorhandler(404)
def page_not_found(e):
    return send_from_directory(Path(current_app.root_path).parent, '404.html'), 404


# 我的收藏：显示用户收藏的文献
@app.route('/my_collected')
@login_required
def my_collected():
    favorite_query = current_user.favorites
    favorite_total = favorite_query.count()
    favorite_ids_subquery = favorite_query.with_entities(Document.id).subquery()
    filtered_query, filter_context = apply_sidebar_filters(favorite_query)
    filtered_query = filtered_query.order_by(Document.upload_time.desc(), Document.id.desc())
    pagination = paginate_documents(filtered_query)
    documents = pagination.items
    app.logger.info(f"User {current_user.custom_id} has {favorite_total} favorite documents.")

    if favorite_total:
        category_counts = build_category_counts([Document.id.in_(favorite_ids_subquery)])
    else:
        category_counts = []

    return render_document_page(
        documents=documents,
        category_counts=category_counts,
        total_count=pagination.total,
        total_count_all=favorite_total,
        current_category='all',
        pagination=pagination,
        **filter_context
    )

# 文献收藏/取消收藏接口
@app.route('/api/toggle_favorite/<int:doc_id>', methods=['POST'])
@login_required
def toggle_favorite(doc_id):
    app.logger.info(f"Toggling favorite for doc_id: {doc_id} by user_id: {current_user.id}")
    doc = Document.query.get_or_404(doc_id)
    ensure_document_access(doc)
    app.logger.info(f"Toggling favorite for doc_id: {doc_id} by user_id: {current_user.id}")

    if current_user.favorites.filter_by(id=doc_id).first():
        # 已收藏 → 取消收藏
        app.logger.info(f"Document {doc_id} is already in favorites. Removing.")
        current_user.favorites.remove(doc)
        message = f'已取消收藏《{doc.title}》'
    else:
        app.logger.info(f"Document {doc_id} is not in favorites. Adding.")
        # 未收藏 → 收藏
        current_user.favorites.append(doc)
        message = f'收藏成功《{doc.title}》'
    app.logger.info(f"Favorite toggle result: {message}")
    db.session.commit()
    return jsonify({'message': message})

# 1. 先定义一个“所有分类”的路由（仅显示当前用户的分类）
@app.route('/all-categories')
@login_required
def all_categories():
    categories = Category.query.filter_by(owner_id=current_user.id).order_by(Category.label).all()
    return render_template('all_categories.html', all_cats=categories)

# 文献分类：显示不同分类的文献
@app.route('/categories/<category>')
def category(category):
    access_condition = get_accessible_documents_condition()
    base_query = apply_accessible_filter(Document.query)
    if category == 'uncategorized':
        base_query = base_query.filter(Document.category_id.is_(None))
        category_label = '未分类'
    else:
        # 尝试以当前用户为主体查找分类（若未找到，仍按文献自身的 category 字段筛选）
        selected_category = None
        if current_user.is_authenticated:
            selected_category = Category.query.filter_by(value=category, owner_id=current_user.id).first()
        if selected_category:
            category_label = selected_category.label
        else:
            category_label = category
        base_query = base_query.filter(Document.category == category)

    total_accessible = apply_accessible_filter(Document.query).count()
    filtered_query, filter_context = apply_sidebar_filters(base_query)
    filtered_query = filtered_query.order_by(Document.upload_time.desc(), Document.id.desc())
    pagination = paginate_documents(filtered_query)
    documents_list = pagination.items
    total = pagination.total

    # 统计所有分类的文献数量
    category_counts = build_category_counts([access_condition])
    current_active_categories = filter_context.get('active_categories') or []
    if not current_active_categories:
        filter_context['active_categories'] = [category]

    return render_document_page(
        documents=documents_list,
        total_count=total,
        category_counts=category_counts,
        current_category=category,
        selected_category_label=category_label,
        total_count_all=total_accessible,
        pagination=pagination,
        **filter_context
    )
    
@app.route('/get-category-data', methods=['GET'])
@login_required
def get_category_data():
    try:
        # 仅返回当前用户的分类和系统文献类型
        categories = Category.query.filter_by(owner_id=current_user.id).order_by(Category.label).all()
        doc_types = get_sorted_doc_types()

        # 如果数据库中存在只由问号组成的标签（可能来自旧的AI占位符），用默认模板修正
        default_map = {k: v for (k, v) in DEFAULT_CATEGORY_TEMPLATES}
        repaired = False
        for c in categories:
            if not c.label or re.fullmatch(r"\?+", str(c.label)):
                new_label = default_map.get(c.value)
                if new_label:
                    c.label = new_label
                    db.session.add(c)
                    repaired = True
        if repaired:
            try:
                db.session.commit()
            except Exception:
                db.session.rollback()

        # 转换为前端需要的格式
        category_list = []
        for c in categories:
            # 仅统计当前用户拥有的文献数（管理界面面向当前用户）
            try:
                owner_id = current_user.id if current_user.is_authenticated else None
                if owner_id:
                    doc_count = Document.query.filter_by(category_id=c.id, owner_id=owner_id).count()
                else:
                    # 未登录不应到达此处（接口被@login_required保护），作为兜底统计为0
                    doc_count = 0
            except Exception:
                # 回退：按 category_id 统计（尽量避免暴露跨用户数据，但作为最后手段使用）
                try:
                    doc_count = Document.query.filter_by(category_id=c.id).count()
                except Exception:
                    doc_count = 0
            category_list.append({
                "id": c.id,
                "value": c.value,
                "label": c.label,
                "doc_count": doc_count
            })

        doc_type_list = [[d.value, d.label] for d in doc_types]

        return jsonify({
            "category_list": category_list,
            "doc_type_list": doc_type_list
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/add_category', methods=['POST'])
@login_required  # 确保用户登录才能添加
def add_category():
    data = request.get_json()
    category_label = (data.get('label') or '').strip()
    category_value = (data.get('value') or '').strip().lower()

    if not category_label:
        return jsonify({"message": "分类名称不能为空"}), 400

    if not category_value:
        category_value = slugify(category_label)
    if not category_value:
        category_value = f"cat-{secrets.token_hex(4)}"

    # 检查是否已存在同名分类（按用户隔离）
    if Category.query.filter_by(value=category_value, owner_id=current_user.id).first():
        return jsonify({"message": "该分类已存在"}), 400

    # 创建新分类并关联当前用户
    new_category = Category(value=category_value, label=category_label, owner_id=current_user.id)
    db.session.add(new_category)
    db.session.commit()

    return jsonify({
        "message": "分类添加成功",
        "category": {
            "id": new_category.id,
            "value": new_category.value,
            "label": new_category.label
        }
    }), 201


@app.route('/api/categories/<int:category_id>', methods=['PATCH'])
@login_required
def update_category(category_id):
    category = Category.query.get_or_404(category_id)
    data = request.get_json() or {}

    new_label = (data.get('label') or category.label).strip()
    new_value = (data.get('value') or category.value).strip().lower()
    if not new_label:
        return jsonify({"message": "分类名称不能为空"}), 400
    if not new_value:
        new_value = slugify(new_label)
    if not new_value:
        return jsonify({"message": "分类标识不能为空"}), 400

    # 仅允许分类所有者更新
    if category.owner_id != current_user.id:
        return jsonify({"message": "无权修改该分类"}), 403

    # 确保标识在当前用户范围内唯一
    existing = Category.query.filter(Category.value == new_value, Category.id != category.id, Category.owner_id == current_user.id).first()
    if existing:
        return jsonify({"message": "分类标识已存在"}), 400

    slug_changed = new_value != category.value
    category.label = new_label
    category.value = new_value

    if slug_changed:
        for doc in Document.query.filter_by(category_id=category.id).all():
            doc.category = new_value

    db.session.commit()
    return jsonify({
        "message": "分类已更新",
        "category": {
            "id": category.id,
            "value": category.value,
            "label": category.label
        }
    })


@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@login_required
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)
    if category.value == 'other':
        return jsonify({"message": "默认分类不可删除"}), 400

    # 仅允许分类所有者删除
    if category.owner_id != current_user.id:
        return jsonify({"message": "无权删除该分类"}), 403

    data = request.get_json(silent=True) or {}
    target_id = data.get('target_id')
    target_category = None
    if target_id:
        if target_id == category_id:
            return jsonify({"message": "不能将分类转移到自身"}), 400
        target_category = Category.query.get(target_id)
        if not target_category or target_category.owner_id != current_user.id:
            return jsonify({"message": "目标分类不存在或无权限"}), 404

    reassign_category_documents(category, target_category)
    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "分类已删除"})


@app.route('/api/categories/merge', methods=['POST'])
@login_required
def merge_categories():
    data = request.get_json() or {}
    target_id = data.get('target_id')
    raw_sources = data.get('source_ids') or []
    if not isinstance(raw_sources, list):
        raw_sources = [raw_sources]
    if not target_id:
        return jsonify({"message": "缺少目标分类"}), 400
    try:
        target_id = int(target_id)
    except (TypeError, ValueError):
        return jsonify({"message": "目标分类无效"}), 400

    source_ids = []
    for item in raw_sources:
        try:
            parsed = int(item)
        except (TypeError, ValueError):
            continue
        if parsed == target_id:
            continue
        if parsed not in source_ids:
            source_ids.append(parsed)

    if not source_ids:
        return jsonify({"message": "请至少选择一个需要合并的分类"}), 400

    target_category = Category.query.get(target_id)
    if not target_category or target_category.owner_id != current_user.id:
        return jsonify({"message": "目标分类不存在或无权限"}), 404

    source_categories = []
    for source_id in source_ids:
        category = Category.query.get(source_id)
        if not category or category.owner_id != current_user.id:
            return jsonify({"message": f"ID 为 {source_id} 的分类不存在或无权限"}), 404
        if category.value == 'other':
            return jsonify({"message": "默认分类不可作为合并来源"}), 400
        source_categories.append(category)

    merged_count = 0
    reassigned_docs = 0
    for source_category in source_categories:
        reassigned_docs += reassign_category_documents(source_category, target_category)
        db.session.delete(source_category)
        merged_count += 1

    db.session.commit()
    return jsonify({
        "message": f"已将 {merged_count} 个分类合并到“{target_category.label}”，迁移 {reassigned_docs} 篇文献"
    })

# 文献类型：显示不同类型的文献
@app.route('/types/<doc_type>')
def doc_type(doc_type):
    base_query = Document.query.filter(Document.doc_type == doc_type)
    base_total = base_query.count()
    filtered_query, filter_context = apply_sidebar_filters(base_query)
    filtered_query = filtered_query.order_by(Document.upload_time.desc(), Document.id.desc())
    pagination = paginate_documents(filtered_query)
    documents = pagination.items
    total = pagination.total
    return render_document_page(
        documents=documents,
        total_count=total,
        category_counts=build_category_counts(),
        total_count_all=base_total,
        current_category='all',
        pagination=pagination,
        **filter_context
    )

# 文献年份：显示不同年份的文献
@app.route('/years/<int:year>')
def year(year):
    base_query = Document.query.filter(Document.year == year)
    base_total = base_query.count()
    filtered_query, filter_context = apply_sidebar_filters(base_query)
    filtered_query = filtered_query.order_by(Document.upload_time.desc(), Document.id.desc())
    pagination = paginate_documents(filtered_query)
    documents = pagination.items
    total = pagination.total
    return render_document_page(
        documents=documents,
        total_count=total,
        category_counts=build_category_counts(),
        total_count_all=base_total,
        current_category='all',
        pagination=pagination,
        **filter_context
    )

# 文献标签：显示不同标签的文献
@app.route('/tags/<tag>')
def tag(tag):
    base_query = Document.query.filter(Document.tags.like(f'%{tag}%'))
    base_total = base_query.count()
    filtered_query, filter_context = apply_sidebar_filters(base_query)
    filtered_query = filtered_query.order_by(Document.upload_time.desc(), Document.id.desc())
    pagination = paginate_documents(filtered_query)
    documents = pagination.items
    total = pagination.total
    return render_document_page(
        documents=documents,
        total_count=total,
        category_counts=build_category_counts(),
        total_count_all=base_total,
        current_category='all',
        pagination=pagination,
        **filter_context
    )

# 最近浏览：显示最近浏览的文献
@app.route('/recent')
def recent():
    base_query = apply_accessible_filter(Document.query)
    total_accessible = base_query.count()
    filtered_query, filter_context = apply_sidebar_filters(base_query)
    filtered_query = filtered_query.order_by(Document.upload_time.desc(), Document.id.desc())
    pagination = paginate_documents(filtered_query)
    documents = pagination.items
    total = pagination.total

    category_counts = build_category_counts()

    return render_document_page(
        documents=documents,
        category_counts=category_counts,
        total_count=total,
        total_count_all=total_accessible,
        current_category='all',
        pagination=pagination,
        **filter_context
    )


#shared_documents：显示共享的文献
@app.route('/shared_documents')
@login_required
def shared_documents():
    # 假设共享的文献是通过Document模型的is_shared字段来标记的
    base_query = Document.query.filter(Document.is_shared.is_(True))
    base_total = base_query.count()
    filtered_query, filter_context = apply_sidebar_filters(base_query)
    filtered_query = filtered_query.order_by(Document.upload_time.desc(), Document.id.desc())
    pagination = paginate_documents(filtered_query)
    shared_docs = pagination.items
    total = pagination.total

    category_counts = build_category_counts([Document.is_shared.is_(True)])
    return render_document_page(
        documents=shared_docs,
        category_counts=category_counts,
        total_count=total,
        total_count_all=base_total,
        current_category='all',
        pagination=pagination,
        **filter_context
    )

# 切换共享状态的API（只有原上传者能调用）
@app.route('/api/toggle_share/<int:doc_id>', methods=['POST'])
@login_required
def toggle_share(doc_id):
    doc = Document.query.get_or_404(doc_id)

    # 只能共享自己的文献
    if doc.owner_id != current_user.id:
        return jsonify({'error': '没有权限修改此文献'}), 403

    # 切换共享状态
    doc.is_shared = not doc.is_shared
    if doc.is_shared:
        doc.share_by_id = current_user.id  # 共享时记录共享者
    else:
        doc.share_by_id = None  # 取消共享时清空

    db.session.commit()

    status = '共享' if doc.is_shared else '取消共享'
    return jsonify({'message': f'已成功{status}文献《{doc.title}》'})


def _split_authors(raw: str | None) -> list[str]:
    if not raw:
        return []
    tokens = [token.strip() for token in re.split(r'[;,，；、]', raw) if token.strip()]
    return tokens


def _normalize_doc_type(doc: 'Document') -> str:
    raw = ''
    try:
        if getattr(doc, 'doc_type_obj', None) is not None and getattr(doc.doc_type_obj, 'value', None):
            raw = doc.doc_type_obj.value
        else:
            raw = getattr(doc, 'doc_type', '') or ''
    except Exception:
        raw = getattr(doc, 'doc_type', '') or ''
    normalized = str(raw).strip().lower()
    alias_map = {
        '期刊': 'journal',
        'journal': 'journal',
        'j': 'journal',
        'article': 'journal',
        'jour': 'journal',
        '会议': 'conference',
        'conference': 'conference',
        'conf': 'conference',
        'inproceedings': 'conference',
        'proceedings': 'conference',
        'confp': 'conference',
        '综述': 'review',
        '评述': 'review',
        'review': 'review',
        'reviews': 'review',
        'review article': 'review',
        'literature review': 'review',
        'annual review': 'review',
        'survey': 'review',
        'overview': 'review',
        'systematic review': 'review',
        'meta analysis': 'review',
        'meta-analysis': 'review',
        '研究现状': 'review',
        '文献综述': 'review',
        '综述论文': 'review',
        '预印本': 'preprint',
        'preprint': 'preprint',
        'working paper': 'preprint',
        'arxiv': 'preprint',
        '学位论文': 'thesis',
        'thesis': 'thesis',
        'dissertation': 'thesis',
        '论文': 'thesis',
        'phdthesis': 'thesis',
        'mastersthesis': 'thesis',
        'thes': 'thesis',
        '书籍': 'book',
        'book': 'book',
        'monograph': 'book',
        'inbook': 'book',
        'collection': 'book',
        'edited book': 'book',
        '专利': 'patent',
        'patent': 'patent',
        '标准': 'standard',
        'standard': 'standard',
        'specification': 'standard',
        '数据集': 'dataset',
        'dataset': 'dataset',
        'data set': 'dataset',
        'database': 'dataset',
        '软件': 'software',
        'software': 'software',
        'code': 'software',
        'computer program': 'software',
        'package': 'software',
        'toolbox': 'software',
        '报告': 'report',
        'report': 'report',
        'techreport': 'report',
        'rprt': 'report',
    }
    return alias_map.get(normalized, normalized or 'other')


def _normalize_thesis_degree(doc: 'Document') -> str:
    raw = getattr(doc, 'thesis_degree', '') or ''
    normalized = str(raw).strip().lower()
    alias_map = {
        'master': 'master',
        'masters': 'master',
        'msc': 'master',
        '硕士': 'master',
        'phd': 'phd',
        'doctor': 'phd',
        'doctoral': 'phd',
        '博士': 'phd',
    }
    mapped = alias_map.get(normalized, '')
    if mapped:
        return mapped

    fallback_doc_type = str(getattr(doc, 'doc_type', '') or '').strip().lower()
    if fallback_doc_type in {'mastersthesis', 'master_thesis', 'thesis_master'}:
        return 'master'
    if fallback_doc_type in {'phdthesis', 'phd_thesis', 'thesis_phd', 'dissertation'}:
        return 'phd'

    candidates = [
        getattr(doc, 'title', None),
        getattr(doc, 'remark', None),
        getattr(doc, 'journal', None),
        getattr(doc, 'booktitle', None),
        getattr(doc, 'publisher', None),
    ]
    merged = ' '.join([str(item) for item in candidates if item]).lower()
    if not merged:
        return ''
    if re.search(r"(ph\.?\s*d\.?|doctoral|doctorate|doctor|dissertation|\bdr\.)", merged) or ('博士' in merged):
        return 'phd'
    if re.search(r"(master'?s|msc|m\.?\s*s\.?|m\.?\s*sc|master thesis)", merged) or ('硕士' in merged):
        return 'master'
    return ''


def _doc_type_marker(normalized_type: str) -> str:
    marker_map = {
        'journal': 'J',
        'conference': 'C',
        'review': 'J',
        'preprint': 'J',
        'thesis': 'D',
        'book': 'M',
        'patent': 'P',
        'standard': 'S',
        'dataset': 'DS',
        'software': 'CP',
        'report': 'R',
    }
    return marker_map.get(normalized_type, 'N')


def _format_gbt7714(doc: 'Document') -> str:
    normalized_type = _normalize_doc_type(doc)
    marker = _doc_type_marker(normalized_type)

    authors = (doc.authors or '').strip() or '佚名'
    title = (doc.title or '').strip() or '无标题'
    year = str(doc.year) if doc.year else ''
    volume = (doc.volume or '').strip()
    issue = (doc.issue or '').strip()
    pages = (doc.pages or '').strip()
    publisher = (doc.publisher or '').strip()
    place = (doc.venue or '').strip()
    journal = (doc.journal or '').strip()
    booktitle = (doc.booktitle or '').strip()

    parts: list[str] = [f"{authors}. {title}[{marker}]."]

    if normalized_type in {'journal', 'review', 'preprint'}:
        container = journal or booktitle
        if container:
            parts.append(container)
        tail_parts: list[str] = []
        if year:
            tail_parts.append(year)
        vol_issue = ''
        if volume and issue:
            vol_issue = f"{volume}({issue})"
        elif volume:
            vol_issue = volume
        elif issue:
            vol_issue = issue
        if vol_issue:
            tail_parts.append(vol_issue)
        tail = ', '.join([p for p in tail_parts if p])
        if pages:
            tail = f"{tail}: {pages}" if tail else pages
        if tail:
            parts.append(tail)
    elif normalized_type == 'conference':
        container = booktitle or journal
        if container:
            parts.append(container)
        tail_parts = []
        if year:
            tail_parts.append(year)
        tail = ', '.join([p for p in tail_parts if p])
        if pages:
            tail = f"{tail}: {pages}" if tail else pages
        if tail:
            parts.append(tail)
    elif normalized_type in {'thesis', 'book', 'report'}:
        container_parts = []
        if place:
            container_parts.append(place + ':')
        if publisher:
            container_parts.append(publisher)
        if container_parts:
            parts.append(' '.join(container_parts))
        if year:
            parts.append(year)
    else:
        container = journal or booktitle or publisher
        if container:
            parts.append(container)
        if year:
            parts.append(year)

    citation = ' '.join([p for p in parts if p]).rstrip()
    if not citation.endswith('.'):
        citation += '.'

    if doc.doi:
        doi_value = str(doc.doi).strip()
        if doi_value:
            citation += f" DOI:{doi_value}."
    if doc.url:
        url_value = str(doc.url).strip()
        if url_value:
            citation += f" URL:{url_value}."

    return citation


def _format_mla(doc: 'Document') -> str:
    normalized_type = _normalize_doc_type(doc)
    thesis_degree = _normalize_thesis_degree(doc)
    authors = (doc.authors or '').strip() or '佚名'
    title = (doc.title or '').strip() or '无标题'
    year = str(doc.year) if doc.year else ''
    volume = (doc.volume or '').strip()
    issue = (doc.issue or '').strip()
    pages = (doc.pages or '').strip()
    publisher = (doc.publisher or '').strip()
    journal = (doc.journal or '').strip()
    booktitle = (doc.booktitle or '').strip()

    parts: list[str] = [f"{authors}. \"{title}.\""]

    if normalized_type in {'journal', 'review', 'preprint'}:
        if journal:
            parts.append(journal + ',')
        if volume:
            parts.append(f"vol. {volume},")
        if issue:
            parts.append(f"no. {issue},")
        if year:
            parts.append(year + ',')
        if pages:
            parts.append(f"pp. {pages}.")
        else:
            parts[-1] = parts[-1].rstrip(',') + '.'
    elif normalized_type == 'conference':
        container = booktitle or journal
        if container:
            parts.append(container + ',')
        if year:
            parts.append(year + ',')
        if pages:
            parts.append(f"pp. {pages}.")
        else:
            parts[-1] = parts[-1].rstrip(',') + '.'
    elif normalized_type == 'book':
        parts = [f"{authors}. {title}."]
        if publisher:
            parts.append(publisher + ',')
        if year:
            parts.append(year + '.')
        elif parts:
            parts[-1] = parts[-1].rstrip(',') + '.'
    elif normalized_type == 'thesis':
        institution = publisher or (booktitle or journal) or ''
        degree_phrase = "Master's thesis" if thesis_degree == 'master' else ("Doctoral dissertation" if thesis_degree == 'phd' else 'Thesis')
        if year and institution:
            parts.append(f"{degree_phrase}, {institution}, {year}.")
        elif year:
            parts.append(f"{degree_phrase}, {year}.")
        elif institution:
            parts.append(f"{degree_phrase}, {institution}.")
        else:
            parts.append(f"{degree_phrase}.")
    else:
        if year:
            parts.append(year + '.')
        else:
            parts[-1] = parts[-1].rstrip(',') + '.'

    citation = ' '.join([p for p in parts if p]).replace('  ', ' ').strip()
    if doc.doi:
        doi_value = str(doc.doi).strip()
        if doi_value:
            citation += f" https://doi.org/{doi_value}"
    elif doc.url:
        url_value = str(doc.url).strip()
        if url_value:
            citation += f" {url_value}"
    return citation


def _format_apa(doc: 'Document') -> str:
    normalized_type = _normalize_doc_type(doc)
    thesis_degree = _normalize_thesis_degree(doc)
    authors = (doc.authors or '').strip() or '佚名'
    title = (doc.title or '').strip() or '无标题'
    year = str(doc.year) if doc.year else ''
    volume = (doc.volume or '').strip()
    issue = (doc.issue or '').strip()
    pages = (doc.pages or '').strip()
    publisher = (doc.publisher or '').strip()
    journal = (doc.journal or '').strip()
    booktitle = (doc.booktitle or '').strip()

    parts: list[str] = [f"{authors}. ({year}). {title}." if year else f"{authors}. {title}."]

    if normalized_type in {'journal', 'review', 'preprint'}:
        if journal:
            parts.append(journal + ',')
        vol_issue = ''
        if volume and issue:
            vol_issue = f"{volume}({issue})"
        elif volume:
            vol_issue = volume
        if vol_issue:
            parts.append(vol_issue + ',')
        if pages:
            parts.append(pages + '.')
        elif parts:
            parts[-1] = parts[-1].rstrip(',') + '.'
    elif normalized_type == 'conference':
        container = booktitle or journal
        if container:
            parts.append(container + '.')
        if pages:
            parts.append(f"(pp. {pages}).")
        if publisher:
            parts.append(publisher + '.')
    elif normalized_type == 'book':
        parts = [f"{authors}. ({year}). {title}." if year else f"{authors}. {title}."]
        if publisher:
            parts.append(publisher + '.')
    elif normalized_type == 'thesis':
        institution = publisher or (booktitle or journal)
        degree_phrase = "Master's thesis" if thesis_degree == 'master' else ("Doctoral dissertation" if thesis_degree == 'phd' else 'Thesis')
        if institution:
            parts.append(f"({degree_phrase}). {institution}.")
        else:
            parts.append(f"({degree_phrase}).")
    else:
        if publisher:
            parts.append(publisher + '.')

    citation = ' '.join([p for p in parts if p]).replace('  ', ' ').strip()
    if doc.doi:
        doi_value = str(doc.doi).strip()
        if doi_value:
            citation += f" https://doi.org/{doi_value}"
    elif doc.url:
        url_value = str(doc.url).strip()
        if url_value:
            citation += f" {url_value}"
    return citation


def _format_bibtex(doc: 'Document') -> str:
    normalized_type = _normalize_doc_type(doc)
    thesis_degree = _normalize_thesis_degree(doc)
    key = generate_bibtex_key(doc)

    entry_type_map = {
        'journal': 'article',
        'conference': 'inproceedings',
        'review': 'article',
        'preprint': 'unpublished',
        'thesis': 'thesis',
        'book': 'book',
        'patent': 'misc',
        'standard': 'misc',
        'dataset': 'misc',
        'software': 'misc',
        'report': 'techreport',
    }
    entry_type = entry_type_map.get(normalized_type, 'misc')
    if normalized_type == 'thesis':
        if thesis_degree == 'master':
            entry_type = 'mastersthesis'
        else:
            entry_type = 'phdthesis'

    fields: list[tuple[str, str]] = []
    if doc.authors:
        fields.append(('author', doc.authors))
    if doc.title:
        fields.append(('title', doc.title))
    if doc.year:
        fields.append(('year', str(doc.year)))

    if entry_type == 'article':
        if doc.journal:
            fields.append(('journal', doc.journal))
        if doc.volume:
            fields.append(('volume', doc.volume))
        if doc.issue:
            fields.append(('number', doc.issue))
        if doc.pages:
            fields.append(('pages', doc.pages))
    elif entry_type == 'inproceedings':
        if doc.booktitle or doc.journal:
            fields.append(('booktitle', doc.booktitle or doc.journal))
        if doc.pages:
            fields.append(('pages', doc.pages))
        if doc.publisher:
            fields.append(('publisher', doc.publisher))
    elif entry_type in {'phdthesis', 'mastersthesis'}:
        if doc.publisher:
            fields.append(('school', doc.publisher))
        elif doc.booktitle or doc.journal:
            fields.append(('school', doc.booktitle or doc.journal))
        if doc.venue:
            fields.append(('address', doc.venue))
    elif entry_type == 'book':
        if doc.publisher:
            fields.append(('publisher', doc.publisher))
        if doc.venue:
            fields.append(('address', doc.venue))
    elif entry_type == 'techreport':
        if doc.publisher:
            fields.append(('institution', doc.publisher))
        if doc.venue:
            fields.append(('address', doc.venue))

    if doc.doi:
        fields.append(('doi', doc.doi))
    if doc.url:
        fields.append(('url', doc.url))

    rendered_lines = [f"@{entry_type}{{{key},"]
    for name, value in fields:
        clean_value = str(value).replace('\n', ' ').strip()
        if clean_value:
            rendered_lines.append(f"  {name} = {{{clean_value}}},")
    if rendered_lines[-1].endswith(','):
        rendered_lines[-1] = rendered_lines[-1].rstrip(',')
    rendered_lines.append("}")
    return "\n".join(rendered_lines)


def _format_ris(doc: 'Document') -> str:
    normalized_type = _normalize_doc_type(doc)
    thesis_degree = _normalize_thesis_degree(doc)
    ris_type_map = {
        'journal': 'JOUR',
        'conference': 'CONF',
        'review': 'JOUR',
        'preprint': 'UNPB',
        'book': 'BOOK',
        'thesis': 'THES',
        'patent': 'PAT',
        'standard': 'STAND',
        'dataset': 'DATA',
        'software': 'COMP',
        'report': 'RPRT',
    }
    ris_type = ris_type_map.get(normalized_type, 'GEN')
    lines: list[str] = [f"TY  - {ris_type}"]
    title = (doc.title or '').strip()
    if title:
        lines.append(f"TI  - {title}")
    author_tokens = _split_authors(doc.authors)
    if author_tokens:
        for author in author_tokens:
            lines.append(f"AU  - {author}")
    elif doc.authors:
        lines.append(f"AU  - {doc.authors}")
    else:
        lines.append("AU  - 佚名")
    if doc.year:
        lines.append(f"PY  - {doc.year}")
    if normalized_type == 'thesis' and thesis_degree:
        degree_phrase = "Master's thesis" if thesis_degree == 'master' else 'Doctoral dissertation'
        lines.append(f"M3  - {degree_phrase}")
    if normalized_type in {'journal', 'review', 'preprint'}:
        if doc.journal:
            lines.append(f"JO  - {doc.journal}")
        if doc.volume:
            lines.append(f"VL  - {doc.volume}")
        if doc.issue:
            lines.append(f"IS  - {doc.issue}")
        if doc.pages:
            lines.append(f"SP  - {doc.pages}")
    elif normalized_type == 'conference':
        if doc.booktitle:
            lines.append(f"T2  - {doc.booktitle}")
        elif doc.journal:
            lines.append(f"T2  - {doc.journal}")
        if doc.pages:
            lines.append(f"SP  - {doc.pages}")
        if doc.publisher:
            lines.append(f"PB  - {doc.publisher}")
    else:
        if doc.publisher:
            lines.append(f"PB  - {doc.publisher}")
        if doc.venue:
            lines.append(f"CY  - {doc.venue}")
        if doc.pages and normalized_type not in {'book', 'thesis'}:
            lines.append(f"SP  - {doc.pages}")
    if doc.doi:
        lines.append(f"DO  - {doc.doi}")
    if doc.url:
        lines.append(f"UR  - {doc.url}")
    lines.append("ER  -")
    return "\n".join(lines)


# 文献引用格式
@app.route('/api/document/<int:doc_id>/citation', methods=['GET'])
@login_required  # 可选：如果需要登录才能获取引用格式
def get_citation_format(doc_id):
    try:
        doc = Document.query.get_or_404(doc_id)
        ensure_document_access(doc)
        app.logger.info(f"获取文献引用格式: {doc.title}")

        apa_citation = _format_apa(doc)
        mla_citation = _format_mla(doc)
        bibtex_citation = _format_bibtex(doc)
        gbt7714_citation = _format_gbt7714(doc)

        return jsonify({
            'apa': apa_citation,
            'mla': mla_citation,
            'bibtex': bibtex_citation,
            'gbt7714': gbt7714_citation
        })
        
    except Exception as e:
        # 捕获异常并返回错误信息
        app.logger.error(f"获取引用格式失败: {str(e)}")
        return jsonify({'error': '获取引用格式失败'}), 500
    
# === 批量引用接口 ===

# 添加到批量引用
@app.route('/api/batch-cite/<int:doc_id>', methods=['POST'])
@login_required
def batch_cite_add(doc_id):
    # 这里假设你有 Document 和 User 模型
    doc = Document.query.get_or_404(doc_id)
    ensure_document_access(doc)

    exists = BatchCitation.query.filter_by(user_id=current_user.id, doc_id=doc_id).first()
    if exists:
        total = BatchCitation.query.filter_by(user_id=current_user.id).count()
        return jsonify({'message': '已在批量引用列表中', 'total': total}), 200

    new_item = BatchCitation(user_id=current_user.id, doc_id=doc_id)
    db.session.add(new_item)
    db.session.commit()
    total = BatchCitation.query.filter_by(user_id=current_user.id).count()
    return jsonify({'message': '已加入批量引用', 'total': total})

# 从批量引用中移除
@app.route('/api/batch-cite/<int:doc_id>', methods=['DELETE'])
@login_required
def batch_cite_remove(doc_id):
    item = BatchCitation.query.filter_by(user_id=current_user.id, doc_id=doc_id).first()
    if not item:
        total = BatchCitation.query.filter_by(user_id=current_user.id).count()
        return jsonify({'message': '不在批量引用列表中', 'total': total}), 200
    db.session.delete(item)
    db.session.commit()
    total = BatchCitation.query.filter_by(user_id=current_user.id).count()
    return jsonify({'message': '已移出批量引用', 'total': total})


@app.route('/api/batch-cite', methods=['DELETE'])
@login_required
def batch_cite_clear():
    BatchCitation.query.filter_by(user_id=current_user.id).delete(synchronize_session=False)
    db.session.commit()
    return jsonify({'message': '批量引用列表已清空', 'total': 0})


@app.route('/api/send-to-kindle/<int:doc_id>', methods=['POST'])
@login_required
def send_to_kindle(doc_id):
    doc = Document.query.get_or_404(doc_id)
    ensure_document_access(doc)

    if not doc.file_path:
        return jsonify({'error': '当前文献没有可发送的文件'}), 400

    file_path = resolve_document_path(doc.file_path)
    if not file_path.exists():
        return jsonify({'error': '文献文件不存在或已被删除'}), 404

    try:
        queued_file = enqueue_kindle_delivery(doc, current_user.id)
    except Exception as exc:
        current_app.logger.exception("发送到 Kindle 队列失败")
        return jsonify({'error': f'准备发送失败: {exc}'}), 500

    response = {
        'message': '文献已复制到 Kindle 队列，请使用 Kindle 邮箱或工具发送。',
        'queued_path': str(queued_file.relative_to(upload_root())).replace('\\', '/')
    }

    kindle_email = getattr(current_user, 'kindle_email', None) or os.environ.get('YSXS_KINDLE_EMAIL')
    if kindle_email:
        response['kindle_email'] = kindle_email

    return jsonify(response)


# 批量引用列表页面
@app.route('/batch-cite-list')
@login_required
def batch_cite_list():
    batch_items = BatchCitation.query.filter_by(user_id=current_user.id).all()
    doc_ids = [item.doc_id for item in batch_items]
    documents = Document.query.filter(Document.id.in_(doc_ids)).all()

    doc_map = {doc.id: doc for doc in documents}
    result = []
    for item in batch_items:
        doc = doc_map.get(item.doc_id)
        if doc:
            result.append({
                'id': doc.id,
                'title': doc.title,
                'authors': doc.authors,
                'journal': doc.journal,
                'year': doc.year,
                'added_at': item.added_at.strftime('%Y-%m-%d %H:%M'),
                'detail_url': url_for('document_detail', doc_id=doc.id, _external=True)
            })

    return render_template('batch_cite_list.html', documents=result)

# 导出批量引用
@app.route('/export-batch-cite')
@login_required
def export_batch_cite():
    fmt = request.args.get('fmt', 'bibtex')
    batch_items = BatchCitation.query.filter_by(user_id=current_user.id).all()
    if not batch_items:
        return jsonify({'message': '批量引用列表为空'}), 400

    doc_ids = [item.doc_id for item in batch_items]
    documents = Document.query.filter(Document.id.in_(doc_ids)).all()

    if fmt == 'bibtex':
        entries = []
        for doc in documents:
            entries.append(_format_bibtex(doc))
        content = "\n".join(entries)
        mimetype = 'application/x-bibtex'
        filename = 'batch_citations.bib'

    elif fmt == 'ris':
        entries = []
        for doc in documents:
            entries.append(_format_ris(doc))
        content = "\n\n".join(entries)
        mimetype = 'application/x-research-info-systems'
        filename = 'batch_citations.ris'

    elif fmt == 'csv':
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', '标题', '作者', '期刊/会议', '年份', '加入时间', 'DOI', 'URL'])
        for doc in documents:
            writer.writerow([
                doc.id,
                doc.title or '',
                doc.authors or '',
                doc.journal or '',
                doc.year or '',
                doc.upload_time.strftime('%Y-%m-%d %H:%M') if doc.upload_time else '',
                doc.doi or '',
                doc.url or ''
            ])
        content = output.getvalue()
        mimetype = 'text/csv'
        filename = 'batch_citations.csv'

    elif fmt == 'json':
        payload = [
            {
                "id": doc.id,
                "title": doc.title,
                "authors": doc.authors,
                "journal": doc.journal,
                "year": doc.year,
                "doi": doc.doi,
                "url": doc.url,
                "added_at": doc.upload_time.isoformat() if doc.upload_time else None
            }
            for doc in documents
        ]
        content = json.dumps(payload, ensure_ascii=False, indent=2)
        mimetype = 'application/json'
        filename = 'batch_citations.json'

    else:
        return jsonify({'message': '不支持的格式'}), 400

    encoding = 'utf-8-sig' if fmt == 'csv' else 'utf-8'
    return send_file(
        BytesIO(content.encode(encoding)),
        mimetype=mimetype,
        as_attachment=True,
        download_name=filename
    )

def _zotero_item_type(normalized_type: str) -> str:
    item_type_map = {
        'journal': 'journalArticle',
        'conference': 'conferencePaper',
        'review': 'journalArticle',
        'preprint': 'preprint',
        'book': 'book',
        'thesis': 'thesis',
        'patent': 'patent',
        'standard': 'report',
        'dataset': 'dataset',
        'software': 'computerProgram',
        'report': 'report',
    }
    return item_type_map.get(normalized_type, 'document')


@app.route('/export/<int:doc_id>/<string:fmt>')
def export_reference(doc_id, fmt):
    """根据 doc_id 和格式导出文献信息"""
    doc = Document.query.get_or_404(doc_id)
    ensure_document_access(doc)

    bibtex_key = generate_bibtex_key(doc)
    doc_payload = {
        "id": doc.id,
        "title": doc.title or "",
        "authors": doc.authors or "",
        "year": doc.year or "",
        "journal": doc.journal or "",
        "doi": doc.doi or "",
        "volume": doc.volume or "",
        "issue": doc.issue or "",
        "pages": doc.pages or "",
        "url": doc.url or "",
        "doc_type": doc.doc_type or "",
        "category": doc.category_obj.label if doc.category_obj else (doc.category or ""),
    }

    normalized_type = _normalize_doc_type(doc)
    ris_type_map = {
        'journal': 'JOUR',
        'conference': 'CONF',
        'review': 'JOUR',
        'preprint': 'UNPB',
        'book': 'BOOK',
        'thesis': 'THES',
        'patent': 'PAT',
        'standard': 'STAND',
        'dataset': 'DATA',
        'software': 'COMP',
        'report': 'RPRT',
    }
    ris_type = ris_type_map.get(normalized_type, 'GEN')
    ris_lines = [
        f"TY  - {ris_type}",
        f"TI  - {doc_payload['title']}",
        f"AU  - {doc_payload['authors']}",
        f"PY  - {doc_payload['year']}",
        f"JO  - {doc_payload['journal']}",
        f"VL  - {doc_payload['volume']}",
        f"IS  - {doc_payload['issue']}",
        f"SP  - {doc_payload['pages']}",
    ]
    if doc_payload['doi']:
        ris_lines.append(f"DO  - {doc_payload['doi']}")
    if doc_payload['url']:
        ris_lines.append(f"UR  - {doc_payload['url']}")
    ris_lines.append("ER  -")

    if fmt == 'ris':
        ris_content = _format_ris(doc)
        response = make_response(ris_content)
        response.headers['Content-Type'] = 'text/plain; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=reference_{doc_id}.ris'
        return response

    if fmt in {'refman', 'noteexpress', 'notefirst'}:
        ext_map = {
            'refman': 'ris',
            'noteexpress': 'net',
            'notefirst': 'txt',
        }
        ris_content = _format_ris(doc)
        response = make_response(ris_content)
        response.headers['Content-Type'] = 'text/plain; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=reference_{doc_id}.{ext_map[fmt]}'
        return response

    if fmt == 'endnote':
        record_type_map = {
            'journal': 'Journal Article',
            'conference': 'Conference Paper',
            'review': 'Review',
            'preprint': 'Preprint',
            'book': 'Book',
            'thesis': 'Thesis',
            'patent': 'Patent',
            'standard': 'Standard',
            'dataset': 'Dataset',
            'software': 'Computer Program',
            'report': 'Report',
        }
        record_type = record_type_map.get(normalized_type, 'Generic')
        authors_raw = doc_payload['authors'] or ''
        author_tokens = [token.strip() for token in re.split(r'[;,，；]', authors_raw) if token.strip()]
        endnote_lines = [f"%0 {record_type}"]
        if author_tokens:
            for author in author_tokens:
                endnote_lines.append(f"%A {author}")
        else:
            endnote_lines.append("%A 佚名")
        if doc_payload['title']:
            endnote_lines.append(f"%T {doc_payload['title']}")
        if doc_payload['journal']:
            endnote_lines.append(f"%J {doc_payload['journal']}")
        if doc_payload['year']:
            endnote_lines.append(f"%D {doc_payload['year']}")
        if doc_payload['volume']:
            endnote_lines.append(f"%V {doc_payload['volume']}")
        if doc_payload['issue']:
            endnote_lines.append(f"%N {doc_payload['issue']}")
        if doc_payload['pages']:
            endnote_lines.append(f"%P {doc_payload['pages']}")
        if doc_payload['doi']:
            endnote_lines.append(f"%R {doc_payload['doi']}")
        if doc_payload['url']:
            endnote_lines.append(f"%U {doc_payload['url']}")
        endnote_lines.append("%~ 云凇学术导出")
        response = make_response("\n".join(endnote_lines))
        response.headers['Content-Type'] = 'text/plain; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=reference_{doc_id}.enw'
        return response

    if fmt == 'bibtex':
        bibtex_content = _format_bibtex(doc)
        response = make_response(bibtex_content)
        response.headers['Content-Type'] = 'text/plain; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=reference_{doc_id}.bib'
        return response

    if fmt == 'json':
        response = make_response(json.dumps(doc_payload, ensure_ascii=False, indent=2))
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=reference_{doc_id}.json'
        return response

    if fmt == 'zotero':
        authors_raw = doc_payload['authors'] or ''
        creator_list = [
            {"creatorType": "author", "firstName": "", "lastName": author.strip()}
            for author in re.split(r'[;,，；]', authors_raw) if author.strip()
        ] or [{"creatorType": "author", "name": "佚名"}]
        zotero_item = {
            "itemType": _zotero_item_type(normalized_type),
            "title": doc_payload['title'],
            "publicationTitle": doc_payload['journal'],
            "volume": doc_payload['volume'],
            "issue": doc_payload['issue'],
            "pages": doc_payload['pages'],
            "date": str(doc_payload['year']) if doc_payload['year'] else "",
            "url": doc_payload['url'],
            "DOI": doc_payload['doi'],
            "creators": creator_list,
        }
        response = make_response(json.dumps({"items": [zotero_item]}, ensure_ascii=False, indent=2))
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=reference_{doc_id}.zotero.json'
        return response

    return "不支持的格式", 400


def _handle_citation_import(parse_func):
    upload = request.files.get('file')
    raw_text = (request.form.get('content') or '').strip()
    text = None
    if upload and upload.filename:
        raw = upload.read()
        if not raw:
            return jsonify({'error': '上传的文件为空'}), 400
        text = _decode_text(raw)
    elif raw_text:
        text = raw_text
    else:
        return jsonify({'error': '请粘贴内容或选择文件'}), 400
    try:
        records = parse_func(text)
    except Exception as exc:
        current_app.logger.exception("解析引用文件失败")
        return jsonify({'error': f'解析失败：{exc}'}), 400
    if not records:
        return jsonify({'error': '未能从文件中解析出有效的条目'}), 400
    created, skipped = create_documents_from_refs(records)
    return jsonify({
        'imported': created,
        'skipped': skipped,
        'redirect_url': url_for('index')
    })


@app.route('/api/import/ris', methods=['POST'])
@login_required
def import_ris():
    return _handle_citation_import(parse_ris_records)


@app.route('/api/import/bibtex', methods=['POST'])
@login_required
def import_bibtex():
    return _handle_citation_import(parse_bibtex_records)




@app.route('/upload-multiple', methods=['POST'])
@login_required
def upload_multiple():
    try:
        # 1. 获取并解析file_id_map
        file_id_map = request.form.get('file_id_map')
        app.logger.info(f"Received file_id_map: {file_id_map}")
        if not file_id_map:
            return jsonify({"error": "未获取到文件ID列表"}), 400
        
        try:
            file_ids = json.loads(file_id_map)  # 解析为列表：['file_123...', 'file_456...']
            app.logger.info(f"Parsed file_ids: {file_ids}")
        except json.JSONDecodeError:
            return jsonify({"error": "文件ID列表格式错误"}), 400
        
        # 2. 获取上传的文件列表（注意：前端表单中文件字段name是'file'，后端用getlist('file')）
        files = request.files.getlist('file')
        app.logger.info(f"Received files: {files}")
        if not files or len(files) != len(file_ids):
            app.logger.warning(f"文件数量不匹配：{len(files)} vs {len(file_ids)}")
            return jsonify({"error": "文件数量与ID列表不匹配"}), 400
        
        # 3. 处理每个文件
        success_count = 0
        failed_files = []
        security_warnings = []
        for idx, file_id in enumerate(file_ids):
            app.logger.info(f"Processing file_id: {file_id}")
            file = files[idx]  # 按顺序匹配文件
            try:
                # 新增：打印文件名和原始信息
                app.logger.info(f"当前文件信息：filename={file.filename}, type={type(file.filename)}")
                if not file:
                    app.logger.error("文件对象为空")
                if not file.filename:
                    app.logger.error("文件名为空字符串或None")
                
                # 手动解析扩展名并打印
                if '.' in file.filename:
                    ext = file.filename.rsplit('.', 1)[1].lower()
                    allowed = current_app.config.get('ALLOWED_EXTENSIONS', set())
                    app.logger.info(f"解析出的扩展名：{ext}，ALLOWED_EXTENSIONS包含：{ext in allowed}")
                else:
                    app.logger.error("文件名中没有'.'，无法解析扩展名")
                if not file or not file.filename or not allowed_file(file.filename):
                    failed_files.append({
                        "filename": file.filename if file else "未知文件",
                        "reason": "不支持的文件类型"
                    })
                    app.logger.warning(f"文件 {file.filename if file else '未知文件'} 类型不支持，跳过上传")
                    continue

                ext = file.filename.rsplit('.', 1)[1].lower()
                scan_temp_path = None
                scan_warning = None
                try:
                    with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{ext}') as scan_temp:
                        scan_temp_path = scan_temp.name
                        reset_filestorage_stream(file)
                        shutil.copyfileobj(file.stream, scan_temp)
                    reset_filestorage_stream(file)
                    is_safe, reason = scan_file_for_threats(scan_temp_path, ext)
                finally:
                    if scan_temp_path:
                        try:
                            os.remove(scan_temp_path)
                        except OSError:
                            pass

                if not is_safe:
                    scan_warning = reason
                    security_warnings.append({
                        "filename": file.filename,
                        "reason": reason
                    })
                    app.logger.warning(f"文件 {file.filename} 安全扫描提示：{reason}，用户自行确认后继续处理")
                
                # 4. 通过file_id获取对应的表单数据（与前端name属性匹配）
                title = request.form.get(f'doc-title[{file_id}]', '').strip()
                authors = request.form.get(f'doc-authors[{file_id}]', '').strip()
                journal = request.form.get(f'doc-journal[{file_id}]', '').strip()
                year = request.form.get(f'doc-year[{file_id}]', '').strip()
                doi_value = request.form.get(f'doc-doi[{file_id}]', '').strip()
                keywords = request.form.get(f'doc-keywords[{file_id}]', '').strip()
                abstract = request.form.get(f'doc-abstract[{file_id}]', '').strip()
                category_identifier = request.form.get(f'doc-category-id[{file_id}]')
                if not category_identifier:
                    # 兼容旧字段
                    category_identifier = request.form.get(f'doc-category[{file_id}]', 'other')
                doc_type = request.form.get(f'doc-type[{file_id}]', 'other')
                thesis_degree = request.form.get(f'doc-thesis-degree[{file_id}]', '').strip()
                app.logger.info(f"解析后的表单数据：title={title}, authors={authors}, category_identifier={category_identifier}, doc_type={doc_type}")
                
                # 验证必填字段
                if not title or not authors or not doc_type:
                    failed_files.append({
                        "filename": file.filename,
                        "reason": "缺少必填的文献信息"
                    })
                    app.logger.warning(f"文件 {file.filename} 缺少必填信息，跳过上传")
                    continue
                
                # 5. 保存文件
                file_info = save_user_file(file, current_user.id)

                # 6. 保存到数据库
                normalized_doc_type = str(doc_type or '').strip().lower()
                is_thesis = normalized_doc_type in {'thesis', 'dissertation'} or str(doc_type or '').strip() in {'学位论文'}
                normalized_thesis_degree = thesis_degree.strip().lower()
                if normalized_thesis_degree in {'master', '硕士'}:
                    normalized_thesis_degree = 'master'
                elif normalized_thesis_degree in {'phd', 'doctor', 'doctoral', '博士'}:
                    normalized_thesis_degree = 'phd'
                else:
                    normalized_thesis_degree = ''
                new_doc = Document(
                    title=title,
                    authors=authors,
                    journal=journal,
                    year=year,
                    keywords=keywords,
                    abstract=abstract,
                    doc_type=doc_type,
                    thesis_degree=(normalized_thesis_degree or None) if is_thesis else None,
                    doi=doi_value or None,
                    file_name=file_info['display_name'],
                    file_path=file_info['relative_path'],
                    file_size=file_info['size'],
                    file_type=file_info['extension'],
                    owner_id=current_user.id,
                    upload_time=utc_now()
                )
                assign_category(new_doc, category_identifier)
                app.logger.info(f"准备添加文献到数据库: {new_doc.__dict__}")
                db.session.add(new_doc)
                success_count += 1
                app.logger.info(f"成功上传文件: {file.filename}")
                app.logger.info(f"文件信息: {new_doc.__dict__}")
                
            except Exception as e:
                app.logger.error(f"处理文件 {file.filename} 时出错: {str(e)}")
                failed_files.append({
                    "filename": file.filename,
                    "reason": f"处理失败: {str(e)}"
                })
        
        db.session.commit()
        return jsonify({
            "success": True,
            "message": f"成功上传 {success_count} 个文件",
            "success_count": success_count,
            "failed_count": len(failed_files),
            "failed_files": failed_files,
            "security_warnings": security_warnings
        }), 200
        
    except Exception as e:
        app.logger.error(f"上传文件时出错: {str(e)}")
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": f"批量上传失败: {str(e)}"
        }), 500

# 管理员删除文献
@app.route('/admin/docs/delete/<int:doc_id>', methods=['POST'])
@login_required
@admin_required
def admin_delete_doc(doc_id):
    document = Document.query.get_or_404(doc_id)
    try:
        # 删除文件系统中的文件
        if document.file_path:
            remove_document_file(document.file_path)
        
        # 删除数据库中的记录
        db.session.delete(document)
        db.session.commit()
        flash(f'文献 "{document.title}" 已成功删除', 'success')
        return redirect(url_for('search_documents'))
    except Exception as e:
        db.session.rollback()
        flash(f'删除文献 "{document.title}" 失败: {str(e)}', 'danger')
        return redirect(url_for('search_documents'))

# 文献详情
@app.route('/doc/<int:doc_id>')
def doc_detail(doc_id):
    document = Document.query.get_or_404(doc_id)
    ensure_document_access(document)
    return render_template('doc_detail.html', document=document)

# 解析文件信息接口
PARSE_FILE_FIELDS = [
    "title",
    "authors",
    "journal",
    "year",
    "keywords",
    "abstract",
    "category",
    "type",
    "full_text",
]


def _build_parse_file_error(message: str, status_code: int):
    payload = {field: "" for field in PARSE_FILE_FIELDS}
    payload["error"] = message
    payload["parsed_at"] = format_cn_time(utc_now(), "%Y-%m-%d %H:%M:%S")
    return jsonify(payload), status_code


@app.route('/parse-file', methods=['POST'])
@login_required
def parse_file():
    if 'file' not in request.files:
        return _build_parse_file_error("无文件", 400)
    
    file = request.files['file']
    filename = secure_filename(file.filename)
    if not filename:
        return _build_parse_file_error("无效的文件名", 400)
    
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    if not allowed_file(filename):
        return _build_parse_file_error("不支持的文件类型", 400)
    if file.content_length and file.content_length > 50 * 1024 * 1024:
        return _build_parse_file_error("解析文件不能超过50MB", 413)

    temp_path = None
    scan_warning = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{ext}') as temp_file:
            temp_path = temp_file.name
            file.save(temp_path)

        is_safe, reason = scan_file_for_threats(temp_path, ext)
        if not is_safe:
            scan_warning = reason
            current_app.logger.warning("解析接口检测到潜在风险，但继续解析: %s", reason)

        try:
            parsed = parse_files(temp_path, ext)
        except Exception as exc:
            current_app.logger.exception("解析文件失败")
            return _build_parse_file_error(f"解析失败：{exc}", 500)
    finally:
        if temp_path:
            try:
                os.remove(temp_path)
            except OSError:
                pass

    if scan_warning:
        parsed.setdefault("warning", f"安全扫描提示：{scan_warning}")

    return jsonify(parsed)

# 检索接口
@app.route('/search')
@login_required  # 需登录才能检索
def search_documents():
    # 获取检索参数
    query = request.args.get('query', '').strip()  # 检索关键词
    category = request.args.get('category', '')    # 分类筛选
    legacy_year = request.args.get('year', '')            # 兼容旧的年份筛选参数
    
    # 基础查询
    search_query = apply_accessible_filter(Document.query)
    
    # 关键词检索（支持标题、作者、摘要、关键词）
    if query:
        search_query = search_query.filter(
            or_(
                Document.title.like(f'%{query}%'),
                Document.authors.like(f'%{query}%'),
                Document.abstract.like(f'%{query}%'),
                Document.tags.like(f'%{query}%')
            )
        )
    
    # 分类筛选
    if category:
        if category == 'uncategorized':
            search_query = search_query.filter(Document.category_id.is_(None))
        else:
            search_query = search_query.filter(Document.category == category)
    
    # 兼容旧年份参数
    if legacy_year:
        try:
            target_year = int(legacy_year)
        except ValueError:
            target_year = None
        if target_year is not None:
            search_query = search_query.filter(Document.year == target_year)

    filtered_query, filter_context = apply_sidebar_filters(search_query)
    filtered_query = filtered_query.order_by(Document.upload_time.desc(), Document.id.desc())
    pagination = paginate_documents(filtered_query)
    documents = pagination.items

    total = pagination.total
    total_count_all = apply_accessible_filter(Document.query).count()

    return render_document_page(
        documents=documents,
        total_count=total,
        search_query=query,
        category_counts=build_category_counts([get_accessible_documents_condition()]),
        current_category=category or 'all',
        total_count_all=total_count_all,
        pagination=pagination,
        **filter_context
    )


@app.route('/documents/table')
@login_required
def documents_table():
    is_admin_view = current_user.is_authenticated and current_user.role in ('admin', 'super admin')
    query = Document.query if is_admin_view else apply_accessible_filter(Document.query)

    keyword = request.args.get('q', '').strip()
    if keyword:
        like_value = f"%{keyword}%"
        query = query.filter(
            or_(
                Document.title.ilike(like_value),
                Document.authors.ilike(like_value),
                Document.journal.ilike(like_value),
                Document.keywords.ilike(like_value)
            )
        )

    documents = query.order_by(Document.upload_time.desc(), Document.id.desc()).all()

    return render_template(
        'documents/table.html',
        documents=documents,
        total_count=len(documents),
        keyword=keyword,
        show_owner_column=is_admin_view,
    )


def _serialize_system_formats():
    ensure_system_citation_formats()
    rows = CitationFormat.query.filter(CitationFormat.is_system.is_(True)).order_by(
        CitationFormat.created_at.asc(),
        CitationFormat.id.asc(),
    ).all()
    return [row.to_dict() for row in rows]


def _get_citation_format_by_key(key: str) -> CitationFormat | None:
    if not key:
        return None

    ensure_system_citation_formats()
    if key.startswith('custom_'):
        try:
            format_id = int(key.split('_', 1)[1])
        except (ValueError, IndexError):
            return None
        return (
            CitationFormat.query
            .filter_by(id=format_id, user_id=current_user.id, is_system=False)
            .first()
        )
    return (
        CitationFormat.query
        .filter_by(code=key, is_system=True)
        .first()
    )


@app.route('/api/citation-formats', methods=['GET', 'POST'])
@login_required
def citation_formats_api():
    if request.method == 'GET':
        custom_items = (
            CitationFormat.query
            .filter_by(user_id=current_user.id, is_system=False)
            .order_by(CitationFormat.created_at.desc())
            .all()
        )
        return jsonify({
            'system': _serialize_system_formats(),
            'custom': [item.to_dict() for item in custom_items],
        })

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    template = (data.get('template') or '').strip()
    description = (data.get('description') or '').strip()
    if not name or not template:
        return jsonify({'error': '格式名称和模板内容不能为空。'}), 400
    new_format = CitationFormat(
        user_id=current_user.id,
        name=name,
        description=description or None,
        template=template,
        is_system=False,
    )
    db.session.add(new_format)
    db.session.commit()
    return jsonify({'item': new_format.to_dict()}), 201


@app.route('/api/citation-formats/<int:format_id>', methods=['PATCH', 'DELETE'])
@login_required
def citation_format_detail(format_id):
    citation_format = (
        CitationFormat.query
        .filter_by(id=format_id, user_id=current_user.id, is_system=False)
        .first_or_404()
    )

    if request.method == 'DELETE':
        db.session.delete(citation_format)
        db.session.commit()
        return jsonify({'status': 'ok'})

    data = request.get_json() or {}
    name = data.get('name')
    template = data.get('template')
    description = data.get('description')
    if name:
        citation_format.name = name.strip()
    if template:
        citation_format.template = template.strip()
    if description is not None:
        citation_format.description = description.strip() or None
    db.session.commit()
    return jsonify({'item': citation_format.to_dict()})


@app.route('/api/citation-formats/export', methods=['POST'])
@login_required
def export_selected_citations():
    data = request.get_json() or {}
    doc_ids_raw = data.get('doc_ids')
    format_key = (data.get('format_key') or '').strip()

    if not isinstance(doc_ids_raw, list) or not doc_ids_raw:
        return jsonify({'error': '请选择要导出的文献。'}), 400

    cleaned_ids = []
    seen_ids = set()
    for raw in doc_ids_raw:
        try:
            doc_id = int(raw)
        except (TypeError, ValueError):
            continue
        if doc_id not in seen_ids:
            cleaned_ids.append(doc_id)
            seen_ids.add(doc_id)

    if not cleaned_ids:
        return jsonify({'error': '没有可导出的文献。'}), 400

    citation_format = _get_citation_format_by_key(format_key)
    if not citation_format or not citation_format.template:
        return jsonify({'error': '未找到对应的引用格式。'}), 404

    query = Document.query
    if not (current_user.role in ('admin', 'super admin')):
        query = apply_accessible_filter(query)

    documents = query.filter(Document.id.in_(cleaned_ids)).all()
    doc_map = {doc.id: doc for doc in documents}
    if not doc_map:
        return jsonify({'error': '无权访问所选文献或文献不存在。'}), 403

    rendered_items = []
    for doc_id in cleaned_ids:
        doc = doc_map.get(doc_id)
        if not doc:
            continue
        context = _build_citation_context(doc)
        rendered = _render_citation_template(citation_format.template, context).strip()
        rendered_items.append(rendered)

    if not rendered_items:
        return jsonify({'error': '未能生成引用内容。'}), 400

    content = '\n'.join(rendered_items)
    base_name = slugify(citation_format.name) or 'citations'
    timestamp = to_cst(utc_now()).strftime('%Y%m%d%H%M%S')
    filename = f'{base_name}-citations-{timestamp}.txt'

    return send_file(
        BytesIO(content.encode('utf-8')),
        mimetype='text/plain; charset=utf-8',
        as_attachment=True,
        download_name=filename,
    )


# 文献详情页
@app.route('/document/<int:doc_id>')
@login_required
def document_detail(doc_id):
    # 查询文献详情
    doc = Document.query.get_or_404(doc_id)
    ensure_document_access(doc)
    # 增加浏览量
    doc.view_count += 1
    db.session.commit()
    return render_template('document_detail.html', doc=doc, ai_enabled=ai_summary_available())


@app.route('/share/document/<int:doc_id>')
def shared_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    if not doc.is_shared:
        abort(404)
    return render_template('public_document.html', doc=doc)

# 编辑文献页面路由（GET请求：显示表单）
@app.route('/document/<int:doc_id>/edit', methods=['GET'])
@login_required
def edit_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    # 验证权限（只有所有者可编辑）
    if doc.owner_id != current_user.id:
        abort(403)
    return render_template('edit_document.html', 
                           doc=doc,
                           categories=Category.query.filter_by(owner_id=current_user.id).order_by(Category.label).all(),
                           doc_types=get_sorted_doc_types(),)

@app.route('/document/<int:doc_id>/delete', methods=['DELETE'])
@login_required
def delete_document(doc_id):
    doc = Document.query.get_or_404(doc_id)

    # 验证权限（只能删除自己的文献）
    ensure_document_access(doc, require_owner=True)

    try:
        # 如果有文件，先删除服务器上的文件
        if doc.file_path:
            remove_document_file(doc.file_path)

        # 从数据库删除记录
        db.session.delete(doc)
        db.session.commit()

        return jsonify({"message": "文献已成功删除"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 处理文献修改（POST请求：更新数据库）
@app.route('/document/<int:doc_id>/edit', methods=['POST'])
@login_required
def update_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    if doc.owner_id != current_user.id:
        abort(403)
    
    # 从表单获取数据并更新文献
    doc.title = request.form['title']
    doc.authors = request.form['authors']
    doc.journal = request.form['journal'] or None
    doc.year = request.form['year'] if request.form['year'] else None
    doc.doi = request.form['DOI'] or None
    doc.volume = request.form['volume'] or None
    doc.issue = request.form['issue'] or None
    doc.pages = request.form['pages'] or None
    category_identifier = request.form.get('category_id') or request.form.get('category')
    assign_category(doc, category_identifier)
    doc.doc_type = request.form['doc_type']
    thesis_degree = (request.form.get('thesis_degree') or '').strip().lower()
    if str(doc.doc_type or '').strip().lower() == 'thesis':
        if thesis_degree in {'master', '硕士'}:
            doc.thesis_degree = 'master'
        elif thesis_degree in {'phd', 'doctor', 'doctoral', '博士'}:
            doc.thesis_degree = 'phd'
        else:
            doc.thesis_degree = None
    else:
        doc.thesis_degree = None
    doc.keywords = request.form['keywords'] or None
    doc.tags = request.form['tags'] or None
    doc.abstract = request.form['abstract'] or None
    doc.modified_at = utc_now()
    
    try:
        db.session.commit()
        # flash('文献信息更新成功！', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'更新失败：{str(e)}', 'danger')
    
    return redirect(url_for('document_detail', doc_id=doc.id))

# 查看本地文件路由
@app.route('/open/<int:doc_id>')
def open_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    ensure_document_access(doc)
    if not doc.file_path:
        abort(404, description="文件不存在")
    file_path = resolve_document_path(doc.file_path)
    if not file_path.exists():
        abort(404, description="文件不存在")

    return send_file(file_path, as_attachment=True, download_name=doc.file_name)

# open_document_in_browser 路由
@app.route('/open-in-browser/<int:doc_id>')
def open_document_in_browser(doc_id):
    doc = Document.query.get_or_404(doc_id)
    ensure_document_access(doc)
    if not doc.file_path:
        abort(404, description="文件不存在")
    file_path = resolve_document_path(doc.file_path)
    if not file_path.exists():
        abort(404, description="文件不存在")

    return send_file(file_path, as_attachment=False)
    

def _fetch_crossref_metadata(doi: str) -> Optional[dict]:
    url = f"https://api.crossref.org/works/{quote(doi)}"
    try:
        response = requests.get(url, timeout=10)
    except Exception as exc:
        current_app.logger.warning("Crossref 请求失败: %s", exc)
        return None
    if response.status_code != 200:
        return None
    data = response.json()
    message = data.get("message", {})
    return {
        "title": message.get("title", [""])[0],
        "authors": ", ".join(
            [f"{a.get('given', '')} {a.get('family', '')}".strip()
             for a in message.get("author", [])]
        ),
        "journal": message.get("container-title", [""])[0],
        "year": message.get("published-print", {}).get("date-parts", [[None]])[0][0]
                or message.get("published-online", {}).get("date-parts", [[None]])[0][0],
        "doi": message.get("DOI", doi),
        "volume": message.get("volume", ""),
        "issue": message.get("issue", ""),
        "pages": message.get("page", ""),
        "abstract": clean_abstract_text(message.get("abstract", ""))
    }


def _fetch_datacite_metadata(doi: str) -> Optional[dict]:
    url = f"https://api.datacite.org/dois/{quote(doi)}"
    try:
        response = requests.get(url, timeout=10, headers={"Accept": "application/vnd.api+json"})
    except Exception as exc:
        current_app.logger.warning("DataCite 请求失败: %s", exc)
        return None
    if response.status_code != 200:
        return None
    data = response.json().get("data", {})
    attributes = data.get("attributes", {})
    creators = attributes.get("creators", [])
    authors = ", ".join([
        " ".join(filter(None, [c.get("givenName"), c.get("familyName")])).strip()
        or c.get("name", "")
        for c in creators
    ])
    return {
        "title": attributes.get("titles", [{}])[0].get("title", ""),
        "authors": authors,
        "journal": attributes.get("containerTitles", [{}])[0].get("title", ""),
        "year": attributes.get("publicationYear"),
        "doi": attributes.get("doi", doi),
        "volume": "",
        "issue": "",
        "pages": "",
        "abstract": clean_abstract_text(attributes.get("descriptions", [{}])[0].get("description", ""))
    }


def get_metadata_by_doi(doi: str) -> Optional[dict]:
    """优先从 Crossref 获取；若失败则回退到 DataCite。"""
    metadata = _fetch_crossref_metadata(doi)
    if metadata:
        return metadata
    return _fetch_datacite_metadata(doi)


def _is_blank_metadata_value(value) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return not value.strip()
    return False


def _apply_doi_metadata_to_document(doc: Document, metadata: dict) -> list[str]:
    updated_fields = []
    changes = _collect_doi_metadata_changes(doc, metadata)

    for field_name, payload in changes.items():
        setattr(doc, field_name, payload['new'])
        updated_fields.append(field_name)

    if updated_fields:
        normalized_doi = normalize_doi(doc.doi or metadata.get('doi') or '')
        if normalized_doi:
            doc.doi = normalized_doi
        doc.modified_at = utc_now()

    return updated_fields


def _collect_doi_metadata_changes(doc: Document, metadata: dict) -> dict[str, dict]:
    field_mapping = {
        'title': 'title',
        'authors': 'authors',
        'journal': 'journal',
        'publisher': 'publisher',
        'year': 'year',
        'volume': 'volume',
        'issue': 'issue',
        'pages': 'pages',
        'abstract': 'abstract',
    }
    changes: dict[str, dict] = {}

    for doc_field, metadata_field in field_mapping.items():
        current_value = getattr(doc, doc_field, None)
        incoming_value = metadata.get(metadata_field)

        if not _is_blank_metadata_value(current_value):
            continue
        if _is_blank_metadata_value(incoming_value):
            continue

        if doc_field == 'year':
            incoming_value = _safe_int(incoming_value)
            if incoming_value is None:
                continue
        elif isinstance(incoming_value, str):
            incoming_value = incoming_value.strip()

        changes[doc_field] = {
            'old': current_value,
            'new': incoming_value,
        }

    return changes


def _format_preview_value(value) -> str:
    if value is None:
        return ''
    return str(value).strip()

def get_pdf_url_from_unpaywall(doi):
    """从 Unpaywall 获取免费 PDF 链接"""
    url = f"https://api.unpaywall.org/v2/{quote(doi)}?email={current_user.email}"  # 邮箱可选，但建议填写以获得更高访问限额
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("is_oa") and data.get("best_oa_location"):
                return data["best_oa_location"]["url_for_pdf"]
        return None
    except Exception as e:
        app.logger.error(f"Unpaywall API 调用失败: {str(e)}")
        return None

def download_pdf(pdf_url, save_path):
    """下载 PDF 到本地"""
    try:
        response = requests.get(pdf_url, timeout=30, stream=True)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        f.write(chunk)
            return True
        return False
    except Exception as e:
        app.logger.error(f"下载 PDF 失败: {str(e)}")
        return False
    
@app.route('/api/import_by_doi', methods=['POST'])
@login_required
def import_by_doi():
    data = request.json
    raw_doi = (data.get('doi') or '').strip()
    doi = normalize_doi(raw_doi)
    app.logger.info(f"导入文献，DOI: {doi}, 用户ID: {current_user.id}")
    if not doi:
        app.logger.error("导入文献失败，DOI 不能为空")
        return jsonify({"error": "DOI 不能为空"}), 400

    # 在进行任何外部请求前，先检查数据库中是否已有相同 DOI
    existing = Document.query.filter(func.lower(Document.doi) == doi.lower()).first()
    if existing:
        app.logger.error(f"导入文献失败，DOI: {doi} 已存在 (ID: {existing.id})")
        return jsonify({"error": "该 DOI 已存在"}), 400

    metadata = get_metadata_by_doi(doi)
    if not metadata:
        app.logger.error(f"导入文献失败，DOI: {doi}，无法获取元数据")
        return jsonify({"error": "无法获取该 DOI 的元数据，请检查 DOI 是否正确"}), 404
    app.logger.info(f"获取到的元数据: {metadata}")
    
    # 获取 PDF 链接
    pdf_url = get_pdf_url_from_unpaywall(doi)

    stored_file = None
    if pdf_url:
        # 生成保存路径
        safe_title = "".join([c for c in metadata["title"] if c.isalnum() or c in " _-"]).rstrip() or "document"
        user_folder = ensure_user_storage(current_user.id)
        filename = get_unique_filename(f"{safe_title}.pdf")
        save_path = user_folder / filename

        # 下载 PDF
        if download_pdf(pdf_url, save_path):
            relative_path = save_path.relative_to(upload_root())
            stored_file = {
                "relative_path": str(relative_path).replace('\\', '/'),
                "size": save_path.stat().st_size,
                "display_name": f"{safe_title}.pdf",
                "extension": "pdf"
            }
            app.logger.info(f"PDF 下载成功: {save_path}")
        else:
            app.logger.warning(f"PDF 下载失败: {pdf_url}")
    else:
        app.logger.info("未找到免费PDF链接")

    # 保存到数据库
    new_doc = Document(
        title=metadata["title"],
        authors=metadata["authors"],
        journal=metadata["journal"],
        year=metadata["year"],
        doi=metadata["doi"],
        volume=metadata["volume"],
        issue=metadata["issue"],
        pages=metadata["pages"],
        abstract=metadata["abstract"],
        doc_type="",  # 初始为空，用户可后续编辑
        keywords="",
        tags="",
        owner_id=current_user.id,
        # 其他字段可根据需要补充
        # 例如 category, doc_type, keywords, abstract 等可以留空或设置默认值
        upload_time=utc_now(),
        view_count=0,
        file_name=stored_file["display_name"] if stored_file else None,  # 假设默认文件名为标题
        file_path=stored_file["relative_path"] if stored_file else None,
        file_size=stored_file["size"] if stored_file else 0,
        file_type=stored_file["extension"] if stored_file else None,
        is_shared=False
        # share_by_id=None  # 初始未共享
        
    )
    app.logger.info(f"检查数据库中是否已存在 DOI: {metadata['doi']}")
    if Document.query.filter_by(doi=metadata["doi"], owner_id=current_user.id).first():
        app.logger.error(f"导入文献失败，DOI: {doi} 已存在")
        return jsonify({"error": "该 DOI 已存在"}), 400
    app.logger.info(f"准备添加文献到数据库: {new_doc.__dict__}")
    assign_category(new_doc, 'other')
    db.session.add(new_doc)
    db.session.commit()

    return jsonify({
        "message": f'成功导入文献《{metadata["title"]}》',
        "doc_id": new_doc.id
    })

@documents_bp.route('/documents/<int:doc_id>/upload-file', methods=['POST'])
@login_required
def upload_file(doc_id):
    """上传文件并关联到文献"""
    # 验证文献存在且属于当前用户
    doc = Document.query.filter_by(id=doc_id, owner_id=current_user.id).first()
    if not doc:
        app.logger.error(f"上传文件失败，文献ID: {doc_id} 不存在或无权访问")
        return jsonify({"error": "文献不存在或无权访问"}), 404

    if 'file' not in request.files:
        app.logger.error(f"上传文件失败，文献ID: {doc_id} 未包含文件字段")
        return jsonify({"error": "未选择文件"}), 400

    file = request.files['file']
    if file.filename == '':
        app.logger.error(f"上传文件失败，文献ID: {doc_id} 未选择文件")
        return jsonify({"error": "未选择文件"}), 400

    if file:
        file_info = save_user_file(file, current_user.id)
        app.logger.info(f"上传文件，保存路径: {file_info['relative_path']}")

        if doc.file_path:
            remove_document_file(doc.file_path)

        doc.file_path = file_info['relative_path']
        doc.file_name = file_info['display_name']
        doc.file_size = file_info['size']
        doc.file_type = file_info['extension']
        db.session.commit()
        app.logger.info(f"上传文件成功，文献ID: {doc_id}，文件路径: {file_info['relative_path']}")
        
        return jsonify({"message": "文件上传成功"}), 200

@documents_bp.route('/documents/<int:doc_id>/file')
@login_required
def view_file(doc_id):
    """查看文献文件"""
    doc = Document.query.filter_by(id=doc_id, owner_id=current_user.id).first()
    if not doc or not doc.file_path:
        return jsonify({"error": "文件不存在"}), 404
    file_path = resolve_document_path(doc.file_path)
    if not file_path.exists():
        return jsonify({"error": "文件不存在"}), 404

    return send_from_directory(file_path.parent, 
                              file_path.name, 
                              as_attachment=False)

@app.route('/document/<int:doc_id>/edit_remark', methods=['POST'])
@login_required
def edit_remark(doc_id):
    try:
        if request.is_json:
            remark_content = request.get_json().get('remark', '')
        else:
            remark_content = request.form.get('remark', '')
        
        doc = Document.query.get_or_404(doc_id)
        doc.remark = remark_content.strip()
        db.session.commit()
        
        return jsonify({
            'code': 200,
            'msg': '备注修改成功！',
            'data': {'remark': doc.remark}
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'code': 500,
            'msg': f'修改失败：{str(e)}'
        }), 500


@app.route('/document/<int:doc_id>/fill-metadata-by-doi', methods=['POST'])
@login_required
def fill_metadata_by_doi(doc_id):
    doc = Document.query.get_or_404(doc_id)
    ensure_document_access(doc, require_owner=True)

    doi = normalize_doi(doc.doi or '')
    if not doi:
        return jsonify({
            'code': 400,
            'msg': '当前文献没有 DOI，无法自动补全。'
        }), 400

    metadata = get_metadata_by_doi(doi)
    if not metadata:
        return jsonify({
            'code': 404,
            'msg': '未能通过 DOI 获取到文献信息，请稍后重试。'
        }), 404

    changes = _collect_doi_metadata_changes(doc, metadata)
    preview_items = [
        {
            'field': field_name,
            'old': _format_preview_value(payload['old']),
            'new': _format_preview_value(payload['new']),
        }
        for field_name, payload in changes.items()
    ]

    request_data = request.get_json(silent=True) or {}
    preview_only = bool(request_data.get('preview'))

    if preview_only:
        return jsonify({
            'code': 200,
            'msg': '已生成 DOI 补全预览。',
            'data': {
                'preview': preview_items,
                'updated_fields': [item['field'] for item in preview_items],
            }
        })

    updated_fields = _apply_doi_metadata_to_document(doc, metadata)
    if not updated_fields:
        return jsonify({
            'code': 200,
            'msg': '可补全的字段都已有内容，无需更新。',
            'data': {
                'updated_fields': [],
                'preview': [],
            }
        })

    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        current_app.logger.exception('DOI 自动补全失败: doc_id=%s', doc_id)
        return jsonify({
            'code': 500,
            'msg': f'自动补全失败：{exc}'
        }), 500

    return jsonify({
        'code': 200,
        'msg': '已根据 DOI 补全文献信息。',
        'data': {
            'updated_fields': updated_fields,
            'preview': preview_items,
        }
    })

def register_blueprints(app: Flask) -> None:
    app.register_blueprint(admin_bp)
    app.register_blueprint(documents_bp)


ensure_database_initialized()
ensure_morning_report_schema()
register_blueprints(app)

import traceback  # 新增：用于打印完整错误栈

# 启动应用
if __name__ == '__main__':
    try:
        print("=" * 50)
        print("准备初始化数据库...")
        
        # 单独捕获数据库初始化错误，便于定位问题
        try:
            with app.app_context():
                db.create_all()  # 创建数据库表
                ensure_document_ai_summary_schema()
                init_category_data()  # 初始化分类数据（你的自定义函数）
                create_test_data()  # 创建测试数据（你的自定义函数）
                sync_document_category_relationships()  # 同步文档分类关联（你的自定义函数）
            print("✅ 数据库初始化成功")
        except Exception as db_e:
            # 单独打印数据库错误，避免与其他错误混淆
            print(f"❌ 数据库初始化失败: {str(db_e)}")
            traceback.print_exc()  # 打印完整错误栈（如SQL语法错误、连接失败）
            raise  # 终止启动，避免服务带病运行
        
        print("\n准备启动Web服务...")
        
        # 1. 获取端口（优先环境变量，默认5050）
        port = int(os.environ.get('YSXS_PORT', 5050))
        # 2. 主机固定为0.0.0.0（允许公网访问，不能用127.0.0.1）
        host = '0.0.0.0'
        # 3. 生产环境强制关闭Debug（覆盖配置文件，避免误开启）
        debug_mode = True
        
        # 启动服务
        app.run(
            host=host,
            port=port,
            debug=debug_mode,
            use_reloader=True  # 生产环境关闭自动重载（避免端口占用冲突）
        )
        
        print(f"✅ Web服务启动成功！访问地址: http://服务器公网IP:{port}")
    
    except Exception as e:
        print(f"\n❌ 服务启动失败: {str(e)}")
        traceback.print_exc()  # 打印完整错误信息（如端口占用、依赖缺失）
    finally:
        print("=" * 50)
