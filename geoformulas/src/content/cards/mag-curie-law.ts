import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mag-curie-law */
const magCurieLaw: FormulaCard = {
  id: 'mag-curie-law',
  name: t('顺磁居里定律', "Curie's Law for Paramagnetic Susceptibility"),
  aliases: { zh: ['居里定律 χ=C/T'], en: ["Curie's law"] },
  node: 'S15.3',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.APPROX'],
    method: ['METH.MAG', 'METH.ROCK'],
    quantity: ['Q.MAG', 'Q.ENERGY'],
    keywords: t('居里定律 顺磁 χ=C/T 温度', "Curie's law paramagnetic susceptibility temperature"),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\chi=\frac{C}{T}`,
    variants: [
      { name: t('Curie–Weiss 形式（含相互作用）', 'Curie–Weiss form (with interactions)'), latex: String.raw`\chi=\frac{C}{T-\theta}` },
    ],
  },
  meaning: t(
    '顺磁介质的磁化率与绝对温度成反比：温度越高，热运动越打乱磁矩取向，χ 越小。居里常数 C 由单位体积内磁矩数决定。这条定律解释了为什么同一矿物在冷的围岩中比在热的深部磁化更强，也为居里温度提供了高温端的行为基准。',
    'The susceptibility of a paramagnet is inversely proportional to absolute temperature: the hotter it gets, the more thermal motion disorders the magnetic moments, and the smaller χ. The Curie constant C depends on the number of moments per unit volume. It explains why the same mineral is more magnetic in cold wall rock than in the hot deep crust, and sets the high-temperature behavior leading to the Curie point.',
  ),
  symbols: [
    { sym: '\\chi', name: t('体积磁化率', 'volume susceptibility'), unit: '—' },
    { sym: 'C', name: t('居里常数', 'Curie constant'), unit: 'K' },
    { sym: 'T', name: t('绝对温度', 'absolute temperature'), unit: 'K' },
    { sym: '\\theta', name: t('Curie–Weiss 温度', 'Curie–Weiss temperature'), unit: 'K' },
  ],
  conditions: {
    applies: [t('顺磁、高温、弱场', 'Paramagnetic, high T, weak field')],
    assumes: [t('磁矩间无相互作用', 'Non-interacting moments')],
    breaks: [t('铁磁有序态（T<Tc）不适用', 'Fails in ferromagnetic ordered state (T<Tc)')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('磁矩在 H 中的势能 U=−m·H', 'Moment energy U=−m·H'),
      latex: String.raw`U=-\mu_0 m H\cos\theta` },
    { n: 2, op: 'setup', title: t('Boltzmann 分布给出平均取向', 'Boltzmann distribution gives mean alignment'),
      latex: String.raw`\langle\cos\theta\rangle\approx\frac{\mu_0 m H}{3k_B T}` },
    { n: 3, op: 'substitute', title: t('M=n m⟨cosθ⟩', 'M=n m⟨cosθ⟩'),
      latex: String.raw`M=\chi H=n m\frac{\mu_0 m}{3k_B T}H` },
    { n: 4, op: 'result', title: t('χ=C/T', 'χ=C/T'),
      latex: String.raw`\chi=\frac{n\mu_0 m^{2}}{3k_B T}=\frac{C}{T}` },
  ],
  viz: [
    {
      id: 'chi-vs-temp',
      level: 'V1',
      title: t('顺磁磁化率 χ 随温度 T 的变化', 'Paramagnetic susceptibility χ versus T'),
      xlabel: t('温度 T (K)', 'temperature T (K)'),
      ylabel: t('χ (相对值)', 'χ (relative)'),
      controls: [
        { id: 'Cc', label: t('居里常数 C', 'Curie constant C'), min: 100, max: 1000, step: 50, value: 400, unit: 'K' },
      ],
      compute: (p) => {
        const C = p['Cc']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const T = 100 + i * 10
          pts.push([T, C / T])
        }
        return [{ label: t('χ=C/T', 'χ=C/T'), color: '#0F6E56', points: pts }]
      },
      note: t('温度从 300 K 升到 800 K，χ 降到原来的约 3/8 —— 高温显著削弱顺磁响应。', 'Rising T from 300 to 800 K drops χ to ~3/8 — high temperature strongly weakens the paramagnetic response.'),
    },
  ],
  links: {
    upstream: [{ id: 'mag-magnetization-susceptibility' }],
    downstream: [{ id: 'mag-curie-temperature', note: t('温度升高到 Tc 时磁性消失', 'At Tc magnetism disappears') }],
  },
  refs: [{ text: 'Dunlop & Özdemir, Rock Magnetism, ch. 10' }],
}

export default magCurieLaw
