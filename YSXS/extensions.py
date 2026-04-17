from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from flask_migrate import Migrate
from flask_mail import Mail
import sqlalchemy.orm as sa_orm

# Flask-SQLAlchemy>=3 依赖 SQLAlchemy 2.0 的 DeclarativeBase；如果当前环境还是 1.x，
# 我们为其提供一个最小的占位类，避免导入时抛 AttributeError。
if not hasattr(sa_orm, "DeclarativeBase"):  # pragma: no cover - 仅在旧版本 SQLAlchemy 中触发
    class DeclarativeBase:
        """Fallback placeholder for SQLAlchemy < 2.0."""
        pass
    sa_orm.DeclarativeBase = DeclarativeBase

if not hasattr(sa_orm, "DeclarativeBaseNoMeta"):  # pragma: no cover
    sa_orm.DeclarativeBaseNoMeta = sa_orm.DeclarativeBase

from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()
login_manager = LoginManager()
csrf = CSRFProtect()
migrate = Migrate()
mail = Mail()
