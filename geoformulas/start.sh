#!/usr/bin/env bash
# GeoFormulas 一键启动：构建 -> 起本地服务 -> 自动打开浏览器
# 用法： ./start.sh [端口] [--no-open] [--no-build] [--check]

set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js not found. Please install Node.js 18+"
  exit 1
fi

echo ""
echo " Starting GeoFormulas ..."
echo ""

exec node scripts/start.mjs "$@"
