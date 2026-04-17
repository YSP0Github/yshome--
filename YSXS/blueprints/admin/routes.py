from __future__ import annotations

from datetime import timedelta

from flask import Blueprint, flash, jsonify, redirect, render_template, request, url_for
from flask_login import current_user, login_required
from sqlalchemy import func

from ...extensions import db
from ...models import ActivityLog, Document, RuntimeMetricSnapshot, User
from ...services.runtime_metrics import build_runtime_metrics_payload
from ...services.security import admin_required, super_admin_required
from ...utils.datetimes import format_cn_time, utc_now

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


@admin_bp.route('/dashboard')
@login_required
@admin_required
def admin_dashboard():
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
    doc_types = [(row[0], int(row[1] or 0)) for row in doc_type_rows]

    stats = {
        'total_users': User.query.count(),
        'active_users': User.query.filter_by(status='正常').count(),
        'new_users_week': User.query.filter(
            User.created_at >= utc_now() - timedelta(days=7)
        ).count(),
        'total_docs': Document.query.count(),
        'new_docs_week': Document.query.filter(
            Document.upload_time >= utc_now() - timedelta(days=7)
        ).count(),
        'doc_types': doc_types,
        'total_storage': sum((doc.file_size or 0) for doc in Document.query.all()) if Document.query.count() > 0 else 0,
    }

    recent_data = {
        'recent_users': User.query.order_by(User.created_at.desc()).limit(5).all(),
        'recent_docs': Document.query.order_by(Document.upload_time.desc()).limit(5).all(),
        'recent_logs': ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(10).all(),
    }

    chart_data = {
        'user_growth': [
            User.query.filter(
                User.created_at >= utc_now() - timedelta(days=i),
                User.created_at < utc_now() - timedelta(days=i - 1)
            ).count() for i in range(6, -1, -1)
        ],
        'doc_growth': [
            Document.query.filter(
                Document.upload_time >= utc_now() - timedelta(days=i),
                Document.upload_time < utc_now() - timedelta(days=i - 1)
            ).count() for i in range(6, -1, -1)
        ],
    }

    return render_template(
        'admin/dashboard.html',
        stats=stats,
        recent=recent_data,
        chart_data=chart_data,
    )


@admin_bp.route('/runtime-monitor')
@login_required
@admin_required
def runtime_monitor():
    payload = build_runtime_metrics_payload()
    return render_template(
        'admin/runtime_monitor.html',
        runtime_payload=payload,
        summary=payload.get('summary', {}),
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
    cutoff = utc_now() - timedelta(hours=hours)
    snapshots = (
        RuntimeMetricSnapshot.query
        .filter(RuntimeMetricSnapshot.captured_at >= cutoff)
        .order_by(RuntimeMetricSnapshot.captured_at.asc())
        .all()
    )
    points = [
        {
            'captured_at': snap.captured_at.isoformat(),
            'captured_label': format_cn_time(snap.captured_at, '%m-%d %H:%M'),
            'current_bandwidth_bps': snap.current_bandwidth_bps,
            'total_data_bytes': snap.total_data_bytes,
            'online_users': snap.online_users,
            'total_recent_bytes': snap.total_recent_bytes,
            'sample_window_seconds': snap.sample_window_seconds,
        }
        for snap in snapshots
    ]
    return jsonify({'hours': hours, 'points': points, 'count': len(points)})
