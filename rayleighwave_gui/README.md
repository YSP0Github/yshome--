# 二维面波传播正演交互式模拟工具

这是一个基于 Python 的二维弹性面波正演教学工具，目标是把原有 Fortran 作业中的核心思想，整理成一个可交互、可视化、可导出的桌面程序。

## 当前版本功能

- 二维各向同性弹性波速度-应力显式正演
- 顶部自由表面 / 顶部吸收边界切换
- 左右底部吸收层（PML 风格阻尼层）
- 多层/倾斜界面模型编辑
- 可设置 `Vp / Vs / 密度`
- 可设置震源位置、类型、子波参数
- 可设置接收器线阵
- 实时显示波场动画
- 实时显示炮集记录和单道曲线
- 保存/加载工程参数
- 导出记录数据、当前波场 PNG、波场 GIF

> 说明：当前吸收边界实现为教学向的“PML 风格阻尼吸收层”，优先保证界面交互、结果演示和代码清晰度，后续可进一步升级为更严格的 split-field PML / CPML。

## 安装

建议使用独立虚拟环境：

```bash
pip install -r requirements.txt
```

## 运行

```bash
python main.py
```

## 目录结构

```text
rayleighwave_gui/
├─ main.py
├─ requirements.txt
├─ README.md
├─ app/
│  ├─ config.py
│  ├─ types.py
│  ├─ model/
│  ├─ physics/
│  ├─ io/
│  ├─ ui/
│  └─ utils/
├─ examples/
└─ outputs/
```

## 使用建议

首轮建议使用以下参数体验：

- 网格：`nx=301, nz=151, dx=1 m, dz=1 m`
- 时间：`dt=0.00025 s, tmax=0.8 s`
- 模型：双层或低速覆盖层
- 震源：垂向点力，`f0=18~30 Hz`
- 检波器：48 道，间距 `3~4 m`

## 后续可扩展方向

- 更严格的 PML / CPML
- 多炮滚动采集
- SEG-Y 导出
- 频散图与相速度分析
- 地形自由表面
- GPU 加速
