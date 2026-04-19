# YSXS 每日数据库备份说明

## 目标

- 每天北京时间 **17:00** 自动备份 `ysxs.db`
- 本地服务器先生成一份时间戳备份
- 再通过 **Tailscale + SCP** 复制到你的电脑
- 如果复制失败，自动发邮件到 `yusp519@qq.com`
- 邮件尽量附上当天生成的数据库备份文件

## 相关文件

- `deploy/backup_ysxs_db.py`
- `deploy/templates/ysxs-db-backup.service.template`
- `deploy/templates/ysxs-db-backup.timer.template`

## 必填环境变量

写入 `YSXS/.env`：

```env
BACKUP_REMOTE_HOST=100.78.235.109
BACKUP_REMOTE_PORT=22
BACKUP_REMOTE_USER=你的Windows登录用户名
BACKUP_REMOTE_DIR=/G:/GitHub/个人主页/var/yun_data
BACKUP_ALERT_EMAIL=yusp519@qq.com
```

可选：

```env
BACKUP_LOCAL_DIR=/opt/yshome/var/ysxs/backups/db
BACKUP_LOCAL_KEEP_DAYS=30
BACKUP_REMOTE_PASSWORD=
```

## 最推荐方式：SSH 密钥免密

**推荐你用 SSH 密钥，不要用密码。**

原因：
- 定时任务无人值守，密码方式不稳定
- 密码明文放环境变量里不安全
- 当前服务器也未安装 `sshpass`

### Windows 电脑需要提前做的事

1. 打开 Windows 的 **OpenSSH Server**
2. 确保 Tailscale 在线
3. 预先创建目录：
   - `G:\GitHub\个人主页\var\yun_data`
4. 把服务器上的公钥加入 Windows 用户的 `authorized_keys`

如果你这样配置好了，**不需要密码**。

## 如果你非要用密码

可以，但不推荐。你还需要在 Linux 服务器手动安装：

```bash
sudo apt install -y sshpass
```

然后在 `.env` 里补：

```env
BACKUP_REMOTE_PASSWORD=你的Windows密码
```

## 安装 systemd service + timer

先生成服务文件：

```bash
cd /opt/yshome
```

然后把模板替换成真实路径，例如：

### `/etc/systemd/system/ysxs-db-backup.service`

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

### `/etc/systemd/system/ysxs-db-backup.timer`

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

启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ysxs-db-backup.timer
sudo systemctl list-timers | grep ysxs-db-backup
```

## 手动测试

```bash
cd /opt/yshome
. .venv/bin/activate
python deploy/backup_ysxs_db.py
```

## upload/ 大文件怎么备份更合适？

**不建议每天全量备份整个 uploads。**

更合适的方案：

### 方案 A：数据库每天、uploads 每周/每月增量
- `ysxs.db`：每天 17:00 备份
- `uploads/`：每周一次 `rsync --ignore-existing` 或增量归档
- 这是最平衡的方案

### 方案 B：上传目录只做冷备份
- 平时只备份数据库
- 每周或每月把 `uploads/` 打包到移动硬盘/另一台机器
- 适合上传大文件很多、变动不频繁的情况

### 方案 C：对象存储/网盘同步
- 把 uploads 放到 NAS / 对象存储 / 云盘同步目录
- 数据库继续单独每日备份
- 适合你后续规模变大时用

## 我给你的建议

你现在最适合：

1. **每天 17:00 只备份 `ysxs.db`**
2. **每周备份一次 `uploads/`**
3. `uploads/` 用：

```bash
rsync -av --ignore-existing /opt/yshome/var/ysxs/uploads/ <backup-target>/uploads/
```

这样省流量、省时间，也够安全。
