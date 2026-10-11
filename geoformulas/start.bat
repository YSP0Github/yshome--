@echo off
chcp 65001 >nul
setlocal

REM GeoFormulas 一键启动：构建 -> 起本地服务 -> 自动打开浏览器
REM 用法：双击本文件，或在命令行执行 start.bat [端口]

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org
  pause
  exit /b 1
)

echo.
echo  Starting GeoFormulas ...
echo.

node scripts\start.mjs %*

if errorlevel 1 (
  echo.
  echo [ERROR] Startup failed. See messages above.
  pause
  exit /b 1
)
