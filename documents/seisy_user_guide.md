```

```

# SeisY 使用说明（扩展代码梳理版）

> 文档状态：基于 G:\SeisY 当前代码结构整理。
> 说明：本文档依据 seisy/main.py 与多个 seisy/core/*.py 模块整理，重点总结主界面、菜单、工具栏和主要专业功能。

![SeisY 主界面截图](../seisy/images/SeisY-main.png)

---

## 1. SeisY 是什么

SeisY 是一个综合性的地震 / 月震 / 行星地震数据处理与模拟分析平台。它把波形处理、事件管理、频谱分析、噪声工具、行星地震模拟和 Apollo 月震数据工具整合在同一个主窗口中。

它的核心能力主要包括：

- 本地波形导入与保存
- 地震数据下载
- 波形预处理与频谱分析
- EVENTLIST 驱动的批处理
- Hypocenter Locator、Planetary Station Map、RayTracer、Normal Mode Workbench、Models Design
- Apollo 月震数据下载、提取与可视化

---

## 2. 主界面结构说明

主窗口类位于 seisy/main.py 的 MainWindow。

### 2.1 顶部菜单栏

主界面顶部包含 6 个一级菜单：

- 文件
- 数据
- 工具
- 模拟
- 设置
- 帮助

### 2.2 顶部主工具栏

菜单下方是一排图标按钮，是高频操作的快捷入口，覆盖导入、打开、保存、查找、视图切换、处理、下载和专业工具启动等功能。

### 2.3 左侧区域

左侧由上下两部分组成：

#### 上半部分：文件树

- 浏览工作目录
- 显示名称、修改日期、大小、类型
- 双击打开文件或进入目录
- 右键进行复制、粘贴、重命名、新建、删除、导入等操作

#### 下半部分：行星 / 球体显示区

- 与 GLWidget、纹理、标记和行星可视化相关
- 截图中显示的是带经纬网的月球球体

### 2.4 中间区域：三块主绘图区

中间有三块上下排列的绘图区：

- canvas_top
- canvas_mid
- canvas_bottom

常用于：

- 波形显示
- 频谱显示
- 多事件对比
- 处理前后结果展示

### 2.5 右侧区域

#### 右上：内置终端 / 日志窗口

- 输出后台下载日志
- 输出处理信息
- 支持输入 SeisY 内部命令

#### 右下左：EVENTLIST 事件列表

- 存放导入后的流数据和分析结果
- 支持分组、批处理、复制、粘贴、删除、撤销、重做

#### 右下右：详情与附加显示区

- 上方用于显示 event 详情
- 下方用于显示附加绘图结果

### 2.6 底部状态栏

状态栏会显示：

- 当前路径
- 已选数量
- 事件列表数量
- 软件版本号

---

## 3. File 菜单

### 3.1 Import File

代码入口：import_file()

作用：

- 导入本地文件
- 调用 SeismicProcessor.read_seismic_data() 解析
- 成功后加入 EVENTLIST
- 最后刷新绘图

可识别类型包括：

- ObsPy 兼容格式
- SAC / MiniSEED / SEGY / SEG2
- TXT / ASCII / CSV / 两列时间序列文本

### 3.2 Open File With Editor

用编辑器打开文件，适合查看脚本、配置和文本文件。

### 3.3 Open Yunji Editor

直接打开 Yunji 编辑器。

### 3.4 Config Files

包含：

- Set Work Dir
- Load Config
- Update Config

### 3.5 Save Data

调用 SeismicProcessor.save_data() 保存当前数据，支持：

- .mseed
- .sac
- .ascii
- .txt
- .csv
- .sgy
- .seg2

### 3.6 Save Project / Save Project As / Open Project

项目文件格式为 .seisyproj。

### 3.7 Export EVENTLIST

导出当前事件列表。

### 3.8 Exit

退出软件。

---

## 4. Data 菜单

### 4.1 Input Date

输入时间参数，常用于下载、裁剪和分析时间窗设置。

### 4.2 Download Seismic Data

代码入口：
aw_seismogram()

可设置：

- Network
- Station
- Channel
- Location
- Start Time
- End Time

特点：

- 支持批量 station / channel 输入
- 后台线程下载
- 下载成功后自动加入 EVENTLIST
- 日志显示在右上角终端区

### 4.3 Preprocessing

包含：

- De-mean
- Detrend
- Detrend Polynomial
- Detrend Polynomial Plot
- Detrend Spline
- Detrend Spline Plot
- Remove Response
- Output Run Mode
- Unit Conversion
- Custom Detrending
- Normalization
- Custom Normalization
- Standardization
- conjugate
- reverse
- Smooth
- Denoise

### 4.4 Interpolation of missing values

支持：

- Linear
- Nearest
- Polynomial
- Spline
- Barycentric
- Krogh
- Piecewise Polynomial
- PCHIP
- Akima
- Cubic Spline

### 4.5 Windowing

支持：

- Hamming
- Hann
- Blackman
- Rectangular
- Bartlett
- Flattop
- Plot Windows

### 4.6 Filtering

包含：

- Filtering
- Median Filtering
- Modify Median Windows size

### 4.7 其它数据功能

- De-pulse and Plot
- Seismic Data Correlation
- Seismic Data Sparsification（当前代码中未实现）
- Plot Amplitude Spectrum
- Plot Amplitude Spectrums
- Plot Time and Amplitude Spectrums
- Export Current Spectrum to File
- Send Spectrum to Normal Mode Workbench
- Plot Current Stream
- Plot Stream 2.0
- Plot Stream 3.0

---

## 5. Tools 菜单

### 5.1 Seismic Downloader

打开独立地震下载工具。

### 5.2 Hypocenter Locator

主要分组：

- Station Metadata
- Waveform Inputs
- Waveform Preview & Picks
- Planetary Model
- Arrival Picker
- Initial Hypocenter Guess
- Results
- Station / Hypocenter Map

### 5.3 Planetary Station Map

主要分组：

- 背景与标题
- 显示区域
- 标记样式
- 数据导入/导出
- 新增对象
- 台站列表
- 震源列表
- 震中距结果
- 到时预测

### 5.4 RayTracer

打开射线追踪工作台。

### 5.5 Apollo System

主要分组：

- 基础配置
- 任务控制
- 下载日志
- 数据提取配置
- 提取与分析日志
- 波形可视化

### 5.6 其他工具

- ULF-VLSNR-SE Reconstructor
- Noise Extractor
- Segment De-pulse (Interactive)
- Trace Merge Tool
- Data Viewer
- Spectrum Analyzer Viewer
- Sliding Correlation Analyzer

---

## 6. Simulation 菜单

### 6.1 Seismic Phase Simulation

震相模拟入口。

### 6.2 Normal Mode Workbench

简正模工作台，主标签页包括：

- 模型模块
- 模态模块
- 激发/合成模块

### 6.3 Models Design

模型设计器，主要区域包括：

- 模型工具栏
- 模型元信息
- 层编辑器
- 模型自动生成
- 模型体检
- 预览标签页

---

## 7. Settings 菜单

包含：

- Modify Configurations
- Plot Sampling Setting
- Plot Spectrum Setting
- Add marker(s) to map
- Modify map markers
- Modify map Texture
- Set Apollo Database Path
- Show Streams List
- Merge Streams List
- Save CSL
- Clear CSL
- Show Memory Usage

---

## 8. Help 菜单

包含：

- Open Wilber 3
- Open Gmap
- Open SAGE tool
- Open Seisnet List
- Open Geoscience Websites Lists
- De-pulse help
- Interpolation help
- About
- Theme
- Language

---

## 9. EVENTLIST 说明

EVENTLIST 是 SeisY 的数据对象管理中心。

常见分组：

- Streams
- Correlation Data
- Noise Data
- Array Data
- 用户自定义分组

右键菜单里可见的典型能力：

- Group Events
- Cal
- More
- Copy Event ID
- Copy Event
- Paste Event
- Delete Event
- Undo Event
- Redo Event

Cal 子菜单中可以做：

- 时域加减
- 频域加减
- Add Noise
- Freq-domain Denoise(PDDM)
- Mean
- SNR / SNR2 / SNRF
- Unify Length

More 子菜单中可以做：

- Trim by DateInput
- Trim by Interactive
- Split Stream
- Merge Streams
- Merge Traces
- plot Select Trace
- Plot Select Stream

---

## 10. 内置终端 / CLI 说明

右上角黑底区域是 SeisY 内置终端。

已注册命令包括：

- clear / clc
- bout
- help
- plot
- -r
- --version
- image_path
- seisd
- hypocenter
- hypocenter_locator
- hello_world

同时还支持独立 CLI 入口：seisy.ui.cli。

---

## 11. 推荐的新手使用流程

### 11.1 常规数据处理

1. File → Import File 导入波形
2. 在 EVENTLIST 中选中事件
3. 使用 De-mean → Detrend → Filtering → Remove Response
4. 用 Plot Current Stream 查看波形变化
5. 用 Plot Amplitude Spectrum 查看频谱
6. Save Data 导出结果
7. Save Project 保存项目

### 11.2 下载并分析新数据

1. Data → Download Seismic Data
2. 填写 network / station / channel / 时间窗
3. 等待后台下载
4. 在 EVENTLIST 中查看下载结果
5. 用 Data Viewer / STA-LTA / Spectrum Analyzer Viewer 做进一步检查

### 11.3 行星地震模拟

1. 打开 Models Design 设计模型
2. 发送到 Normal Mode Workbench
3. 计算模态并查看结果
4. 用 Planetary Station Map 配置台站与震源
5. 用 RayTracer 辅助分析传播路径

---

## 12. 我对 SeisY 的总结

最核心的 5 类能力：

- 地震数据导入 / 下载 / 保存
- 波形预处理与频谱分析
- EVENTLIST 批处理与管理
- 行星地震模拟工具链
- Apollo 月震专用数据系统

最有特色的部分：

1. 一个窗口集成多种地震处理能力
2. 行星地震相关模块较完整
3. 简正模、模型设计、射线追踪、台站地图之间存在联动
4. Apollo 月震工具链具有明显特色

---

## 13. 本文档参考的主要代码入口

- seisy/main.py
- seisy/core/SeismicConfig.py
- seisy/core/ui_dialogs.py
- seisy/core/ui_plot.py
- seisy/core/data_viewer.py
- seisy/core/noise_tools.py
- seisy/core/hypocenter_locator_gui.py
- seisy/core/planetary_station_map.py
- seisy/core/raytracer_qt.py
- seisy/core/normal_modes.py
- seisy/core/models_design.py
- seisy/apollo_moonquake_system/ui/main_window.py
- seisy/core/cli_CommandProcessor.py

## 科学计算与公式索引

> 本节按“功能 → 计算逻辑 → 关键公式 → 对应代码”的方式整理 SeisY 中与科学计算直接相关的模块。
> 说明：以下内容严格依据当前代码实现总结；其中一部分属于物理近似或工程化估算，文中已尽量注明。

### 科学计算功能清单


| 功能             | 主要计算逻辑                                                 | 关键代码                                                                                        |
| ---------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 数据预处理       | 去均值、去趋势、归一化、平滑、滤波、缺失值插值               | `seisy/core/processing.py`                                                                      |
| 频谱与功率谱     | FFT、单边/双边谱、PSD、Welch 平均                            | `seisy/core/processing.py`, `seisy/tools/spectrum_analysis.py`, `seisy/tools/power_spectrum.py` |
| 信噪比与噪声匹配 | RMS / 功率型 SNR、滑动归一化相关、频域增益抑噪               | `seisy/core/processing.py`, `seisy/core/sliding_corr.py`                                        |
| 震源定位         | 大圆距离、理论走时、残差最小二乘反演                         | `seisy/core/hypocenter_locator.py`                                                              |
| 射线追踪         | 分层速度模型、固定起射角积分、目标震中距反求                 | `seisy/core/raytracer.py`                                                                       |
| 简正模分析       | 模态频率估计、Q 与阻尼时间、特征函数、激发权重、台站响应合成 | `seisy/core/normal_modes.py`                                                                    |
| 观测谱匹配       | 峰值检测、频率容差匹配、理论—观测对照                       | `seisy/core/normal_modes.py`                                                                    |
| 月震流程         | 质量筛选、SNR 评估、震前噪声截取、叠加重建、模型评分         | `seisy/core/lunar_pipeline.py`                                                                  |
| PDDM 重建        | 互相关、频域反卷积式重建                                     | `seisy/core/PDDM.py`                                                                            |
| 面波反演         | 频散曲线前向、加权 L2 目标函数、平滑约束优化                 | `seisy/core/SWI.py`                                                                             |
| 合成地震记录     | Ricker 子波、层状事件叠加、随机噪声注入                      | `seisy/core/SeismicSynthesizer.py`                                                              |

### 1. 数据预处理 / 频谱 / PSD

**对应代码**：`seisy/core/processing.py`、`seisy/tools/spectrum_analysis.py`、`seisy/tools/power_spectrum.py`

#### 1.1 异常值稳定化与归一化

- 先处理 `NaN / +Inf / -Inf`，避免后续 FFT、滤波、归一化输入失真。
- 每道数据通常采用 Min-Max 归一化：

$$
x' = \frac{x-x_{\min}}{x_{\max}-x_{\min}}
$$

- 若 $x_{\max}=x_{\min}$，则该道置零，避免分母为零。

#### 1.2 FFT、幅度谱与 PSD

离散傅里叶变换写成：

$$
X[k]=\sum_{n=0}^{N-1} x[n] e^{-i2\pi kn/N}
$$

频率轴为：

$$
f_k = \frac{k f_s}{N}
$$

双边幅度谱与双边功率谱密度可写成：

$$
A_2(f)=\frac{|X(f)|}{N}
$$

$$
PSD_2(f)=\frac{|X(f)|^2}{f_sN}
$$

Welch 方法的思想是“分段 + 加窗 + 分段 FFT + 平均”，其目标不是改变物理定义，而是降低估计方差。

#### 1.3 Parseval 与 SNR

Parseval 背景说明时域平方和与频域平方和是对应的，因此 PSD 更适合表达能量分布。

功率型信噪比可写成：

$$
SNR_{dB}=10\log_{10}\left(\frac{P_s}{P_n}\right)
$$

而在月震流程等模块中，还会用 RMS 比值型定义。

---

### 2. hypocenter_locator.py：球面几何、走时与加权最小二乘

**对应代码**：`seisy/core/hypocenter_locator.py`

- 先由 Haversine 公式计算台站与震源之间的中心角 $\Delta$。
- 若 TauP 可用，则优先使用 TauP 走时；否则退回均匀介质近似。

回退近似可写成：

$$
L_{arc}=R\Delta
$$

$$
L=\sqrt{L_{arc}^2+h^2}
$$

$$
t=\frac{L}{v}
$$

定位参数一般写成：

$$
m=(lat, lon, depth, t_0)
$$

加权残差函数为：

$$
r_i = w_i\,[t_{obs}-(t_0+t_{calc}+c_i)]
$$

其中 $w_i$ 为综合权重，$c_i$ 为台站改正。

协方差近似常写成：

$$
(J^\mathsf{T}J)^{-1}
$$

---

### 3. raytracer.py：分层速度模型、路径积分与目标震中距反求

**对应代码**：`seisy/core/raytracer.py`

层内速度通常可写成半径归一化多项式：

$$
v(r)=a+bx+cx^2+dx^3, \qquad x=\frac{r}{R}
$$

其物理背景可视为球对称介质中的路径积分问题：

$$
T=\int \frac{ds}{v(r)}
$$

射线参数常用于解释折射与边界控制行为：

$$
p \sim \frac{r\sin i}{v(r)}
$$

代码层面则对应两种工作模式：

1. **正演模式**：给定起射角，逐层推进并累计走时、震中距、出射角与路径点。
2. **反求模式**：扫描并细化起射角，使理论震中距逼近目标值。

---

### 4. normal_modes.py I：模型准备、模态枚举、频率估计、Q 与阻尼

**对应代码**：`seisy/core/normal_modes.py`

#### 4.1 模型对象与模态枚举

- `PlanetaryModel` 维护半径、密度、`Vp`、`Vs`、`qkappa`、`qshear` 等分层参数。
- 模态按角阶数 $l$、径向阶数 $n$ 与模态类型（spheroidal / toroidal / radial）生成。

#### 4.2 不同模态的经验频率关系

Toroidal 模态频率近似可写成：

$$
f \propto \frac{V_s\sqrt{l(l+1)}}{2\pi R}
$$

Spheroidal 模态频率近似可写成：

$$
f \propto \frac{V_{eff}\sqrt{l(l+1)}}{2\pi R}
$$

Radial 模态频率近似可写成：

$$
f \propto \frac{V_p}{R}
$$

#### 4.3 Q 与阻尼时间

模态 Q 合成后，可进一步转为阻尼时间：

$$
\tau = \frac{Q}{\pi f}
$$

---

### 5. normal_modes.py II：特征函数、震源激发与台站响应合成

#### 5.1 特征函数

归一化半径定义为：

$$
x=\frac{r}{R}
$$

Toroidal 模态的一个近似振型可写成：

$$
x^l\sin((n+1)\pi x)
$$

密度缩放可写成：

$$
\sqrt{\rho(r)}
$$

#### 5.2 有限震源时窗与台站响应

有限震源时窗采用高斯型抑制项：

$$
\exp\!\left(-\frac{(2\pi fT)^2}{8}\right)
$$

台站响应的核心形式为阻尼振荡叠加：

$$
u(t)=\sum_m W_m e^{-t/\tau_m}\sin(2\pi f_m t+\phi_m)
$$

其中 $W_m$ 同时吸收震源深度、机制、方位角、分量、震中距等多种权重。

---

### 6. normal_modes.py III：观测谱峰检测、理论匹配与精确球贝塞尔求根

- 使用 `scipy.signal.find_peaks()` 提取候选峰。
- 匹配容差不是固定常数，而是随理论频率局部间距和观测峰位变化。

Toroidal 边界条件可写成：

$$
j_l'(x)+\frac{j_l(x)}{x}=0
$$

若根为 $x_n$，则频率换算为：

$$
f=\frac{v x_n}{2\pi R}
$$

#### 6.1 模态求解原理：为什么“近似求解”会这么简单？

当前 `normal_modes.py` 里实际上并存两套思路：

1. **近似频率估算（NormalModeCalculator）**：不是严格求解完整弹性球本征值问题，而是把平均速度、球半径、角阶数、径向阶数与结构修正因子组合起来，快速估计模态频率。  
2. **均匀球根求解（ExactNormalModeSolver）**：把介质近似成均匀球体，在球贝塞尔函数边界条件下做数值求根，再把根换算成频率。

因此，前者更适合快速浏览、交互展示与参数扫描；后者更适合说明“模态频率并不只是经验公式，还可以由边界条件本征根得到”。

#### 6.2 近似求解的计算逻辑

近似求解器 `_estimate_frequency()` 并没有构造完整的运动方程矩阵，而是用如下结构做经验估计：

$$
f \sim \frac{v_{eff}}{2\pi R}\times \text{degree term}\times \text{radial factor}\times \text{structure factor}
$$

其中：

- 对 Toroidal 模态，角阶主要体现为

$$
\sqrt{l(l+1)}
$$

因此频率近似写成：

$$
f_T \sim \frac{V_s\sqrt{l(l+1)}}{2\pi R}\,C_n C_{liq} C_{disc} C_{body}
$$

- 对 Spheroidal 模态，代码采用等效速度与相似的角阶缩放：

$$
f_S \sim \frac{V_{eff}\sqrt{l(l+1)}}{2\pi R}\,C_n C_{str}
$$

- 对 Radial 模态，则近似为：

$$
f_R \sim \frac{V_p}{R}\,C_n C_{str}
$$

这里的 $C_n$、$C_{liq}$、$C_{disc}$、$C_{body}$、$C_{str}$ 都是代码中的修正项，分别代表径向阶数、液层比例、间断面数量、天体类型与结构影响。  
所以这部分**本质上是半经验估算器，而不是严格的本征值解法**。

#### 6.3 均匀球根求解：本征根来自哪里？

如果把介质近似为均匀球体，径向部分的位移函数可以写成球贝塞尔函数：

$$
u(r) \propto j_l(kr)
$$

其中

$$
k = \frac{\omega}{v}
$$

令

$$
x = kR = \frac{\omega R}{v}
$$

则模态问题就转化为：**寻找满足自由表面边界条件的 $x$ 的离散根**。

#### 6.4 代码中的边界条件

`ExactNormalModeSolver._boundary_condition()` 当前采用的均匀球近似边界条件为：

- **Toroidal**

$$
j_l'(x)+\frac{j_l(x)}{x}=0
$$

- **Radial**

$$
j_0'(x)=0
$$

- **Spheroidal（当前代码中的简化形式）**

$$
j_l'(x)+\frac{2j_l(x)}{x}=0
$$

需要说明的是，这里的 spheroidal 条件仍是**简化表达**，并不是完整分层弹性球的耦合本征方程组。

#### 6.5 根如何变成频率？

若边界条件的第 $n$ 个根为 $x_n$，则有

$$
x_n = \frac{\omega_n R}{v}
$$

又因为

$$
\omega_n = 2\pi f_n
$$

所以频率换算公式为：

$$
f_n = \frac{v x_n}{2\pi R}
$$

这正是 `ExactNormalModeSolver.compute_modes()` 中把根换成频率的核心公式。

#### 6.6 数值求根逻辑

`_find_roots()` 的步骤很直接：

1. 在自变量 $x$ 上按固定步长扫描；  
2. 检查边界函数 $F(x)$ 是否出现变号，即

$$
F(x_k)F(x_{k+1}) < 0
$$

3. 一旦发现变号区间，就用 Brent 法在该区间上求根：

$$
F(x_n)=0
$$

代码对应的是 `scipy.optimize.brentq`。因此，“均匀根求解”本质上就是：

> **球贝塞尔边界条件 + 变号区间扫描 + 一维数值根求解 + 根到频率映射**。

#### 6.7 这一部分在文档中应如何表述

为了避免夸大，建议明确区分：

- **近似求解器**：快速、直观、便于交互，但偏经验化；
- **均匀球根求解器**：更接近真正的本征值问题，但仍基于均匀球和简化边界条件；
- **若要达到严格地球/行星自由振荡求解**：通常还需要完整的一维分层弹性方程、层间匹配条件、重力/自引力项及更严格的边界条件。

---

### 7. 月震流程 / PDDM / SWI / 合成地震记录

月震质量筛选常使用 RMS 比值型 SNR：

$$
\mathrm{SNR}=\frac{\mathrm{RMS}(signal)}{\mathrm{RMS}(noise)}
$$

对齐后叠加重建可写成：

$$
\bar{x}(t)=\frac{1}{N}\sum_i x_i(t)
$$

PDDM 频域恢复公式可写成：

$$
F_{re}=\frac{F_{s2s1}-F_{s2n1}}{F_{s2}^{*}+\varepsilon}
$$

Ricker 子波写成：

$$
w(t)=(1-2\pi^2 f_0^2 t^2)e^{-\pi^2 f_0^2 t^2}
$$

---

### Markdown 公式渲染说明

如果目标 Markdown 查看器支持数学公式，通常应使用：

- 行内公式：`$ ... $`
- 独立公式：`$$ ... $$`

因此本节公式已统一改为上述写法，而不是只保留普通文本或代码样式。这样在支持数学渲染的 Markdown 目标文件/查看器中，应显示为真正公式，而不是一串字母。
