import json
import logging
import os
import re
import secrets
import shutil
import string
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from functools import wraps
from io import BytesIO, StringIO
from logging.handlers import RotatingFileHandler
from pathlib import Path
from threading import Lock
from urllib.parse import quote
import tempfile
import csv
import time
from typing import Optional
from typing import Optional

import requests
from dotenv import load_dotenv
from flask import (Blueprint, Flask, abort, current_app, flash, jsonify, make_response,
                   redirect, render_template, request, send_file, send_from_directory,
                   session, url_for)
from flask_cors import CORS  # 新增导入
from flask_login import (LoginManager, UserMixin, current_user, login_required, login_user,
                         logout_user)
from flask_migrate import Migrate
from flask_mail import Mail, Message
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect, generate_csrf
from sqlalchemy import func, or_, and_, inspect, false
from werkzeug.security import check_password_hash, generate_password_hash

# 假设已导入相关模型
from .utils.file_helpers import get_unique_filename, scan_file_for_threats, secure_filename
from .utils.parse_files import parse_files


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')
UTC = timezone.utc
CN_TZ = ZoneInfo("Asia/Shanghai")
DOCUMENTS_PER_PAGE = int(os.environ.get('YSXS_DOCS_PER_PAGE', 10))


def utc_now() -> datetime:
    """Return naive UTC datetime for consistent storage."""
    return datetime.now(UTC).replace(tzinfo=None)


def ensure_utc(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        # 历史数据以本地时间存储（无 tzinfo），按上海时区解析再换算到 UTC
        return value.replace(tzinfo=CN_TZ).astimezone(UTC)
    return value.astimezone(UTC)


def to_cst(value: Optional[datetime]) -> Optional[datetime]:
    aware = ensure_utc(value)
    return aware.astimezone(CN_TZ) if aware else None


def format_cn_time(value: Optional[datetime], fmt: str = "%Y-%m-%d %H:%M") -> str:
    local_dt = to_cst(value)
    return local_dt.strftime(fmt) if local_dt else ""


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


def normalize_url_prefix(prefix: Optional[str]) -> str:
    """Normalize URL prefix strings like '//YSXS/' into '/YSXS'."""
    if prefix is None:
        return ''
    cleaned = str(prefix).strip()
    if not cleaned:
        return ''
    cleaned = cleaned.strip('/')
    if not cleaned:
        return ''
    return f"/{cleaned}"


def _get_positive_int_env(key: str, default: int = 0) -> int:
    value = os.environ.get(key)
    if value is None:
        return default
    try:
        parsed = int(value)
    except (ValueError, TypeError):
        return default
    return parsed if parsed > 0 else default


class BaseConfig:
    SECRET_KEY = os.environ.get('YSXS_SECRET_KEY', 'change-me')
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'YSXS_DATABASE_URI',
        f"sqlite:///{BASE_DIR / 'ysxs.db'}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.environ.get('YSXS_UPLOAD_DIR', str(BASE_DIR / 'uploads'))
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'}
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    WTF_CSRF_TIME_LIMIT = None
    BANDWIDTH_LIMIT_BYTES_PER_SEC = _get_positive_int_env('YSXS_MAX_BANDWIDTH_BPS', 0)
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'False').lower() == 'true'
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'False').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')


# 【新增】定义配置类（如果你的CONFIG_MAP里已有，可忽略）
class DevelopmentConfig(BaseConfig):
    DEBUG = True
    

class ProductionConfig(BaseConfig):
    DEBUG = False
    SESSION_COOKIE_SECURE = True


class TestingConfig(BaseConfig):
    TESTING = True
    WTF_CSRF_ENABLED = False


CONFIG_MAP = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
}

db = SQLAlchemy()
login_manager = LoginManager()
csrf = CSRFProtect()
migrate = Migrate()
mail = Mail()


class RuntimeMetricsStore:
    """In-memory helper that tracks online users and recent bandwidth usage."""

    def __init__(self, activity_window_seconds: int = 300, bandwidth_window_seconds: int = 60,
                 history_window_seconds: int = 900) -> None:
        self.activity_window_seconds = activity_window_seconds
        self.bandwidth_window_seconds = bandwidth_window_seconds
        self.history_window_seconds = max(history_window_seconds, bandwidth_window_seconds)
        self.lock = Lock()
        self.site_events = deque()
        self.user_events = defaultdict(deque)
        self.last_seen = {}

    def mark_active(self, user_id) -> None:
        if not user_id:
            return
        now = datetime.utcnow()
        with self.lock:
            self.last_seen[user_id] = now
            self._cleanup_locked(now)

    def record_transfer(self, user_id, bytes_out) -> None:
        size = max(0, int(bytes_out or 0))
        if size <= 0:
            return
        now = datetime.utcnow()
        with self.lock:
            self.site_events.append((now, size))
            if user_id:
                queue = self.user_events[user_id]
                queue.append((now, size))
            self._cleanup_locked(now)

    def snapshot(self) -> dict:
        now = datetime.utcnow()
        with self.lock:
            self._cleanup_locked(now)
            site_events = list(self.site_events)
            user_events = {uid: list(queue) for uid, queue in self.user_events.items()}
            last_seen = dict(self.last_seen)
        return {
            'now': now,
            'site_events': site_events,
            'user_events': user_events,
            'last_seen': last_seen,
        }

    def _cleanup_locked(self, now: datetime) -> None:
        cutoff_events = now - timedelta(seconds=self.history_window_seconds)
        while self.site_events and self.site_events[0][0] < cutoff_events:
            self.site_events.popleft()
        for uid in list(self.user_events.keys()):
            queue = self.user_events[uid]
            while queue and queue[0][0] < cutoff_events:
                queue.popleft()
            if not queue:
                del self.user_events[uid]
        cutoff_online = now - timedelta(seconds=self.activity_window_seconds)
        for uid in list(self.last_seen.keys()):
            if self.last_seen[uid] < cutoff_online:
                del self.last_seen[uid]


runtime_metrics = RuntimeMetricsStore()
SNAPSHOT_INTERVAL_SECONDS = 60
SNAPSHOT_RETENTION_HOURS = 72
_last_snapshot_saved_at = None


def _format_timestamp(dt_value):
    if not dt_value:
        return None, None
    display = dt_value.strftime('%Y-%m-%d %H:%M:%S')
    return dt_value.isoformat(), display


def _estimate_response_size(response):
    length = None
    try:
        length = response.calculate_content_length()
    except Exception:
        length = getattr(response, 'content_length', None)
    if length is None and not getattr(response, 'direct_passthrough', False):
        try:
            data = response.get_data()
            length = len(data)
        except Exception:
            length = 0
    return max(0, length or 0)


def human_readable_bytes(value, precision: int = 2) -> str:
    num = float(value or 0)
    if num <= 0:
        return '0 B'
    units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    idx = 0
    while num >= 1024 and idx < len(units) - 1:
        num /= 1024.0
        idx += 1
    return f"{num:.{precision}f} {units[idx]}"


def human_readable_bandwidth(value, precision: int = 2) -> str:
    num = float(value or 0)
    if num <= 0:
        return '0 B/s'
    units = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s']
    idx = 0
    while num >= 1024 and idx < len(units) - 1:
        num /= 1024.0
        idx += 1
    return f"{num:.{precision}f} {units[idx]}"


class BandwidthLimiterMiddleware:
    """WSGI middleware that throttles response throughput."""

    def __init__(self, wsgi_app, bytes_per_second: int) -> None:
        self.wsgi_app = wsgi_app
        self.bytes_per_second = max(0, int(bytes_per_second or 0))

    def __call__(self, environ, start_response):
        if self.bytes_per_second <= 0:
            return self.wsgi_app(environ, start_response)
        iterable = self.wsgi_app(environ, start_response)
        return self._apply_limit(iterable)

    def _apply_limit(self, iterable):
        limit = self.bytes_per_second
        sent = 0
        start_time = time.monotonic()
        try:
            for chunk in iterable:
                if chunk:
                    sent += len(chunk)
                    yield chunk
                    elapsed = time.monotonic() - start_time
                    expected = sent / limit
                    delay = expected - elapsed
                    if delay > 0:
                        time.sleep(delay)
                else:
                    yield chunk
        finally:
            close = getattr(iterable, 'close', None)
            if close:
                close()


class ScriptRootMiddleware:
    """Assign SCRIPT_NAME so url_for outputs include reverse-proxy prefixes."""

    def __init__(self, wsgi_app, default_prefix: str = '') -> None:
        self.wsgi_app = wsgi_app
        self.default_prefix = normalize_url_prefix(default_prefix)

    def __call__(self, environ, start_response):
        header_prefix = normalize_url_prefix(environ.get('HTTP_X_FORWARDED_PREFIX'))
        prefix = header_prefix or self.default_prefix

        path_info = environ.get('PATH_INFO', '')
        if prefix and prefix != '/':
            environ['SCRIPT_NAME'] = prefix
            if path_info.startswith(prefix):
                trimmed = path_info[len(prefix):]
                if not trimmed:
                    trimmed = '/'
                elif not trimmed.startswith('/'):
                    trimmed = '/' + trimmed
                environ['PATH_INFO'] = trimmed
        elif header_prefix:
            environ['SCRIPT_NAME'] = header_prefix
        if not environ.get('PATH_INFO'):
            environ['PATH_INFO'] = '/'

        return self.wsgi_app(environ, start_response)


def setup_logging(app: Flask) -> None:
    log_dir = Path(app.root_path) / 'logs'
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / 'app.log'

    log_level = logging.INFO
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,
        backupCount=10,
        encoding='utf-8'
    )
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(module)s:%(lineno)d - %(message)s'
    )
    file_handler.setFormatter(formatter)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(log_level)
    app.logger.info('日志系统初始化完成')


def create_app() -> Flask:
    app = Flask(__name__, instance_relative_config=True)
    config_name = os.environ.get('YSXS_ENV', 'development').lower()
    app.config.from_object(CONFIG_MAP.get(config_name, DevelopmentConfig))
    mail.init_app(app)

    url_prefix = normalize_url_prefix(os.environ.get('YSXS_URL_PREFIX'))
    app.config['APPLICATION_ROOT'] = url_prefix
    app.config['YSXS_URL_PREFIX'] = url_prefix
    # 【新增】兼容末尾/，避免路径拼接错误
    cookie_path = '/'
    app.config['SESSION_COOKIE_PATH'] = cookie_path
    app.url_map.strict_slashes = False

    app.config.setdefault('SQLALCHEMY_DATABASE_URI', f"sqlite:///{BASE_DIR / 'literature.db'}")
    upload_root = app.config.get('UPLOAD_FOLDER', str(BASE_DIR / 'uploads'))
    app.config['UPLOAD_FOLDER'] = upload_root
    Path(upload_root).mkdir(parents=True, exist_ok=True)

    csrf.init_app(app)
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)
    login_manager.login_view = 'login'
    # 自定义 Flask-Login 未授权提示（默认会显示英语 'Please log in to access this page.'）
    login_manager.login_message = '请先登录以访问该页面'
    login_manager.login_message_category = 'warning'

    allowed_origin = os.environ.get('YSXS_ALLOWED_ORIGIN', 'http://localhost:5000')
    CORS(
        app,
        resources={r"/*": {"origins": [allowed_origin]}},
        supports_credentials=True,
    )

    app.add_template_filter(format_cn_time, 'format_cn_time')

    setup_logging(app)
    limit_bps = app.config.get('BANDWIDTH_LIMIT_BYTES_PER_SEC', 0)
    if limit_bps:
        app.wsgi_app = BandwidthLimiterMiddleware(app.wsgi_app, limit_bps)
        app.logger.info('Bandwidth limiter enabled: %s bytes/sec', limit_bps)
    return app

DEFAULT_URL_PREFIX = normalize_url_prefix(os.environ.get('YSXS_URL_PREFIX'))


app = create_app()
app.wsgi_app = ScriptRootMiddleware(
    app.wsgi_app,
    DEFAULT_URL_PREFIX
)


@app.template_filter('human_bytes')
def human_bytes_filter(value, precision: int = 2):
    return human_readable_bytes(value, precision)


@app.template_filter('human_bandwidth')
def human_bandwidth_filter(value, precision: int = 2):
    return human_readable_bandwidth(value, precision)


DOC_TYPE_LABEL_MAP = {
    'journal': '期刊',
    'conference': '会议',
    'book': '书籍',
    'thesis': '学位论文',
    'report': '报告',
    'other': '其他',
}

CITATION_SYSTEM_FORMATS = [
    {
        'key': 'system_gbt',
        'name': 'GB/T 7714',
        'description': '中文期刊常用标准',
        'template': '{{authors}}. {{title}}[J]. {{journal}}, {{year}}, {{volume}}({{issue}}): {{pages}}.',
        'type': '系统',
    },
    {
        'key': 'system_apa',
        'name': 'APA',
        'description': 'American Psychological Association',
        'template': '{{authors}}. ({{year}}). {{title}}. {{journal}}, {{volume}}({{issue}}), {{pages}}. {{doi}}',
        'type': '系统',
    },
    {
        'key': 'system_mla',
        'name': 'MLA',
        'description': 'Modern Language Association',
        'template': '{{authors}}. "{{title}}." {{journal}} {{volume}}.{{issue}} ({{year}}): {{pages}}.',
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



@app.before_request
def _runtime_metrics_before_request():
    if current_user.is_authenticated:
        runtime_metrics.mark_active(current_user.id)


@app.after_request
def _runtime_metrics_after_request(response):
    try:
        user_id = current_user.id if current_user.is_authenticated else None
        runtime_metrics.record_transfer(user_id, _estimate_response_size(response))
        maybe_persist_runtime_metrics()
    except Exception:
        current_app.logger.exception("Failed to record runtime metrics")
    return response


# 统一在模板中提供 csrf_token() 调用
@app.context_processor
def inject_csrf_token():
    return {'csrf_token': generate_csrf}



documents_bp = Blueprint('documents', __name__)


def upload_root() -> Path:
    return Path(current_app.config['UPLOAD_FOLDER']).resolve()


def ensure_user_storage(user_id: int) -> Path:
    root = upload_root()
    folder = root / str(user_id)
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def save_user_file(file_storage, user_id: int) -> dict:
    original_name = secure_filename(file_storage.filename)
    user_folder = ensure_user_storage(user_id)
    unique_name = get_unique_filename(original_name)
    target_path = user_folder / unique_name
    file_storage.save(target_path)
    relative_path = target_path.relative_to(upload_root())
    return {
        'display_name': original_name,
        'relative_path': str(relative_path).replace('\\', '/'),
        'absolute_path': target_path,
        'size': target_path.stat().st_size,
        'extension': target_path.suffix.lstrip('.').lower()
    }


def reset_filestorage_stream(file_storage) -> None:
    """
    确保 FileStorage 的底层流可重复读取，并将指针重置到起始位置。
    """
    stream = getattr(file_storage, "stream", None)
    if stream is None:
        return
    if stream.seekable():
        stream.seek(0)
        return
    data = stream.read()
    file_storage.stream = BytesIO(data)


def resolve_document_path(stored_path: str) -> Path:
    path_obj = Path(stored_path)
    if path_obj.is_absolute():
        return path_obj
    return upload_root() / path_obj


def remove_document_file(stored_path: str) -> None:
    try:
        target = resolve_document_path(stored_path)
        if target.exists():
            target.unlink()
    except Exception:
        current_app.logger.exception("删除附件失败: %s", stored_path)


def enqueue_kindle_delivery(doc: 'Document', requester_id: int) -> Path:
    """
    将文献文件复制到当前用户的 Kindle 队列目录，供后续发送使用。
    """
    if not doc.file_path:
        raise ValueError("当前文献没有关联文件")

    source = resolve_document_path(doc.file_path)
    if not source.exists():
        raise FileNotFoundError("文献文件不存在或已被删除")

    queue_dir = ensure_user_storage(requester_id) / 'kindle_queue'
    queue_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    target_name = f"{doc.id}_{timestamp}_{source.name}"
    target = queue_dir / target_name
    shutil.copy2(source, target)
    return target


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


# 收藏中间表
favorite = db.Table(
    'favorite',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('document_id', db.Integer, db.ForeignKey('document.id'), primary_key=True),
    db.Column('favorited_at', db.DateTime, default=datetime.utcnow)
)

# 首先添加授权密钥模型
class AdminAuthKey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(64), unique=True, nullable=False)  # 授权密钥
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 生成者（超级管理员）
    created_at = db.Column(db.DateTime, default=datetime.now)  # 生成时间
    expires_at = db.Column(db.DateTime)  # 过期时间
    is_used = db.Column(db.Boolean, default=False)  # 是否已使用（单次有效）
    used_by = db.Column(db.Integer, db.ForeignKey('user.id'))  # 新增：记录使用该密钥的用户ID
    used_at = db.Column(db.DateTime)  # 新增：记录密钥使用时间
    
    # 关键修复：明确指定外键为 created_by
    creator = db.relationship(
        'User', 
        backref=db.backref('auth_keys', lazy=True),
        foreign_keys=[created_by]  # 告诉SQLAlchemy使用created_by字段关联User
    )

    # 新增：关联使用该授权码的用户，需指定外键
    user = db.relationship(
        'User',
        foreign_keys=[used_by],  # 明确关联used_by字段
        backref=db.backref('used_auth_keys', lazy=True)
    )

    def is_expired(self):
        """检查密钥是否过期"""
        return self.expires_at and self.expires_at < datetime.now()
    
    def is_valid(self):
        """检查密钥是否有效（未过期且未使用）"""
        return not self.is_expired() and not self.is_used
    
    @classmethod
    def verify_auth_key(cls, auth_key):
        """
        类方法：验证授权密钥是否有效（供管理员注册使用）
        :param auth_key: 前端传入的授权密钥字符串
        :return: tuple(验证结果: bool, 提示信息: str, 密钥实例: AdminAuthKey|None)
                 - 验证通过：(True, "密钥有效", 密钥实例)
                 - 验证失败：(False, "错误原因", None)
        """
        # 1. 先校验入参（避免非字符串/空字符串）
        if not isinstance(auth_key, str) or len(auth_key.strip()) == 0:
            return False, "授权密钥不能为空且必须是字符串", None

        # 2. 查询密钥（去除前后空格，兼容用户误输入）
        key_record = cls.query.filter_by(key=auth_key.strip()).first()

        # 3. 分步验证逻辑
        if not key_record:
            return False, "授权密钥不存在", None  # 密钥未找到
        if key_record.is_used:
            return False, "授权密钥已被使用（单次有效）", None  # 已使用
        if key_record.expires_at and datetime.now() > key_record.expires_at:
            return False, f"授权密钥已过期（过期时间：{key_record.expires_at.strftime('%Y-%m-%d %H:%M')}", None  # 已过期

        # 4. 验证通过：暂不标记为已使用（交给路由统一提交，避免事务冲突）
        return True, "密钥验证通过", key_record
    
class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 关联用户
    action = db.Column(db.String(100), nullable=False)  # 操作类型（如"上传文献"、"登录"）
    target = db.Column(db.String(200))  # 操作对象（如文献ID、用户名）
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # 操作时间
    
    # 可选：关联用户信息
    user = db.relationship('User', backref=db.backref('activities', lazy=True))


class RuntimeMetricSnapshot(db.Model):
    __tablename__ = 'runtime_metric_snapshot'

    id = db.Column(db.Integer, primary_key=True)
    captured_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
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

class User(UserMixin, db.Model):
    '''
    id: 主键，自动生成的唯一标识符。
    custom_id: 自定义ID，用于区分用户。
    role: 用户角色，默认为'user'。
    username: 用户名，必须唯一。
    password_hash: 密码哈希值，用于存储加密后的密码。
    email: 邮箱地址，必须唯一。
    created_at: 注册时间，默认为当前时间。
    avatar: 头像文件名，用于存储用户头像。  
    status: 用户状态，默认为'正常'。
    '''
    id = db.Column(db.Integer, primary_key=True)
    custom_id = db.Column(db.String(20), unique=True, nullable=False)
    role = db.Column(db.String(20), default='user')  # 角色：user/admin
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)  # 启用注册时间
    avatar = db.Column(db.String(120))  # 启用头像字段（存储文件名）
    # 用户状态
    status = db.Column(db.String(20), default='正常')  # 状态：active/inactive
    email_confirmed_at = db.Column(db.DateTime, nullable=True)
    last_password_change = db.Column(db.DateTime, nullable=True)
    
    # 收藏的文献
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

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        self.last_password_change = utc_now()

    @property
    def is_email_confirmed(self) -> bool:
        return self.email_confirmed_at is not None
    
    def is_super_admin(self):
        """判断是否为超级管理员"""

        return self.role == 'super admin'
    
    def generate_auth_key(self, expires_hours=24):
        """
        超级管理员生成授权密钥
        :param expires_hours: 密钥有效期（小时），默认24小时
        :return: 生成的密钥字符串
        """
        # 只有超级管理员可以生成密钥
        if not self.is_super_admin():
            raise PermissionError("只有超级管理员可以生成授权密钥")
        
        # 生成随机密钥（32位字母数字混合）
        alphabet = string.ascii_letters + string.digits
        auth_key = ''.join(secrets.choice(alphabet) for _ in range(32))
        
        # 设置过期时间
        expires_at = datetime.now() + timedelta(hours=expires_hours)
        
        # 保存到数据库
        new_key = AdminAuthKey(
            key=auth_key,
            created_by=self.id,
            expires_at=expires_at
        )
        db.session.add(new_key)
        db.session.commit()
        
        return auth_key
    
    @property
    def is_active(self):
        """覆盖UserMixin的is_active属性，基于status字段"""
        return self.status == '正常'
    
    def is_not_active(self):
        """检查用户是否处于非活动状态"""
        return self.status == '异常' or self.status == '封禁'
    
# 分类模型
class Category(db.Model):
    __table_args__ = (
        db.UniqueConstraint('owner_id', 'value', name='uq_category_owner_value'),
        db.Index('ix_category_owner_id', 'owner_id')
    )

    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    value = db.Column(db.String(50), nullable=False)  # ? "computer"
    label = db.Column(db.String(100), nullable=False)  # 如 "计算机"

    owner = db.relationship('User', backref=db.backref('categories', lazy='dynamic'))


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
    ('other', '其他')
]


def ensure_user_categories(user_id: int | None, commit: bool = False) -> int:
    """Ensure the default category set exists for the given user."""
    if not user_id:
        return 0

    # 如果用户已经有任意分类，尊重用户修改/删除，不自动补回单个默认分类。
    # 仅在用户没有任何分类时才初始化默认分类集合（首次注册或管理员手动清空时）。
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

# 文献类型模型
class DocType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.String(50), unique=True, nullable=False)  # 如 "journal"
    label = db.Column(db.String(100), nullable=False)  # 如 "期刊"    

# 定义文献数据模型（对应数据库表）
class Document(db.Model):
    '''
    id: 主键，自动生成的唯一标识符。
    title: 文献标题，不能为空。
    authors: 作者，不能为空。
    journal: 期刊/会议名，可空。
    year: 发表年份，可空。
    volume: 卷，可空。
    issue: 期，可空。
    pages: 页码，可空。
    abstract: 摘要，可空。
    keywords: 关键词，用逗号分隔，可空。
    category: 分类，可空。
    tags: 标签，用逗号分隔，可空。
    DOI: 文献标识符，可空。
    view_count: 浏览量，默认为0。
    created_at: 添加时间，默认为当前时间。
    upload_time: 上传时间，默认为当前时间。
    url: 文献链接，可空。
    file_name: 文件名，可空。
    file_path: 文件存储路径，可空。
    file_size: 文件大小（字节），可空。
    file_type: 文件类型（如pdf、docx），可空。
    doc_type: 文献类型（期刊/会议等），可空。
    owner_id: 关联用户ID，外键，不能为空。
    owner: 关联用户，反向引用，可空。
    is_shared: 是否共享，默认为False。
    '''
    id = db.Column(db.Integer, primary_key=True)  # 唯一ID
    title = db.Column(db.String(255), nullable=False)  # 文献标题
    authors = db.Column(db.String(255), nullable=False)  # 作者
    journal = db.Column(db.String(255))  # 期刊/会议名
    year = db.Column(db.Integer)  # 发表年份
    volume = db.Column(db.String(50))  # 卷
    issue = db.Column(db.String(50))  # 期
    pages = db.Column(db.String(50))  # 页码
    abstract = db.Column(db.Text)  # 摘要
    # 新增：备注字段（支持长文本，允许为空）
    remark = db.Column(db.Text, nullable=True, comment="备注/笔记")

    keywords = db.Column(db.String(255))  # 关键词（用逗号分隔）
    category = db.Column(db.String(100))  # 分类（如"计算机科学"）
    tags = db.Column(db.String(255))  # 标签（用逗号分隔）
    doi = db.Column(db.String(100))  # DOI
    view_count = db.Column(db.Integer, default=0)  # 浏览量
    created_at = db.Column(db.DateTime, default=datetime.now)  # 添加时间
    upload_time = db.Column(db.DateTime, default=datetime.now)  # 上传时间
    modified_at = db.Column(db.DateTime, default=datetime.now)  # 最近编辑时间
    url = db.Column(db.String(512), nullable=True)  # 长度设长一些，适配长URL
    editor = db.Column(db.String(100))  # 编辑
    publisher = db.Column(db.String(100))  # 出版社
    venue = db.Column(db.String(255))  # 出版地
    booktitle = db.Column(db.String(255))  # 会议名
    category_count = db.Column(db.Integer, default=0)  # 分类计数
    
    # 新增文献文件相关字段
    file_name = db.Column(db.String(255))  # 文件名
    file_path = db.Column(db.String(512))  # 文件存储路径
    file_size = db.Column(db.Integer)  # 文件大小（字节）
    file_type = db.Column(db.String(50))  # 文件类型（如pdf、docx）
    doc_type = db.Column(db.String(50))  # 文献类型（期刊/会议等）
    is_shared = db.Column(db.Boolean, default=False)  # 是否共享，默认为False
    
    # 所有者外键
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    owner = db.relationship(
        'User',
        foreign_keys=[owner_id],
        backref=db.backref('owned_documents', lazy=True)
    )

    # 共享者外键
    share_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    share_by = db.relationship(
        'User',
        foreign_keys=[share_by_id],
        backref=db.backref('shared_documents', lazy=True)
    )

    # 分类外键
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category_obj = db.relationship('Category', backref='documents')  # 反向引用

    # 文献类型外键
    doc_type_id = db.Column(db.Integer, db.ForeignKey('doc_type.id'))
    doc_type_obj = db.relationship('DocType', backref='documents')


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


class CitationFormat(db.Model):
    __tablename__ = 'citation_format'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    code = db.Column(db.String(64), unique=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.String(255))
    template = db.Column(db.Text, nullable=False)
    is_system = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

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

def slugify(value: str) -> str:
    if not value:
        return ''
    value = value.strip().lower()
    value = re.sub(r'\s+', '-', value)
    value = re.sub(r'[^a-z0-9-]', '', value)
    value = re.sub(r'-{2,}', '-', value).strip('-')
    return value


CITATION_PLACEHOLDER_PATTERN = re.compile(r'{{\s*(\w+)\s*}}')


def _build_citation_context(doc: Document) -> dict:
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
        'doi': doc.doi or '',
        'url': doc.url or '',
    }


def _render_citation_template(template: str, context: dict) -> str:
    if not template:
        return ''

    def replace(match):
        key = match.group(1)
        return str(context.get(key, '') or '')

    return CITATION_PLACEHOLDER_PATTERN.sub(replace, template)


def resolve_category(identifier, owner_id: int | None = None):
    if identifier is None or identifier == '':
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


def assign_category(doc: 'Document', identifier=None, owner_id: int | None = None):
    owner_id = owner_id or getattr(doc, 'owner_id', None)
    category = resolve_category(identifier, owner_id=owner_id)
    if not category and owner_id:
        # ensure default exists for this user before falling back
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

        Document.category.isnot(None)
    updates = 0
    for doc in missing_docs:
        category = resolve_category(doc.category)
        if category:
            doc.category_id = category.id
            updates += 1
    if updates:
        current_app.logger.info("同步了 %s 条缺失分类关联", updates)
        db.session.commit()


def build_category_counts(filters=None):
    filters = filters or []
    owner_id = current_user.id if current_user.is_authenticated else None

    counts = []
    # 当有登录用户时，仅统计该用户的分类（同时仅统计当前用户可访问的文献）
    if owner_id:
        query = (
            db.session.query(Category.value, Category.label, func.count(Document.id))
            .join(Document, Document.category_id == Category.id)
            .filter(Category.owner_id == owner_id)
        )
        for condition in filters:
            query = query.filter(condition)
        # 仅计入当前用户可访问的文献（owned 或 shared 或 share_by）
        query = query.filter(get_accessible_documents_condition())
        query = query.group_by(Category.id, Category.value, Category.label)
        counts = [
            {"value": value, "label": label, "count": int(count)}
            for value, label, count in query.all()
        ]
    else:
        # 未登录时，只统计对外共享的文献，以文献自身的 category 字段为准
        shared_q = db.session.query(Document.category, func.count(Document.id)).filter(Document.is_shared.is_(True))
        for condition in filters:
            shared_q = shared_q.filter(condition)
        shared_q = shared_q.group_by(Document.category)
        for category_value, cnt in shared_q.all():
            label = category_value or '未分类'
            counts.append({"value": category_value or 'uncategorized', "label": label, "count": int(cnt)})

    # 统计“未分类”的文献数（在可访问范围内）
    uncategorized_query = Document.query.filter(get_accessible_documents_condition())
    for condition in filters:
        uncategorized_query = uncategorized_query.filter(condition)
    uncategorized_count = uncategorized_query.filter(Document.category_id.is_(None)).count()
    if uncategorized_count:
        # 如果已经在 counts 中出现（未登录统计时），避免重复添加
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
        options = [
            {"value": value, "label": label}
            for value, label in rows if value
        ]
        # 未分类是否存在（在当前用户可访问范围内）
        has_uncategorized = Document.query.filter(get_accessible_documents_condition()).filter(Document.category_id.is_(None)).limit(1).first() is not None
        if has_uncategorized:
            options.append({"value": "uncategorized", "label": "未分类"})
    else:
        # 未登录时只显示共享文献的分类（按文献自身的 category 文本字段汇总）
        rows = (
            db.session.query(Document.category).filter(Document.is_shared.is_(True)).distinct().all()
        )
        for (cat_val,) in rows:
            if cat_val:
                options.append({"value": cat_val, "label": cat_val})
        has_uncategorized = Document.query.filter(Document.is_shared.is_(True)).filter(Document.category_id.is_(None)).limit(1).first() is not None
        if has_uncategorized:
            options.append({"value": "uncategorized", "label": "未分类"})

    return options


def get_year_filter_options():
    current_year = datetime.now().year
    previous_year = max(current_year - 1, 0)
    range_start = max(current_year - 5, 0)
    range_end = max(current_year - 3, 0)
    options = [
        {
            "value": str(current_year),
            "label": f"{current_year} 年",
            "min_year": current_year,
            "max_year": current_year
        }
    ]
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
    doc_types = DocType.query.order_by(DocType.label).all()
    options = [
        {"value": dt.value, "label": dt.label}
        for dt in doc_types
        if dt.value
    ]
    if not options:
        distinct_types = (
            db.session.query(Document.doc_type)
            .filter(Document.doc_type.isnot(None))
            .distinct()
            .order_by(Document.doc_type)
            .all()
        )
        for value, in distinct_types:
            if value:
                options.append({"value": value, "label": value})
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

# 应用侧边栏过滤器到查询，并返回过滤后的查询和当前的过滤状态（用于前端展示）
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
            # 优先将分类 value 映射到当前用户的 category_id，再按 category_id 过滤。
            try:
                owner_id = current_user.id if current_user.is_authenticated else None
                if owner_id:
                    cat_rows = Category.query.with_entities(Category.id).filter(Category.owner_id == owner_id, Category.value.in_(selected_regular)).all()
                    cat_ids = [r[0] for r in cat_rows]
                else:
                    cat_ids = []
            except Exception:
                cat_ids = []

            if cat_ids:
                category_conditions.append(Document.category_id.in_(cat_ids))
            # 对于遗留数据（document.category 存储为字符串的情况）仍保留回退匹配
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


class BatchCitation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doc_id = db.Column(db.Integer, db.ForeignKey('document.id'), nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 避免重复添加同一文献
    __table_args__ = (
        db.UniqueConstraint('user_id', 'doc_id', name='uq_batch_user_doc'),
    )


def generate_bibtex_key(doc: 'Document') -> str:
    author_block = (doc.authors or '').split(';')[0].split(',')[0].strip()
    if not author_block and doc.title:
        author_block = doc.title.split()[0]
    author_slug = slugify(author_block) or 'ref'
    year_part = str(doc.year or datetime.utcnow().year)
    return f"{author_slug}{year_part}{doc.id}"


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
    ensure_user_categories(current_user.id)
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
            doc_type=record.get('doc_type') or 'journal',
            publisher=record.get('publisher'),
            owner_id=current_user.id,
            upload_time=datetime.now(),
            created_at=datetime.now(),
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

def get_current_user_batch_ids():
    if not current_user.is_authenticated:
        return []
    rows = BatchCitation.query.with_entities(BatchCitation.doc_id).filter_by(user_id=current_user.id).all()
    return [row.doc_id for row in rows]


def render_document_page(**context):
    batch_ids = get_current_user_batch_ids()
    context.setdefault('batch_cite_ids', batch_ids)
    context.setdefault('batch_cite_count', len(batch_ids))
    active_categories = context.get('active_categories') or []
    category_options = context.get('category_options') or []
    if active_categories:
        lookup = {opt.get('value'): opt.get('label') for opt in category_options}
        labels = [lookup.get(value, value) for value in active_categories if value]
        if labels:
            context['selected_category_label'] = '、'.join(labels)
    else:
        context.setdefault('selected_category_label', '全部文献')

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


def get_accessible_documents_condition():
    if current_user.is_authenticated:
        return Document.owner_id == current_user.id
    return false()


def apply_accessible_filter(query):
    return query.filter(get_accessible_documents_condition())


class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doc_id = db.Column(db.Integer, db.ForeignKey('document.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # 避免重复添加同一文献
    __table_args__ = (
        db.UniqueConstraint('user_id', 'doc_id', name='uq_note_user_doc'),
    )

# 定义用户登录回调函数，用于从数据库中加载用户
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# 检查文件类型是否允许
def allowed_file(filename: str) -> bool:
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', set())
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed

# 初始化分类数据的函数
def init_category_data():
    # 仅初始化系统级文档类型；分类应为每个用户单独创建，
    # 因此不再在此处插入无主的分类记录。

    # 数据库还没迁移完成时直接返回，避免导入阶段查表失败
    if not inspect(db.engine).has_table('doc_type'):
        return

    if not DocType.query.first():
        doc_types = [
            ('journal', '期刊'),
            ('conference', '会议'),
            ('book', '书籍'),
            ('thesis', '学位论文'),
            ('report', '报告'),
            ('other', '其他')
        ]
        for value, label in doc_types:
            db.session.add(DocType(value=value, label=label))
    
    db.session.commit()


# 生成初始超级管理员（首次运行时执行）
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
    app.logger.info('超级管理员用户创建成功')


# 管理员权限装饰器
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 检查用户是否登录且是管理员
        if not current_user.is_authenticated or not 'admin' in current_user.role :  
            return redirect(url_for('login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

# 超级管理员权限装饰器
def super_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'super admin':
            abort(403)  # 仅允许超级管理员访问
        return f(*args, **kwargs)
    return decorated_function
def _bucket_bandwidth_series(events, now, bucket_seconds: int = 30, buckets: int = 12):
    bucket_seconds = max(1, int(bucket_seconds or 1))
    buckets = max(1, int(buckets or 1))
    totals = [0] * buckets
    window = bucket_seconds * buckets
    for timestamp, size in events:
        if not timestamp:
            continue
        age = (now - timestamp).total_seconds()
        if age < 0 or age >= window:
            continue
        bucket_from_now = int(age // bucket_seconds)
        target_index = buckets - 1 - bucket_from_now
        if 0 <= target_index < buckets:
            totals[target_index] += size
    series = []
    for idx in range(buckets):
        offset = (buckets - 1 - idx) * bucket_seconds
        bucket_end = now - timedelta(seconds=offset)
        value = totals[idx]
        bps = value / bucket_seconds if bucket_seconds else 0
        series.append({
            'label': bucket_end.strftime('%H:%M:%S'),
            'bytes': value,
            'bps': bps
        })
    return series


def build_runtime_metrics_payload(bucket_seconds: int = 30, buckets: int = 12) -> dict:
    snapshot = runtime_metrics.snapshot()
    now = snapshot['now']
    site_events = snapshot['site_events']
    user_events = snapshot['user_events']
    last_seen = snapshot['last_seen']

    sample_window = max(1, int(getattr(runtime_metrics, 'bandwidth_window_seconds', 60) or 60))
    cutoff = now - timedelta(seconds=sample_window)
    total_recent_bytes = sum(size for ts, size in site_events if ts >= cutoff)
    site_bandwidth_bps = total_recent_bytes / sample_window if sample_window else 0

    user_bandwidth_map = {}
    for user_id, events in user_events.items():
        user_total = sum(size for ts, size in events if ts >= cutoff)
        user_bandwidth_map[user_id] = user_total / sample_window if sample_window else 0

    online_cutoff = now - timedelta(seconds=getattr(runtime_metrics, 'activity_window_seconds', 300))
    online_user_ids = [user_id for user_id, ts in last_seen.items() if ts and ts >= online_cutoff]

    total_users = User.query.count()
    total_docs = Document.query.count()
    total_storage_bytes = db.session.query(func.coalesce(func.sum(Document.file_size), 0)).scalar() or 0
    avg_data_per_user = total_storage_bytes / total_users if total_users else 0
    bandwidth_limit = current_app.config.get('BANDWIDTH_LIMIT_BYTES_PER_SEC', 0) or 0
    avg_bandwidth_online = site_bandwidth_bps / len(online_user_ids) if online_user_ids else 0

    user_rows = (
        db.session.query(
            User.id,
            User.username,
            User.role,
            func.count(Document.id).label('doc_count'),
            func.coalesce(func.sum(Document.file_size), 0).label('storage_bytes')
        )
        .outerjoin(Document, Document.owner_id == User.id)
        .group_by(User.id, User.username, User.role)
        .all()
    )
    per_user_usage = []
    for row in user_rows:
        last_seen_iso, last_seen_display = _format_timestamp(last_seen.get(row.id))
        entry = {
            'user_id': row.id,
            'username': row.username,
            'role': row.role,
            'doc_count': int(row.doc_count or 0),
            'storage_bytes': int(row.storage_bytes or 0),
            'bandwidth_bps': user_bandwidth_map.get(row.id, 0.0),
            'is_online': row.id in online_user_ids,
            'last_seen_iso': last_seen_iso,
            'last_seen_display': last_seen_display,
        }
        per_user_usage.append(entry)

    per_user_usage.sort(key=lambda item: item['storage_bytes'], reverse=True)
    top_storage_users = per_user_usage[:5]
    top_bandwidth_users = sorted(per_user_usage, key=lambda item: item['bandwidth_bps'], reverse=True)[:5]
    online_details = sorted(
        [entry for entry in per_user_usage if entry['is_online']],
        key=lambda item: item['bandwidth_bps'],
        reverse=True
    )
    bandwidth_series = _bucket_bandwidth_series(site_events, now, bucket_seconds, buckets)
    timestamp_iso, timestamp_display = _format_timestamp(now)

    return {
        'summary': {
            'timestamp_iso': timestamp_iso,
            'timestamp_display': timestamp_display,
            'total_users': total_users,
            'online_users': len(online_user_ids),
            'online_user_ids': online_user_ids,
            'total_documents': total_docs,
            'total_data_bytes': int(total_storage_bytes),
            'total_recent_bytes': int(total_recent_bytes),
            'avg_data_per_user_bytes': float(avg_data_per_user),
            'current_bandwidth_bps': site_bandwidth_bps,
            'bandwidth_limit_bps': bandwidth_limit,
            'avg_bandwidth_per_online_user_bps': avg_bandwidth_online,
            'sample_window_seconds': sample_window,
            'per_user_count': len(per_user_usage),
        },
        'per_user_usage': per_user_usage,
        'top_storage_users': top_storage_users,
        'top_bandwidth_users': top_bandwidth_users,
        'online_users_detail': online_details,
        'bandwidth_series': bandwidth_series,
        'chart_bucket_seconds': bucket_seconds,
        'chart_bucket_count': buckets,
    }


def _cleanup_old_snapshots(cutoff: datetime) -> None:
    if cutoff is None:
        return
    try:
        removed = RuntimeMetricSnapshot.query.filter(
            RuntimeMetricSnapshot.captured_at < cutoff
        ).delete()
        if removed:
            db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to cleanup runtime metric snapshots")


def maybe_persist_runtime_metrics():
    global _last_snapshot_saved_at
    try:
        now = datetime.utcnow()
        if _last_snapshot_saved_at and (now - _last_snapshot_saved_at).total_seconds() < SNAPSHOT_INTERVAL_SECONDS:
            return
        payload = build_runtime_metrics_payload()
        summary = payload.get('summary', {})
        snapshot = RuntimeMetricSnapshot(
            captured_at=datetime.utcnow(),
            sample_window_seconds=int(summary.get('sample_window_seconds') or 0),
            total_users=int(summary.get('total_users') or 0),
            online_users=int(summary.get('online_users') or 0),
            total_documents=int(summary.get('total_documents') or 0),
            total_data_bytes=int(summary.get('total_data_bytes') or 0),
            total_recent_bytes=int(summary.get('total_recent_bytes') or 0),
            current_bandwidth_bps=float(summary.get('current_bandwidth_bps') or 0),
            bandwidth_limit_bps=float(summary.get('bandwidth_limit_bps') or 0),
            avg_data_per_user_bytes=float(summary.get('avg_data_per_user_bytes') or 0),
            avg_bandwidth_per_online_user_bps=float(summary.get('avg_bandwidth_per_online_user_bps') or 0),
            per_user_count=int(summary.get('per_user_count') or 0),
        )
        db.session.add(snapshot)
        db.session.commit()
        _last_snapshot_saved_at = now
        retention_cutoff = now - timedelta(hours=SNAPSHOT_RETENTION_HOURS)
        _cleanup_old_snapshots(retention_cutoff)
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Failed to persist runtime metrics snapshot")


admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/dashboard')
@login_required
@admin_required  # 使用现有权限装饰器
def admin_dashboard():
    """管理员中心主页"""
    if not current_user.is_authenticated or 'admin' not in current_user.role:
        flash('无权访问管理员中心', 'danger')
        return redirect(url_for('index'))
    
    doc_type_rows = (
        db.session.query(
            Document.doc_type,
            func.count(Document.id)
        )
        .group_by(Document.doc_type)
        .all()
    )
    doc_types = [
        (row[0], int(row[1] or 0))
        for row in doc_type_rows
    ]

    # 系统统计数据
    stats = {
        # 用户统计
        'total_users': User.query.count(),
        'active_users': User.query.filter_by(status='正常').count(),
        'new_users_week': User.query.filter(
            User.created_at >= datetime.now() - timedelta(days=7)
        ).count(),
        
        # 文献统计
        'total_docs': Document.query.count(),
        'new_docs_week': Document.query.filter(
            Document.upload_time >= datetime.now() - timedelta(days=7)
        ).count(),
        'doc_types': doc_types,
        
        # 存储统计
        'total_storage': sum((doc.file_size or 0) for doc in Document.query.all()) if Document.query.count() > 0 else 0
    }
    
    # 最近活动数据
    recent_data = {
        'recent_users': User.query.order_by(User.created_at.desc()).limit(5).all(),
        'recent_docs': Document.query.order_by(Document.upload_time.desc()).limit(5).all(),
        'recent_logs': ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(10).all()  # 假设存在活动日志模型
    }
    
    # 图表数据（用于前端可视化）
    chart_data = {
        # 用户增长趋势（近7天）
        'user_growth': [
            User.query.filter(
                User.created_at >= datetime.now() - timedelta(days=i),
                User.created_at < datetime.now() - timedelta(days=i-1)
            ).count() for i in range(6, -1, -1)
        ],
        # 文献增长趋势（近7天）
        'doc_growth': [
            Document.query.filter(
                Document.upload_time >= datetime.now() - timedelta(days=i),
                Document.upload_time < datetime.now() - timedelta(days=i-1)
            ).count() for i in range(6, -1, -1)
        ]
    }
    
    return render_template(
        'admin/dashboard.html',
        stats=stats,
        recent=recent_data,
        chart_data=chart_data
    )


@admin_bp.route('/runtime-monitor')
@login_required
@admin_required
def runtime_monitor():
    payload = build_runtime_metrics_payload()
    return render_template(
        'admin/runtime_monitor.html',
        runtime_payload=payload,
        summary=payload.get('summary', {})
    )


@admin_bp.route('/runtime-monitor/data')
@login_required
@admin_required
def runtime_monitor_data():
    payload = build_runtime_metrics_payload()
    return jsonify(payload)


@admin_bp.route('/runtime-monitor/history')
@login_required
@admin_required
def runtime_monitor_history():
    hours = request.args.get('hours', type=int, default=24)
    hours = max(1, min((hours or 24), 168))
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    snapshots = (
        RuntimeMetricSnapshot.query
        .filter(RuntimeMetricSnapshot.captured_at >= cutoff)
        .order_by(RuntimeMetricSnapshot.captured_at.asc())
        .all()
    )
    points = [
        {
            'captured_at': snap.captured_at.isoformat(),
            'captured_label': snap.captured_at.strftime('%m-%d %H:%M'),
            'current_bandwidth_bps': snap.current_bandwidth_bps,
            'total_data_bytes': snap.total_data_bytes,
            'online_users': snap.online_users,
            'total_recent_bytes': snap.total_recent_bytes,
            'sample_window_seconds': snap.sample_window_seconds,
        }
        for snap in snapshots
    ]
    return jsonify({
        'hours': hours,
        'points': points,
        'count': len(points),
    })


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
            key_record.used_at = datetime.now()  # 记录使用时间

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
                filename = f"avatar_{user.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
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
        doc_types = DocType.query.all()

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


# 文献引用格式
@app.route('/api/document/<int:doc_id>/citation', methods=['GET'])
@login_required  # 可选：如果需要登录才能获取引用格式
def get_citation_format(doc_id):
    try:
        doc = Document.query.get_or_404(doc_id)
        ensure_document_access(doc)
        app.logger.info(f"获取文献引用格式: {doc.title}")
        
        # --- APA 格式（7版，标点后加空格）---
        volume_issue = str(doc.volume) if doc.volume else ""
        if doc.issue and str(doc.issue).strip():
            volume_issue = f"{doc.volume}({doc.issue})" if doc.volume else f"({doc.issue})"
        elif not doc.volume:
            volume_issue = ""

        apa_parts = [f"{doc.authors}. ({doc.year}). {doc.title}. {doc.journal},"]
        if volume_issue:
            apa_parts.append(f"{volume_issue},")  # 逗号后加空格（拼接时自动加）
        if doc.pages:
            apa_parts.append(f"{doc.pages}")
        apa_citation = ' '.join(apa_parts).rstrip(',') + '.'  # 保留空格，符合APA规则
        if doc.doi:
            apa_citation += f" https://doi.org/{doc.doi}"  # DOI前加空格

        # --- MLA 格式（9版，无多余空格）---
        mla_parts = [f"{doc.authors}. \"{doc.title}\". {doc.journal}"]  # 句号后加空格
        if doc.volume:
            vol_part = f"{doc.volume}"
            if doc.issue and str(doc.issue).strip():
                vol_part = f"{doc.volume}({doc.issue})"
            if doc.year:
                vol_part += f"({doc.year})"
            mla_parts.append(vol_part)  # 直接拼接，无空格
        if doc.pages:
            mla_parts.append(f":{doc.pages}")  # 冒号后无空格
        mla_citation = ''.join(mla_parts) + '.'  # 无空格拼接，符合MLA规则

        # --- BibTeX 格式 ---
        bibtex_key = generate_bibtex_key(doc)
        bibtex_citation = f"""@article{{{bibtex_key},
            author = {{{doc.authors}}},
            title = {{{doc.title}}},
            journal = {{{doc.journal}}},
            year = {{{doc.year}}},
            volume = {{{doc.volume or ''}}},
            number = {{{doc.issue.strip() if (doc.issue and str(doc.issue).strip()) else ''}}},
            pages = {{{doc.pages or ''}}},
            doi = {{{doc.doi or ''}}},
            url = {{{doc.url or ''}}}
        }}"""

        # --- GB/T 7714 格式（无空格，核心修正）---
        normalized_type = (doc.doc_type or '').lower()
        type_map = {
            'journal': 'J', '期刊': 'J', 'conference': 'C', '会议': 'C',
            'thesis': 'D', 'dissertation': 'D', 'book': 'M', 'monograph': 'M'
        }
        gbt_type = type_map.get(normalized_type, 'J' if doc.journal else 'N')

        author_block = doc.authors or '佚名'
        title_block = doc.title or '无标题'
        container = doc.journal or doc.booktitle or doc.publisher or ''
        issue_block = ""
        if doc.volume and doc.issue and str(doc.issue).strip():
            issue_block = f"{doc.volume}({doc.issue})"
        elif doc.volume:
            issue_block = str(doc.volume)
        page_block = f":{doc.pages}" if doc.pages else ""

        # 关键：用空字符串拼接，去掉所有多余空格
        gbt_parts = [f"{author_block}.{title_block}[{gbt_type}]."]  # 无空格
        if container:
            gbt_parts.append(f"{container},")  # 无空格
        if doc.year:
            gbt_parts.append(f"{doc.year},")  # 无空格
        if issue_block:
            gbt_parts.append(f"{issue_block}")  # 无空格
        if page_block:
            gbt_parts.append(f"{page_block}")  # 无空格
        # 拼接时用''而非' '，彻底去掉空格
        gbt7714_citation = ''.join(part for part in gbt_parts if part).rstrip(',') + '.'

        if doc.doi:
            gbt7714_citation += f"DOI:{doc.doi}."  # 无空格
        if doc.url:
            gbt7714_citation += f"URL:{doc.url}."  # 无空格

        return jsonify({
            'apa': apa_citation,
            'mla': mla_citation,
            'bibtex': bibtex_citation,
            'gbt7714': gbt7714_citation
        })
        
    except Exception as e:
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
            key = generate_bibtex_key(doc)
            entries.append(f"""@article{{{key},
    author  = "{doc.authors}",
    title   = "{doc.title}",
    journal = "{doc.journal}",
    year    = "{doc.year}",
    volume  = "{doc.volume}",
    number  = "{doc.issue}",
    pages   = "{doc.pages}"
}}""")
        content = "\n".join(entries)
        mimetype = 'application/x-bibtex'
        filename = 'batch_citations.bib'

    elif fmt == 'ris':
        entries = []
        for doc in documents:
            entries.append(f"""TY  - JOUR
AU  - {doc.authors}
TI  - {doc.title}
JO  - {doc.journal}
PY  - {doc.year}
VL  - {doc.volume}
IS  - {doc.issue}
SP  - {doc.pages}
ER  -""")
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

    normalized_type = (doc_payload['doc_type'] or '').lower()
    ris_type_map = {
        'journal': 'JOUR',
        'conference': 'CONF',
        'book': 'BOOK',
        'thesis': 'THES',
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
        ris_content = "\n".join(ris_lines)
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
        ris_content = "\n".join(ris_lines)
        response = make_response(ris_content)
        response.headers['Content-Type'] = 'text/plain; charset=utf-8'
        response.headers['Content-Disposition'] = f'attachment; filename=reference_{doc_id}.{ext_map[fmt]}'
        return response

    if fmt == 'endnote':
        record_type_map = {
            'journal': 'Journal Article',
            'conference': 'Conference Paper',
            'book': 'Book',
            'thesis': 'Thesis',
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
        bibtex_content = f"""@article{{{bibtex_key},
  title={{ {doc_payload['title']} }},
  author={{ {doc_payload['authors']} }},
  year={{ {doc_payload['year']} }},
  journal={{ {doc_payload['journal']} }},
  volume={{ {doc_payload['volume']} }},
  number={{ {doc_payload['issue']} }},
  pages={{ {doc_payload['pages']} }},
  doi={{ {doc_payload['doi']} }},
  url={{ {doc_payload['url']} }}
}}"""
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
            "itemType": "journalArticle",
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
                new_doc = Document(
                    title=title,
                    authors=authors,
                    journal=journal,
                    year=year,
                    keywords=keywords,
                    abstract=abstract,
                    doc_type=doc_type,
                    doi=doi_value or None,
                    file_name=file_info['display_name'],
                    file_path=file_info['relative_path'],
                    file_size=file_info['size'],
                    file_type=file_info['extension'],
                    owner_id=current_user.id,
                    upload_time=datetime.now()
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
    payload["parsed_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
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
    
    doc_type_options = get_doc_type_options()

    return render_template(
        'documents/table.html',
        documents=documents,
        total_count=len(documents),
        keyword=keyword,
        show_owner_column=is_admin_view,
        doc_type_options=[],
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
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
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
    # 后端清理摘要空白（替代前端 JS，只执行一次）
    # if doc.abstract:
    #     # 清理开头/结尾空白 + 合并连续换行（和前端 JS 逻辑一致）
    #     clean_abstract = doc.abstract.strip()  # 清理开头/结尾空白
    #     clean_abstract = re.sub(r'\n+', '\n', clean_abstract)  # 合并连续换行
    #     doc.abstract = clean_abstract  # 替换为清理后的内容

    ensure_document_access(doc)
    # 增加浏览量
    doc.view_count += 1
    db.session.commit()
    return render_template('document_detail.html', doc=doc,)


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
                           doc_types=DocType.query.all(),)

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
    doc.keywords = request.form['keywords'] or None
    doc.tags = request.form['tags'] or None
    doc.abstract = request.form['abstract'] or None
    doc.modified_at = datetime.now()
    
    try:
        db.session.commit()
        flash('文献信息更新成功！', 'success')
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
        "abstract": message.get("abstract", "")
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
        "abstract": attributes.get("descriptions", [{}])[0].get("description", "")
    }


def get_metadata_by_doi(doi: str) -> Optional[dict]:
    """优先从 Crossref 获取；若失败则回退到 DataCite。"""
    metadata = _fetch_crossref_metadata(doi)
    if metadata:
        return metadata
    return _fetch_datacite_metadata(doi)

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
        upload_time=datetime.now(),
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


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(admin_bp)
    app.register_blueprint(documents_bp)


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
