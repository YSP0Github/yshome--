#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="$PROJECT_DIR/deploy"
TEMPLATE_DIR="$DEPLOY_DIR/templates"
GENERATED_DIR="$DEPLOY_DIR/generated"
REQ_FILE="$DEPLOY_DIR/requirements-server.txt"

CONFIG_FILE=""
INTERACTIVE=0
INSTALL_SYSTEM=0
INSTALL_NGINX=0
INSTALL_SYSTEMD=0
RUN_MIGRATIONS=1
CREATE_ENV_IF_MISSING=1
ENABLE_IP_ACCESS_CONF=1

DOMAIN="yshome.top www.yshome.top"
PRIMARY_DOMAIN="yshome.top"
SERVER_IP="115.191.21.25"
RUN_USER="YSP"
RUN_GROUP="YSP"
TARGET_DIR="$PROJECT_DIR"
VAR_DIR="/home/YSP/var/ysxs"
ENV_FILE="$PROJECT_DIR/YSXS/.env"
PYTHON_BIN="python3"
GUNICORN_BIN="/home/YSP/miniconda3/envs/YSZJ/bin/gunicorn"
PORT="5050"
GUNICORN_TIMEOUT="300"
GUNICORN_WORKERS="2"
SERVICE_NAME="ysxs-gunicorn"
NGINX_CONF_NAME="yshome"
IP_NGINX_CONF_NAME="ip_access"
SSL_CERT_PATH="/etc/nginx/ssl/yshome.top.pem"
SSL_KEY_PATH="/etc/nginx/ssl/yshome.top.key"

usage() {
  cat <<USAGE
用法：bash deploy/bootstrap_yshome.sh [选项]

可选参数：
  --config PATH              读取部署配置文件（推荐）
  --interactive              进入交互式问答
  --target-dir PATH          项目目录
  --var-dir PATH             运行数据目录（数据库 / uploads）
  --env-file PATH            YSXS .env 文件路径
  --python PATH              Python 可执行文件（用于安装依赖 / 迁移）
  --gunicorn-bin PATH        gunicorn 可执行文件
  --domain "A B"            nginx server_name，多个域名用空格分隔
  --primary-domain DOMAIN    主域名（用于 YSXS_ALLOWED_ORIGIN）
  --server-ip IP             公网 IP（用于生成 IP 访问 nginx 配置）
  --port PORT                gunicorn 监听端口，默认 5050
  --run-user USER            systemd 运行用户
  --run-group GROUP          systemd 运行组
  --service-name NAME        systemd 服务名，默认 ysxs-gunicorn
  --nginx-conf-name NAME     域名 nginx 配置名，默认 yshome
  --ip-nginx-conf-name NAME  IP nginx 配置名，默认 ip_access
  --ssl-cert PATH            SSL 证书路径
  --ssl-key PATH             SSL 私钥路径
  --install-system           自动 apt 安装系统依赖（需 root）
  --install-nginx            自动安装 nginx 配置（需 root）
  --install-systemd          自动安装 systemd 服务（需 root）
  --disable-ip-access-conf   不生成 / 不安装 IP 访问 nginx 配置
  --skip-migrations          跳过 flask db upgrade
  --no-env-create            .env 不存在时不自动创建
  -h, --help                 显示帮助
USAGE
}

log() { echo; echo "[$(date '+%F %T')] $*"; }

need_root() {
  if [[ $EUID -ne 0 ]]; then
    echo "此步骤需要 root/sudo：$*" >&2
    exit 1
  fi
}

ensure_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "缺少命令: $1" >&2
    exit 1
  }
}

normalize_path() {
  python3 - "$1" <<'PY'
from pathlib import Path
import sys
print(Path(sys.argv[1]).expanduser().resolve())
PY
}

generate_secret() {
  python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
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

load_config_file() {
  local file="$1"
  [[ -f "$file" ]] || { echo "配置文件不存在：$file" >&2; exit 1; }
  # shellcheck disable=SC1090
  source "$file"

  if [[ "${INSTALL_SYSTEM:-false}" =~ ^(1|true|TRUE|yes|YES)$ ]]; then INSTALL_SYSTEM=1; else INSTALL_SYSTEM=0; fi
  if [[ "${INSTALL_NGINX:-false}" =~ ^(1|true|TRUE|yes|YES)$ ]]; then INSTALL_NGINX=1; else INSTALL_NGINX=0; fi
  if [[ "${INSTALL_SYSTEMD:-false}" =~ ^(1|true|TRUE|yes|YES)$ ]]; then INSTALL_SYSTEMD=1; else INSTALL_SYSTEMD=0; fi
  if [[ "${RUN_MIGRATIONS:-true}" =~ ^(1|true|TRUE|yes|YES)$ ]]; then RUN_MIGRATIONS=1; else RUN_MIGRATIONS=0; fi
  if [[ "${CREATE_ENV_IF_MISSING:-true}" =~ ^(1|true|TRUE|yes|YES)$ ]]; then CREATE_ENV_IF_MISSING=1; else CREATE_ENV_IF_MISSING=0; fi
  if [[ "${ENABLE_IP_ACCESS_CONF:-true}" =~ ^(1|true|TRUE|yes|YES)$ ]]; then ENABLE_IP_ACCESS_CONF=1; else ENABLE_IP_ACCESS_CONF=0; fi
}

interactive_wizard() {
  echo "================ yshome 部署向导（按当前已跑通服务器方案） ================"
  TARGET_DIR="$(normalize_path "$(ask '项目目录' "$TARGET_DIR")")"
  VAR_DIR="$(normalize_path "$(ask '运行数据目录' "$VAR_DIR")")"
  ENV_FILE="$(normalize_path "$(ask '.env 文件路径' "$ENV_FILE")")"
  DOMAIN="$(ask '域名 server_name（多个用空格分隔）' "$DOMAIN")"
  PRIMARY_DOMAIN="$(ask '主域名（用于 Allowed Origin）' "$PRIMARY_DOMAIN")"
  SERVER_IP="$(ask '公网 IP（用于生成 ip_access.conf）' "$SERVER_IP")"
  RUN_USER="$(ask 'systemd 运行用户' "$RUN_USER")"
  RUN_GROUP="$(ask 'systemd 运行组' "$RUN_GROUP")"
  PYTHON_BIN="$(ask 'Python 可执行文件' "$PYTHON_BIN")"
  GUNICORN_BIN="$(ask 'gunicorn 可执行文件' "$GUNICORN_BIN")"
  PORT="$(ask 'Gunicorn 监听端口' "$PORT")"
  SSL_CERT_PATH="$(ask 'SSL 证书路径' "$SSL_CERT_PATH")"
  SSL_KEY_PATH="$(ask 'SSL 私钥路径' "$SSL_KEY_PATH")"
  if ask_yes_no '是否自动 apt 安装系统依赖' n; then INSTALL_SYSTEM=1; fi
  if ask_yes_no '是否自动安装 systemd 服务' n; then INSTALL_SYSTEMD=1; fi
  if ask_yes_no '是否自动安装 nginx 配置' n; then INSTALL_NGINX=1; fi
  if ask_yes_no '是否执行 flask db upgrade' y; then RUN_MIGRATIONS=1; else RUN_MIGRATIONS=0; fi
  if ask_yes_no '若 .env 不存在，是否自动创建' y; then CREATE_ENV_IF_MISSING=1; else CREATE_ENV_IF_MISSING=0; fi
  if ask_yes_no '是否生成公网 IP 访问 nginx 配置' y; then ENABLE_IP_ACCESS_CONF=1; else ENABLE_IP_ACCESS_CONF=0; fi
  echo "========================================================================"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --config) CONFIG_FILE="$2"; shift 2 ;;
    --interactive) INTERACTIVE=1; shift ;;
    --target-dir) TARGET_DIR="$2"; shift 2 ;;
    --var-dir) VAR_DIR="$2"; shift 2 ;;
    --env-file) ENV_FILE="$2"; shift 2 ;;
    --python) PYTHON_BIN="$2"; shift 2 ;;
    --gunicorn-bin) GUNICORN_BIN="$2"; shift 2 ;;
    --domain) DOMAIN="$2"; shift 2 ;;
    --primary-domain) PRIMARY_DOMAIN="$2"; shift 2 ;;
    --server-ip) SERVER_IP="$2"; shift 2 ;;
    --port) PORT="$2"; shift 2 ;;
    --run-user) RUN_USER="$2"; shift 2 ;;
    --run-group) RUN_GROUP="$2"; shift 2 ;;
    --service-name) SERVICE_NAME="$2"; shift 2 ;;
    --nginx-conf-name) NGINX_CONF_NAME="$2"; shift 2 ;;
    --ip-nginx-conf-name) IP_NGINX_CONF_NAME="$2"; shift 2 ;;
    --ssl-cert) SSL_CERT_PATH="$2"; shift 2 ;;
    --ssl-key) SSL_KEY_PATH="$2"; shift 2 ;;
    --install-system) INSTALL_SYSTEM=1; shift ;;
    --install-nginx) INSTALL_NGINX=1; shift ;;
    --install-systemd) INSTALL_SYSTEMD=1; shift ;;
    --disable-ip-access-conf) ENABLE_IP_ACCESS_CONF=0; shift ;;
    --skip-migrations) RUN_MIGRATIONS=0; shift ;;
    --no-env-create) CREATE_ENV_IF_MISSING=0; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知参数: $1"; usage; exit 1 ;;
  esac
done

if [[ -n "$CONFIG_FILE" ]]; then
  load_config_file "$CONFIG_FILE"
fi

if [[ $INTERACTIVE -eq 0 && -t 0 && -z "$CONFIG_FILE" ]]; then
  INTERACTIVE=1
fi
[[ $INTERACTIVE -eq 1 ]] && interactive_wizard

TARGET_DIR="$(normalize_path "$TARGET_DIR")"
VAR_DIR="$(normalize_path "$VAR_DIR")"
ENV_FILE="$(normalize_path "$ENV_FILE")"

if [[ ! -f "$TARGET_DIR/YSXS/app.py" ]]; then
  echo "目标目录中未找到 YSXS/app.py：$TARGET_DIR" >&2
  exit 1
fi

install_system_packages() {
  need_root "安装系统依赖"
  if command -v apt-get >/dev/null 2>&1; then
    log "安装系统依赖（Debian/Ubuntu）"
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
      python3 python3-venv python3-dev build-essential libffi-dev libssl-dev \
      pkg-config sqlite3 nginx git curl
  else
    echo "当前脚本仅自动支持 apt 系统，请手动安装 python3 / sqlite3 / nginx / git 等依赖。" >&2
    exit 1
  fi
}

prepare_runtime_files() {
  log "创建运行目录"
  mkdir -p "$VAR_DIR/uploads" "$VAR_DIR/backups/db" "$TARGET_DIR/YSXS/logs" "$GENERATED_DIR"
  if id "$RUN_USER" >/dev/null 2>&1 && getent group "$RUN_GROUP" >/dev/null 2>&1; then
    chown -R "$RUN_USER:$RUN_GROUP" "$VAR_DIR" "$TARGET_DIR/YSXS/logs" 2>/dev/null || true
  fi
}

install_python_requirements() {
  log "安装 Python 依赖"
  ensure_cmd "$PYTHON_BIN"
  "$PYTHON_BIN" -m pip install --upgrade pip setuptools wheel
  "$PYTHON_BIN" -m pip install -r "$REQ_FILE"
}

write_env_file() {
  mkdir -p "$(dirname "$ENV_FILE")"
  local secret
  secret="$(generate_secret)"
  sed \
    -e "s|__GENERATE_ME__|$secret|g" \
    -e "s|^YSXS_DATABASE_URI=.*|YSXS_DATABASE_URI=sqlite:///$VAR_DIR/ysxs.db|" \
    -e "s|^YSXS_UPLOAD_DIR=.*|YSXS_UPLOAD_DIR=$VAR_DIR/uploads|" \
    -e "s|^YSXS_ALLOWED_ORIGIN=.*|YSXS_ALLOWED_ORIGIN=https://$PRIMARY_DOMAIN|" \
    "$TEMPLATE_DIR/ysxs.env.example" > "$ENV_FILE"
}

run_database_setup() {
  if [[ $RUN_MIGRATIONS -eq 0 ]]; then
    log "跳过数据库迁移"
    return
  fi
  log "执行数据库迁移与基础检查"
  (
    cd "$TARGET_DIR"
    set -a
    source "$ENV_FILE"
    set +a
    export FLASK_APP=YSXS.app
    "$PYTHON_BIN" -m flask db upgrade --directory migrations
    "$PYTHON_BIN" -m scripts.check_doc_types
  )
}

generate_systemd_file() {
  local out="$GENERATED_DIR/${SERVICE_NAME}.service"
  sed \
    -e "s|__RUN_USER__|$RUN_USER|g" \
    -e "s|__RUN_GROUP__|$RUN_GROUP|g" \
    -e "s|__PROJECT_DIR__|$TARGET_DIR|g" \
    -e "s|__ENV_FILE__|$ENV_FILE|g" \
    -e "s|__GUNICORN_BIN__|$GUNICORN_BIN|g" \
    -e "s|__GUNICORN_TIMEOUT__|$GUNICORN_TIMEOUT|g" \
    -e "s|__GUNICORN_WORKERS__|$GUNICORN_WORKERS|g" \
    -e "s|__PORT__|$PORT|g" \
    "$TEMPLATE_DIR/ysxs-gunicorn.service.template" > "$out"
  echo "$out"
}

generate_nginx_file() {
  local out="$GENERATED_DIR/${NGINX_CONF_NAME}.conf"
  sed \
    -e "s|__DOMAIN__|$DOMAIN|g" \
    -e "s|__PROJECT_DIR__|$TARGET_DIR|g" \
    -e "s|__PORT__|$PORT|g" \
    -e "s|__SSL_CERT_PATH__|$SSL_CERT_PATH|g" \
    -e "s|__SSL_KEY_PATH__|$SSL_KEY_PATH|g" \
    "$TEMPLATE_DIR/yshome.nginx.conf.template" > "$out"
  echo "$out"
}

generate_ip_nginx_file() {
  if [[ $ENABLE_IP_ACCESS_CONF -eq 0 ]]; then
    return
  fi
  local out="$GENERATED_DIR/${IP_NGINX_CONF_NAME}.conf"
  sed \
    -e "s|__SERVER_IP__|$SERVER_IP|g" \
    -e "s|__PROJECT_DIR__|$TARGET_DIR|g" \
    -e "s|__PORT__|$PORT|g" \
    "$TEMPLATE_DIR/ip_access.nginx.conf.template" > "$out"
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
  local main_conf ip_conf
  main_conf="$(generate_nginx_file)"
  cp "$main_conf" "/etc/nginx/conf.d/${NGINX_CONF_NAME}.conf"

  if [[ $ENABLE_IP_ACCESS_CONF -eq 1 ]]; then
    ip_conf="$(generate_ip_nginx_file)"
    cp "$ip_conf" "/etc/nginx/conf.d/${IP_NGINX_CONF_NAME}.conf"
  else
    rm -f "/etc/nginx/conf.d/${IP_NGINX_CONF_NAME}.conf"
  fi

  nginx -t
  systemctl reload nginx
}

print_summary() {
  local service_file="$GENERATED_DIR/${SERVICE_NAME}.service"
  local nginx_file="$GENERATED_DIR/${NGINX_CONF_NAME}.conf"
  local ip_nginx_file="<未生成>"
  [[ $ENABLE_IP_ACCESS_CONF -eq 1 ]] && ip_nginx_file="$GENERATED_DIR/${IP_NGINX_CONF_NAME}.conf"

  cat <<NOTES

================ 按当前已跑通服务器方案生成完成 ================
项目目录:          $TARGET_DIR
运行数据目录:      $VAR_DIR
.env 文件:         $ENV_FILE
域名 server_name:  $DOMAIN
主域名:            $PRIMARY_DOMAIN
公网 IP:           $SERVER_IP
systemd 用户:      $RUN_USER:$RUN_GROUP
gunicorn:          $GUNICORN_BIN
nginx 主配置:      $nginx_file
nginx IP 配置:     $ip_nginx_file
systemd 模板:      $service_file
SSL 证书:          $SSL_CERT_PATH
SSL 私钥:          $SSL_KEY_PATH

【已自动完成】
- 创建运行目录
- 安装 Python 依赖
- 生成 .env（如不存在）
- 执行数据库迁移与 DocType 检查（除非跳过）
- 生成 systemd / nginx 配置模板

【你还需要确认】
1. 如果是迁移服务器，请手动复制：
   - 数据库：$VAR_DIR/ysxs.db
   - 上传文件：$VAR_DIR/uploads/

2. 如果未传 --install-systemd / --install-nginx，请手动安装：
   sudo cp "$service_file" /etc/systemd/system/${SERVICE_NAME}.service
   sudo cp "$nginx_file" /etc/nginx/conf.d/${NGINX_CONF_NAME}.conf

3. 若启用了 IP 配置，也复制：
   sudo cp "$ip_nginx_file" /etc/nginx/conf.d/${IP_NGINX_CONF_NAME}.conf

4. 安装后执行：
   sudo systemctl daemon-reload
   sudo systemctl enable --now $SERVICE_NAME
   sudo nginx -t && sudo systemctl reload nginx

5. 首次建议创建管理员：
   cd "$TARGET_DIR" && "$PYTHON_BIN" -m scripts.create_super_admin

【排查命令】
- systemctl status $SERVICE_NAME
- journalctl -u $SERVICE_NAME -f
- nginx -t
- tail -f /var/log/nginx/error.log
===============================================================
NOTES
}

log "开始按当前已跑通服务器方案配置 yshome/YSXS"
[[ $INSTALL_SYSTEM -eq 1 ]] && install_system_packages || true
prepare_runtime_files
install_python_requirements
if [[ ! -f "$ENV_FILE" ]]; then
  if [[ $CREATE_ENV_IF_MISSING -eq 1 ]]; then
    log "未发现 .env，自动创建：$ENV_FILE"
    write_env_file
  else
    echo "未找到 .env 且禁止自动创建：$ENV_FILE" >&2
    exit 1
  fi
else
  log "检测到已有 .env，保留现状：$ENV_FILE"
fi
run_database_setup
generate_systemd_file >/dev/null
generate_nginx_file >/dev/null
generate_ip_nginx_file >/dev/null || true
[[ $INSTALL_SYSTEMD -eq 1 ]] && install_systemd_unit || true
[[ $INSTALL_NGINX -eq 1 ]] && install_nginx_conf || true
print_summary
