import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** critical-porosity-model */
const criticalPorosityModel: FormulaCard = {
  id: 'critical-porosity-model',
  name: t('临界孔隙度模型', 'The Critical Porosity Model'),
  aliases: { zh: ['临界孔隙度', 'Nur 模型', '固结线'], en: ['critical porosity', 'Nur model', 'consolidation line'] },
  node: 'S13.1',
  tags: {
    math: ['MATH.APPROX', 'MATH.ALGEBRA'],
    method: ['METH.ROCK'],
    quantity: ['Q.VEL', 'Q.MAT'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`K = K_m\left(1-\frac{\phi}{\phi_c}\right),\qquad
\mu = \mu_m\left(1-\frac{\phi}{\phi_c}\right),\qquad \phi < \phi_c`,
    variants: [
      { name: t('φ > φ_c 时体系变为悬浮体', 'For φ > φ_c the system becomes a suspension'), latex: String.raw`\frac{1}{K} = \frac{1-\phi}{K_m}+\frac{\phi}{K_f}\quad(\text{Reuss 悬浮平均})` },
      { name: t('改写的速度形式', 'Rewritten in terms of velocity'), latex: String.raw`V_P = V_{Pm}\sqrt{1-\frac{\phi}{\phi_c}},\qquad V_S = V_{Sm}\sqrt{1-\frac{\phi}{\phi_c}}\ \ (\rho\ \text{近似不变})` },
      { name: t('典型临界孔隙度', 'Typical critical porosities'), latex: String.raw`\phi_c \approx 0.36\text{–}0.40\ (\text{砂岩}),\quad 0.65\text{–}0.75\ (\text{白垩})` },
      { name: t('与压实趋势的结合', 'Combination with the compaction trend'), latex: String.raw`\phi(z) = \phi_0 e^{-cz} \Longrightarrow V_P(z) = V_{Pm}\sqrt{1-\frac{\phi_0e^{-cz}}{\phi_c}}` },
    ],
  },
  meaning: t(
    'Nur 的临界孔隙度模型把岩石分成两个截然不同的区间：孔隙度低于临界值 φ_c 时，矿物颗粒仍构成承重的骨架，模量随孔隙度线性下降到零；高于 φ_c 时颗粒已经「浮」在流体里，体系变成悬浮体，模量由 Reuss 平均决定。这条分界线正好对应沉积学上的「固结—未固结」转变，也解释了为什么浅层未固结砂岩的速度—孔隙度关系与深层完全不同。',
    'Nur\'s critical-porosity model divides rock into two sharply different regimes: below the critical porosity φ_c the mineral grains still form a load-bearing frame and the moduli decrease linearly to zero; above φ_c the grains "float" in the fluid, the system becomes a suspension, and the moduli follow the Reuss average. That boundary corresponds exactly to the sedimentological transition from consolidated to unconsolidated, and explains why shallow unconsolidated sands have a completely different velocity–porosity relation from deep formations.',
  ),
  symbols: [
    { sym: '\\phi_c', name: t('临界孔隙度（骨架消失点）', 'critical porosity (frame-vanishing point)'), unit: '无量纲' },
    { sym: 'K, \\mu', name: t('岩石的体积模量与剪切模量', 'bulk and shear moduli of the rock'), unit: 'GPa' },
    { sym: 'K_m, \\mu_m', name: t('矿物基质的模量', 'mineral matrix moduli'), unit: 'GPa' },
    { sym: '\\rho', name: t('岩石密度', 'rock density'), unit: 'kg/m³' },
  ],
  conditions: {
    applies: [t('岩石物理模板、未固结砂岩速度建模、压实趋势外推', 'Rock-physics templates, velocity modelling of unconsolidated sands, extrapolating compaction trends')],
    assumes: [t('粒间孔隙、无胶结或胶结很弱', 'Intergranular porosity, no or weak cementation')],
    breaks: [t('强胶结岩石不适用（胶结物在极低孔隙度下就承重）', 'Does not apply to strongly cemented rocks (cement bears load at very low porosity)'), t('裂缝或溶洞孔隙无临界孔隙度概念', 'Fracture or vuggy porosity has no critical-porosity concept')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('设骨架模量随孔隙度线性下降，在 φ_c 处归零', 'Assume the frame moduli decrease linearly and vanish at φ_c'), latex: String.raw`K(\phi_c) = 0,\quad K(0) = K_m` },
    { n: 2, op: 'algebra', title: t('线性插值', 'Linear interpolation'), latex: String.raw`K = K_m\frac{\phi_c-\phi}{\phi_c} = K_m\left(1-\frac{\phi}{\phi_c}\right)` },
    { n: 3, op: 'identity', title: t('剪切模量同理（骨架无剪切抵抗）', 'Same for the shear modulus (the frame has no shear resistance)'), latex: String.raw`\mu = \mu_m\left(1-\frac{\phi}{\phi_c}\right)` },
    { n: 4, op: 'substitute', title: t('V = √((K + 4μ/3)/ρ)，若 ρ 变化可忽略则速度按 √(1−φ/φ_c) 缩放', 'V = √((K + 4μ/3)/ρ); if the change in ρ is negligible, velocity scales as √(1−φ/φ_c)'), latex: String.raw`V_P = V_{Pm}\sqrt{1-\frac{\phi}{\phi_c}}` },
    { n: 5, op: 'result', title: t('φ > φ_c 时改由 Reuss 平均控制，速度骤降', 'For φ > φ_c the Reuss average takes over and velocity drops sharply'), latex: String.raw`\frac{1}{K} = \frac{1-\phi}{K_m} + \frac{\phi}{K_f}` },
  ],
  viz: [
    {
      id: 'crit-por',
      level: 'V2',
      title: t('临界孔隙度两侧的速度行为', 'Velocity behaviour on either side of the critical porosity'),
      xlabel: t('孔隙度 φ', 'porosity φ'),
      ylabel: t('V_P (m/s)', 'V_P (m/s)'),
      controls: [
        { id: 'pc', label: t('临界孔隙度 φ_c', 'critical porosity φ_c'), min: 0.2, max: 0.75, step: 0.01, value: 0.4 },
        { id: 'km', label: t('基质模量 K_m (GPa)', 'matrix modulus K_m (GPa)'), min: 20, max: 80, step: 1, value: 37 },
        { id: 'kf', label: t('流体模量 K_f (GPa)', 'fluid modulus K_f (GPa)'), min: 0.5, max: 3.5, step: 0.05, value: 2.2 },
      ],
      note: t('曲线在 φ = φ_c 处有一个明显的拐点：左侧（固结区）速度随孔隙度缓慢下降，右侧（悬浮区）几乎塌到流体速度。把 φ_c 调小，拐点左移，整个可用孔隙度区间变窄。', 'The curve has a clear kink at φ = φ_c: to the left (consolidated) velocity falls slowly with porosity, to the right (suspension) it collapses almost to the fluid velocity. Lowering φ_c moves the kink left and narrows the whole usable porosity range.'),
      compute: (p) => {
        const pc = p['pc'], km = p['km'], kf = p['kf']
        const mum = km * 0.85
        const rm = 2650, rf = 1000
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const ph = (i / 300) * 0.8
          const rho = rm * (1 - ph) + rf * ph
          let K: number, mu = 0
          if (ph < pc) {
            K = km * (1 - ph / pc)
            mu = mum * (1 - ph / pc)
          } else {
            // 悬浮区：Reuss 平均，剪切模量趋零
            K = 1 / ((1 - ph) / km + ph / kf)
            mu = 0
          }
          const vp = Math.sqrt((K + (4 / 3) * mu) / (rho / 1000)) * 1000
          pts.push([ph, Math.min(vp, 6000)])
        }
        return [{ label: t('V_P(φ)', 'V_P(φ)'), color: '#185FA5', points: pts }]
      },
    },
    {
      id: 'crit-depth',
      level: 'V1',
      title: t('结合压实趋势得到速度随深度变化', 'Combining with the compaction trend gives velocity versus depth'),
      xlabel: t('深度 z (km)', 'depth z (km)'),
      ylabel: t('V_P (m/s)', 'V_P (m/s)'),
      controls: [
        { id: 'phi0', label: t('地表孔隙度 φ₀', 'surface porosity φ₀'), min: 0.3, max: 0.6, step: 0.01, value: 0.45 },
        { id: 'c', label: t('压实系数 c (1/km)', 'compaction coefficient c (1/km)'), min: 0.2, max: 3, step: 0.05, value: 1.2 },
        { id: 'pc', label: t('临界孔隙度 φ_c', 'critical porosity φ_c'), min: 0.2, max: 0.6, step: 0.01, value: 0.4 },
      ],
      note: t('浅层速度低而增长快（孔隙度快速被压实掉），深层趋于平缓。临界孔隙度决定了「快速增长段」在哪里结束 —— 这正是沉积盆地速度剖面的典型形态。', 'Velocity is low and rises quickly at shallow depth (porosity is compacted out fast) then flattens at depth. The critical porosity sets where the "fast growth" segment ends — exactly the typical shape of a sedimentary-basin velocity profile.'),
      compute: (p) => {
        const phi0 = p['phi0'], c = p['c'], pc = p['pc']
        const vm = 5500
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const z = (i / 200) * 5
          const ph = phi0 * Math.exp(-c * z)
          const v = ph < pc ? vm * Math.sqrt(Math.max(0, 1 - ph / pc)) : vm * 0.25
          pts.push([z, Math.min(v, vm)])
        }
        return [{ label: t('V_P(z)', 'V_P(z)'), color: '#993C1D', points: pts }]
      },
    },
  ],
  example: {
    title: t('浅层未固结砂', 'A shallow unconsolidated sand'),
    input: t('φ = 0.38，φ_c = 0.40，V_Pm = 5500 m/s', 'φ = 0.38, φ_c = 0.40, V_Pm = 5500 m/s'),
    steps: [
      t('1 − φ/φ_c = 1 − 0.95 = 0.05', '1 − φ/φ_c = 1 − 0.95 = 0.05'),
      t('V_P = 5500 × √0.05 = 1230 m/s', 'V_P = 5500 × √0.05 = 1230 m/s'),
    ],
    output: t('接近临界孔隙度时速度已跌到 1.2 km/s，仅略高于水速', 'Near the critical porosity velocity has dropped to 1.2 km/s, only slightly above the water velocity'),
  },
  links: {
    upstream: [{ id: 'wyllie-time-average', note: t('临界孔隙度模型是它的物理解释', 'The critical-porosity model is its physical explanation') }],
    downstream: [{ id: 'gassmann-equation', note: t('骨架模量是 Gassmann 的输入', 'The frame moduli are inputs to Gassmann') }],
    seealso: [{ id: 'raymer-hunt-gardner', note: t('经验关系在固结区与其接近', 'The empirical relation approaches it in the consolidated regime') }],
  },
  refs: [{ text: 'Nur et al. (1998), Critical porosity: the key to relating physical properties to porosity in rocks, The Leading Edge 17, 357–362' }],
}

export default criticalPorosityModel
