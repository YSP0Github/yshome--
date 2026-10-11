import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-charged-particle-cyclotron */
const uemChargedParticleCyclotron: FormulaCard = {
  id: 'uem-charged-particle-cyclotron',
  name: t('带电粒子在磁场中的圆周运动', 'Circular Motion of a Charged Particle in B'),
  aliases: { zh: ['回旋半径 r=mv/qB', '回旋频率'], en: ['cyclotron radius', 'gyroradius and frequency'] },
  node: 'S19.3',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.MAG'],
    keywords: t('回旋半径 mv/qB 回旋频率 质谱仪 带电粒子圆周运动', 'cyclotron radius mv over qB gyrofrequency mass spectrometer circular motion'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`r=\frac{mv}{qB},\qquad f=\frac{qB}{2\pi m}`,
    variants: [
      { name: t('角频率', 'Angular frequency'), latex: String.raw`\omega=\dfrac{qB}{m}` },
      { name: t('平行分量：螺旋线', 'Parallel component: helix'), latex: String.raw`\mathbf{v}=v_{\perp}\hat{\perp}+v_{\parallel}\hat{\parallel}` },
    ],
  },
  meaning: t(
    '垂直射入均匀磁场的带电粒子，受恒定向心力 qvB 做匀速圆周运动，半径 r=mv/qB、频率 f=qB/2πm。回旋频率与速度无关，这是回旋加速器共振加速的关键；有平行速度分量时则走螺旋线。',
    'A charge entering a uniform field perpendicularly feels a constant centripetal force qvB and moves in a circle with radius r=mv/qB and frequency f=qB/2πm. The cyclotron frequency is independent of speed—the key to resonant acceleration in cyclotrons; a parallel velocity component makes it spiral.',
  ),
  symbols: [
    { sym: 'r', name: t('回旋半径', 'gyroradius'), unit: 'm' },
    { sym: 'm', name: t('粒子质量', 'mass'), unit: 'kg' },
    { sym: 'v', name: t('速率（垂直分量）', 'speed (perpendicular)'), unit: 'm/s' },
    { sym: 'q', name: t('电荷', 'charge'), unit: 'C' },
    { sym: 'B', name: t('磁感应强度', 'magnetic field'), unit: 'T' },
    { sym: 'f', name: t('回旋频率', 'cyclotron frequency'), unit: 'Hz' },
  ],
  conditions: {
    applies: [t('均匀磁场、v⊥B（或分解为平行/垂直）', 'Uniform field, v⊥B (or decomposed into parallel/perpendicular)')],
    assumes: [t('非相对论 v≪c', 'Non-relativistic v≪c')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('磁力=向心力', 'Magnetic force = centripetal'),
      latex: String.raw`qvB=\dfrac{mv^{2}}{r}` },
    { n: 2, op: 'algebra', title: t('解半径', 'Solve for radius'),
      latex: String.raw`r=\dfrac{mv}{qB}` },
    { n: 3, op: 'algebra', title: t('频率 v=2πrf', 'Frequency v=2πrf'),
      latex: String.raw`f=\dfrac{v}{2\pi r}=\dfrac{qB}{2\pi m}` },
  ],
  viz: [
    {
      id: 'radius-vs-v',
      level: 'V1',
      title: t('回旋半径随速度与磁场', 'Gyroradius vs speed and field'),
      xlabel: t('速率 v (10⁶ m/s)', 'speed v (10⁶ m/s)'),
      ylabel: t('回旋半径 r (cm)', 'gyroradius r (cm)'),
      xRange: [0, 5],
      controls: [
        { id: 'bfield', label: t('磁场 B (T)', 'field B'), min: 0.1, max: 5, step: 0.1, value: 1, unit: 'T' },
      ],
      compute: (p) => {
        const B = p['bfield']
        // electron: m=9.11e-31 kg, |q|=1.602e-19 C
        const m = 9.11e-31
        const q = 1.602e-19
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const vM = (i / 200) * 5 // v in 1e6 m/s
          const v = vM * 1e6
          const r = m * v / (q * B)
          pts.push([vM, r * 100])
        }
        return [{ label: t('电子 r=mv/eB', 'electron r=mv/eB'), color: '#993C1D', points: pts }]
      },
      note: t('r 随 v 线性增大、随 B 增大而缩小；增强磁场可把粒子"箍"在更小的轨道上。', 'r grows linearly with v and shrinks with B; a stronger field confines particles to smaller orbits.'),
    },
  ],
  links: {
    upstream: [{ id: 'uem-lorentz-force' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §28' }],
}

export default uemChargedParticleCyclotron
