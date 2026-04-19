#!/usr/bin/env python3
from __future__ import annotations

import os
import shlex
import shutil
import smtplib
import sqlite3
import subprocess
import sys
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path
from zoneinfo import ZoneInfo

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover
    load_dotenv = None

TZ = ZoneInfo("Asia/Shanghai")


def env_bool(key: str, default: bool = False) -> bool:
    raw = os.environ.get(key)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def load_project_env(project_dir: Path) -> None:
    env_file = project_dir / "YSXS" / ".env"
    if load_dotenv and env_file.exists():
        load_dotenv(env_file)


def require_env(key: str) -> str:
    value = (os.environ.get(key) or "").strip()
    if not value:
        raise RuntimeError(f"缺少环境变量: {key}")
    return value


def make_local_backup(db_path: Path, backup_dir: Path) -> Path:
    backup_dir.mkdir(parents=True, exist_ok=True)
    now = datetime.now(TZ)
    backup_name = f"ysxs-{now:%Y%m%d-%H%M%S}.db"
    backup_path = backup_dir / backup_name
    source = sqlite3.connect(db_path)
    target = sqlite3.connect(backup_path)
    try:
        source.backup(target)
    finally:
        target.close()
        source.close()
    return backup_path


def build_scp_commands(backup_path: Path) -> tuple[list[str], list[str]]:
    host = require_env("BACKUP_REMOTE_HOST")
    user = require_env("BACKUP_REMOTE_USER")
    remote_dir = require_env("BACKUP_REMOTE_DIR").rstrip("/\\")
    port = (os.environ.get("BACKUP_REMOTE_PORT") or "22").strip()
    password = os.environ.get("BACKUP_REMOTE_PASSWORD") or ""
    filename = backup_path.name
    target = f"{user}@{host}:{remote_dir}/{filename}"

    base = ["scp", "-P", port, "-o", "StrictHostKeyChecking=accept-new", str(backup_path), target]
    if password:
        sshpass = shutil.which("sshpass")
        if not sshpass:
            raise RuntimeError("设置了 BACKUP_REMOTE_PASSWORD，但服务器未安装 sshpass。请改用 SSH 密钥，或先安装 sshpass。")
        return [sshpass, "-p", password, *base], base
    return base, base


def upload_backup(backup_path: Path) -> None:
    command, display_cmd = build_scp_commands(backup_path)
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(
            "远程复制失败\n"
            f"命令: {' '.join(shlex.quote(x) for x in display_cmd)}\n"
            f"stdout: {result.stdout.strip()}\n"
            f"stderr: {result.stderr.strip()}"
        )


def send_failure_email(subject: str, body: str, attachment: Path | None) -> None:
    mail_server = (os.environ.get("MAIL_SERVER") or "").strip()
    username = (os.environ.get("MAIL_USERNAME") or "").strip()
    password = os.environ.get("MAIL_PASSWORD") or ""
    sender = (os.environ.get("MAIL_DEFAULT_SENDER") or username or "").strip()
    recipient = (os.environ.get("BACKUP_ALERT_EMAIL") or "").strip()
    if not (mail_server and username and password and sender and recipient):
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = recipient
    msg.set_content(body)

    if attachment and attachment.exists():
        with attachment.open("rb") as fh:
            data = fh.read()
        msg.add_attachment(data, maintype="application", subtype="octet-stream", filename=attachment.name)

    port = int((os.environ.get("MAIL_PORT") or "587").strip())
    use_ssl = env_bool("MAIL_USE_SSL", False)
    use_tls = env_bool("MAIL_USE_TLS", False)

    if use_ssl:
        with smtplib.SMTP_SSL(mail_server, port, timeout=30) as smtp:
            smtp.login(username, password)
            smtp.send_message(msg)
    else:
        with smtplib.SMTP(mail_server, port, timeout=30) as smtp:
            if use_tls:
                smtp.starttls()
            smtp.login(username, password)
            smtp.send_message(msg)


def prune_old_backups(backup_dir: Path) -> None:
    keep_days = int((os.environ.get("BACKUP_LOCAL_KEEP_DAYS") or "30").strip())
    if keep_days <= 0:
        return
    cutoff = datetime.now(TZ).timestamp() - keep_days * 86400
    for path in backup_dir.glob("ysxs-*.db"):
        try:
            if path.stat().st_mtime < cutoff:
                path.unlink()
        except Exception:
            pass


def main() -> int:
    project_dir = Path(__file__).resolve().parent.parent
    load_project_env(project_dir)

    db_uri = require_env("YSXS_DATABASE_URI")
    if not db_uri.startswith("sqlite:///"):
        raise RuntimeError("当前备份脚本仅支持 sqlite 数据库。")
    db_path = Path(db_uri[len("sqlite:///"):]).expanduser().resolve()
    backup_dir = Path((os.environ.get("BACKUP_LOCAL_DIR") or project_dir / "var" / "ysxs" / "backups" / "db")).expanduser().resolve()

    if not db_path.exists():
        raise RuntimeError(f"数据库文件不存在: {db_path}")

    backup_path = make_local_backup(db_path, backup_dir)
    prune_old_backups(backup_dir)
    upload_backup(backup_path)
    print(f"备份成功: {backup_path}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        project_dir = Path(__file__).resolve().parent.parent
        try:
            load_project_env(project_dir)
        except Exception:
            pass
        backup_path = None
        try:
            db_uri = (os.environ.get("YSXS_DATABASE_URI") or "").strip()
            if db_uri.startswith("sqlite:///"):
                db_path = Path(db_uri[len("sqlite:///"):]).expanduser().resolve()
                backup_dir = Path((os.environ.get("BACKUP_LOCAL_DIR") or project_dir / "var" / "ysxs" / "backups" / "db")).expanduser().resolve()
                if db_path.exists():
                    backup_path = make_local_backup(db_path, backup_dir)
        except Exception:
            backup_path = None
        now = datetime.now(TZ)
        subject = f"[YSXS备份失败] {now:%Y-%m-%d %H:%M:%S}"
        body = f"YSXS 数据库备份失败。\n时间(北京时间): {now:%Y-%m-%d %H:%M:%S}\n错误信息: {exc}\n"
        try:
            send_failure_email(subject, body, backup_path)
        except Exception:
            pass
        print(body, file=sys.stderr)
        raise SystemExit(1)
