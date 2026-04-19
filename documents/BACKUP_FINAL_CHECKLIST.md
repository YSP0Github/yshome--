# YSXS 备份最终部署清单

> 目标：
> - `ysxs.db` 每天 **北京时间 17:00** 自动备份到你的 Windows 电脑
> - `uploads/` 每周 **周日北京时间 18:00** 增量备份到你的 Windows 电脑
> - 失败时自动发邮件到 `yusp519@qq.com`

---

## 一、先完成 Windows 端准备

按文档操作：

- `documents/WINDOWS_TAILSCALE_SSH_SETUP.md`

你至少要确认这 4 件事：

1. Windows 已开启 **OpenSSH Server**
2. Windows 和服务器的 **Tailscale 都在线**
3. 目标目录已创建：
   - `G:\GitHub\个人主页\var\yun_data`
4. Linux 服务器已经可以 **SSH 免密登录** Windows

先手动测试：

```bash
ssh ysxs-backup-pc
```

如果你还没配 `~/.ssh/config`，也可以直接测：

```bash
ssh 你的Windows用户名@100.78.235.109
```

---

## 二、配置 `.env`

编辑：

```bash
nano YSXS/.env
```

至少补这些：

```env
BACKUP_REMOTE_HOST=100.78.235.109
BACKUP_REMOTE_PORT=22
BACKUP_REMOTE_USER=你的Windows用户名
BACKUP_REMOTE_DIR=/G:/GitHub/个人主页/var/yun_data
BACKUP_ALERT_EMAIL=yusp519@qq.com
```

如果 `uploads/` 备份和数据库备份用同一台电脑、同一目录，**下面这些可以不填**，它会自动复用上面的配置：

```env
UPLOADS_BACKUP_REMOTE_HOST=
UPLOADS_BACKUP_REMOTE_PORT=22
UPLOADS_BACKUP_REMOTE_USER=
UPLOADS_BACKUP_REMOTE_DIR=
UPLOADS_BACKUP_REMOTE_PASSWORD=
UPLOADS_BACKUP_ALERT_EMAIL=
```

### 邮件配置也必须可用

失败告警依赖这些变量：

```env
MAIL_SERVER=
MAIL_PORT=
MAIL_USE_TLS=
MAIL_USE_SSL=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_DEFAULT_SENDER=
```

---

## 三、先手动跑测试

### 1）只测试邮件

```bash
cd /opt/yshome
. .venv/bin/activate
python deploy/test_backup_chain.py --mail-only
```

预期：
- `yusp519@qq.com` 能收到测试邮件

### 2）测试数据库备份链路

```bash
python deploy/test_backup_chain.py
```

预期：
- 服务器本地生成一个带时间戳的 `.db` 备份
- 你的 Windows 目录 `G:\GitHub\个人主页\var\yun_data` 出现对应文件
- 邮箱收到成功邮件（或失败邮件）

### 3）测试 uploads 增量备份

```bash
bash deploy/backup_ysxs_uploads.sh
```

预期：
- Windows 目标目录下出现 `uploads/`
- 新文件会被同步过去

---

## 四、安装 DB 定时备份 timer

### 方式 A：交互式安装

```bash
sudo bash deploy/install_db_backup_timer.sh --interactive
```

### 方式 B：手动安装

生成并复制下面两个文件：

#### `/etc/systemd/system/ysxs-db-backup.service`

```ini
[Unit]
Description=YSXS SQLite backup job
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=YSP
Group=YSP
WorkingDirectory=/opt/yshome
EnvironmentFile=/opt/yshome/YSXS/.env
ExecStart=/opt/yshome/.venv/bin/python /opt/yshome/deploy/backup_ysxs_db.py
```

#### `/etc/systemd/system/ysxs-db-backup.timer`

```ini
[Unit]
Description=Run YSXS DB backup daily at 17:00 Beijing time

[Timer]
OnCalendar=*-*-* 17:00:00 Asia/Shanghai
Persistent=true
Unit=ysxs-db-backup.service

[Install]
WantedBy=timers.target
```

启用：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ysxs-db-backup.timer
sudo systemctl list-timers | grep ysxs-db-backup
```

---

## 五、安装 uploads 定时增量备份 timer

手动创建下面两个文件：

#### `/etc/systemd/system/ysxs-uploads-backup.service`

```ini
[Unit]
Description=YSXS uploads incremental backup job
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=YSP
Group=YSP
WorkingDirectory=/opt/yshome
EnvironmentFile=/opt/yshome/YSXS/.env
ExecStart=/usr/bin/bash /opt/yshome/deploy/backup_ysxs_uploads.sh
```

#### `/etc/systemd/system/ysxs-uploads-backup.timer`

```ini
[Unit]
Description=Run YSXS uploads incremental backup every Sunday at 18:00 Beijing time

[Timer]
OnCalendar=Sun *-*-* 18:00:00 Asia/Shanghai
Persistent=true
Unit=ysxs-uploads-backup.service

[Install]
WantedBy=timers.target
```

启用：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ysxs-uploads-backup.timer
sudo systemctl list-timers | grep ysxs-uploads-backup
```

---

## 六、日常检查命令

### 查看 DB timer

```bash
systemctl status ysxs-db-backup.timer
systemctl status ysxs-db-backup.service
journalctl -u ysxs-db-backup.service -n 100 --no-pager
```

### 查看 uploads timer

```bash
systemctl status ysxs-uploads-backup.timer
systemctl status ysxs-uploads-backup.service
journalctl -u ysxs-uploads-backup.service -n 100 --no-pager
```

### 查看下次触发时间

```bash
systemctl list-timers | grep ysxs
```

---

## 七、推荐最终策略

### 数据库
- 每天 17:00 备份
- 这是最重要的核心状态备份

### uploads
- 每周日 18:00 增量备份
- 不建议每天全量备份大文件

---

## 八、你 git 上传前最后确认

建议提交这些文件：

- `deploy/bootstrap_yshome.sh`
- `deploy/install_db_backup_timer.sh`
- `deploy/backup_ysxs_db.py`
- `deploy/backup_ysxs_uploads.sh`
- `deploy/test_backup_chain.py`
- `deploy/requirements-server.txt`
- `deploy/templates/*`
- `YSXS/.env.example`
- `documents/ONE_CLICK_DEPLOY.md`
- `documents/DB_BACKUP_SETUP.md`
- `documents/UPLOADS_BACKUP_SETUP.md`
- `documents/WINDOWS_TAILSCALE_SSH_SETUP.md`
- `documents/BACKUP_FINAL_CHECKLIST.md`

### 不要提交：
- `YSXS/.env`
- 真正的密码 / API Key / 邮箱授权码
- 任何私钥文件（例如 `~/.ssh/id_ed25519_ysxs_backup`）

---

## 九、你现在最推荐的执行顺序

```bash
# 1. 先手动测邮件
python deploy/test_backup_chain.py --mail-only

# 2. 再测数据库备份
python deploy/test_backup_chain.py

# 3. 再测 uploads 增量备份
bash deploy/backup_ysxs_uploads.sh

# 4. 安装 DB timer
sudo bash deploy/install_db_backup_timer.sh --interactive

# 5. 手动安装 uploads timer
sudo nano /etc/systemd/system/ysxs-uploads-backup.service
sudo nano /etc/systemd/system/ysxs-uploads-backup.timer
sudo systemctl daemon-reload
sudo systemctl enable --now ysxs-uploads-backup.timer

# 6. 检查所有 timer
systemctl list-timers | grep ysxs
```

完成后，这套备份就能长期自动跑。
