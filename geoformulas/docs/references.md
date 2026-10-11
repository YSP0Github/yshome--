# 参考项目调研清单

调研时间：2026-10-10　调研范围：GitHub API 精确检索 + 全网搜索
结论先行：**全球范围内没有一个把「地球物理公式 = 逐行推导 + 符号级联动 + 可视化」做成统一产品的项目**。现有成果要么在「内容侧」（教材、Notebook），要么在「形式侧」（物理可视化网站），两者之间的接缝处正是你的机会。

---

## 一、内容侧：现成的公式来源（可直接作为知识骨架与校对基准）

### ★ A 级：强烈建议作为内容主参考

| 项目 | 定位 | 星标 | 最后更新 | 链接 |
|---|---|---|---|---|
| **geoscixyz / gpg** | 《Geophysics for Practicing Geoscientists》开源教材，Oldenburg & Jones 著，覆盖重、磁、电、震四大方法的全部基础公式 | 74 | 2025-09 | https://github.com/geoscixyz/gpg ／ https://gpg.geosci.xyz |
| **geoscixyz / em** | 《Electromagnetic methods in geophysics》开源教材，SEG 2017 杰出讲师短课程用书 | 81 | 2025-02 | https://github.com/geoscixyz/em ／ https://em.geosci.xyz |
| **geoscixyz / geosci-labs** | 应用地球物理交互式 Notebook-Apps 合集（DC 电阻率 / IP / EM / 磁法 / 地震），ipywidgets 驱动 | 59 | 2026-09 | https://github.com/geoscixyz/geosci-labs |
| **geoscixyz / gpgLabs** | 配套 gpg 的教程与示例 Notebook | 47 | 2025-10 | https://github.com/geoscixyz/gpgLabs |
| **seg/tutorials、seg/tutorials-2018** | SEG《The Leading Edge》官方教程代码。含共轭梯度反演、FWI 伴随建模、岩石物理 | 152 / 132 | 2018–2020 | https://github.com/seg/tutorials |
| **Shearer 教材补充体系** | 详见下方两门课 | | | |

> geoscixyz 是**整个英语世界里最完整的开放地物教材生态**（UBC-GIF 维护，19 个仓库）。它用 Sphinx + reStructuredText 构建，公式用 MathJax。它的价值在于：知识结构清晰、公式口径权威、CC-BY / MIT 授权。**它的弱点正好是你的机会**：Web 端交互重（依赖 Binder 起 Python 内核，加载慢）、无中文、没有逐步推导的呈现、公式之间没有依赖图谱。

### ★ B 级：课程型 Notebook（公式 + 推导 + 代码三位一体的成熟范式）

| 项目 | 说明 | 链接 |
|---|---|---|
| **uw-geophysics-edu / ess-412-512-intro2seismology** | 华盛顿大学地震学导论，Jupyter Book 构建。模块划分极清晰：数据处理 → 应力应变 → 体波射线 → 反射地震 → 面波 → 噪声互相关。**这是「知识图谱该如何分层」的最佳模板** | https://github.com/uw-geophysics-edu/ess-412-512-intro2seismology |
| **amtseismo / EPS164** | UC Davis 观测地震学。**最大亮点**：把公式拆成 (a)(b)(c)(d)(e) 小步，每步先给方程、再让学生算、再出图 —— 这就是你要的「推导即交互」 | https://amtseismo.github.io/EPS164/wave-equation-practice |
| **Seismo-Live** | 交互式地震学 Notebook 合集（被广泛引用），Jupyter Book + Binder 双路线 | https://seismo-live.readthedocs.io |

### ★ C 级：工具与索引（用来加速自己的生产）

| 项目 | 说明 | 链接 |
|---|---|---|
| **awesome-geophysics** | 社区维护的地物资源总索引（软件 / 数据集 / 教材 / 课程）。多个 fork 版本内容略不同，建议对比 `arasbadrooj` 与 `mhdned` 两个 fork | https://github.com/arasbadrooj/awesome-geophysics |
| **agilescientific / xlines** | 《X lines of Python》——每个地物算法用几十行 Python 实现 + 讲解。**它对你的启发：每条公式配一个「最小可运行实现」** | https://github.com/agilescientific/xlines |
| **SimPEG** | 地物正演/反演框架（重力、磁法、EM、直流电）。可作为重公式的数值校验器 | https://github.com/simpeg/simpeg |
| **Fatiando a Terra** | Python 地物建模工具（重力、磁法为主） | https://github.com/fatiando/fatiando |
| **ICGEM（GFZ）** | 全球重力场模型服务，含球谐理论与全部计算公式，官网有交互式三维可视化 | https://icgem.gfz.de |
| **SEG Wiki** | 含 Öz Yilmaz《Seismic Data Analysis》全文，公式 LaTeX 源码可提取 | https://wiki.seg.org |

---

## 二、形式侧：网页「公式 + 可视化」的产品范式（直接抄/inspire 技术）

| 项目 | 范式价值 | 星标 | 链接 |
|---|---|---|---|
| **PhysicsHub** | **与你目标最接近的产品**。Next.js + TypeScript + Tailwind，每张知识卡片 = 理论讲解（KaTeX）+ 交互式仿真。MIT。活跃更新到 2026-10。**这是你的 UI/架构头号对标对象** | 62 | https://github.com/physicshub/physicshub.github.io ／ https://physicshub.github.io |
| **HBCSE Interactive Derivations** | **唯一专门做「交互式推导」的项目**。条形公式、伯努利方程、热方程、单摆阻尼……每步可展开/折叠推导过程。**这是你「推导」模块的直接范本** | — | https://lsr.hbcse.tifr.res.in/?p=1482 |
| **Explorable Physics**（landgreen） | 纯静态：手写 SVG + KaTeX + canvas 的探索式物理笔记，GPL-3.0，仍在更新。**证明了「静态站也能做丰富交互」** | 143 | https://github.com/landgreen/physics ／ https://landgreen.github.io/physics/ |
| **manim（3Blue1Brown）** | 数学动画引擎。若想给推导做视频/动画，这是唯一选择。可在构建期离线渲染成序列图片嵌入 | 94k | https://github.com/3b1b/manim |
| **conwayjw97 / Earth-Layer-Visualiser** | Three.js 做的 PREM 地球内部三维剖切 + Chart.js 画速度/密度剖面。**地物的「三维表达」参考** | — | https://github.com/conwayjw97/Earth-Layer-Visualiser |
| **homo-deus.com/lab/geophysics** | 5 个仿真：布格/自由空气重力异常、Airy/Pratt 均衡、地磁场与发电机、地幔对流、地震波传播。**可当作「可视化清单」核对表** | — | https://homo-deus.com/lab/geophysics |
| **Binamraaa / interactive-shallow-water-model** | **关键技术验证**：用 Pyodide 在浏览器里跑 NumPy 做地球物理流体数值仿真 + Plotly.js 渲染。**证明了「Python 数值内核可直接跑在纯前端」** | — | https://github.com/Binamraaa/interactive-shallow-water-model |
| **qunabu / Gravity** | 浏览器太阳系模拟器做得非常好的交互叙事：43 步导览，每步独立 URL 可分享。**「分步推导 + 深链」的 UX 范本** | — | https://github.com/qunabu/Gravity |

---

## 三、关键调研结论

1. **不存在直接竞品**。最接近的 PhysicsHub 只做通识物理（不含地物）；最完整的 geoscixyz 只做静态教材 + 需要起内核的 Notebook。**两者中间的交叉地带是空的**。
2. **技术风险已经被人趟平了**：KaTeX 渲染公式、Plotly/D3 画交互图、Pyodide 跑 NumPy/SciPy、Three.js 做三维 —— 全部有成熟方案且在浏览器端可用。你的工程量不在技术可行性，而在**内容组织与产能**。
3. **真正的瓶颈是「公式的数据化」**。所有现有项目都把公式当「排版文本」，没人把公式当「结构化数据」。谁先把公式建模成「符号表 + 推导步图 + 可视化绑定 + 依赖边」，谁就能自动生成页面、自动建图谱、自动做参数检查。这是本项目最值得投入的一件事。
4. **中文内容几乎没有**。除了少量翻译讲义，地物公式的中文交互式资源基本是一片空白。做中文版具备独立价值。
5. **许可注意**：geoscixyz 系列是 CC-BY-4.0 / MIT，PhysicsHub 是 MIT。可以**复用其知识结构与公式口径**，但推导文字、图示必须自己写，并在每页标注参考来源章节。避免直接搬运教科书原文（尤其 SEG Wiki 上 Öz Yilmaz 的内容，版权归 SEG）。

---

## 四、建议立刻去翻的 5 个页面

1. https://gpg.geosci.xyz — 看它的章节树，拿来当你的知识图谱一级节点
2. https://em.geosci.xyz — 看它如何把 Maxwell 方程组一步步拆到具体观测量的公式
3. https://lsr.hbcse.tifr.res.in/?p=1482 — 看「交互式推导」的交互设计
4. https://physicshub.github.io — 看最终产品形态
5. https://uw-geophysics-edu.github.io/ess-412-512-intro2seismology — 看课程如何分层、如何配套 Notebook
