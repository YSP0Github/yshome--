import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')


def _ensure_dir_for(path: Path) -> Path:
    """Make sure the parent directory for a sqlite database exists."""
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def _normalize_sqlite_uri(raw_uri: Optional[str]) -> str:
    SQLITE_PREFIX = 'sqlite:///'
    if not raw_uri:
        default_path = _ensure_dir_for(BASE_DIR / 'ysxs.db')
        return f"{SQLITE_PREFIX}{default_path.as_posix()}"

    if not raw_uri.lower().startswith(SQLITE_PREFIX):
        return raw_uri

    path_and_query = raw_uri[len(SQLITE_PREFIX):]
    path_part, sep, query_part = path_and_query.partition('?')

    if path_part in {':memory:', ''}:
        return raw_uri

    expanded = os.path.expanduser(os.path.expandvars(path_part))
    candidate = Path(expanded)
    if not candidate.is_absolute():
        candidate = BASE_DIR / candidate

    normalized_path = _ensure_dir_for(candidate).as_posix()
    normalized_uri = f"{SQLITE_PREFIX}{normalized_path}"
    if sep:
        normalized_uri = f"{normalized_uri}?{query_part}"
    return normalized_uri


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
    SQLALCHEMY_DATABASE_URI = _normalize_sqlite_uri(
        os.environ.get('YSXS_DATABASE_URI')
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
