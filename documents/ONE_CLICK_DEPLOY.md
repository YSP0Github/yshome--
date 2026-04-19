# yshome 一键部署说明

## 一键脚本

项目已新增：

```bash
bash deploy/bootstrap_yshome.sh
```

它会自动完成：
- 创建虚拟环境
- 安装 Python 依赖
- 生成 `YSXS/.env` 模板
- 创建数据库/上传目录
- 执行 `flask db upgrade`
- 生成 systemd / nginx 配置模板

## 推荐用法

### 0）最省心：直接交互式问答

```bash
bash deploy/bootstrap_yshome.sh --interactive
```

脚本会逐项询问：部署目录、数据目录、域名、端口、是否装 systemd/nginx 等。


### 1）普通用户先跑一遍（不直接改系统）

```bash
bash deploy/bootstrap_yshome.sh \
  --target-dir /opt/yshome \
  --var-dir /opt/yshome/var/ysxs \
  --domain your-domain.com
```

### 2）如果你已经是 root，想顺手把 systemd 和 nginx 也装上

```bash
sudo bash deploy/bootstrap_yshome.sh \
  --target-dir /opt/yshome \
  --var-dir /opt/yshome/var/ysxs \
  --domain your-domain.com \
  --install-system \
  --install-systemd \
  --install-nginx
```

## 仍然必须手动做的事

### A. 迁移旧数据

如果你是换服务器，不是全新空站，必须手动复制：

- 旧数据库 → 新服务器 `ysxs.db`
- 旧上传目录 → 新服务器 `uploads/`

例如：

```bash
scp old:/path/to/ysxs.db /opt/yshome/var/ysxs/ysxs.db
scp -r old:/path/to/uploads /opt/yshome/var/ysxs/
```

### B. 补全 `.env` 的真实密钥

必须至少检查：
- `YSXS_SECRET_KEY`
- `YSXS_ALLOWED_ORIGIN`
- `OPENAI_API_KEY`（若使用 AI）
- `MAIL_*`（若使用邮件）
- `NASA_ADS_API_TOKEN`（若使用晨报增强）

### C. HTTPS / 证书

脚本不会自动申请真实证书。仍需你手动：
- 配置域名解析
- 使用 `certbot` 或云厂商证书服务启用 HTTPS

### D. 超级管理员账号

脚本不会自动创建安全的生产管理员。
如需先生成默认管理员：

```bash
cd /opt/yshome
. .venv/bin/activate
python -m scripts.create_super_admin
```

**注意：默认密码很弱，必须立即改。**

## 生成物

脚本会生成：
- `deploy/generated/ysxs-gunicorn.service`
- `deploy/generated/yshome.nginx.conf`

如果你没有加 `--install-systemd` / `--install-nginx`，可以手动复制过去。

## 常见问题

### 1. 为什么不是完全 100% 自动？
因为以下内容不适合盲目自动化：
- 旧数据迁移
- 域名与 HTTPS
- 生产密钥/API Key
- 邮件账号密码

### 2. 为什么建议先普通用户跑一遍？
因为这样可以先确认：
- Python 依赖能装好
- Flask 能启动
- 数据库迁移能通过

没问题后再让 root 安装 systemd / nginx，更稳。

## 相关后续文档

- 总备份清单：`documents/BACKUP_FINAL_CHECKLIST.md`
- 数据库备份：`documents/DB_BACKUP_SETUP.md`
- uploads 增量备份：`documents/UPLOADS_BACKUP_SETUP.md`
- Windows + Tailscale + SSH 免密：`documents/WINDOWS_TAILSCALE_SSH_SETUP.md`
