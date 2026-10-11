# 公式卡片写作规范

一条公式 = `src/content/cards/<id>.ts` 一个文件。写完后运行 `npm run build`，
`scripts/gen-index.mjs` 会自动扫描目录并生成注册表 —— **不要手工编辑 `src/content/index.ts`，也不要编辑 `src/taxonomy.ts`**。

## 文件骨架

```ts
import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** <id> */
const <camelCaseId>: FormulaCard = {
  id: '<id>',
  name: t('中文名', 'English name'),
  aliases: { zh: ['别名'], en: ['alias'] },
  node: 'S1.2',                       // 必须是 taxonomy.ts 中已定义的叶子节点
  tags: {
    subject: 'S1.2',                  // 可省略，默认同 node
    math: ['MATH.VECTOR'],            // 见下方词表
    method: ['METH.STRUCT'],
    quantity: ['Q.TENSOR'],
    keywords: t('中文关键词 空格分隔', 'english keywords'),
  },
  audience: 'bachelor',               // highschool | bachelor | master | phd
  complete: 'L2',                     // L1 条目 | L2 含推导 | L3 含可视化 | L4 含算例
  statement: {
    main: String.raw`\sigma_{ij}=\lambda\,\delta_{ij}\,\varepsilon_{kk}+2\mu\,\varepsilon_{ij}`,
    variants: [{ name: t('变体名', 'variant'), latex: String.raw`...` }],
  },
  meaning: t('这条公式在说什么、为什么重要（2-4 句）', '...'),
  symbols: [
    { sym: '\\sigma_{ij}', name: t('应力张量分量', 'stress component'), unit: 'Pa', typical: '10⁶ – 10⁹' },
  ],
  conditions: {
    applies: [t('适用条件', '...')],
    assumes: [t('隐含假设', '...')],
    breaks:  [t('失效情形', '...')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('步骤标题', 'Step title'), latex: String.raw`...`, note: t('为什么这一步成立', '...') },
  ],
  viz: [ /* 见下 */ ],
  example: { title: t('算例', 'Example'), input: t('输入', 'input'), steps: [t('中间结果','...')], output: t('结论', '...') },
  links: {
    upstream:   [{ id: 'strain-tensor', note: t('依赖它', '...') }],
    downstream: [{ id: 'navier-equation' }],
    seealso:    [{ id: 'hookes-law-isotropic' }],
  },
  refs: [{ text: 'Shearer, Introduction to Seismology, 2nd ed., §3.1' }],
}

export default <camelCaseId>
```

## 硬性规则（违反会导致 `npm run check` 失败）

1. **`id` 必须等于文件名**（kebab-case，如 `love-wave-dispersion.ts` → `id: 'love-wave-dispersion'`）。
   全局唯一。导出变量用 camelCase，且必须 `export default`。
2. **所有 LaTeX 必须能被 KaTeX 渲染**：
   - 一律用 `String.raw` 反引号模板字符串
   - 在 JS 模板字符串里 `\` 不需要转义（因为用了 raw），直接写 `\frac{}{}`
   - **禁止**使用 KaTeX 不支持的宏（如 `\align`、`\equation` 环境、`\mathbb{R}` 可用但需 `\mathbb`）
   - 常用可安全使用：`\frac \sqrt \partial \nabla \cdot \times \left \right \sum \int \lim \exp \ln \sin \cos \tan \boldsymbol \mathbf \hat \bar \tilde \dot \ddot \Delta \delta \alpha \beta \gamma \lambda \mu \rho \sigma \tau \omega \Omega \theta \varphi \varepsilon \vartheta \approx \equiv \propto \le \ge \neq \pm \cdot \mathrm \operatorname \text \begin{pmatrix} \begin{aligned} \\ \quad \qquad \! \,`
   - `\text{中文}` 可用，但尽量用英文或中文均可（KaTeX 支持 CJK）
   - 矩阵用 `\begin{bmatrix}...\end{bmatrix}`，不要 `\begin{array}` 除非必要
3. **`node` 必须是 taxonomy.ts 里存在的叶子 id**（如 `S4.2`，不要写 `S4`）。
4. **`links` 里的 id 必须真实存在**。你只能引用：你自己本批次创建的 id，或下方「已知 id 白名单」中的 id。**跨批次引用一律禁止**（会报 link 错误）。
5. **`tags` 的值必须来自下方词表**，拼写完全一致。
6. **可视化 `compute` 必须是纯函数**：只用 `p['控件id']` 读取参数，返回 `Series[]`；
   不得出现 `NaN/Infinity`（自检会用默认参数调用它并检查有限性）。
7. **不允许出现乱码或非中英文字符**（如乱码西里尔字母、奇怪的 token）。中文用简体。
8. **不要** import 除 `../../core/types.js` 以外的任何东西；不要把 `t` 之外的运行时依赖带进来。
9. 数学必须正确：量纲要自洽，单位用 SI，符号在全站约定内保持一致（见下）。

## 标签词表

**math（可多值）**
`MATH.DIFF` `MATH.FOURIER` `MATH.VECTOR` `MATH.LINALG` `MATH.COMPLEX` `MATH.GEOM` `MATH.ALGEBRA` `MATH.APPROX` `MATH.ROOT` `MATH.TRANSFORM` `MATH.STAT`

**method（可多值）**
`METH.EXPL` `METH.TELE` `METH.SURF` `METH.STRUCT` `METH.INSTR` `METH.PROC` `METH.INV` `METH.ATTEN` `METH.HAZARD` `METH.STAT` `METH.ROCK`

**quantity（可多值）**
`Q.VEL` `Q.TIME` `Q.AMP` `Q.FREQ` `Q.MAT` `Q.TENSOR` `Q.GEOM` `Q.SOURCE` `Q.HAZARD`

**derivation 步的 op（决定前端配色）**
`setup` 设定 · `geometry` 几何 · `physics` 物理定律 · `identity` 恒等式 · `substitute` 代入 · `algebra` 代数化简 · `taylor` 展开近似 · `transform` 积分/坐标变换 · `result` 结论

## 全站符号约定（必须遵守）

| 符号 | 含义 | 符号 | 含义 |
|---|---|---|---|
| `α` | P 波速度 | `β` | S 波速度 |
| `ρ` | 密度 | `λ, μ` | Lamé 常数（μ 也是剪切模量） |
| `K` | 体积模量 | `ν` | 泊松比 |
| `E` | 杨氏模量 | `p` | 射线参数（水平慢度） |
| `u` | 慢度 `1/c` | `t` | 走时 |
| `M₀` | 地震矩 | `M_w` | 矩震级 |
| `Q` | 品质因子 | `t*` | 累积衰减算子 |
| `ω` | 角频率 | `k` | 波数 |
| `f_c` | 拐角频率 | `Δσ` | 应力降 |
| `Z` | 波阻抗 `ρc` | `θ` | 入射角 |
| `σ_ij` | 应力张量 | `ε_ij` | 应变张量 |
| `M_ij` | 矩张量 | `λ_w` 写作 `\lambda` 波长时需在符号表里说明 |

**冲突处理**：`λ` 优先表示 Lamé 常数；波长用 `\lambda` 时须在符号表注明「此处为波长」。
`ρ` 只表示密度，慢度一律用 `u` 或 `p`。

## 可视化（viz）写法

```ts
viz: [
  {
    id: 'my-plot',                    // 卡片内唯一
    level: 'V1',                      // V0 静态 | V1 参数曲线 | V2 场 | V3 动画 | V4 三维 | V5 重内核
    title: t('图标题', 'Title'),
    xlabel: t('x 轴', 'x'),
    ylabel: t('y 轴', 'y'),
    xScale: 'linear',                 // 可选 'log'
    controls: [
      { id: 'v', label: t('速度', 'velocity'), min: 1000, max: 6000, step: 50, value: 3000, unit: 'm/s' },
    ],
    xRange: [0, 10],                  // 可选，只用于固定 x 显示范围
    note: t('这张图想让人看出什么', '...'),
    compute: (p) => {
      const v = p['v']
      const pts: Array<[number, number]> = []
      for (let i = 0; i <= 300; i++) {
        const x = (i / 300) * 10
        pts.push([x, x / v])          // 必须是有限数
      }
      return [{ label: t('走时', 'travel time'), color: '#185FA5', points: pts }]
    },
  },
],
```

可用色板：`#185FA5` 蓝 · `#0F6E56` 绿 · `#BA7517` 橙 · `#993C1D` 棕 · `#7F77DD` 紫 · `#B4B2A9` 灰。
`controls` 里的 `id` 在同一张图内唯一；不同图之间用不同前缀避免混淆（如 `v1`、`v2`）。

## 完成度分配建议

- **L1**：只有 statement + symbols + meaning（用于纯定义型、查表型公式）
- **L2**：L1 + 3–6 步 derivation（绝大多数公式做到这一级）
- **L3**：L2 + 至少一张交互图（核心公式、教学价值高的）
- **L4**：L3 + 数值算例 example（最能体现"怎么用"的）

## 已知 id 白名单（可安全引用）

下面只是一份「起步时可放心引用」的清单。**全站已有 300+ 条，实际可选引用的 id 远多于此** ——
引用前请直接 `ls src/content/cards/` 或查 `src/content/index.ts`，以实际文件名为准。
`npm run check` 会自动校验：引用了不存在的 id 会直接报错。

**S0 数学基础**
`harmonic-plane-wave` `fourier-transform-pair` `fourier-shift-theorem` `convolution-theorem`
`parseval-theorem` `discrete-fourier-transform` `hilbert-transform` `analytic-signal-envelope`
`nyquist-sampling` `aliasing-frequency-folding` `window-function-leakage` `multitaper-spectrum`
`short-time-fourier` `wavelet-transform-morlet` `predictive-deconvolution` `wiener-filter`
`matched-filter-detection` `cross-correlation-time-delay` `noise-cross-correlation-stacking`
`gradient` `divergence-theorem` `stokes-theorem` `index-notation-kronecker` `euler-formula`
`complex-phasor-representation` `residue-theorem` `laplace-transform` `hankel-transform`
`legendre-polynomials` `spherical-harmonics` `bessel-cylindrical-wave` `dirac-delta-sifting`
`green-function-definition` `helmholtz-green-function` `forced-oscillator-green-function`
`gaussian-distribution` `chi-square-goodness` `maximum-likelihood-estimation`
`error-propagation` `covariance-correlation` `poisson-earthquake-occurrence`

**S1 弹性力学**
`strain-tensor` `infinitesimal-strain-tensor` `displacement-gradient-tensor` `rotation-tensor`
`volumetric-strain` `engineering-shear-strain` `principal-strain-invariants` `strain-compatibility`
`stress-tensor-symmetry` `traction-cauchy-stress` `deviatoric-stress` `principal-stress-eigenvalues`
`stress-invariants` `mohr-circle-max-shear` `lithostatic-pressure` `strain-energy-density`
`hookes-law-isotropic` `generalized-hooke-law` `isotropic-hooke-law` `voigt-notation-stiffness-matrix`
`anisotropic-stiffness-symmetries` `vti-elastic-constants` `thomsen-parameters` `christoffel-equation`
`bulk-modulus-lame` `elastic-moduli-conversions` `poissons-ratio-lame` `youngs-modulus-lame`
`poisson-from-velocities` `velocity-ratio-poisson` `navier-equation` `navier-equation-expanded`
`helmholtz-decomposition` `ps-potential-decoupling` `p-wave-velocity-formula`
`s-wave-velocity-formula` `acoustic-wave-equation` `reduced-wave-equation` `dalembert-solution`
`spherical-wave-solution` `complex-modulus` `zener-standard-linear-solid` `debye-peak-relaxation`
`kramers-kronig-dispersion` `complex-velocity-attenuation` `q-from-complex-modulus`

**S2 体波与射线**
`seismic-phase-nomenclature` `snell-law-converted-waves` `snell-law-spherical-interface`
`critical-angle-total-reflection` `head-wave-critical-angle` `ray-parameter-conservation`
`ray-parameter-slope` `direct-wave-travel-time` `hypocentral-distance-geometry`
`sp-time-difference-distance` `dipping-reflector-travel-time` `reflection-hyperbola`
`refracted-wave-intercept-time` `hyperbolic-moveout-offset` `nonhyperbolic-moveout`
`average-velocity-conversion` `rms-velocity-definition` `spherical-earth-travel-time`
`angular-distance-great-circle` `ellipticity-correction` `earth-flattening-transformation`
`turning-point-depth` `core-shadow-zone` `eikonal-equation` `kinematic-ray-equations`
`dynamic-ray-tracing` `triplication-caustic` `shooting-method-ray-tracing`
`bending-method-ray-tracing` `taup-transform` `wiechert-herglotz-inversion`
`slant-stack-discrete` `tau-sum-moveout-relations` `tau-p-wavefield-separation`
`radon-transform-linear`

**S3 反射与成像**
`acoustic-impedance` `acoustic-reflection-coefficient` `transmission-coefficient`
`p-and-s-impedance` `reflection-transmission-energy` `transmission-loss` `free-surface-amplification`
`zoeppritz-boundary-conditions` `postcritical-reflection` `aki-richards-approximation`
`shuey-approximation` `fatti-approximation` `avo-intercept-gradient` `avo-classification`
`lambda-mu-rho-reflectivity` `elastic-impedance` `fluid-factor-avo` `nmo-correction`
`nmo-stretch-muting` `dip-moveout-correction` `cmp-gather-fold` `semblance-velocity-spectrum`
`stacking-response` `velocity-analysis` `dix-formula` `migration-impulse-response`
`kirchhoff-migration` `finite-difference-migration` `phase-shift-migration`
`reverse-time-migration` `exploding-reflector-model` `ricker-wavelet` `fresnel-zone-radius`
`wavelet-bandwidth-resolution` `vertical-resolution` `thin-bed-tuning` `tuning-wedge-model`
`periodic-multiple` `interbed-multiple` `srme-surface-multiple-prediction`
`radon-multiple-attenuation` `synthetic-seismogram` `recursive-impedance-inversion`
`reflectivity-log-conversion`

**S4 震源物理**
`moment-tensor-definition` `dc-iso-clvd-decomposition` `centroid-moment-tensor`
`moment-tensor-inversion-linear` `moment-tensor-source-type-plot` `focal-mechanism-first-motion`
`double-couple-radiation-pattern` `seismic-moment` `mw-moment-magnitude` `body-wave-magnitude`
`surface-wave-magnitude` `local-magnitude` `magnitude-saturation` `energy-magnitude-relation`
`mb-ms-discrimination` `radiated-seismic-energy` `apparent-stress` `static-stress-drop`
`fracture-energy` `radiation-efficiency` `earthquake-scaling-laws` `corner-frequency-source-dimension`
`brune-source-spectrum` `omega-square-model` `source-spectral-scaling` `far-field-body-wave-pulse`
`moment-rate-function` `source-rise-time` `haskell-source-model` `rupture-directivity`
`okada-dislocation` `slip-distribution-inversion` `coulomb-stress-change`

**S5 面波与自由振荡**
`love-wave-dispersion` `love-wave-higher-modes` `rayleigh-wave-equation`
`rayleigh-velocity-approximation` `rayleigh-elliptical-polarization` `rayleigh-hv-ellipticity`
`phase-velocity` `group-velocity` `phase-group-velocity` `surface-wave-sensitivity-kernel`
`surface-wave-azimuthal-anisotropy` `radial-anisotropy-xi` `vti-sh-azimuthal-velocity`
`dispersion-curve-inversion` `free-oscillation-modes` `spheroidal-toroidal-modes`
`normal-mode-summation` `mode-multiplet-splitting`

**S6 衰减与 Q**
`quality-factor-q` `attenuation-coefficient-q` `tstar-operator` `power-law-q`
`absorption-band-q` `pulse-broadening-q` `spectral-ratio-q` `coda-q-method`
`coda-q-lapse-time` `lg-wave-q` `thomsen-qp-qsv-velocity`

**S7 内部结构**
`prem-velocity-model` `iasp91-model` `velocity-model-parameterization` `hydrostatic-equilibrium`
`adams-williamson` `mantle-discontinuities` `mohorovicic-discontinuity`
`d-double-prime-post-perovskite` `receiver-function-deconvolution` `receiver-function-h-kappa`
`ccp-stacking` `shear-wave-splitting` `splitting-parameters-measurement`

**S8 观测与仪器**
`seismometer-equation` `seismometer-frequency-response` `damping-ratio` `pole-zero-response`
`instrument-deconvolution` `counts-to-ground-motion` `array-beamforming`
`array-response-beampattern` `fk-analysis` `peterson-noise-model` `site-amplification-hv`
`vs30-site-term`

**S9 信号处理**
`sampling-spectral-periodicity` `convolution-integral` `cross-correlation` `fourier-transform`
（其余见 S0 段中列出的信号处理方法）

**S10 反演**
`least-squares-normal-equations` `damped-least-squares` `l-curve-criterion` `resolution-matrix`
`model-covariance-matrix` `travel-time-tomography` `ray-path-perturbation-frechet`
`checkerboard-resolution-test` `bayesian-inversion` `likelihood-misfit-function`
`metropolis-hastings-mcmc` `fwi-adjoint-gradient` `fwi-misfit-l2`

**S11 强地面运动**
`ground-motion-parameters` `response-spectrum-oscillator` `arias-intensity`
`gmpe-functional-form` `high-frequency-kappa` `quarter-wavelength-amplification`
`soil-nonlinear-degradation` `seismic-intensity` `intensity-pga-conversion`
`psha-integral` `hazard-curve-uhs`

**S12 统计地震学**
`gutenberg-richter-law` `seismic-moment-rate` `aki-b-value` `magnitude-completeness-mc`
`omori-law` `modified-omori-law` `bath-law` `brownian-passage-time` `etas-model`
`etas-likelihood`

**S13 岩石物理**
`wyllie-time-average` `raymer-hunt-gardner` `critical-porosity-model` `gassmann-equation`
`gassmann-fluid-substitution` `biot-poroelasticity` `biot-coefficient` `gardner-relation`
`castagna-mudrock-line`
