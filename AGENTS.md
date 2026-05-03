# AGENTS.md

## 项目定位
- 这是 `yshome` 仓库：主页静态站点 + `YSXS` Flask 子应用 + 若干独立实验/工具子项目。
- 当前维护方式以**本地开发、本地提交、再 push 到 GitHub**为主；云服务器不再作为日常代码编辑环境。

## 当前维护约定
- **优先修改仓库内项目文件**，尽量不要把线上机器上的临时改动当成事实来源。
- **运行数据不在仓库内**：数据库、上传文件、备份等应继续放在仓库外部的 `var/` 路径中，不要为了图省事把这些运行数据移回 `yshome/`。
- **不要提交运行数据、日志、数据库、备份、密钥、证书。** `.gitignore` 已忽略 `var/`、`backups/`、`instance/`、`*.db`、日志等内容。
- 如无明确要求，**不要直接改线上 nginx/systemd 实例文件**；仓库里保留的是模板和部署脚本。

## 仓库结构速览
- `index.html`, `404.html`, `50x.html`, `static/`, `CSS/`, `HTML/`, `templates/`：主页与静态页面资源。
- `YSXS/`：主 Flask 应用，挂载在 `/YSXS` 路径下。
- `migrations/`：Flask-Migrate/Alembic 迁移。
- `deploy/`：部署脚本、nginx/systemd 模板、备份脚本。
- `scripts/`：运维/数据校验脚本。
- `SeisRTMonitor/`：独立 Python 子项目。
- `rayleighwave_gui/`：独立 Python GUI 子项目。
- `PendulumLab/`, `ResonanceLab/`, `WaveLab/`, `funhome/`, `message_board/`：静态或小型专题页面。

## YSXS 相关约定
- 应用入口：`YSXS.app:app`
- 本地组合预览入口：`serve_local.py`
- URL 前缀默认是 `/YSXS`，不要随意改掉相关前缀逻辑，除非连同反向代理一起调整。
- 典型环境变量：
  - `YSXS_URL_PREFIX=/YSXS`
  - `YSXS_DATABASE_URI=...`
  - `YSXS_UPLOAD_DIR=...`
  - `YSXS_ALLOWED_ORIGIN=...`
- 示例配置在：
  - `YSXS/.env.example`
  - `deploy/templates/ysxs.env.example`
- 若机器上存在 `YSXS/.env`，应视为**本地/部署私有文件**，不要把其中密钥、口令、token 回写到仓库。

## 部署与服务器配置
- nginx 模板：`deploy/templates/yshome.nginx.conf.template`
- gunicorn systemd 模板：`deploy/templates/ysxs-gunicorn.service.template`
- 一键部署脚本：`deploy/bootstrap_yshome.sh`
- 这说明：
  - **仓库里有模板**，但**线上实际生效文件通常在** `/etc/nginx/conf.d/`、`/etc/systemd/system/`。
  - 如果以后要补齐服务器配置，优先从 `deploy/templates/` 和 `deploy/bootstrap_yshome.sh` 还原，而不是凭记忆重写。

## 云服务器资源约束
- 当前云服务器规格应按以下现实条件考虑：
  - 机型：`ecs.e-c1m1.large`
  - CPU：`2 vCPU`
  - 内存：`2 GiB RAM`
  - 系统盘：`40 GiB SSD`
- 后续新增功能、页面联动、后台任务时，应优先遵守这些约束：
  - 默认优先选择**轻量方案**，避免为了展示效果引入持续高频刷新、重图表、重轮询、重计算。
  - 能用单台站就不要默认多台站，能按需加载就不要页面初始自动全量加载。
  - 对 `SeisRTMonitor` 这类实时项目，优先使用低频 `snapshot` 轮询、单实例复用、可停止释放的策略。
  - 不要默认开启过多进程、线程、常驻 worker、大缓存或大型内存队列。
  - 不要自动抓取体量较大的远程目录、全站清单或长时间回放数据，除非用户明确要求。
  - 前端页面要防止因为 iframe、自适应高度脚本、无限追加 DOM 等问题导致页面不断拉长或持续占用资源。
  - 若必须增加后台任务，要确保失败可降级、空闲可停用、资源占用可控。

## 本地开发常用命令
```bash
cd /home/ysp007/yshome
python serve_local.py
```
- 访问：
  - `http://127.0.0.1:5050/` 主页
  - `http://127.0.0.1:5050/YSXS` Flask 子应用

如需初始化 Python 依赖：
```bash
cd /home/ysp007/yshome
python3 -m venv .venv
source .venv/bin/activate
pip install -r deploy/requirements-server.txt
```

如需执行迁移：
```bash
cd /home/ysp007/yshome
source .venv/bin/activate
export FLASK_APP=YSXS.app
flask db upgrade --directory migrations
```

## 修改时的建议
- 先确认修改落在哪一层：
  1. 静态主页/专题页
  2. `YSXS` Flask 应用
  3. 部署模板/脚本
  4. 独立子项目（如 `SeisRTMonitor`、`rayleighwave_gui`）
- 若只是页面或业务逻辑调整，**尽量不要顺手改部署脚本、数据库路径、反向代理前缀**。
- 若涉及文件上传/数据库，默认假设真实数据在仓库外 `var/`，修改代码时不要把路径写死到仓库内部。
- 改完后先看 `git status`，确认没有把 `.env`、数据库、日志、输出文件一起带上。

## 提交前最小检查
- `git status --short`
- 对 Web/Flask 改动，至少本地打开一次：`/` 和 `/YSXS`
- 若改了数据库模型或迁移相关内容，检查 `migrations/` 是否同步
- 若改了部署模板，备注这只是模板，不代表线上已经自动生效

## Agent 工作边界
- 默认可安全修改：仓库内源码、静态资源、README、脚本、模板。
- 默认不要修改：仓库外 `var/` 数据、私有 `.env`、系统级 nginx/systemd 实例文件、证书/密钥。
- 除非用户明确要求，否则不要做“顺手部署”“顺手清库”“顺手覆盖上传目录”这类高风险操作。

## 更细的修改边界
- 可直接修改的内容：
  - 前端静态页面、HTML、CSS、JS、图片引用、模板文件
  - `YSXS/` 内业务逻辑、视图、表单、服务层、非敏感配置样例
  - `deploy/` 内模板、部署脚本、说明文档
  - `README`、使用说明、项目内辅助脚本
- 修改前应先谨慎确认的内容：
  - 数据库模型、迁移脚本、上传路径、鉴权逻辑、邮件配置、AI 相关配置
  - 与 `/YSXS` 前缀、反向代理、静态资源映射有关的逻辑
  - 备份脚本、定时任务、systemd/nginx 模板中的路径和用户
- 默认不要擅自修改的内容：
  - 仓库外的 `var/`、历史数据库、上传文件、备份文件
  - `YSXS/.env` 这类真实私有配置
  - 线上 `/etc/nginx/`、`/etc/systemd/system/`、证书、密钥、SSH 相关文件
  - 任何体积很大的二进制产物、压缩包、导出结果、临时测试输出

## Git 与提交约定
- 每次修改前，先大致确认目标文件属于哪个子项目，避免跨项目误改。
- 若任务只涉及单一模块，尽量只改必要文件，不做无关重构。
- 提交前检查是否混入以下内容：
  - `.env`
  - `*.db`
  - `logs/`
  - `outputs/`
  - `uploads/`
  - 本地 IDE 临时文件
- 若修改会影响部署行为，应在提交说明或变更说明里明确写清楚。

## 目录级注意事项
- `YSXS/`
  - 这是主业务应用，优先保证稳定性。
  - 涉及数据库、上传、登录、邮件、晨报、AI 调用时，优先做最小改动。
- `deploy/`
  - 这里是“模板和脚本事实来源”，不是线上生效状态本身。
  - 改模板时要考虑本地路径、服务器路径、Windows 备份目标路径是否仍兼容。
- `migrations/`
  - 没有模型变更时，不要随意生成或改写迁移。
- `SeisRTMonitor/`、`rayleighwave_gui/`
  - 视为相对独立子项目处理，除非任务明确要求，不要把其依赖或结构改动扩散到主站。
  - `HTML/SeisRT.html` 的公开数据默认走 `/YSXS/api/seisrt/*` 轻量接口，缓存写入仓库外 `/home/ysp007/var/seisrt/`，可用 `YSXS_SEISRT_VAR_DIR` 覆盖。
  - SeisRT 公开页只应默认展示公开地震目录和单台站短窗口波形，不要默认给每个访客启动完整 SeisRTMonitor。
  - SeisRT 公开地震目录目前包含 USGS、EMSC 和国家地震数据中心/中国地震台网速报目录，新增来源时优先低频抓取并缓存。
  - SeisRT 事件空间视图不要使用不符合中国地图表达要求的境外底图；当前前端使用高德中文栅格底图。
  - SeisRT 最近事件的中国/境外判定优先使用服务端高德逆地理接口，环境变量为 `YSXS_AMAP_WEB_KEY`；结果缓存到仓库外 `/home/ysp007/var/seisrt/amap_regeo_cache.json`，不要在前端逐条实时请求高德接口。
  - SeisRT 事件地名显示规则：高德判定为中国地区时只显示中文地名；境外事件尽量显示“中文 / English”形式。没有高德 Key 时只能使用目录来源和轻量 fallback，不要把 fallback 写成精确边界判定。
  - SeisRT 公共单台站波形快照当前允许 3 秒级刷新、默认 5 分钟窗口，但仍是短窗口快照，不是连续 SeedLink/WebSocket 流；不要把公开页文案写成实时直播。
- 静态站点目录
  - 优先保持现有目录结构与相对路径，避免因为资源路径调整导致线上 404。

## 编码与格式注意事项
- 所有文本文件默认使用 **UTF-8 编码** 保存，尽量不要混入 GBK/ANSI/未知编码。
- 修改包含中文的 HTML、Python、Markdown、模板文件后，要特别留意中文是否正常显示。
- **不要出现乱码或整段中文变成问号的情况**；如果发现中文变成连续问号或大量问号字符，应立即停止覆盖并先修正编码问题。
- 尽量保持原有换行与格式风格稳定，避免无意义的大面积格式化。
