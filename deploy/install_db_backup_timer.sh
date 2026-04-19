#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE_DIR="$PROJECT_DIR/deploy/templates"
GENERATED_DIR="$PROJECT_DIR/deploy/generated"
TARGET_DIR="$PROJECT_DIR"
ENV_FILE="$PROJECT_DIR/YSXS/.env"
VENV_DIR="$PROJECT_DIR/.venv"
RUN_USER="${SUDO_USER:-$USER}"
RUN_GROUP="${SUDO_USER:-$USER}"
SERVICE_NAME="ysxs-db-backup"
INTERACTIVE=0

usage() {
  cat <<USAGE
用法：sudo bash deploy/install_db_backup_timer.sh [选项]

  --interactive         进入交互式问答
  --target-dir PATH     项目目录，默认当前仓库目录
  --env-file PATH       .env 路径，默认 <target-dir>/YSXS/.env
  --venv-dir PATH       虚拟环境目录，默认 <target-dir>/.venv
  --run-user USER       定时任务运行用户
  --run-group GROUP     定时任务运行组
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interactive) INTERACTIVE=1; shift ;;
    --target-dir) TARGET_DIR="$2"; shift 2 ;;
    --env-file) ENV_FILE="$2"; shift 2 ;;
    --venv-dir) VENV_DIR="$2"; shift 2 ;;
    --run-user) RUN_USER="$2"; shift 2 ;;
    --run-group) RUN_GROUP="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知参数: $1"; usage; exit 1 ;;
  esac
done

normalize() {
  python3 - <<PY
from pathlib import Path
print(Path(r'''$1''').expanduser().resolve())
PY
}

TARGET_DIR="$(normalize "$TARGET_DIR")"
ENV_FILE="$(normalize "$ENV_FILE")"
VENV_DIR="$(normalize "$VENV_DIR")"
mkdir -p "$GENERATED_DIR"

ask() {
  local prompt="$1"
  local default="${2-}"
  local answer
  read -r -p "$prompt [$default]: " answer || true
  printf '%s' "${answer:-$default}"
}

if [[ $INTERACTIVE -eq 1 ]]; then
  TARGET_DIR="$(normalize "$(ask '项目目录' "$TARGET_DIR")")"
  ENV_FILE="$(normalize "$(ask '.env 路径' "$ENV_FILE")")"
  VENV_DIR="$(normalize "$(ask '虚拟环境目录' "$VENV_DIR")")"
  RUN_USER="$(ask '运行用户' "$RUN_USER")"
  RUN_GROUP="$(ask '运行组' "$RUN_GROUP")"
fi

if [[ $EUID -ne 0 ]]; then
  echo "请使用 sudo/root 安装 systemd timer。" >&2
  exit 1
fi

service_out="$GENERATED_DIR/${SERVICE_NAME}.service"
timer_out="$GENERATED_DIR/${SERVICE_NAME}.timer"

sed \
  -e "s|__RUN_USER__|$RUN_USER|g" \
  -e "s|__RUN_GROUP__|$RUN_GROUP|g" \
  -e "s|__PROJECT_DIR__|$TARGET_DIR|g" \
  -e "s|__ENV_FILE__|$ENV_FILE|g" \
  -e "s|__VENV_DIR__|$VENV_DIR|g" \
  "$TEMPLATE_DIR/ysxs-db-backup.service.template" > "$service_out"
cp "$TEMPLATE_DIR/ysxs-db-backup.timer.template" "$timer_out"

cp "$service_out" "/etc/systemd/system/${SERVICE_NAME}.service"
cp "$timer_out" "/etc/systemd/system/${SERVICE_NAME}.timer"

systemctl daemon-reload
systemctl enable --now "${SERVICE_NAME}.timer"
systemctl restart "${SERVICE_NAME}.timer"

printf '\n已安装：\n  %s\n  %s\n' "/etc/systemd/system/${SERVICE_NAME}.service" "/etc/systemd/system/${SERVICE_NAME}.timer"
systemctl list-timers | grep "$SERVICE_NAME" || true
