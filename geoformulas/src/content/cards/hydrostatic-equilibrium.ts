import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** hydrostatic-equilibrium */
const hydrostaticEquilibrium: FormulaCard = {
  id: 'hydrostatic-equilibrium',
  name: t('静水压平衡与压力剖面', 'Hydrostatic Equilibrium & the Pressure Profile'),
  aliases: { zh: ['静水压平衡', '压力剖面', '重力剖面'], en: ['hydrostatic equilibrium', 'pressure profile', 'gravity profile'] },
  node: 'S7.2',
  tags: {
    math: ['MATH.DIFF', 'MATH.GEOM'],
    method: ['METH.STRUCT'],
    quantity: ['Q.MAT', 'Q.GEOM'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\frac{dP}{dr} = -\rho(r)\,g(r),\qquad g(r) = \frac{G\,m(r)}{r^{2}},\qquad m(r) = 4\pi\!\int_{0}^{r}\!\rho(r')r'^{2}dr'`,
    variants: [
      { name: t('均匀密度球的解析解', 'Analytic solution for a uniform-density sphere'), latex: String.raw`g(r) = \frac{4\pi G\rho}{3}r,\qquad P(r) = \frac{2\pi G\rho^{2}}{3}(R^{2}-r^{2})` },
      { name: t('中心压力', 'Central pressure'), latex: String.raw`P(0) = \frac{2\pi G\rho^{2}R^{2}}{3}` },
      { name: t('与 Adams–Williamson 的衔接', 'Link to Adams–Williamson'), latex: String.raw`\frac{d\rho}{dr} = -\frac{\rho\,g}{\phi},\qquad \phi = v_P^{2} - \frac{4}{3}v_S^{2}` },
    ],
  },
  meaning: t(
    '地球内部的压力几乎完全由「上面压着多少岩石」决定 —— 这就是静水压平衡。它把密度剖面直接变成压力剖面，进而决定矿物相变的深度与熔点。整个地球内部的物理状态（是固是液、是什么矿物）都挂在这条压力曲线上。',
    'The pressure inside the Earth is set almost entirely by how much rock is stacked above — that is hydrostatic equilibrium. It turns a density profile directly into a pressure profile, which in turn fixes the depths of phase transitions and the melting curve. The physical state of the whole interior (solid or liquid, which mineral) hangs on this pressure curve.',
  ),
  symbols: [
    { sym: 'P', name: t('压力', 'pressure'), unit: 'Pa', typical: '0 – 360 GPa' },
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
    { sym: 'g', name: t('重力加速度', 'gravitational acceleration'), unit: 'm/s²', typical: '0 – 10.7' },
    { sym: 'm(r)', name: t('半径 r 内的质量', 'mass inside radius r'), unit: 'kg' },
    { sym: 'G', name: t('万有引力常数', 'gravitational constant'), unit: 'm³/(kg·s²)', typical: '6.674×10⁻¹¹' },
  ],
  conditions: {
    applies: [t('由密度模型推算压力与重力剖面', 'Deriving pressure and gravity profiles from a density model')],
    assumes: [
      t('球对称、静止、无对流应力', 'Spherical symmetry, static, no convective stress'),
      t('密度模型已知（如 PREM）', 'The density model is known (e.g. PREM)'),
    ],
    breaks: [
      t('地幔对流产生的动态应力虽小但不可忽略（约 1–10 MPa）', 'Dynamic stresses from mantle convection are small but not negligible (about 1–10 MPa)'),
      t('地球扁率使 g 随纬度变化约 0.5%', 'Earth’s flattening makes g vary with latitude by about 0.5%'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('球壳的受力平衡', 'Force balance on a spherical shell'),
      latex: String.raw`P(r+dr)\,4\pi(r+dr)^{2} - P(r)\,4\pi r^{2} = -\rho\,g\,4\pi r^{2}dr` },
    { n: 2, op: 'algebra', title: t('取一阶得微分方程', 'Take first order to get the differential equation'),
      latex: String.raw`\frac{dP}{dr} = -\rho g` },
    { n: 3, op: 'physics', title: t('高斯定理给出 g', 'Gauss’s law gives g'),
      latex: String.raw`g(r) = \frac{Gm(r)}{r^{2}},\qquad m(r) = 4\pi\int_0^r\rho r'^{2}dr'` },
    { n: 4, op: 'substitute', title: t('均匀密度时代入求解', 'Solve for uniform density'),
      latex: String.raw`g = \frac{4\pi G\rho}{3}r \Longrightarrow P(r) = \int_r^R \rho g\,dr' = \frac{2\pi G\rho^{2}}{3}(R^{2}-r^{2})` },
    { n: 5, op: 'result', title: t('中心压力', 'Central pressure'),
      latex: String.raw`P(0) = \frac{2\pi G\rho^{2}R^{2}}{3}` },
  ],
  viz: [
    {
      id: 'pressure-gravity',
      level: 'V2',
      title: t('均匀密度球的压力与重力剖面', 'Pressure and gravity profiles of a uniform-density sphere'),
      xlabel: t('归一化半径 r/R', 'normalised radius r/R'),
      ylabel: t('P (GPa) / g (m/s²)', 'P (GPa) / g (m/s²)'),
      controls: [
        { id: 'rho', label: t('平均密度 ρ (kg/m³)', 'mean density ρ (kg/m³)'), min: 3000, max: 7000, step: 50, value: 5515 },
      ],
      note: t('均匀模型给出的中心压力约 173 GPa，真实地球（PREM）约 360 GPa —— 差别来自真实地球向中心显著压缩。', 'The uniform model gives about 173 GPa at the centre versus about 360 GPa for the real Earth (PREM) — the difference comes from strong central compression.'),
      compute: (p) => {
        const rho = p['rho']
        const G = 6.674e-11
        const R = 6.371e6
        const P: Array<[number, number]> = []
        const g: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const r = (i / 200) * R
          const xr = i / 200
          const gg = (4 * Math.PI * G * rho * r) / 3
          const pp = ((2 * Math.PI * G * rho * rho) / 3) * (R * R - r * r)
          g.push([xr, gg])
          P.push([xr, pp / 1e9])
        }
        return [
          { label: t('P (GPa)', 'P (GPa)'), color: '#185FA5', points: P },
          { label: t('g (m/s²)', 'g (m/s²)'), color: '#993C1D', points: g, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('地心压力的量级', 'The order of magnitude of central pressure'),
    input: t('ρ = 5515 kg/m³，R = 6371 km', 'ρ = 5515 kg/m³, R = 6371 km'),
    steps: [
      t('P(0) = (2π/3)×6.674×10⁻¹¹×(5515)²×(6.371×10⁶)²', 'P(0) = (2π/3)×6.674×10⁻¹¹×(5515)²×(6.371×10⁶)²'),
      t('= 1.73×10¹¹ Pa = 173 GPa', '= 1.73×10¹¹ Pa = 173 GPa'),
    ],
    output: t('约 170 万大气压；真实地球因中心压缩达到约 360 GPa', 'About 1.7 million atmospheres; the real Earth reaches about 360 GPa thanks to central compression'),
  },
  links: {
    upstream: [{ id: 'adams-williamson', note: t('由速度反推密度', 'Inferring density from velocity') }],
    downstream: [{ id: 'mantle-discontinuities', note: t('压力决定相变深度', 'Pressure sets the phase-transition depth') }],
    seealso: [{ id: 'lithostatic-pressure', note: t('地壳中的简单形式', 'The simple form in the crust') }],
  },
  refs: [{ text: 'Stacey, F. & Davis, P. (2008). Physics of the Earth, 4th ed., ch. 3' }],
}

export default hydrostaticEquilibrium
