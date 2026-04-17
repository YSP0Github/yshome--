from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from zoneinfo import ZoneInfo

UTC = timezone.utc
CN_TZ = ZoneInfo("Asia/Shanghai")


def utc_now() -> datetime:
    """Return naive UTC datetime for consistent storage."""
    return datetime.now(UTC).replace(tzinfo=None)


def ensure_utc(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        # System-wide policy: all naive datetimes are stored as UTC.
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def to_cst(value: Optional[datetime]) -> Optional[datetime]:
    aware = ensure_utc(value)
    return aware.astimezone(CN_TZ) if aware else None


def format_cn_time(value: Optional[datetime], fmt: str = "%Y-%m-%d %H:%M") -> str:
    local_dt = to_cst(value)
    return local_dt.strftime(fmt) if local_dt else ""
