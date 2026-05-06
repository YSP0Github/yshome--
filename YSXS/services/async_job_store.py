from __future__ import annotations

import json
import os
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any, Iterable

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_VAR_DIR = PROJECT_ROOT.parent / "var" / "ysxs"
DEFAULT_DB_PATH = DEFAULT_VAR_DIR / "async_jobs.sqlite3"

_INIT_LOCK = threading.Lock()
_INITIALIZED_DB_PATHS: set[str] = set()


def _expand_path(value: str) -> Path:
    expanded = os.path.expanduser(os.path.expandvars(value))
    path = Path(expanded)
    if not path.is_absolute():
        path = (PROJECT_ROOT / path).resolve()
    return path


def _is_within(path: Path, root: Path) -> bool:
    try:
        path.resolve().relative_to(root.resolve())
        return True
    except ValueError:
        return False


def _sqlite_uri_to_path(uri: str) -> Path | None:
    prefix = "sqlite:///"
    if not uri or not uri.lower().startswith(prefix):
        return None
    path_part = uri[len(prefix):].partition("?")[0].strip()
    if not path_part or path_part == ":memory:":
        return None
    return _expand_path(path_part)


def get_async_job_store_path() -> Path:
    explicit = (os.environ.get("YSXS_ASYNC_JOB_STORE_PATH") or "").strip()
    if explicit:
        path = _expand_path(explicit)
        path.parent.mkdir(parents=True, exist_ok=True)
        return path

    upload_dir_raw = (os.environ.get("YSXS_UPLOAD_DIR") or "").strip()
    if upload_dir_raw:
        upload_dir = _expand_path(upload_dir_raw)
        if not _is_within(upload_dir, PROJECT_ROOT):
            path = upload_dir.parent / "async_jobs.sqlite3"
            path.parent.mkdir(parents=True, exist_ok=True)
            return path

    db_path = _sqlite_uri_to_path((os.environ.get("YSXS_DATABASE_URI") or "").strip())
    if db_path and not _is_within(db_path, PROJECT_ROOT):
        path = db_path.parent / "async_jobs.sqlite3"
        path.parent.mkdir(parents=True, exist_ok=True)
        return path

    DEFAULT_VAR_DIR.mkdir(parents=True, exist_ok=True)
    return DEFAULT_DB_PATH


def _ensure_schema(db_path: Path) -> None:
    db_key = str(db_path)
    if db_key in _INITIALIZED_DB_PATHS:
        return
    with _INIT_LOCK:
        if db_key in _INITIALIZED_DB_PATHS:
            return
        db_path.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(db_path, timeout=30) as conn:
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA synchronous=NORMAL")
            conn.execute("PRAGMA busy_timeout=30000")
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS async_jobs (
                    job_id TEXT PRIMARY KEY,
                    job_type TEXT NOT NULL,
                    user_id INTEGER NOT NULL,
                    fingerprint TEXT,
                    status TEXT NOT NULL,
                    step TEXT,
                    error TEXT,
                    payload_json TEXT,
                    html TEXT,
                    params_json TEXT,
                    created_ts REAL NOT NULL,
                    updated_ts REAL NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_async_jobs_type_fingerprint_updated
                ON async_jobs (job_type, fingerprint, updated_ts DESC)
                """
            )
            conn.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_async_jobs_type_updated
                ON async_jobs (job_type, updated_ts)
                """
            )
        _INITIALIZED_DB_PATHS.add(db_key)


def _connect() -> sqlite3.Connection:
    db_path = get_async_job_store_path()
    _ensure_schema(db_path)
    conn = sqlite3.connect(db_path, timeout=30, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA busy_timeout=30000")
    return conn


def _dump_json(value: Any) -> str | None:
    if value is None:
        return None
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def _load_json(value: str | None) -> Any:
    if not value:
        return None
    try:
        return json.loads(value)
    except Exception:
        return None


def _row_to_job(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return {
        "job_id": row["job_id"],
        "job_type": row["job_type"],
        "user_id": int(row["user_id"]),
        "fingerprint": row["fingerprint"] or "",
        "status": row["status"] or "",
        "step": row["step"] or "",
        "error": row["error"],
        "payload": _load_json(row["payload_json"]),
        "html": row["html"] or "",
        "params": _load_json(row["params_json"]) or {},
        "created_ts": float(row["created_ts"] or 0),
        "updated_ts": float(row["updated_ts"] or 0),
    }


def _write_job(conn: sqlite3.Connection, job: dict[str, Any]) -> None:
    conn.execute(
        """
        INSERT INTO async_jobs (
            job_id, job_type, user_id, fingerprint, status, step, error,
            payload_json, html, params_json, created_ts, updated_ts
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(job_id) DO UPDATE SET
            job_type=excluded.job_type,
            user_id=excluded.user_id,
            fingerprint=excluded.fingerprint,
            status=excluded.status,
            step=excluded.step,
            error=excluded.error,
            payload_json=excluded.payload_json,
            html=excluded.html,
            params_json=excluded.params_json,
            created_ts=excluded.created_ts,
            updated_ts=excluded.updated_ts
        """,
        (
            job["job_id"],
            job["job_type"],
            int(job["user_id"]),
            job.get("fingerprint") or "",
            job.get("status") or "pending",
            job.get("step") or "",
            job.get("error"),
            _dump_json(job.get("payload")),
            job.get("html") or "",
            _dump_json(job.get("params") or {}),
            float(job.get("created_ts") or time.time()),
            float(job.get("updated_ts") or time.time()),
        ),
    )


def cleanup_async_jobs(job_type: str, ttl_seconds: int) -> int:
    cutoff_ts = time.time() - max(0, int(ttl_seconds or 0))
    with _connect() as conn:
        cursor = conn.execute(
            "DELETE FROM async_jobs WHERE job_type = ? AND updated_ts < ?",
            (job_type, cutoff_ts),
        )
        return int(cursor.rowcount or 0)


def get_async_job(job_type: str, job_id: str) -> dict[str, Any] | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM async_jobs WHERE job_type = ? AND job_id = ?",
            (job_type, job_id),
        ).fetchone()
    return _row_to_job(row)


def find_latest_async_job_by_fingerprint(
    job_type: str,
    fingerprint: str,
    *,
    statuses: Iterable[str] | None = None,
) -> dict[str, Any] | None:
    statuses = [str(item).strip() for item in (statuses or []) if str(item).strip()]
    sql = "SELECT * FROM async_jobs WHERE job_type = ? AND fingerprint = ?"
    params: list[Any] = [job_type, fingerprint]
    if statuses:
        placeholders = ", ".join("?" for _ in statuses)
        sql += f" AND status IN ({placeholders})"
        params.extend(statuses)
    sql += " ORDER BY updated_ts DESC, created_ts DESC LIMIT 1"
    with _connect() as conn:
        row = conn.execute(sql, params).fetchone()
    return _row_to_job(row)


def create_async_job(
    *,
    job_type: str,
    job_id: str,
    user_id: int,
    fingerprint: str,
    status: str,
    step: str,
    params: dict[str, Any] | None = None,
    error: str | None = None,
    payload: Any = None,
    html: str = "",
) -> dict[str, Any]:
    now_ts = time.time()
    job = {
        "job_id": job_id,
        "job_type": job_type,
        "user_id": int(user_id),
        "fingerprint": fingerprint,
        "status": status,
        "step": step,
        "error": error,
        "payload": payload,
        "html": html,
        "params": params or {},
        "created_ts": now_ts,
        "updated_ts": now_ts,
    }
    with _connect() as conn:
        _write_job(conn, job)
    return job


def update_async_job(job_type: str, job_id: str, **updates) -> dict[str, Any] | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM async_jobs WHERE job_type = ? AND job_id = ?",
            (job_type, job_id),
        ).fetchone()
        job = _row_to_job(row)
        if not job:
            return None
        job.update(updates)
        job["updated_ts"] = time.time()
        _write_job(conn, job)
        return job
