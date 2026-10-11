import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** radiation-efficiency */
const radiationEfficiency: FormulaCard = {
  id: 'radiation-efficiency',
  name: t('辐射效率', 'Radiation Efficiency'),
  aliases: { zh: ['辐射效率', '能量分配', '视应力比'], en: ['radiation efficiency', 'energy partitioning', 'scaled energy'] },
  node: 'S4.5',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.TELE'],
    quantity: ['Q.SOURCE', 'Q.AMP'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`\eta_{R} = \frac{E_{S}}{E_{S}+E_{G}} = \frac{2\mu\,E_{S}}{\Delta\sigma_{s}\,M_{0}}`,
    variants: [
      { name: t('标度能量', 'Scaled energy'), latex: String.raw`\tilde{e} = \frac{E_S}{M_0} \sim 10^{-5}\text{–}10^{-4}` },
      { name: t('用视应力表达', 'In terms of apparent stress'), latex: String.raw`\eta_R = \frac{2\sigma_a}{\Delta\sigma_s}` },
      { name: t('取值范围', 'Range of values'), latex: String.raw`\eta_R \in [0,1],\qquad \eta_R \to 1 \Longrightarrow \text{破裂几乎不耗能}` },
    ],
  },
  meaning: t(
    '辐射效率回答一个很直接的问题：地震释放的应变能里，有多大比例真的变成了地震波？多数地震在 0.25–1 之间，说明破裂过程本身消耗了不少能量。异常低（< 0.1）的往往是有大量慢滑动的事件 —— 它们滑动巨大、海啸很强，地震波却很弱。',
    'Radiation efficiency answers a very direct question: what fraction of the released strain energy actually becomes seismic waves? Most earthquakes lie between 0.25 and 1, meaning the rupture consumes a fair share. Anomalously low values (< 0.1) usually indicate events with substantial slow slip — huge slip and strong tsunamis, but weak seismic radiation.',
  ),
  symbols: [
    { sym: '\\eta_{R}', name: t('辐射效率', 'radiation efficiency'), unit: '无量纲', typical: '0.25 – 1' },
    { sym: 'E_{S}', name: t('辐射地震能量', 'radiated seismic energy'), unit: 'J' },
    { sym: 'E_{G}', name: t('断裂能', 'fracture energy'), unit: 'J' },
    { sym: '\\tilde{e}', name: t('标度能量 E_S/M₀', 'scaled energy E_S/M₀'), unit: '无量纲', typical: '10⁻⁵ – 10⁻⁴' },
    { sym: '\\sigma_{a}', name: t('视应力', 'apparent stress'), unit: 'Pa' },
    { sym: '\\Delta\\sigma_{s}', name: t('静态应力降', 'static stress drop'), unit: 'Pa' },
  ],
  conditions: {
    applies: [t('震源能量收支分析、海啸地震与慢地震识别', 'Source energy-budget analysis; identifying tsunami and slow earthquakes')],
    assumes: [
      t('E_S、Δσ_s、M₀ 都独立可靠地测定', 'E_S, Δσ_s and M₀ are all independently and reliably measured'),
      t('简单裂纹模型（E_S + E_G = Δσ_s M₀/2μ）', 'A simple crack model (E_S + E_G = Δσ_s M₀/2μ)'),
    ],
    breaks: [
      t('Δσ_s 估计误差大，η_R 的不确定度常超过 50%', 'Δσ_s is poorly constrained, so η_R often carries >50% uncertainty'),
      t('复杂破裂（多凹凸体）时单一 η_R 意义有限', 'For complex ruptures (multiple asperities) a single η_R has limited meaning'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('能量守恒：总释放能分成辐射与耗散', 'Energy conservation: total release splits into radiated and dissipated'),
      latex: String.raw`\Delta W = E_S + E_G` },
    { n: 2, op: 'identity', title: t('定义效率', 'Define the efficiency'),
      latex: String.raw`\eta_R = \frac{E_S}{E_S+E_G}` },
    { n: 3, op: 'physics', title: t('裂纹模型给出总释放能', 'The crack model gives the total released energy'),
      latex: String.raw`\Delta W = \frac{\Delta\sigma_s M_0}{2\mu}` },
    { n: 4, op: 'substitute', title: t('代入得到可直接计算的形式', 'Substitute to get a directly computable form'),
      latex: String.raw`\eta_R = \frac{E_S}{\Delta\sigma_s M_0/2\mu} = \frac{2\mu E_S}{\Delta\sigma_s M_0}` },
    { n: 5, op: 'result', title: t('用视应力重写', 'Rewrite using apparent stress'),
      latex: String.raw`\sigma_a = \mu\frac{E_S}{M_0} \Longrightarrow \eta_R = \frac{2\sigma_a}{\Delta\sigma_s}` },
  ],
  viz: [
    {
      id: 'efficiency-map',
      level: 'V1',
      title: t('辐射效率随标度能量与应力降的变化', 'Radiation efficiency versus scaled energy and stress drop'),
      xlabel: t('静态应力降 Δσ_s (MPa)', 'static stress drop Δσ_s (MPa)'),
      ylabel: t('辐射效率 η_R', 'radiation efficiency η_R'),
      xScale: 'log',
      controls: [
        { id: 'le', label: t('log₁₀(E_S/M₀)', 'log₁₀(E_S/M₀)'), min: -6, max: -3.5, step: 0.05, value: -4.5 },
        { id: 'mu', label: t('剪切模量 μ (GPa)', 'shear modulus μ (GPa)'), min: 10, max: 70, step: 1, value: 30 },
      ],
      note: t('标度能量固定时，应力降越大辐射效率越低 —— 高应力降地震把更多能量花在破裂上。', 'At fixed scaled energy, a larger stress drop means lower radiation efficiency — high-stress-drop events spend more energy on breaking the rock.'),
      compute: (p) => {
        const e = Math.pow(10, p['le']), mu = p['mu'] * 1e9
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const ds = Math.pow(10, -0.5 + (i / 200) * 2) * 1e6
          pts.push([ds / 1e6, (2 * mu * e) / ds])
        }
        return [{ label: t('η_R(Δσ_s)', 'η_R(Δσ_s)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('海啸地震的辐射效率', 'Radiation efficiency of a tsunami earthquake'),
    input: t('E_S/M₀ = 1×10⁻⁶，Δσ_s = 0.5 MPa，μ = 30 GPa', 'E_S/M₀ = 1×10⁻⁶, Δσ_s = 0.5 MPa, μ = 30 GPa'),
    steps: [t('η_R = 2×3×10¹⁰×10⁻⁶/(5×10⁵) = 0.12', 'η_R = 2×3×10¹⁰×10⁻⁶/(5×10⁵) = 0.12')],
    output: t('仅 12% 的能量变成地震波 —— 典型的海啸地震特征', 'Only 12% of the energy becomes seismic waves — typical of tsunami earthquakes'),
  },
  links: {
    upstream: [
      { id: 'fracture-energy', note: t('耗散的那一部分', 'The dissipated part') },
      { id: 'radiated-seismic-energy', note: t('辐射的那一部分', 'The radiated part') },
      { id: 'apparent-stress', note: t('视应力', 'Apparent stress') },
    ],
  },
  refs: [{ text: 'Kanamori, H. & Rivera, L. (2006). Energy partitioning during an earthquake. AGU Monograph 170, 3–13' }],
}

export default radiationEfficiency
