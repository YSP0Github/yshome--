# YunSongHome

publishing my research and some interest things.

## 部署说明（按当前服务器真实已跑通配置整理）

下面这套部署说明，不是泛化示例，而是根据这台服务器当前真实在跑的配置整理出来的：

- nginx 生效文件：`/etc/nginx/conf.d/yshome.conf`
- IP 访问 nginx：`/etc/nginx/conf.d/ip_access.conf`
- gunicorn service：`/etc/systemd/system/ysxs-gunicorn.service`
- 当前监听：`127.0.0.1:5050`
- 当前进程用户：`YSP`
- 当前项目目录：`/home/YSP/yshome`
- 当前运行数据目录：`/home/YSP/var/ysxs`
- 当前 gunicorn：`/home/YSP/miniconda3/envs/YSZJ/bin/gunicorn`

也就是说，仓库里的部署脚本现在是**尽量按这套真实跑通方案去生成**，以降低和现网不一致导致的出错概率。

---

## 1. 当前线上真实结构（基准）

当前这台服务器的真实成功结构可概括为：

- 项目源码：`/home/YSP/yshome`
- 数据库：`/home/YSP/var/ysxs/ysxs.db`
- 上传目录：`/home/YSP/var/ysxs/uploads/`
- Flask/Gunicorn：只监听 `127.0.0.1:5050`
- nginx：
  - 域名 `yshome.top www.yshome.top` 走 HTTPS
  - `80` 端口域名请求统一跳转到 `443`
  - IP `115.191.21.25` 可单独走 HTTP 测试访问
- YSXS 子应用路径前缀：`/YSXS`

---

## 2. 仓库内对应脚本/模板

- 一键入口：`deploy/quick_deploy.sh`
- 主部署脚本：`deploy/bootstrap_yshome.sh`
- 配置示例：`deploy/quick-deploy.conf.example`
- 域名 nginx 模板：`deploy/templates/yshome.nginx.conf.template`
- IP 访问 nginx 模板：`deploy/templates/ip_access.nginx.conf.template`
- gunicorn systemd 模板：`deploy/templates/ysxs-gunicorn.service.template`
- 环境变量模板：`deploy/templates/ysxs.env.example`

---

## 3. 最傻瓜的使用方法

### 第一步：clone 项目

```bash
git clone <你的仓库地址> yshome
cd yshome
```

### 第二步：第一次运行入口脚本

```bash
bash deploy/quick_deploy.sh
```

第一次不会直接部署，而是先创建：

```bash
deploy/quick-deploy.conf
```

### 第三步：编辑配置文件

```bash
nano deploy/quick-deploy.conf
```

这个文件默认就是按当前线上真实服务器写的。

如果你是：
- 在**当前这台服务器**上重建部署：通常只需要小改
- 在**别的服务器**上部署：重点改路径、域名、IP、Python/Gunicorn 路径

---

## 4. 配置文件里最重要的字段

### 4.1 域名 / IP

```bash
DOMAIN="yshome.top www.yshome.top"
PRIMARY_DOMAIN="yshome.top"
SERVER_IP="115.191.21.25"
```

说明：
- `DOMAIN`：写进 nginx 的 `server_name`
- `PRIMARY_DOMAIN`：用于生成 `YSXS_ALLOWED_ORIGIN`
- `SERVER_IP`：用于生成 `ip_access.conf`

### 4.2 用户

```bash
RUN_USER="YSP"
RUN_GROUP="YSP"
```

当前线上真实运行就是 `YSP`。

如果你在新服务器上改成别的用户，例如 `www-data`，要保证：
- 该用户对项目目录有读取权限
- 对 `var/ysxs` 有写权限

### 4.3 目录

```bash
TARGET_DIR="/home/YSP/yshome"
VAR_DIR="/home/YSP/var/ysxs"
ENV_FILE="/home/YSP/yshome/YSXS/.env"
```

当前线上真实目录就是这组。

### 4.4 Python / Gunicorn

```bash
PYTHON_BIN="/home/YSP/miniconda3/envs/YSZJ/bin/python"
GUNICORN_BIN="/home/YSP/miniconda3/envs/YSZJ/bin/gunicorn"
```

这一点非常重要。

当前真实线上不是 `.venv/bin/gunicorn`，而是 **miniconda 环境 `YSZJ`**。
所以如果你在别的机器没有这个 conda 环境，必须改成你自己的 Python / gunicorn 路径。

### 4.5 SSL 证书

```bash
SSL_CERT_PATH="/etc/nginx/ssl/yshome.top.pem"
SSL_KEY_PATH="/etc/nginx/ssl/yshome.top.key"
```

这也是按当前真实 nginx 配置写的。

如果你换服务器：
- 证书路径可能要改
- 或者先不启用 nginx 安装，等证书准备好再装

---

## 5. 自动开关怎么理解

```bash
INSTALL_SYSTEM=false
INSTALL_SYSTEMD=false
INSTALL_NGINX=false
RUN_MIGRATIONS=true
CREATE_ENV_IF_MISSING=true
ENABLE_IP_ACCESS_CONF=true
```

建议理解成：

- `INSTALL_SYSTEM=true`
  - 自动安装系统依赖（apt）
  - 适合新 Debian/Ubuntu 机器

- `INSTALL_SYSTEMD=true`
  - 自动把生成的 `ysxs-gunicorn.service` 安装到 `/etc/systemd/system/`

- `INSTALL_NGINX=true`
  - 自动把 nginx 配置写入 `/etc/nginx/conf.d/`

- `RUN_MIGRATIONS=true`
  - 自动执行 `flask db upgrade`

- `CREATE_ENV_IF_MISSING=true`
  - 若 `YSXS/.env` 不存在则自动创建

- `ENABLE_IP_ACCESS_CONF=true`
  - 生成和安装 `ip_access.conf`
  - 这样公网 IP 可以直接访问测试页和 `/YSXS`

如果你只是先生成模板，不想立刻动系统级配置，可以保持 `INSTALL_SYSTEMD=false` 和 `INSTALL_NGINX=false`。

---

## 6. 正式部署

如果只是先生成文件：

```bash
bash deploy/quick_deploy.sh
```

如果要真正安装 systemd / nginx：

```bash
sudo bash deploy/quick_deploy.sh
```

脚本会做这些事：

1. 创建运行目录
2. 安装 Python 依赖
3. 创建 `.env`（如果不存在）
4. 执行数据库迁移
5. 生成：
   - `deploy/generated/ysxs-gunicorn.service`
   - `deploy/generated/yshome.conf`
   - `deploy/generated/ip_access.conf`（如果开启）
6. 在你打开开关时，把这些文件安装到系统目录

---

## 7. 当前生成逻辑和真实线上配置的对应关系

### 域名 nginx
生成后的域名配置会尽量匹配当前线上：

- 80 端口域名请求跳转 HTTPS
- 443 端口提供 SSL
- 主站根目录指向项目目录
- `/YSXS/` 反代到 `127.0.0.1:5050`
- `/YSXS/static/` 单独 alias

### IP 访问 nginx
会单独生成一个 `ip_access.conf`，基本对应当前线上 IP 测试配置。

### gunicorn systemd
生成后的 service 会尽量匹配当前线上：

- `WorkingDirectory=/home/YSP/yshome` 这种形式
- 使用你配置里的 `GUNICORN_BIN`
- 监听 `127.0.0.1:5050`
- worker 默认 `2`
- timeout 默认 `300`

---

## 8. 新服务器迁移时最关键的一点

脚本可以自动生成配置，但**不能替你自动恢复旧数据**。

如果是迁移旧站，你还需要手动复制：

- 数据库：
  ```bash
  /home/YSP/var/ysxs/ysxs.db
  ```
- 上传文件：
  ```bash
  /home/YSP/var/ysxs/uploads/
  ```

复制完成后建议再执行一次：

```bash
cd /你的项目目录
export FLASK_APP=YSXS.app
source 你的环境/bin/activate  # 如果你不是 conda，就改成你的方式
python -m flask db upgrade --directory migrations
```

---

## 9. 常用排查命令

### 查看 gunicorn 服务

```bash
systemctl status ysxs-gunicorn
```

### 持续查看 gunicorn 日志

```bash
journalctl -u ysxs-gunicorn -f
```

### 检查 nginx 配置

```bash
sudo nginx -t
```

### 重载 nginx

```bash
sudo systemctl reload nginx
```

### 查看 nginx 错误日志

```bash
tail -f /var/log/nginx/error.log
```

### 看 5050 端口是否监听

```bash
ss -ltnp | grep 5050
```

---

## 10. 对当前仓库使用者的建议

如果你以后还是主要在这台服务器维护，那么最稳妥的方式是：

1. 先 `git pull`
2. 改仓库内代码
3. 必要时执行：
   ```bash
   sudo bash deploy/quick_deploy.sh
   ```
4. 检查：
   - `https://你的域名/`
   - `https://你的域名/YSXS`
   - `http://你的服务器IP/`
   - `http://你的服务器IP/YSXS`

---

## 11. 重要提醒

- 仓库里保存的是**可复现当前部署结构的模板和脚本**。
- 线上真实证书、私钥、数据库、上传文件仍然不应提交到 git。
- 如果以后你手动改了 `/etc/nginx/conf.d/*.conf` 或 `/etc/systemd/system/*.service`，记得同步回仓库模板，否则仓库和真实运行状态会再次偏离。
