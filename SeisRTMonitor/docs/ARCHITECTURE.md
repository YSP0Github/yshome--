# SeisRTMonitor 架构设计

## 目标

构建一个 PyQt6 地震数据实时监测系统，重点是：

1. SeedLink 实时数据接入；
2. 低延迟滚动波形显示；
3. 多台站、多通道扩展；
4. 事件触发检测、报警、保存；
5. 后续支持地图、台站管理、震相拾取、简单定位。

## 推荐技术路线

GUI 使用 PyQt6。实时波形绘图建议优先使用 pyqtgraph，原因：

- 基于 Qt Graphics/View 或 OpenGL，刷新性能明显优于 Matplotlib；
- 适合 10-60 FPS 的实时滚动曲线；
- 支持降采样、裁剪、快速 setData；
- 与 PyQt6 信号槽集成自然。

如果必须完全 Qt 原生，可用 QPainter 自绘波形控件：

- 优点：依赖少、可控性强、极致轻量；
- 缺点：坐标轴、缩放、选择、导出、十字光标等都要自己实现。

因此建议：第一版用 pyqtgraph 快速建立稳定实时显示；核心数据层保持独立，后续可把 WaveformView 替换为 QPainter 原生控件。

## 分层结构

```text
seisrt/
  app/            # 应用入口、启动流程
  gui/            # PyQt6 界面层
  core/           # 实时数据核心：SeedLink、缓冲、数据模型
  algorithms/     # 检测、拾取、定位、震级算法
  storage/        # 事件保存、配置保存、波形写出
  services/       # 后台服务编排，如监测会话、报警服务
  resources/      # 图标、样式、资源
configs/          # 默认配置
docs/             # 设计文档
tests/            # 单元测试
```

## 核心数据流

```text
SeedLinkWorker 后台线程
      ↓ trace
TraceQueue / Qt Signal
      ↓
StreamBuffer / RingBuffer
      ↓
Detector 检测模块
      ↓
WaveformView 实时显示
      ↓
EventStore 保存事件和日志
```

## 线程原则

- SeedLink 接收运行在后台线程；
- 后台线程不得直接操作 GUI；
- GUI 通过 QTimer 定时从缓冲区取快照刷新；
- 数据写入和绘图读取之间用锁或队列隔离；
- 关闭时必须先 terminate SeedLink，再 join 线程。

## 后续里程碑

### M1：最小实时波形监控

- 单台站单通道 SeedLink 接入；
- 环形缓冲区；
- pyqtgraph 实时滚动显示；
- 启停按钮和状态栏。

### M2：多通道与稳定性

- 多台站/多通道管理；
- 断线自动重连；
- 数据延迟显示；
- 日志面板。

### M3：事件检测

- STA/LTA；
- 多台站联合触发；
- 事件前后窗口保存为 MSEED；
- 报警弹窗/声音。

### M4：地震监测平台

- 台站地图；
- 事件列表；
- P 波拾取；
- 简单震中定位与震级估计。
