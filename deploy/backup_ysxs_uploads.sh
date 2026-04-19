#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$PROJECT_DIR/YSXS/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$PROJECT_DIR/YSXS/.env"
  set +a
fi

UPLOAD_DIR="${YSXS_UPLOAD_DIR:-$PROJECT_DIR/var/ysxs/uploads}"
REMOTE_HOST="${UPLOADS_BACKUP_REMOTE_HOST:-${BACKUP_REMOTE_HOST:-}}"
REMOTE_PORT="${UPLOADS_BACKUP_REMOTE_PORT:-${BACKUP_REMOTE_PORT:-22}}"
REMOTE_USER="${UPLOADS_BACKUP_REMOTE_USER:-${BACKUP_REMOTE_USER:-}}"
REMOTE_DIR="${UPLOADS_BACKUP_REMOTE_DIR:-${BACKUP_REMOTE_DIR:-}}"
PASSWORD="${UPLOADS_BACKUP_REMOTE_PASSWORD:-${BACKUP_REMOTE_PASSWORD:-}}"
ALERT_EMAIL="${UPLOADS_BACKUP_ALERT_EMAIL:-${BACKUP_ALERT_EMAIL:-}}"
LOG_PREFIX='[YSXS uploads backup]'

log() {
  printf '%s %s\n' "$LOG_PREFIX" "$*"
}

fail_and_alert() {
  local msg="$1"
  echo "$msg" >&2
  if [[ -n "$ALERT_EMAIL" && -x "$PROJECT_DIR/.venv/bin/python" ]]; then
    UPLOADS_BACKUP_ERROR="$msg" "$PROJECT_DIR/.venv/bin/python" "$PROJECT_DIR/deploy/test_backup_chain.py" --mail-only >/dev/null 2>&1 || true
  fi
  exit 1
}

[[ -d "$UPLOAD_DIR" ]] || fail_and_alert "上传目录不存在: $UPLOAD_DIR"
[[ -n "$REMOTE_HOST" && -n "$REMOTE_USER" && -n "$REMOTE_DIR" ]] || fail_and_alert "缺少上传备份远程配置（UPLOADS_BACKUP_REMOTE_* 或 BACKUP_REMOTE_*）。"
command -v rsync >/dev/null 2>&1 || fail_and_alert "缺少 rsync，请先安装。"

SSH_BASE=(ssh -p "$REMOTE_PORT" -o StrictHostKeyChecking=accept-new)
RSYNC_RSH=(ssh -p "$REMOTE_PORT" -o StrictHostKeyChecking=accept-new)
if [[ -n "$PASSWORD" ]]; then
  command -v sshpass >/dev/null 2>&1 || fail_and_alert "设置了上传备份密码，但未安装 sshpass。"
  SSH_BASE=(sshpass -p "$PASSWORD" "${SSH_BASE[@]}")
  RSYNC_RSH=(sshpass -p "$PASSWORD" ssh -p "$REMOTE_PORT" -o StrictHostKeyChecking=accept-new)
fi

REMOTE_PATH="$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/uploads/"

log "确保远程 uploads 目录存在"
"${SSH_BASE[@]}" "$REMOTE_USER@$REMOTE_HOST" "mkdir -p '$REMOTE_DIR/uploads'" || fail_and_alert "无法创建远程目录: $REMOTE_DIR/uploads"

log "开始执行 uploads 增量备份"
rsync -av --ignore-existing -e "${RSYNC_RSH[*]}" "$UPLOAD_DIR/" "$REMOTE_PATH" || fail_and_alert "rsync 增量备份失败。"

log "uploads 增量备份完成"
