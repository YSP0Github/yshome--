from __future__ import annotations

from collections import defaultdict, deque
from datetime import timedelta
from threading import Lock

from flask import current_app
from flask_login import current_user
from sqlalchemy import func

from ..extensions import db
from ..models import Document, RuntimeMetricSnapshot, User
from ..utils.datetimes import format_cn_time, utc_now


class RuntimeMetricsStore:
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
        now = utc_now()
        with self.lock:
            self.last_seen[user_id] = now
            self._cleanup_locked(now)

    def record_transfer(self, user_id, bytes_out) -> None:
        size = max(0, int(bytes_out or 0))
        if size <= 0:
            return
        now = utc_now()
        with self.lock:
            self.site_events.append((now, size))
            if user_id:
                queue = self.user_events[user_id]
                queue.append((now, size))
            self._cleanup_locked(now)

    def snapshot(self) -> dict:
        now = utc_now()
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


def _format_timestamp(dt_value):
    if not dt_value:
        return None, None
    display = format_cn_time(dt_value, '%Y-%m-%d %H:%M:%S')
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
            'label': format_cn_time(bucket_end, '%H:%M:%S'),
            'bytes': value,
            'bps': bps
        })
    return series


runtime_metrics = RuntimeMetricsStore()
SNAPSHOT_INTERVAL_SECONDS = 60
SNAPSHOT_RETENTION_HOURS = 72
_last_snapshot_saved_at = None


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
        now = utc_now()
        if _last_snapshot_saved_at and (now - _last_snapshot_saved_at).total_seconds() < SNAPSHOT_INTERVAL_SECONDS:
            return
        payload = build_runtime_metrics_payload()
        summary = payload.get('summary', {})
        snapshot = RuntimeMetricSnapshot(
            captured_at=utc_now(),
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


def runtime_metrics_before_request():
    if current_user.is_authenticated:
        runtime_metrics.mark_active(current_user.id)


def runtime_metrics_after_request(response):
    try:
        user_id = current_user.id if current_user.is_authenticated else None
        runtime_metrics.record_transfer(user_id, _estimate_response_size(response))
        maybe_persist_runtime_metrics()
    except Exception:
        current_app.logger.exception("Failed to record runtime metrics")
    return response


__all__ = [
    'RuntimeMetricsStore',
    'runtime_metrics',
    'human_readable_bytes',
    'human_readable_bandwidth',
    'build_runtime_metrics_payload',
    'maybe_persist_runtime_metrics',
    'runtime_metrics_before_request',
    'runtime_metrics_after_request',
]
