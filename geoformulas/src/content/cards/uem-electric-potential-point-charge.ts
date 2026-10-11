import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-electric-potential-point-charge */
const uemElectricPotentialPointCharge: FormulaCard = {
  id: 'uem-electric-potential-point-charge',
  name: t('点电荷的电势', 'Electric Potential of a Point Charge'),
  aliases: { zh: ['电势 V=kQ/r', '电位'], en: ['electric potential', 'potential of point charge'] },
  node: 'S19.1',
  tags: {
    math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ELEC'],
    keywords: t('电势 V=kQ/r 电位 标量叠加 电势能 无穷远为零', 'electric potential kQ/r scalar superposition potential energy infinity zero'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`V=\frac{U}{q_{0}}=\frac{1}{4\pi\varepsilon_{0}}\frac{Q}{r}\qquad(\,V(\infty)=0\,)`,
    variants: [
      { name: t('点电荷系电势（标量叠加）', 'Discrete charges (scalar sum)'), latex: String.raw`V=\dfrac{1}{4\pi\varepsilon_{0}}\sum_{i}\dfrac{q_{i}}{r_{i}}` },
      { name: t('电势能', 'Electric potential energy'), latex: String.raw`U=q_{0}V=\dfrac{1}{4\pi\varepsilon_{0}}\dfrac{Qq_{0}}{r}` },
    ],
  },
  meaning: t(
    '电势是单位正电荷的电势能，是标量。点电荷 V=kQ/r，取无穷远为零点。与矢量电场不同，电势按代数相加，计算常更省事；场强是电势的负梯度。',
    'Electric potential is the electric potential energy per unit positive charge, a scalar. A point charge gives V=kQ/r with the zero at infinity. Unlike the vector field E, potentials add algebraically and are often easier to compute; E is the negative gradient of V.',
  ),
  symbols: [
    { sym: 'V', name: t('电势', 'electric potential'), unit: 'V' },
    { sym: 'U', name: t('电势能', 'potential energy'), unit: 'J' },
    { sym: 'Q', name: t('场源电荷', 'source charge'), unit: 'C' },
    { sym: 'r', name: t('到场源距离', 'distance'), unit: 'm' },
  ],
  conditions: {
    applies: [t('取无穷远电势为零；真空静电场', 'Zero potential at infinity; electrostatic vacuum field')],
    assumes: [t('电势为标量，直接代数相加', 'Potential is scalar, added algebraically')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('电势差=场强线积分', 'Potential difference = line integral of E'),
      latex: String.raw`V(r)-V(\infty)=-\int_{\infty}^{r}\mathbf{E}\cdot d\mathbf{l}` },
    { n: 2, op: 'transform', title: t('代入 E=kQ/r² 径向', 'Substitute radial E=kQ/r²'),
      latex: String.raw`V(r)=-\int_{\infty}^{r}\dfrac{kQ}{r'^{2}}\,dr'=\dfrac{kQ}{r}` },
    { n: 3, op: 'result', title: t('叠加得电荷系电势', 'Superpose for a charge system'),
      latex: String.raw`V=\dfrac{1}{4\pi\varepsilon_{0}}\sum_{i}\dfrac{q_{i}}{r_{i}}` },
  ],
  viz: [
    {
      id: 'potential-vs-r',
      level: 'V1',
      title: t('点电荷电势随距离', 'Point-charge potential vs distance'),
      xlabel: t('距离 r (m)', 'distance r (m)'),
      ylabel: t('电势 V (V)', 'potential V (V)'),
      xRange: [0, 5],
      controls: [
        { id: 'qval', label: t('场源电荷 Q (μC)', 'source charge Q'), min: 0.1, max: 50, step: 0.1, value: 1, unit: 'μC' },
      ],
      compute: (p) => {
        const Q = p['qval'] * 1e-6
        const pts: Array<[number, number]> = []
        const k = 1 / (4 * Math.PI * 8.854e-12)
        for (let i = 1; i <= 200; i++) {
          const r = (i / 200) * 5 + 0.05
          pts.push([r, k * Q / r])
        }
        return [{ label: t('V=kQ/r', 'V=kQ/r'), color: '#0F6E56', points: pts }]
      },
      note: t('V∝1/r（正电荷为正、负电荷为负），越靠近电荷绝对值越大。', 'V∝1/r (positive for Q>0, negative for Q<0); magnitude grows near the charge.'),
    },
  ],
  links: {
    upstream: [{ id: 'uem-electric-field-point-charge' }],
    downstream: [{ id: 'uem-potential-gradient-e' }, { id: 'uem-electrostatic-energy' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §24' }],
}

export default uemElectricPotentialPointCharge
