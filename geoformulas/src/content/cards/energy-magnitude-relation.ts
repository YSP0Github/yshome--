import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** energy-magnitude-relation */
const energyMagnitudeRelation: FormulaCard = {
  id: 'energy-magnitude-relation',
  name: t('能量—震级关系', 'Energy–Magnitude Relation'),
  aliases: { zh: ['古登堡能量公式', '辐射能量', '视应力'], en: ['Gutenberg energy relation', 'radiated energy', 'apparent stress'] },
  node: 'S4.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.TELE'],
    quantity: ['Q.SOURCE', 'Q.AMP'],
  },
  audience: 'highschool',
  complete: 'L2',
  statement: {
    main: String.raw`\log_{10}E_{S} = 1.5\,M_{w} + 4.8 \quad (E_{S}\ \text{单位 J})`,
    variants: [
      { name: t('cgs 形式的经典写法', 'Classic form in cgs'), latex: String.raw`\log_{10}E_S = 1.5\,M_s + 11.8 \quad (E_S\ \text{单位 erg})` },
      { name: t('由视应力给出', 'From the apparent stress'), latex: String.raw`E_S = \frac{\sigma_{a}}{\mu}M_{0},\qquad \sigma_a = \mu\frac{E_S}{M_0}` },
      { name: t('相邻震级的能量比', 'Energy ratio between adjacent magnitudes'), latex: String.raw`\frac{E(M+1)}{E(M)} = 10^{1.5} \approx 31.6,\qquad \frac{E(M+2)}{E(M)} = 10^{3} = 1000` },
    ],
  },
  meaning: t(
    '震级每加 1，地震矩增大约 32 倍，辐射能量也增大约 32 倍；每加 2 就是 1000 倍。这个 10^1.5 的因子是地震学里最需要记住的常数之一 —— 它解释了为什么一次 M9 与一次 M7 完全不是一个量级的事件。',
    'Each unit of magnitude increases the seismic moment and the radiated energy by about a factor of 32; two units mean a factor of 1000. This 10^1.5 factor is one of the constants most worth memorising in seismology — it explains why an M9 is not remotely the same class of event as an M7.',
  ),
  symbols: [
    { sym: 'E_{S}', name: t('辐射地震能量', 'radiated seismic energy'), unit: 'J' },
    { sym: 'M_{w}', name: t('矩震级', 'moment magnitude'), unit: '无量纲' },
    { sym: '\\sigma_{a}', name: t('视应力', 'apparent stress'), unit: 'Pa', typical: '0.1 – 10 MPa' },
    { sym: '\\mu', name: t('剪切模量', 'shear modulus'), unit: 'Pa', typical: '30 GPa' },
    { sym: 'M_{0}', name: t('地震矩', 'seismic moment'), unit: 'N·m' },
  ],
  conditions: {
    applies: [t('由震级估算辐射能量、比较不同地震的规模', 'Estimating radiated energy from magnitude and comparing event sizes')],
    assumes: [
      t('经验关系，离散度可达 0.3 个震级单位', 'Empirical relation with scatter up to 0.3 magnitude units'),
      t('E_S 指辐射能量，不是总应变能释放', 'E_S is radiated energy, not the total strain-energy release'),
    ],
    breaks: [
      t('慢地震、 tsunami 地震的 E_S 远低于该关系预测', 'Slow and tsunami earthquakes radiate far less energy than predicted'),
      t('小震（M < 3）时关系不再可靠', 'Unreliable for small events (M < 3)'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('由地震矩定义出发', 'Start from the definition of seismic moment'),
      latex: String.raw`M_0 = \mu\,\bar{u}\,A` },
    { n: 2, op: 'physics', title: t('辐射能量约等于应力降乘滑动乘面积的一半', 'Radiated energy is about half the stress drop times slip times area'),
      latex: String.raw`E_S \approx \frac{1}{2}\Delta\sigma\,\bar{u}\,A = \frac{\Delta\sigma}{2\mu}M_0` },
    { n: 3, op: 'identity', title: t('定义视应力', 'Define the apparent stress'),
      latex: String.raw`\sigma_a = \mu\frac{E_S}{M_0} \approx \frac{\Delta\sigma}{2}` },
    { n: 4, op: 'substitute', title: t('代入 M₀ 与 M_w 的关系', 'Insert the M₀–M_w relation'),
      latex: String.raw`\log_{10}M_0 = 1.5M_w + 9.1` },
    { n: 5, op: 'result', title: t('得到经验形式', 'Obtain the empirical form'),
      latex: String.raw`\log_{10}E_S = 1.5M_w + 4.8 \quad (\sigma_a \approx 1.5\ \text{MPa})` },
  ],
  viz: [
    {
      id: 'energy-vs-mw',
      level: 'V1',
      title: t('辐射能量随矩震级的变化', 'Radiated energy versus moment magnitude'),
      xlabel: t('M_w', 'M_w'),
      ylabel: t('log₁₀ E_S (J)', 'log₁₀ E_S (J)'),
      controls: [
        { id: 'sa', label: t('视应力 σ_a (MPa)', 'apparent stress σ_a (MPa)'), min: 0.05, max: 20, step: 0.05, value: 1.5 },
        { id: 'mu', label: t('剪切模量 μ (GPa)', 'shear modulus μ (GPa)'), min: 10, max: 70, step: 1, value: 30 },
      ],
      note: t('视应力变化一个数量级，能量曲线平移一个数量级 —— 这就是为什么「同样震级灾害差别很大」。', 'Changing the apparent stress by one decade shifts the energy curve by one decade — the reason damage varies so much at fixed magnitude.'),
      compute: (p) => {
        const sa = p['sa'] * 1e6, mu = p['mu'] * 1e9
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 190; i++) {
          const mw = (i / 190) * 9.5
          const lM0 = 1.5 * mw + 9.1
          const lE = Math.log10(sa) + lM0 - Math.log10(mu)
          pts.push([mw, lE])
        }
        return [{ label: t('log₁₀ E_S', 'log₁₀ E_S'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('M_w 9 与 M_w 7 的对比', 'Comparing M_w 9 with M_w 7'),
    input: t('ΔM_w = 2', 'ΔM_w = 2'),
    steps: [
      t('能量比 = 10^{1.5×2} = 1000', 'Energy ratio = 10^{1.5×2} = 1000'),
      t('M_w 7：E_S ≈ 10^{15.3} J；M_w 9：E_S ≈ 10^{18.3} J', 'M_w 7: E_S ≈ 10^{15.3} J; M_w 9: E_S ≈ 10^{18.3} J'),
    ],
    output: t('一次 M9 释放的辐射能量约等于 1000 次 M7', 'One M9 radiates about as much energy as 1000 M7 events'),
  },
  links: {
    upstream: [{ id: 'mw-moment-magnitude', note: t('矩震级的定义', 'Definition of moment magnitude') }],
    downstream: [{ id: 'radiated-seismic-energy', note: t('辐射能量的独立算法', 'Independent computation of radiated energy') }],
    seealso: [{ id: 'apparent-stress', note: t('视应力的物理意义', 'Physical meaning of apparent stress') }],
  },
  refs: [{ text: 'Gutenberg, B. & Richter, C. F. (1956). Earthquake magnitude, intensity, energy and acceleration. Bull. Seismol. Soc. Am., 46, 105–145' }],
}

export default energyMagnitudeRelation
