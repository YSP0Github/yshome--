#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="$PROJECT_DIR/deploy"
TEMPLATE_DIR="$DEPLOY_DIR/templates"
GENERATED_DIR="$DEPLOY_DIR/generated"
REQ_FILE="$DEPLOY_DIR/requirements-server.txt"

INSTALL_SYSTEM=0
INSTALL_NGINX=0
INSTALL_SYSTEMD=0
RUN_MIGRATIONS=1
CREATE_ENV_IF_MISSING=1
INTERACTIVE=0
DOMAIN=""
RUN_USER="${SUDO_USER:-$USER}"
RUN_GROUP="${SUDO_USER:-$USER}"
TARGET_DIR="$PROJECT_DIR"
VAR_DIR="$PROJECT_DIR/var/ysxs"
PORT="5050"
ENV_FILE="$PROJECT_DIR/YSXS/.env"
VENV_DIR="$PROJECT_DIR/.venv"
PYTHON_BIN="python3"
SERVICE_NAME="ysxs-gunicorn"

usage() {
  cat <<USAGE
用法：bash deploy/bootstrap_yshome.sh [选项]

可选参数：
  --interactive             进入交互式问答
  --target-dir PATH         项目部署目录，默认当前仓库目录
  --var-dir PATH            数据目录，默认 <target-dir>/var/ysxs
  --env-file PATH           .env 文件路径，默认 <target-dir>/YSXS/.env
  --venv-dir PATH           虚拟环境目录，默认 <target-dir>/.venv
  --python PATH             Python 可执行文件，默认 python3
  --domain DOMAIN           域名，用于生成 nginx 配置
  --port PORT               gunicorn 监听端口，默认 5050
  --run-user USER           systemd 运行用户，默认当前用户
  --run-group GROUP         systemd 运行组，默认同用户
  --install-system          自动 apt 安装系统依赖（需 sudo/root）
  --install-nginx           安装 nginx 配置到 /etc/nginx/conf.d/（需 sudo/root）
  --install-systemd         安装 systemd 服务到 /etc/systemd/system/（需 sudo/root）
  --skip-migrations         跳过 flask db upgrade
  --no-env-create           若 .env 不存在则不自动创建模板
  -h, --help                显示帮助
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interactive) INTERACTIVE=1; shift ;;
    --target-dir) TARGET_DIR="$2"; shift 2 ;;
    --var-dir) VAR_DIR="$2"; shift 2 ;;
    --env-file) ENV_FILE="$2"; shift 2 ;;
    --venv-dir) VENV_DIR="$2"; shift 2 ;;
    --python) PYTHON_BIN="$2"; shift 2 ;;
    --domain) DOMAIN="$2"; shift 2 ;;
    --port) PORT="$2"; shift 2 ;;
    --run-user) RUN_USER="$2"; shift 2 ;;
    --run-group) RUN_GROUP="$2"; shift 2 ;;
    --install-system) INSTALL_SYSTEM=1; shift ;;
    --install-nginx) INSTALL_NGINX=1; shift ;;
    --install-systemd) INSTALL_SYSTEMD=1; shift ;;
    --skip-migrations) RUN_MIGRATIONS=0; shift ;;
    --no-env-create) CREATE_ENV_IF_MISSING=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知参数: $1"; usage; exit 1 ;;
  esac
done

if [[ $INTERACTIVE -eq 0 && -t 0 && $# -eq 0 ]]; then
  INTERACTIVE=1
fi

normalize_path() {
  python3 - <<PY
from pathlib import Path
print(Path(r'''$1''').expanduser().resolve())
PY
}

TARGET_DIR="$(normalize_path "$TARGET_DIR")"
VAR_DIR="$(normalize_path "$VAR_DIR")"
ENV_FILE="$(normalize_path "$ENV_FILE")"
VENV_DIR="$(normalize_path "$VENV_DIR")"

if [[ ! -f "$TARGET_DIR/YSXS/app.py" ]]; then
  echo "目标目录中未找到 YSXS/app.py：$TARGET_DIR" >&2
  echo "请先把整个 yshome 项目 clone / rsync 到目标目录，再运行本脚本。" >&2
  exit 1
fi

log() { printf '\n[%s] %s\n' "$(date '+%F %T')" "$*"; }
need_root() {
  if [[ $EUID -ne 0 ]]; then
    echo "此步骤需要 root/sudo：$*" >&2
    exit 1
  fi
}
ensure_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "缺少命令: $1" >&2; exit 1; }
}
ask() {
  local prompt="$1"
  local default="${2-}"
  local answer
  if [[ -n "$default" ]]; then
    read -r -p "$prompt [$default]: " answer || true
    printf '%s' "${answer:-$default}"
  else
    read -r -p "$prompt: " answer || true
    printf '%s' "$answer"
  fi
}
ask_yes_no() {
  local prompt="$1"
  local default="$2"
  local suffix="[y/N]"
  local answer
  [[ "$default" == "y" ]] && suffix="[Y/n]"
  while true; do
    read -r -p "$prompt $suffix: " answer || true
    answer="${answer:-$default}"
    case "${answer,,}" in
      y|yes) return 0 ;;
      n|no) return 1 ;;
    esac
  done
}

generate_secret() {
  python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
}

interactive_wizard() {
  echo
  echo "================ yshome 部署向导 ================"
  TARGET_DIR="$(normalize_path "$(ask '项目部署目录' "$TARGET_DIR")")"
  VAR_DIR="$(normalize_path "$(ask '运行数据目录（数据库/uploads）' "$VAR_DIR")")"
  VENV_DIR="$(normalize_path "$(ask '虚拟环境目录' "$VENV_DIR")")"
  ENV_FILE="$(normalize_path "$(ask '.env 文件路径' "$ENV_FILE")")"
  DOMAIN="$(ask '站点域名（没有可留空）' "$DOMAIN")"
  PORT="$(ask 'Gunicorn 监听端口' "$PORT")"
  RUN_USER="$(ask 'systemd 运行用户' "$RUN_USER")"
  RUN_GROUP="$(ask 'systemd 运行组' "$RUN_GROUP")"
  PYTHON_BIN="$(ask 'Python 可执行文件' "$PYTHON_BIN")"
  if ask_yes_no '是否执行 flask db upgrade' y; then RUN_MIGRATIONS=1; else RUN_MIGRATIONS=0; fi
  if ask_yes_no '若 .env 不存在，是否自动生成模板' y; then CREATE_ENV_IF_MISSING=1; else CREATE_ENV_IF_MISSING=0; fi
  if ask_yes_no '是否自动安装系统依赖（apt）' n; then INSTALL_SYSTEM=1; fi
  if ask_yes_no '是否自动安装 systemd 服务' n; then INSTALL_SYSTEMD=1; fi
  if ask_yes_no '是否自动安装 nginx 配置' n; then INSTALL_NGINX=1; fi
  echo "================================================"
}

write_env_file() {
  mkdir -p "$(dirname "$ENV_FILE")"
  local secret origin
  secret="$(generate_secret)"
  origin="${DOMAIN:+https://$DOMAIN}"
  sed \
    -e "s|__GENERATE_ME__|$secret|g" \
    -e "s|^YSXS_DATABASE_URI=.*|YSXS_DATABASE_URI=sqlite:///$VAR_DIR/ysxs.db|" \
    -e "s|^YSXS_UPLOAD_DIR=.*|YSXS_UPLOAD_DIR=$VAR_DIR/uploads|" \
    -e "s|^YSXS_ALLOWED_ORIGIN=.*|YSXS_ALLOWED_ORIGIN=$origin|" \
    -e "s|^YSXS_PORT=.*|YSXS_PORT=$PORT|" \
    "$TEMPLATE_DIR/ysxs.env.example" > "$ENV_FILE"
}

install_system_packages() {
  need_root "安装系统依赖"
  if command -v apt-get >/dev/null 2>&1; then
    log "安装系统依赖 (apt)"
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
      python3 python3-venv python3-dev build-essential libffi-dev libssl-dev \
      pkg-config sqlite3 nginx git curl
  else
    echo "当前仅自动支持 apt 系统。请手动安装：python3 python3-venv python3-dev build-essential libffi-dev libssl-dev sqlite3 nginx git" >&2
    exit 1
  fi
}

prepare_runtime_files() {
  log "创建运行目录"
  mkdir -p "$VAR_DIR/uploads" "$VAR_DIR/backups/db" "$TARGET_DIR/YSXS/logs" "$GENERATED_DIR"
}

setup_venv() {
  log "创建/更新虚拟环境: $VENV_DIR"
  ensure_cmd "$PYTHON_BIN"
  "$PYTHON_BIN" -m venv "$VENV_DIR"
  "$VENV_DIR/bin/pip" install --upgrade pip wheel setuptools
  "$VENV_DIR/bin/pip" install -r "$REQ_FILE"
}

run_database_setup() {
  if [[ $RUN_MIGRATIONS -eq 0 ]]; then
    log "跳过数据库迁移"
    return
  fi
  log "执行数据库迁移与基础检查"
  (cd "$TARGET_DIR" && \
    export FLASK_APP=YSXS.app && \
    "$VENV_DIR/bin/flask" db upgrade --directory migrations && \
    "$VENV_DIR/bin/python" -m scripts.check_doc_types)
}

generate_systemd_file() {
  local out="$GENERATED_DIR/${SERVICE_NAME}.service"
  sed \
    -e "s|__RUN_USER__|$RUN_USER|g" \
    -e "s|__RUN_GROUP__|$RUN_GROUP|g" \
    -e "s|__PROJECT_DIR__|$TARGET_DIR|g" \
    -e "s|__ENV_FILE__|$ENV_FILE|g" \
    -e "s|__VENV_DIR__|$VENV_DIR|g" \
    -e "s|__PORT__|$PORT|g" \
    "$TEMPLATE_DIR/ysxs-gunicorn.service.template" > "$out"
  echo "$out"
}

generate_nginx_file() {
  local server_name="${DOMAIN:-example.com www.example.com}"
  local out="$GENERATED_DIR/yshome.nginx.conf"
  sed \
    -e "s|__DOMAIN__|$server_name|g" \
    -e "s|__PROJECT_DIR__|$TARGET_DIR|g" \
    -e "s|__PORT__|$PORT|g" \
    "$TEMPLATE_DIR/yshome.nginx.conf.template" > "$out"
  echo "$out"
}

install_systemd_unit() {
  need_root "安装 systemd 服务"
  local src
  src="$(generate_systemd_file)"
  cp "$src" "/etc/systemd/system/${SERVICE_NAME}.service"
  systemctl daemon-reload
  systemctl enable --now "$SERVICE_NAME"
}

install_nginx_conf() {
  need_root "安装 nginx 配置"
  local src
  src="$(generate_nginx_file)"
  cp "$src" "/etc/nginx/conf.d/yshome.conf"
  nginx -t
  systemctl reload nginx
}

print_manual_notes() {
  local service_file="$GENERATED_DIR/${SERVICE_NAME}.service"
  local nginx_file="$GENERATED_DIR/yshome.nginx.conf"
  cat <<NOTES

================ 部署完成/待办摘要 ================
项目目录:      $TARGET_DIR
数据目录:      $VAR_DIR
.env 文件:     $ENV_FILE
虚拟环境:      $VENV_DIR
systemd 模板:  $service_file
nginx 模板:    $nginx_file

【已经自动完成】
- 创建 var/uploads、日志目录
- 创建虚拟环境并安装 Python 依赖
- 生成 .env（若之前不存在）
- 执行 flask db upgrade 与 DocType 检查（除非你传了 --skip-migrations）
- 生成 systemd / nginx 配置模板

【仍需要你手动确认/处理】
1. 如果这是迁移到新服务器：
   - 把旧服务器数据库复制到：$VAR_DIR/ysxs.db
   - 把旧服务器上传文件复制到：$VAR_DIR/uploads/
   - 再重新执行一次：
     cd "$TARGET_DIR" && export FLASK_APP=YSXS.app && "$VENV_DIR/bin/flask" db upgrade --directory migrations

2. 编辑 .env，至少确认这些值：
   - YSXS_SECRET_KEY
   - YSXS_ALLOWED_ORIGIN
   - OPENAI_API_KEY / OPENAI_BASE_URL（如果你要用 AI/晨报）
   - MAIL_*（如果你要用邮件注册/找回密码）
   - NASA_ADS_API_TOKEN（如果要增强晨报/检索）

3. 首次部署建议手动创建超级管理员：
   cd "$TARGET_DIR" && "$VENV_DIR/bin/python" -m scripts.create_super_admin
   注意：脚本默认账号密码很弱，创建后请立刻到数据库或后台改掉。

4. 如果没有使用 --install-systemd / --install-nginx：
   - 手动把模板复制到 /etc/systemd/system/ 和 /etc/nginx/conf.d/
   - 然后执行：
     sudo systemctl daemon-reload
     sudo systemctl enable --now $SERVICE_NAME
     sudo nginx -t && sudo systemctl reload nginx

5. HTTPS/证书 不能完全自动化：
   - 先把域名解析到服务器
   - 再用 certbot 或云厂商证书配置 HTTPS
   - 若启用 HTTPS，请把 YSXS_ALLOWED_ORIGIN 改成 https://你的域名

6. 若服务器不是 Debian/Ubuntu：
   - 本脚本不会自动装系统包
   - 请手动安装 python3、venv、编译工具、sqlite3、nginx、git

【本地验证命令】
cd "$TARGET_DIR"
source "$VENV_DIR/bin/activate"
export FLASK_APP=YSXS.app
python -m YSXS.app

【生产日志排查】
- Gunicorn: journalctl -u $SERVICE_NAME -f
- App log : tail -f "$TARGET_DIR/YSXS/logs/app.log"
- Nginx   : tail -f /var/log/nginx/error.log
===================================================
NOTES
}

[[ $INTERACTIVE -eq 1 ]] && interactive_wizard

log "开始配置 yshome/YSXS"
[[ $INSTALL_SYSTEM -eq 1 ]] && install_system_packages || true
prepare_runtime_files
setup_venv
if [[ ! -f "$ENV_FILE" ]]; then
  if [[ $CREATE_ENV_IF_MISSING -eq 1 ]]; then
    log "未发现 .env，自动创建模板: $ENV_FILE"
    write_env_file
  else
    echo "未找到 .env 且禁止自动创建: $ENV_FILE" >&2
    exit 1
  fi
else
  log "检测到已有 .env，保留现状: $ENV_FILE"
fi
run_database_setup
generate_systemd_file >/dev/null
generate_nginx_file >/dev/null
[[ $INSTALL_SYSTEMD -eq 1 ]] && install_systemd_unit || true
[[ $INSTALL_NGINX -eq 1 ]] && install_nginx_conf || true
print_manual_notes
