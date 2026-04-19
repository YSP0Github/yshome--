# uploads/ 增量备份说明

## 新增文件

- `deploy/backup_ysxs_uploads.sh`
- `deploy/templates/ysxs-uploads-backup.service.template`
- `deploy/templates/ysxs-uploads-backup.timer.template`

## 作用

- 每周做一次 `uploads/` 增量备份
- 只同步目标机上还没有的文件
- 避免每天全量复制大文件

## 为什么这样更合适？

因为：
- `ysxs.db` 小而关键，适合每天备份
- `uploads/` 大且变化没那么频繁，适合低频增量

## 备份策略建议

- 数据库：每天 17:00
- uploads：每周日 18:00

## 需要的环境变量

如果和数据库备份用同一台机器，可以什么都不加，直接复用：
- `BACKUP_REMOTE_HOST`
- `BACKUP_REMOTE_USER`
- `BACKUP_REMOTE_DIR`

如果你想单独指定 uploads 目标，可以额外写：

```env
UPLOADS_BACKUP_REMOTE_HOST=
UPLOADS_BACKUP_REMOTE_PORT=22
UPLOADS_BACKUP_REMOTE_USER=
UPLOADS_BACKUP_REMOTE_DIR=
UPLOADS_BACKUP_REMOTE_PASSWORD=
UPLOADS_BACKUP_ALERT_EMAIL=
```

## 安装方式

把模板替换成真实路径，例如：

### `/etc/systemd/system/ysxs-uploads-backup.service`

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

### `/etc/systemd/system/ysxs-uploads-backup.timer`

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

## 手动测试

```bash
cd /opt/yshome
bash deploy/backup_ysxs_uploads.sh
```

## 注意

当前脚本使用：

```bash
rsync -av --ignore-existing
```

这意味着：
- 新文件会同步过去
- 已存在但内容变了的旧文件，不会覆盖

这通常适合你的上传文献场景，因为上传文件一般是新增为主。

如果你以后想改成“有变化就覆盖”，可以改成：

```bash
rsync -av
```
