#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="$PROJECT_DIR/deploy"
CONFIG_FILE="$DEPLOY_DIR/quick-deploy.conf"
EXAMPLE_FILE="$DEPLOY_DIR/quick-deploy.conf.example"

if [[ ! -f "$CONFIG_FILE" ]]; then
  cp "$EXAMPLE_FILE" "$CONFIG_FILE"
  cat <<MSG
已创建部署配置：
  $CONFIG_FILE

这个示例是按当前已跑通服务器整理的。
请先修改这些关键项：
- DOMAIN
- PRIMARY_DOMAIN
- SERVER_IP
- RUN_USER / RUN_GROUP
- TARGET_DIR / VAR_DIR
- PYTHON_BIN / GUNICORN_BIN
- SSL_CERT_PATH / SSL_KEY_PATH

如果你准备直接安装到系统目录，请再把：
- INSTALL_SYSTEMD=true
- INSTALL_NGINX=true

然后重新执行：
  bash deploy/quick_deploy.sh
MSG
  exit 0
fi

exec bash "$DEPLOY_DIR/bootstrap_yshome.sh" --config "$CONFIG_FILE" "$@"
