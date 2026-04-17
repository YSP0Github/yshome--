# 项目文件系统概览

## 顶层目录

- `CSS/`、`HTML/`、`static/`、`templates/`：存放独立的静态页面与前端素材。
- `documents/`：文档与说明（本文件位于此处）。
- `scripts/`、`migrations/`、`instance/`、`uploads/`：项目运行时脚本、数据库迁移记录、实例化配置以及上传文件存储。
- `YSXS/`：核心 Flask 应用代码（后端 API、业务逻辑、模板等）。
- 其他根目录（如 `codes/`、`funhome/`、`message_board/` 等）为站点的历史或辅助模块。

## `YSXS/` 目录结构

```
YSXS/
├── app.py                # 主 Flask 应用，路由与业务逻辑集中处
├── app_factory.py        # create_app 工厂与日志/中间件初始化
├── config.py             # 环境变量与配置类
├── extensions.py         # Flask 扩展实例（db/login_manager/mail 等）
├── middleware.py         # 带宽限制、脚本路径等 WSGI 中间件
├── wsgi.py               # 部署入口
├── .env                  # 本地环境变量
├── blueprints/
│   └── admin/routes.py   # 管理后台蓝图
├── models/
│   ├── user.py           # 用户及活动记录模型
│   ├── document.py       # 文献、分类、引用模型
│   ├── citation.py       # 批量引用等模型
│   └── runtime.py        # 运行指标快照
├── services/
│   ├── runtime_metrics.py # 性能统计
│   ├── security.py        # 权限装饰器
│   └── storage.py         # 文档存储/清理
├── utils/
│   ├── datetimes.py      # 时区与时间帮助函数
│   ├── file_helpers.py   # 上传文件处理
│   └── parse_files.py    # 文献解析工具
├── templates/            # Jinja2 模板（YSXS.html、admin、emails 等）
├── static/               # Tailwind/JS/CSS/图片等静态资源
├── logs/                 # app.log 及轮转日志
├── uploads/              # 用户上传文件
└── instance/             # 实例化配置和本地数据库
```

## 关键数据库文件

- `YSXS/ysxs.db`：项目默认 SQLite 数据库。
- `YSXS/ysxs.db-journal`、`YSXS/ysxs copy.db`、`YSXS/ysxs0.db`：调试或备份数据库副本。

## 运行相关

- `environment.yml` 与 `YSZJ_env.tar.gz`：记录/打包 Conda 环境。
- `serve_local.py`、`update_ysxs-db.py` 等脚本位于根目录，用于本地运行或批量更新。

以上结构覆盖了经过最新调整后的网页系统主要目录与文件，便于后续查阅和协同开发。
