import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** phase-group-velocity */
const phaseGroupVelocity: FormulaCard = {
  id: 'phase-group-velocity',
  name: t('相速度与群速度', 'Phase & Group Velocity'),
  aliases: { zh: ['群速度', '相速度'], en: ['group velocity', 'phase velocity', 'dispersion relation'] },
  node: 'S5.3',
  tags: {
    math: ['MATH.DIFF', 'MATH.FOURIER'],
    method: ['METH.SURF'],
    quantity: ['Q.VEL', 'Q.FREQ'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`U=\frac{\mathrm{d}\omega}{\mathrm{d}k}=c+k\frac{\mathrm{d}c}{\mathrm{d}k}=c-\lambda\frac{\mathrm{d}c}{\mathrm{d}\lambda}`,
    variants: [
      { name: t('用周期表示', 'In terms of period'), latex: String.raw`U=\frac{c^{2}}{c+T\,\mathrm{d}c/\mathrm{d}T}` },
      { name: t('正频散时群速度小于相速度', 'Normal dispersion: group velocity is below phase velocity'), latex: String.raw`\frac{\mathrm{d}c}{\mathrm{d}T}>0\ \Longrightarrow\ U<c` },
    ],
  },
  meaning: t(
    '在频散介质里，「波峰移动的速度」和「能量传播的速度」不是同一个东西。相速度 c = ω/k 是等相位面的移动；群速度 U = dω/dk 是波包（也就是能量）的移动。面波频散测量测到的到时对应群速度，而大多数正演公式给出的是相速度 —— 两者搞混会导致反演出的速度结构系统性偏错。',
    'In a dispersive medium the speed of a wave crest and the speed of energy transport are not the same thing. Phase velocity c = ω/k is the motion of a constant-phase surface; group velocity U = dω/dk is the motion of the wave packet, i.e. of energy. Dispersion measurements pick arrival times, which correspond to group velocity, whereas most forward formulas give phase velocity. Confusing the two biases the inverted velocity structure systematically.',
  ),
  symbols: [
    { sym: 'U', name: t('群速度', 'group velocity'), unit: 'm/s' },
    { sym: 'c', name: t('相速度 ω/k', 'phase velocity ω/k'), unit: 'm/s' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
    { sym: 'k', name: t('波数 2π/λ', 'wavenumber 2π/λ'), unit: 'rad/m' },
    { sym: 'T', name: t('周期', 'period'), unit: 's' },
  ],
  conditions: {
    applies: [t('任意频散介质中的波包传播', 'Wave-packet propagation in any dispersive medium')],
    assumes: [t('波包频带足够窄，可用一阶展开', 'The wave packet is narrow-band enough for a first-order expansion')],
    breaks: [t('强频散或波包在传播中变形严重时，群速度不再有单一定义', 'Under strong dispersion or severe packet distortion the group velocity is no longer uniquely defined')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('两个频率相近的波叠加', 'Superpose two waves of similar frequency'),
      latex: String.raw`u=A\cos\!\left((k+\Delta k)x-(\omega+\Delta\omega)t\right)+A\cos\!\left((k-\Delta k)x-(\omega-\Delta\omega)t\right)` },
    { n: 2, op: 'identity', title: t('和差化积', 'Use the sum-to-product identity'),
      latex: String.raw`u=2A\cos\!\left(\Delta k\,x-\Delta\omega\,t\right)\cos\!\left(kx-\omega t\right)`,
      note: t('第一个因子是包络，第二个是载波。', 'The first factor is the envelope, the second the carrier.') },
    { n: 3, op: 'geometry', title: t('包络的移动速度', 'Speed of the envelope'),
      latex: String.raw`\Delta k\,x-\Delta\omega\,t=\text{const}\;\Longrightarrow\; \frac{\mathrm{d}x}{\mathrm{d}t}=\frac{\Delta\omega}{\Delta k}` },
    { n: 4, op: 'taylor', title: t('取极限', 'Take the limit'),
      latex: String.raw`U=\lim_{\Delta k\to0}\frac{\Delta\omega}{\Delta k}=\frac{\mathrm{d}\omega}{\mathrm{d}k}` },
    { n: 5, op: 'algebra', title: t('用 c 表示', 'Express through c'),
      latex: String.raw`\omega=kc\;\Longrightarrow\; U=\frac{\mathrm{d}(kc)}{\mathrm{d}k}=c+k\frac{\mathrm{d}c}{\mathrm{d}k}` },
    { n: 6, op: 'result', title: t('换成波长或周期', 'Convert to wavelength or period'),
      latex: String.raw`k=\frac{2\pi}{\lambda}\;\Longrightarrow\; U=c-\lambda\frac{\mathrm{d}c}{\mathrm{d}\lambda}` },
  ],
  viz: [
    {
      id: 'group-vs-phase',
      level: 'V1',
      title: t('频散介质中相速度与群速度的差异', 'Phase versus group velocity in a dispersive medium'),
      xlabel: t('周期 T (s)', 'period T (s)'),
      ylabel: t('速度 (m/s)', 'velocity (m/s)'),
      controls: [
        { id: 'c0', label: t('长周期极限速度 c₀', 'long-period limit c₀'), min: 2000, max: 4500, step: 50, value: 3500, unit: 'm/s' },
        { id: 'dc', label: t('随周期的变化率 dc/dT', 'rate dc/dT'), min: -40, max: 40, step: 1, value: 12, unit: 'm/s per s' },
      ],
      compute: (p) => {
        const c0 = p['c0'], dc = p['dc']
        const cPts: Array<[number, number]> = []
        const uPts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const T = 1 + (i / 200) * 49
          const c = c0 + dc * (T - 1)
          cPts.push([T, c])
          uPts.push([T, c * c / (c + T * dc)])
        }
        return [
          { label: t('相速度 c(T)', 'phase velocity c(T)'), color: '#185FA5', points: cPts },
          { label: t('群速度 U(T)', 'group velocity U(T)'), color: '#0F6E56', points: uPts },
        ]
      },
      note: t('当 c 随周期增大（正频散）时 U < c；反频散（dc/dT < 0）时 U > c，群速度曲线在相速度上方。', 'When c grows with period (normal dispersion) U < c; under inverse dispersion (dc/dT < 0) U > c and the group-velocity curve sits above the phase velocity.'),
    },
  ],
  links: {
    upstream: [{ id: 'phase-velocity', note: t('c = ω/k 的定义', 'The definition c = ω/k') }],
    seealso: [{ id: 'group-velocity', note: t('群速度的基本定义', 'Basic definition of group velocity') }],
  },
  refs: [{ text: 'Shearer, Introduction to Seismology, 2nd ed., §11.1' }],
}

export default phaseGroupVelocity
