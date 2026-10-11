# 地球物理公式大全 · 推导与可视化

一个**纯前端、零打包**的地震学公式知识站。每条公式是一个自包含的数据模块，携带标签、符号表、分步推导、参数化可视化与依赖链接；在此基础上可以按任意体系重组为列表、气泡图或系谱图。中英双语一键切换。

## 快速开始

### 一键启动（推荐）

```bash
npm start
```

Windows 用户直接**双击 `start.bat`**；macOS / Linux 用 `./start.sh`。
它会自动：装依赖（首次）→ 编译 → 起本地服务 → **打开浏览器**。默认 `http://localhost:5173`，端口被占用会自动顺延。

| 参数 | 作用 |
|---|---|
| `npm start -- 8080` | 指定端口 |
| `npm start -- --no-open` | 不自动打开浏览器 |
| `npm start -- --no-build` | 跳过编译，直接用上次的产物（秒开） |
| `npm start -- --check` | 启动前跑一遍内容自检 |

### 分步执行

```bash
npm install          # 只装 KaTeX 与 TypeScript，无打包器
npm run build        # tsc 编译 src/ → assets/js/，并同步 KaTeX 到 assets/vendor/
npm run serve        # http://localhost:5173
npm run check        # 编译 + 内容自检（LaTeX / 依赖 / 标签 / 数值）
npm run watch        # 改 src/ 时自动重编译，配合 npm run serve 使用
```

`npm run build` 之后，**根目录就是可直接部署的静态目录**：把 `index.html` 与 `assets/` 一起 rsync 到服务器即可，无需 Node 运行时。

> 说明：`assets/js/` 是编译产物。改完 `src/` 记得重新 `npm run build`（或用 `npm run watch` 常驻）。

## 设计要点

### 1. 一条公式 = 一个文件

```
src/content/cards/<formula-id>.ts     ← 独立模块，可任意增删重排
src/content/index.ts                  ← 唯一需要手改的注册表
```

新增公式只需两步：复制任意现有文件当模板改内容 → 在 `index.ts` 里 import 并加入 `ALL_CARDS`。
其余全部自动派生：学科归属、跨体系统计、气泡图、系谱图、搜索索引、完整性自检。

### 2. 四个可排序维度

| 体系 | 含义 | 是否多值 |
|---|---|---|
| `subject` | 学科树（S0 数学基础 → S10 反演，两级） | 单值，带层级 |
| `math` | 推导中实际用到的数学工具 | 多值 |
| `method` | 现场用它干什么活 | 多值 |
| `quantity` | 它最终回答的那个物理量 | 多值 |
| `audience` / `complete` | 高中 → 博士 / L1 → L4 | 单值 |

因为标签互不隶属，同一批数据可以按任意轴排序、聚合、画图。

### 3. 推导步是有类型的

每一步标注 `op`，前端据此上色：
`setup` 设定 · `geometry` 几何 · `physics` 物理定律 · `identity` 恒等式 · `substitute` 代入 · `algebra` 代数 · `taylor` 展开近似 · `transform` 积分变换 · `result` 结论

### 4. 可视化按「够用为止」分级

`V0` 静态 SVG · `V1` 参数曲线 · `V2` 场渲染 · `V3` 数值动画 · `V4` 三维 · `V5` 重内核（Pyodide）
每条公式的 `viz[].compute(params)` 是一个纯函数，输入滑块参数、输出曲线数组 —— 换一套画法不影响数据。

## 目录结构

```
index.html               站点入口（引用编译产物，可直接部署）
assets/
  styles.css             全部样式
  js/                    ← tsc 从 src/ 编译而来
  vendor/katex/          ← npm run build 自动从 node_modules 同步
src/
  core/types.ts          数据契约（FormulaCard / FacetSystem / VizSpec …）
  core/store.ts          聚合层：学科树、依赖边、依赖深度、分面统计、自检
  core/search.ts         中英混合分词 + BM25，支持符号与 LaTeX 检索
  core/katex.ts          KaTeX 渲染 + 符号级联动（失败自动回退）
  core/plot.ts           Canvas 图表引擎（HiDPI / 对数轴 / 悬停读数）
  taxonomy.ts            学科树 + 另外三套分类体系
  views/                 首页 / 浏览 / 详情页 / 气泡图 / 系谱图 / 关于
  content/cards/         公式模块（当前 310 条，全部叶子节点非空）
scripts/
  start.mjs              一键启动：构建 → 起服务 → 开浏览器
  serve.mjs              零依赖静态服务器（可 import 复用，端口自动顺延）
  copy-assets.mjs        同步 KaTeX（只增不删，可重复执行）
  selfcheck.mjs          内容自检
start.bat / start.sh     一键启动入口（双击即用）
```

## 内容现状

- **310 条**公式，覆盖 S0 数学基础 → S13 岩石物理共 **14 个一级学科、78 个叶子节点**
- **1615 步**推导、**289 个**交互可视化、**667 条**依赖边
- 全部叶子节点均有条目（最少 2 条）；覆盖高中 → 博士四个层级
- 全部条目双语；`npm run check` 全绿（LaTeX 全部可渲染、依赖引用全部可解析、数值函数全部返回有限值）

### 各一级学科的条目分布

| 学科 | 条目 | 学科 | 条目 |
|---|---|---|---|
| S0 数学与波动基础 | 41 | S7 内部结构 | 13 |
| S1 弹性力学与本构 | 49 | S8 观测与仪器 | 12 |
| S2 体波与射线理论 | 36 | S9 信号处理 | 14 |
| S3 反射透射与成像 | 41 | S10 反演与成像 | 13 |
| S4 震源物理 | 33 | S11 强地面运动 | 12 |
| S5 面波与自由振荡 | 15 | S12 统计地震学 | 11 |
| S6 衰减与 Q | 11 | S13 岩石物理 | 9 |

## 部署到个人主页

```bash
rsync -av --delete index.html assets/ user@server:/var/www/geoformulas/
```

`vite.config` 之类不存在，`base` 一律使用相对路径（`./assets/...`），所以放在**任意子目录**下都能直接打开，例如 `https://your.site/projects/geoformulas/`。

如果需要放在子路径下，什么配置都不用改 —— 相对路径已经处理好了。

## 已知边界

- 尚未支持 KaTeX 之外的公式渲染（如 MathJax 的某些宏）
- 依赖图谱目前是分层 DAG；单条公式的系谱图用 BFS 分层，节点多时可能较宽
- 搜索索引在浏览器端构建（310 条无压力；到 1000 条时应改为构建期生成的静态索引）
