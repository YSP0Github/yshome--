import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phase-velocity */
const phaseVelocity: FormulaCard = {
  id: 'phase-velocity',
  name: t('相速度', 'Phase Velocity'),
  aliases: { zh: ['c=ω/k', 'c=λf', '相位传播速度'], en: ['phase velocity', 'c = omega over k', 'celerity'] },
  node: 'S0.1',
  tags: {
    math: ['MATH.DIFF', 'MATH.GEOM'],
    method: ['METH.PROC'],
    quantity: ['Q.VEL', 'Q.FREQ'],
    keywords: t('相速度 波速 等相位面 频散 ω-k 平面', 'phase velocity wave speed constant-phase surface dispersion omega-k plane'),
  },
  audience: 'highschool',
  complete: 'L3',
  statement: {
    main: String.raw`c=\frac{\omega}{k}=\lambda f=\frac{\lambda}{T}`,
    variants: [
      { name: t('由等相位面定义', 'Defined through surfaces of constant phase'), latex: String.raw`kx-\omega t=\text{const}\;\Longrightarrow\; \frac{\dd x}{\dd t}=\frac{\omega}{k}=c` },
      { name: t('矢量形式', 'Vector form'), latex: String.raw`c=\frac{\omega}{|\mathbf{k}|},\qquad \mathbf{c}=\frac{\omega}{|\mathbf{k}|^{2}}\,\mathbf{k}` },
      { name: t('用慢度写出', 'In terms of slowness'), latex: String.raw`u=\frac{1}{c}=\frac{k}{\omega}=\frac{p}{\sin\theta}` },
    ],
  },
  meaning: t(
    '相速度是「波形上某一个固定相位点（比如波峰）向前移动的速度」，也就是 λ/T：一个周期走一个波长。它是地震学里最直接可测的量 —— 量出到时差和距离就能算出来。但要注意，相速度并不是能量传播的速度；只有在非频散介质中两者才相等。',
    'Phase velocity is the speed at which one fixed point of phase, a crest for instance, moves forward — equivalently λ/T, one wavelength per period. It is the most directly measurable quantity in seismology: measure an arrival-time difference and a distance and you have it. Beware, though: phase velocity is not the speed at which energy travels. The two coincide only in a non-dispersive medium.',
  ),
  symbols: [
    { sym: 'c', name: t('相速度', 'phase velocity'), unit: 'm/s', typical: '10² – 10⁴ m/s' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
    { sym: 'k', name: t('波数', 'wavenumber'), unit: 'rad/m' },
    { sym: '\\lambda', name: t('波长（此处为波长，非 Lamé 常数）', 'wavelength — here wavelength, not the Lamé constant'), unit: 'm' },
    { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz' },
    { sym: 'T', name: t('周期', 'period'), unit: 's' },
    { sym: 'u', name: t('慢度 1/c', 'slowness, 1/c'), unit: 's/m' },
    { sym: 'p', name: t('射线参数（水平慢度）', 'ray parameter, or horizontal slowness'), unit: 's/m' },
    { sym: '\\theta', name: t('入射角', 'incidence angle'), unit: 'rad' },
  ],
  conditions: {
    applies: [
      t('单色（单一频率）波的等相位面推进', 'The advance of constant-phase surfaces of a monochromatic wave'),
      t('各向同性介质中 c 与方向无关', 'In an isotropic medium c does not depend on direction'),
    ],
    assumes: [
      t('介质均匀，否则 c = c(x) 需改用走时积分', 'The medium is homogeneous, otherwise c = c(x) and one must integrate travel time'),
      t('线性、无耗散（Q → ∞），否则 c 还取决于频率', 'Linear and lossless, that is Q → ∞, otherwise c also depends on frequency'),
    ],
    breaks: [
      t('频散介质中 c = c(ω)，单个相速度无法描述波包的整体运动', 'In a dispersive medium c = c(ω), so a single phase velocity cannot describe the motion of the wave packet as a whole'),
      t('各向异性介质中相速度方向一般不等于能流方向', 'In an anisotropic medium the phase-velocity direction generally differs from the energy-flow direction'),
      t('c 可以超过任何实际能量传播速度，它不携带信息，不违反相对论', 'c may exceed any physical energy speed because it carries no information, so nothing is violated'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'setup',
      title: t('写出谐和波的相位', 'Write down the phase of a harmonic wave'),
      latex: String.raw`\varphi(x,t)=kx-\omega t+\varphi_0`,
      note: t('相速度就是「盯着同一个相位值看，这个点在空间里跑多快」。', 'Phase velocity asks: if I follow one fixed value of the phase, how fast does that point move through space?'),
    },
    {
      n: 2,
      op: 'physics',
      title: t('锁住相位：令 φ 为常数', 'Lock the phase: set φ constant'),
      latex: String.raw`kx-\omega t=\text{const}`,
    },
    {
      n: 3,
      op: 'algebra',
      title: t('对时间求导', 'Differentiate with respect to time'),
      latex: String.raw`k\frac{\dd x}{\dd t}-\omega=0\;\Longrightarrow\;\frac{\dd x}{\dd t}=\frac{\omega}{k}`,
    },
    {
      n: 4,
      op: 'result',
      title: t('得到相速度', 'The phase velocity'),
      latex: String.raw`c\equiv\frac{\dd x}{\dd t}=\frac{\omega}{k}`,
    },
    {
      n: 5,
      op: 'substitute',
      title: t('换成 λ、f、T 的写法', 'Rewrite it with λ, f and T'),
      latex: String.raw`c=\frac{2\pi f}{2\pi/\lambda}=\lambda f=\frac{\lambda}{T}`,
      note: t('这就是最实用的形式：一个周期走一个波长。', 'This is the most practical form: one wavelength per period.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('与群速度的分野', 'Where it parts company with the group velocity'),
      latex: String.raw`v_g=\frac{\dd\omega}{\dd k}=c+k\frac{\dd c}{\dd k}\neq c\quad(\text{当 }c=c(k))`,
      note: t('只要 c 随 k 变化，能量传播速度就不再是相速度；面波频散正是如此。', 'As soon as c varies with k, the energy speed is no longer the phase velocity; that is exactly what happens for dispersive surface waves.'),
    },
  ],
  viz: [
    {
      id: 'wave-motion',
      level: 'V1',
      title: t('盯住一个波峰：它每秒前进 λ f 米', 'Follow one crest: it advances λf metres every second'),
      xlabel: t('位置 x (m)', 'position x (m)'),
      ylabel: t('位移 u (m)', 'displacement u (m)'),
      controls: [
        { id: 'c', label: t('相速度 c', 'phase velocity c'), min: 50, max: 4000, step: 50, value: 500, unit: 'm/s' },
        { id: 'f', label: t('频率 f', 'frequency f'), min: 0.1, max: 10, step: 0.1, value: 1, unit: 'Hz' },
        { id: 't', label: t('观察时刻 t', 'observation time t'), min: 0, max: 5, step: 0.02, value: 0, unit: 's' },
      ],
      xRange: [0, 2000],
      note: t('波长由 λ = c/f 自动决定。把 t 从 0 拖到 1 s，波峰正好前进 c 米；改变 f 只改变波峰的疏密，不改前进速度 —— 这正是非频散介质的特征。',
        'The wavelength follows from λ = c/f. Dragging t from 0 to 1 s moves a crest exactly c metres; changing f only changes how closely spaced the crests are, not how fast they advance — the hallmark of a non-dispersive medium.'),
      compute: (p) => {
        const c = p['c']
        const f = p['f']
        const tt = p['t']
        const lam = c / f
        const k = (2 * Math.PI) / lam
        const w = 2 * Math.PI * f
        const pts: Array<[number, number]> = []
        const xmax = Math.min(2000, Math.max(200, 6 * lam))
        for (let i = 0; i <= 800; i++) {
          const x = (i / 800) * xmax
          pts.push([x, Math.cos(k * x - w * tt)])
        }
        const xCrest = c * tt
        return [
          { label: t('u(x, t)', 'u(x, t)'), color: '#185FA5', points: pts },
          { label: t('波峰轨迹 x = ct', 'crest trajectory x = ct'), color: '#BA7517', dash: true, points: [[xCrest, -1.3], [xCrest, 1.3]] },
        ]
      },
    },
    {
      id: 'omega-k-line',
      level: 'V1',
      title: t('ω–k 平面：相速度就是那条直线的斜率', 'The ω–k plane: phase velocity is the slope of that line'),
      xlabel: t('波数 k (rad/m)', 'wavenumber k (rad/m)'),
      ylabel: t('角频率 ω (rad/s)', 'angular frequency ω (rad/s)'),
      controls: [
        { id: 'c2', label: t('相速度 c', 'phase velocity c'), min: 100, max: 4000, step: 50, value: 2000, unit: 'm/s' },
        { id: 'k0', label: t('工作点波数 k₀', 'operating wavenumber k₀'), min: 0.001, max: 0.05, step: 0.001, value: 0.01, unit: 'rad/m' },
      ],
      xRange: [0, 0.05],
      note: t('非频散时 ω = ck 是一条过原点的直线，斜率即 c；直线上任意一点（割线斜率）与原点的连线斜率都相同，所以相速度 = 群速度。频散时这条线会弯，两者就分开了。',
        'Without dispersion ω = ck is a straight line through the origin whose slope is c. Every point on it has the same secant slope from the origin, so phase and group velocity coincide. With dispersion the line bends and the two separate.'),
      compute: (p) => {
        const c = p['c2']
        const k0 = p['k0']
        const line: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const k = (i / 200) * 0.05
          line.push([k, c * k])
        }
        return [
          { label: t('ω = ck', 'ω = ck'), color: '#185FA5', points: line },
          { label: t('工作点 (k₀, ω₀)', 'operating point (k₀, ω₀)'), color: '#993C1D', points: [[k0, c * k0]] },
        ]
      },
    },
  ],
  example: {
    title: t('从两张地震图量相速度', 'Measuring phase velocity from two seismograms'),
    input: t('两台站相距 Δx = 50 km，同一波峰到时差 Δt = 10 s', 'Two stations Δx = 50 km apart, the same crest arriving Δt = 10 s apart'),
    steps: [
      t('c = Δx/Δt = 50000/10 = 5000 m/s', 'c = Δx/Δt = 50000/10 = 5000 m/s'),
      t('若该震相主频 f = 0.2 Hz，则 λ = c/f = 25000 m', 'If its dominant frequency is f = 0.2 Hz, then λ = c/f = 25000 m'),
    ],
    output: t('5 km/s 是典型的地壳 P 波速度；25 km 的波长说明它无法分辨几公里尺度的构造', '5 km/s is a typical crustal P velocity; the 25 km wavelength says it cannot resolve structures a few kilometres across'),
  },
  links: {
    upstream: [
      { id: 'angular-frequency', note: t('提供 ω', 'supplies ω') },
      { id: 'wavenumber-wavelength', note: t('提供 k', 'supplies k') },
    ],
    downstream: [
      { id: 'group-velocity', note: t('频散时才与 c 分离', 'separates from c only when dispersive') },
      { id: 'acoustic-impedance', note: t('c 与 ρ 共同决定 Z', 'c together with ρ determines Z') },
    ],
    seealso: [{ id: 'harmonic-plane-wave' }],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §3.1' },
  ],
}

export default phaseVelocity
