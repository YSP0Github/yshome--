import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mag-dipole-field-axial */
const magDipoleFieldAxial: FormulaCard = {
  id: 'mag-dipole-field-axial',
  name: t('偶极轴上与赤道侧的磁场', 'Dipole Field on Axis and in the Equatorial Plane'),
  aliases: { zh: ['轴向场', '赤道场'], en: ['axial dipole field', 'equatorial dipole field'] },
  node: 'S15.1',
  tags: {
    math: ['MATH.GEOM', 'MATH.VECTOR'],
    method: ['METH.MAG'],
    quantity: ['Q.MAG'],
    keywords: t('偶极 轴上 赤道 2m 4m', 'dipole on axis equatorial plane field'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`B_{\text{轴}}=\frac{\mu_0}{2\pi}\frac{m}{r^{3}},\qquad B_{\text{侧}}=\frac{\mu_0}{4\pi}\frac{m}{r^{3}}`,
  },
  meaning: t(
    '沿偶极轴方向（θ=0）的场强是赤道方向（θ=90°）的两倍：B_轴 = μ₀m/2πr³，B_侧 = μ₀m/4πr³。这个"轴两倍于赤道"的关系是偶极场最容易记的特征，也是判断某地磁场是否近似偶极的简便依据。',
    'The field along the dipole axis (θ=0) is twice that in the equatorial plane (θ=90°): B_axis = μ₀m/2πr³ and B_eq = μ₀m/4πr³. This "axis-doubles-equator" signature is the easiest thing to remember about a dipole field and a quick test of whether a measured field is approximately dipolar.',
  ),
  symbols: [
    { sym: 'B_{\\text{轴}}', name: t('轴上磁场', 'axial field'), unit: 'T' },
    { sym: 'B_{\\text{侧}}', name: t('赤道侧磁场', 'equatorial field'), unit: 'T' },
    { sym: 'm', name: t('磁偶极矩', 'dipole moment'), unit: 'A·m²' },
    { sym: 'r', name: t('到场点距离', 'distance to field point'), unit: 'm' },
  ],
  conditions: {
    applies: [t('偶极远场的两个特殊方向', 'Two special directions of the dipole far field')],
    assumes: [t('远场 r≫偶极尺度', 'Far field r≫ dipole size')],
    breaks: [t('近场高阶项修正', 'Higher multipoles near the dipole')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('取一般偶极场公式', 'Take the general dipole field'),
      latex: String.raw`B_r=-\frac{\mu_0}{4\pi}\frac{2m\cos\theta}{r^{3}},\ B_\theta=-\frac{\mu_0}{4\pi}\frac{m\sin\theta}{r^{3}}` },
    { n: 2, op: 'geometry', title: t('轴上 θ=0：cos0=1，sin0=0', 'On axis θ=0'),
      latex: String.raw`B_{\text{轴}}=|B_r|=\frac{\mu_0}{4\pi}\frac{2m}{r^{3}}=\frac{\mu_0 m}{2\pi r^{3}}` },
    { n: 3, op: 'geometry', title: t('赤道 θ=90°：B_θ 为主', 'Equator θ=90°'),
      latex: String.raw`B_{\text{侧}}=|B_\theta|=\frac{\mu_0}{4\pi}\frac{m}{r^{3}}` },
    { n: 4, op: 'result', title: t('轴 = 2 × 侧', 'Axis = 2 × equator'),
      latex: String.raw`B_{\text{轴}}=2\,B_{\text{侧}}` },
  ],
  viz: [
    {
      id: 'dipole-field-vs-angle',
      level: 'V1',
      title: t('偶极场随极角 θ 的变化', 'Dipole field magnitude versus polar angle θ'),
      xlabel: t('极角 θ (°)', 'polar angle θ (°)'),
      ylabel: t('B / (μ₀m/4πr³)', 'B / (μ₀m/4πr³)'),
      controls: [],
      compute: () => {
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 180; i++) {
          const theta = (i * Math.PI) / 180
          const b = Math.sqrt(1 + 3 * Math.cos(theta) ** 2)
          pts.push([i, b])
        }
        return [{ label: t('B(θ)', 'B(θ)'), color: '#993C1D', points: pts }]
      },
      note: t('θ=0（轴）取最大值 2，θ=90°（赤道）取 1 —— 正好是 2:1。', 'θ=0 (axis) peaks at 2, θ=90° (equator) at 1 — exactly a 2:1 ratio.'),
    },
  ],
  links: {
    upstream: [{ id: 'mag-dipole-field-general' }],
    downstream: [{ id: 'mag-central-dipole-field' }],
  },
  refs: [{ text: 'Blakely, Potential Theory, §5' }],
}

export default magDipoleFieldAxial
