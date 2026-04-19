#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import smtplib
import subprocess
import sys
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path
from zoneinfo import ZoneInfo

try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None

TZ = ZoneInfo('Asia/Shanghai')


def load_env(project_dir: Path) -> None:
    env_file = project_dir / 'YSXS' / '.env'
    if load_dotenv and env_file.exists():
        load_dotenv(env_file)


def env_bool(key: str, default: bool = False) -> bool:
    raw = os.environ.get(key)
    if raw is None:
        return default
    return raw.strip().lower() in {'1', 'true', 'yes', 'on'}


def send_mail(subject: str, body: str) -> None:
    mail_server = (os.environ.get('MAIL_SERVER') or '').strip()
    username = (os.environ.get('MAIL_USERNAME') or '').strip()
    password = os.environ.get('MAIL_PASSWORD') or ''
    sender = (os.environ.get('MAIL_DEFAULT_SENDER') or username or '').strip()
    recipient = (os.environ.get('BACKUP_ALERT_EMAIL') or '').strip()
    if not (mail_server and username and password and sender and recipient):
        raise RuntimeError('邮件配置不完整，无法发送测试邮件。')

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = recipient
    msg.set_content(body)

    port = int((os.environ.get('MAIL_PORT') or '587').strip())
    use_ssl = env_bool('MAIL_USE_SSL', False)
    use_tls = env_bool('MAIL_USE_TLS', False)

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


def run_db_backup(project_dir: Path) -> tuple[int, str]:
    proc = subprocess.run(
        [sys.executable, str(project_dir / 'deploy' / 'backup_ysxs_db.py')],
        capture_output=True,
        text=True,
    )
    output = (proc.stdout or '') + ('\n' + proc.stderr if proc.stderr else '')
    return proc.returncode, output.strip()


def main() -> int:
    parser = argparse.ArgumentParser(description='测试 YSXS 备份链路。')
    parser.add_argument('--mail-only', action='store_true', help='仅发送邮件，不执行数据库备份测试')
    args = parser.parse_args()

    project_dir = Path(__file__).resolve().parent.parent
    load_env(project_dir)
    now = datetime.now(TZ)

    if args.mail_only:
        body = os.environ.get('UPLOADS_BACKUP_ERROR') or '这是 YSXS 备份链路的邮件测试。'
        send_mail(f'[YSXS备份测试] {now:%Y-%m-%d %H:%M:%S}', body)
        print('邮件测试已发送')
        return 0

    code, output = run_db_backup(project_dir)
    if code == 0:
        subject = f'[YSXS备份测试成功] {now:%Y-%m-%d %H:%M:%S}'
        body = f'数据库备份链路测试成功。\n北京时间: {now:%Y-%m-%d %H:%M:%S}\n输出:\n{output}\n'
    else:
        subject = f'[YSXS备份测试失败] {now:%Y-%m-%d %H:%M:%S}'
        body = f'数据库备份链路测试失败。\n北京时间: {now:%Y-%m-%d %H:%M:%S}\n输出:\n{output}\n'
    send_mail(subject, body)
    print(body)
    return 0 if code == 0 else code


if __name__ == '__main__':
    raise SystemExit(main())
