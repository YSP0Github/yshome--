import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** apparent-stress */
const apparentStress: FormulaCard = {
  id: 'apparent-stress',
  name: t('视应力与辐射效率', 'Apparent Stress & Radiation Efficiency'),
  aliases: { zh: ['视应力'], en: ['apparent stress', 'radiation efficiency'] },
  node: 'S4.5',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.TELE'],
    quantity: ['Q.SOURCE', 'Q.AMP'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`\sigma_a=\mu\,\frac{E_s}{M_0},\qquad \eta_{sw}=\frac{\sigma_a}{\Delta\sigma}=\frac{\mu E_s}{\Delta\sigma\,M_0}`,
    variants: [
      { name: t('辐射地震能量', 'Radiated seismic energy'), latex: String.raw`E_s=\frac{1}{2}\left(\Delta\sigma_1+\Delta\sigma_2\right)\bar{D}\,A\ \to\ \frac{\Delta\sigma\,\bar{D}\,A}{2}\ \text{（Orowan 模型）}` },
      { name: t('能量—震级关系', 'Energy–magnitude relation'), latex: String.raw`\log_{10}E_s=1.5\,M_s+11.8\quad (E_s\ \text{单位 erg})` },
    ],
  },
  meaning: t(
    '视应力是「单位地震矩辐射了多少能量」，它把震源的能量收支与力学收支联系起来。辐射效率 η 则衡量释放的应变能里有多大比例变成了地震波 —— 剩下的都耗在破裂面摩擦生热上。多数地震的 η 只有 0.1 量级，意味着摩擦生热消耗了绝大部分能量。',
    'Apparent stress is the seismic energy radiated per unit moment, linking the energy budget of a source to its mechanical budget. Radiation efficiency η measures what fraction of the released strain energy became seismic waves; the rest is dissipated as frictional heat on the fault. For most earthquakes η is only of order 0.1, meaning frictional heating consumes the bulk of the energy.',
  ),
  symbols: [
    { sym: '\\sigma_a', name: t('视应力', 'apparent stress'), unit: 'Pa', typical: '10⁴ – 10⁶' },
    { sym: 'E_s', name: t('辐射地震能量', 'radiated seismic energy'), unit: 'J' },
    { sym: 'M_0', name: t('地震矩', 'seismic moment'), unit: 'N·m' },
    { sym: '\\eta_{sw}', name: t('辐射效率', 'radiation efficiency'), unit: '无量纲', typical: '0.05 – 0.5' },
    { sym: '\\Delta\\sigma', name: t('静态应力降', 'static stress drop'), unit: 'Pa' },
  ],
  conditions: {
    applies: [t('由能量与地震矩推算震源的力学效率', 'Inferring mechanical efficiency from energy and moment')],
    assumes: [t('Orowan 模型：动摩擦应力与最终剪应力相等', 'The Orowan model: dynamic friction equals the final shear stress')],
    breaks: [t('能量估计受 Q 校正与场地效应影响极大，误差常达一倍以上', 'Energy estimates are strongly affected by Q correction and site effects, often with errors exceeding a factor of two')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('辐射能量 = 应力降 × 滑移 × 面积 / 2', 'Radiated energy = stress drop × slip × area / 2'),
      latex: String.raw`E_s=\frac{1}{2}\,\Delta\sigma_{\text{eff}}\,\bar{D}\,A`,
    },
    { n: 2, op: 'substitute', title: t('代入 M₀ = μ A D̄', 'Substitute M₀ = μ A D̄'),
      latex: String.raw`\bar{D}A=\frac{M_0}{\mu}\;\Longrightarrow\; E_s=\frac{\Delta\sigma_{\text{eff}}}{2}\frac{M_0}{\mu}` },
    { n: 3, op: 'algebra', title: t('定义视应力', 'Define the apparent stress'),
      latex: String.raw`\sigma_a\equiv\mu\frac{E_s}{M_0}=\frac{\Delta\sigma_{\text{eff}}}{2}` },
    { n: 4, op: 'result', title: t('辐射效率', 'Radiation efficiency'),
      latex: String.raw`\eta_{sw}=\frac{\sigma_a}{\Delta\sigma}=\frac{\mu E_s}{\Delta\sigma\,M_0}` },
  ],
  links: {
    upstream: [{ id: 'seismic-moment', note: t('M₀ 来自它', 'M₀ comes from it') }],
    seealso: [{ id: 'static-stress-drop', note: t('Δσ 的分母', 'Supplies the denominator Δσ') }],
  },
  refs: [{ text: 'Wyss & Brune (1968), J. Geophys. Res., 73' }, { text: 'Kanamori & Heaton (2000), in GeoComplexity and the Physics of Earthquakes' }],
}

export default apparentStress
