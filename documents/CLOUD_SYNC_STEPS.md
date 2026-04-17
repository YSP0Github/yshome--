# 云服务器同步流程

> 假设云主机运行 Linux，且你拥有 SSH 访问权。Windows 服务器步骤保持一致，只是命令略有不同。

## 1. 准备环境

1. 安装系统依赖（示例）：
   ```bash
   sudo apt update
   sudo apt install -y python3.11 python3.11-venv git sqlite3 build-essential libffi-dev
   ```
2. 创建部署目录，例如 `/opt/yshome` 并赋权：
   ```bash
   sudo mkdir -p /opt/yshome
   sudo chown $USER:$USER /opt/yshome
   ```

## 2. 同步代码

1. 在本地仓库提交并推送到远程（GitHub/Gitee/自建 Git 服务器皆可）：
   ```bash
   git add .
   git commit -m "sync"
   git push origin main
   ```
2. 云端首次部署：
   ```bash
   cd /opt/yshome
   git clone <your-repo-url> .
   ```
3. 以后更新只需 `git pull`。

## 3. 创建虚拟环境并安装依赖

```bash
cd /opt/yshome
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt        # 如果只提供 environment.yml，可先在本地导出 requirements
```

## 4. 同步配置与数据

1. 拷贝 `.env` 到云端（只保留必要的密钥/SMTP，注意不要泄露）：
   ```bash
   scp YSXS/.env user@server:/opt/yshome/YSXS/.env
   ```
   - 修改 `YSXS_DATABASE_URI` 为云端绝对路径，例如 `sqlite:////opt/yshome/YSXS/ysxs.db`。
2. 传输数据库和上传文件：
   ```bash
   scp YSXS/ysxs.db user@server:/opt/yshome/YSXS/ysxs.db
   scp -r YSXS/uploads user@server:/opt/yshome/YSXS/uploads
   ```
3. 确认权限：
   ```bash
   chmod 600 /opt/yshome/YSXS/ysxs.db
   chmod -R 700 /opt/yshome/YSXS/uploads
   ```

## 5. 数据库迁移

1. 激活虚拟环境，设置 Flask 入口：
   ```bash
   cd /opt/yshome
   source venv/bin/activate
   export FLASK_APP=YSXS/app.py
   ```
2. 运行迁移：
   ```bash
   flask db upgrade
   ```
3. 如果 `ensure_database_initialized()` 会干扰迁移，可临时注释该调用，升级完成后再恢复。

## 6. 启动服务

### 临时验证

```bash
source venv/bin/activate
python serve_local.py
```

浏览器打开 `http://服务器IP:5050/YSXS/` 验证功能正常。

### 生产部署（示例：gunicorn + systemd）

1. 安装 gunicorn：
   ```bash
   source venv/bin/activate
   pip install gunicorn
   ```
2. 测试运行：
   ```bash
   gunicorn 'YSXS.app:app' --bind 0.0.0.0:8000 --workers 3
   ```
3. 创建 systemd 单元 `/etc/systemd/system/ysxs.service`（需 sudo）：
   ```ini
   [Unit]
   Description=YSXS Service
   After=network.target

   [Service]
   User=<deploy-user>
   WorkingDirectory=/opt/yshome
   Environment="FLASK_APP=YSXS/app.py"
   ExecStart=/opt/yshome/venv/bin/gunicorn 'YSXS.app:app' --bind 0.0.0.0:8000 --workers 3
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
4. 启动并设置开机自启：
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now ysxs.service
   ```
5. 如果需要对外提供 HTTPS，可在 Nginx/Apache 上做反向代理，把 443/80 的流量转发到 gunicorn 监听端口。

## 7. 后续同步策略

1. **代码更新**：本地开发 → `git push` → 云端 `git pull` → `pip install -r requirements.txt`（如有依赖更新）→ `flask db upgrade` → `systemctl restart ysxs`.
2. **数据库/上传文件备份**：定期
   ```bash
   sqlite3 /opt/yshome/YSXS/ysxs.db ".backup '/opt/yshome/backups/ysxs-$(date +%F).db'"
   ```
   或使用 `scp server:/opt/yshome/YSXS/ysxs.db ./backups/`.
3. **日志排查**：查看 `/opt/yshome/YSXS/logs/app.log` 与 `journalctl -u ysxs`.

完成以上步骤后，你的云服务器会与本地环境保持一致，后续更新只需重复“提交/拉取 + 迁移 + 重启”流程即可。
