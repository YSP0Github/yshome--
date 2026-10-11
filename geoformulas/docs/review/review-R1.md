# 审查记录 R1 — S0（数学与波动基础）、S1（弹性力学与本构）

- 审查范围：`src/content/cards` 中 `node` 顶级为 S0 / S1 的全部卡片。
- 审查条数：90。
- 修改条数：4（共 4 张卡片）。
- 存疑条数：2。
- 校验：改动文件均通过 `node scripts/verify-cards.mjs`（KaTeX 无错、viz 有限、node/tag 存在）。

## 变更清单

| id | 改了什么 | 依据/出处 |
|----|----------|-----------|
| acoustic-impedance | 推导第 6 步（界面反射/透射）原写 `T=1+R_stress=2Z1/(Z2+Z1)`，代数自相矛盾：`1+(Z2−Z1)/(Z1+Z2)=2Z2/(Z1+Z2)`，并不等于 `2Z1/(Z1+Z2)`。改为 `T_位移=1−R=2Z1/(Z2+Z1)`，与本卡 variant、viz（T=1−R）保持一致，并补注压力透射系数 `T_σ=1+R=2Z2/(Z1+Z2)`。 | Aki & Richards, Quantitative Seismology, §5.3（法向入射反射/透射系数的位移/压力约定） |
| ps-wave-velocities | 算例数值订正：α 由 6.74 km/s 改为 6.70 km/s，α/β 由 1.71 改为 1.70（β=3.94 km/s、ν≈0.24 不变）。给定 λ=40 GPa、μ=45 GPa、ρ=2900 kg/m³，α=√((λ+2μ)/ρ)=√(130e9/2900)=6.695 km/s。 | 直接按给定参数重算（P 波速度公式 α=√((λ+2μ)/ρ)） |
| vti-sh-azimuthal-velocity | 方位角谐和展开的 cos4ψ 系数错误。对 `1+δ sin²ψcos²ψ+ε sin⁴ψ` 作 Fourier–三角展开，cos4ψ 项系数为 `(ε−δ)/8`，原卡两处（variant 与推导第 6 步）均误写为 `(δ−2ε)/8`（等价 `−(2ε−δ)/8`）。已按三角恒等式 `sin²cos²=(1−cos4ψ)/8`、`sin⁴=(3−4cos2ψ+cos4ψ)/8` 两处一并订正为 `(ε^(V)−δ^(V))/8`。 | Thomsen (1986), Weak elastic anisotropy; Rüger 方位角 P 波速度展开；三角恒等式直接验证 |
| maximum-likelihood-estimation | 算例数值订正：8 个残差的 ML 方差由 0.0472 改为 0.0484 s²（σ_ML=0.217→0.220 s），无偏 s² 由 (8/7)×0.0472=0.0540 改为 (8/7)×0.0484=0.0553 s²（s=0.232→0.235 s）。均值 μ_ML=0.0063 s 不变。 | 按给定残差序列直接计算：Σx²=0.3875，N·x̄²=0.0003125，σ²_ML=(0.3875−0.0003125)/8=0.0484 |

## 未改动但已逐条核对无误的重点

- 全部 Lamé/模量换算（bulk-modulus-lame、poissons-ratio-lame、youngs-modulus-lame、elastic-moduli-conversions、p-wave-velocity-formula、s-wave-velocity-formula、poisson-from-velocities、velocity-ratio-poisson）：逐式代数核对，互推一致。
- Navier 方程两种形式、P/S 势解耦、波数 k=ω/c、复波速/复波数/衰减 α=ω/(2Qc)、t* 算子、Kramers–Kronig 对数频散（c 形式系数 1/πQ、模量形式 2/πQ）、Zener 模型与 Debye 峰（FWHM=1.144 十进）：均正确。
- 应力/应变张量、Cauchy 公式、主应力/主应变、J₂ von Mises、Mohr 圆（θ_f=45°+φ/2）、地静压力梯度：均正确。
- Fourier/Hilbert/解析信号/留数/Laplace/Bessel/Legendre/球谐/Green 函数/d'Alembert/球面波、误差传播/高斯/协方差/MLE/卡方：均正确。

## 存疑项

1. **acoustic-impedance（node: S0.1）** — 内容是法向入射界面的反射/透射系数，按题材更贴近反射界面（S3 反射）一支而非 S0.1 平面波基础。按审查纪律未自行移动 node，仅记录。
2. **三张 Hooke 定律卡内容高度重叠**（hookes-law-isotropic / generalized-hooke-law / isotropic-hooke-law）— 三者均讲广义胡克定律与刚度张量对称性（81→36→21），内容重复，疑似冗余条目。这是结构/去重问题而非单卡数学错误，未改动；是否合并由组织者决定。
