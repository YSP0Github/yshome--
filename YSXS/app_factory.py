import logging
import os
from pathlib import Path
from logging.handlers import RotatingFileHandler
from flask import Flask
from flask_cors import CORS

from .config import CONFIG_MAP, DevelopmentConfig, BASE_DIR
from .extensions import csrf, db, login_manager, migrate, mail
from .middleware import BandwidthLimiterMiddleware
from .utils.datetimes import format_cn_time


def normalize_url_prefix(prefix: str | None) -> str:
    if prefix is None:
        return ''
    cleaned = str(prefix).strip()
    if not cleaned:
        return ''
    cleaned = cleaned.strip('/')
    if not cleaned:
        return ''
    return f"/{cleaned}"


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
    app.config.setdefault('SESSION_COOKIE_PATH', '/')
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
    login_manager.login_message = '请先登录以访问该页面'
    login_manager.login_message_category = 'warning'

    allowed_origin = os.environ.get('YSXS_ALLOWED_ORIGIN', 'http://localhost:5000')
    CORS(
        app,
        resources={r"/*": {"origins": [allowed_origin]}} ,
        supports_credentials=True,
    )

    app.add_template_filter(format_cn_time, 'format_cn_time')

    setup_logging(app)
    limit_bps = app.config.get('BANDWIDTH_LIMIT_BYTES_PER_SEC', 0)
    if limit_bps:
        app.wsgi_app = BandwidthLimiterMiddleware(app.wsgi_app, limit_bps)
        app.logger.info('Bandwidth limiter enabled: %s bytes/sec', limit_bps)
    return app
