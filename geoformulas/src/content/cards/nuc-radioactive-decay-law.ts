import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** nuc-radioactive-decay-law */
const nucRadioactiveDecayLaw: FormulaCard = {
  id: 'nuc-radioactive-decay-law',
  name: t('放射性衰变定律', 'Radioactive Decay Law'),
  aliases: { zh: ['N=N₀e^(−λt)', '衰变常数'], en: ['decay law N = N0 e^(-lambda t)', 'decay constant'] },
  node: 'S20.5',
  tags: {
    math: ['MATH.DIFF', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.TIME', 'Q.ENERGY'],
    keywords: t('放射性衰变 N=N0e^(−λt) 衰变常数 λ 指数衰减', 'radioactive decay law N = N0 e^(-lambda t) decay constant exponential decay'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`N(t)=N_0\,e^{-\lambda t}`,
    variants: [
      { name: t('微分形式', 'Differential form'), latex: String.raw`\frac{dN}{dt}=-\lambda N` },
    ],
  },
  meaning: t(
    '放射性原子核的衰变是随机过程，但大量核的统计行为严格服从指数规律：N(t)=N₀e^(−λt)。λ 是衰变常数，单位时间内一个核衰变的概率。每过一个特征寿命 1/λ，剩下的核数减到原来的 1/e。它是碳-14 测年、放射性活度监测的基础。',
    'The decay of a radioactive nucleus is a random process, but the statistical behaviour of a large number follows a strict exponential: N(t) = N₀e^(−λt). λ is the decay constant, the probability per unit time that one nucleus decays. Every characteristic lifetime 1/λ cuts the remaining nuclei by a factor 1/e. It underlies radiocarbon dating and radioactive-activity monitoring.'
  ),
  symbols: [
    { sym: 'N(t)', name: t('t 时刻未衰变核数', 'number of undecayed nuclei at time t'), unit: '1' },
    { sym: 'N_0', name: t('初始核数', 'initial number of nuclei'), unit: '1' },
    { sym: '\\lambda', name: t('衰变常数', 'decay constant'), unit: 's⁻¹' },
    { sym: 't', name: t('时间', 'time'), unit: 's' },
  ],
  conditions: {
    applies: [t('大量同类放射性核、无外界干扰', 'A large sample of identical radioactive nuclei, undisturbed')],
    assumes: [t('衰变概率与核的历史、周围环境无关', 'Decay probability is independent of history and environment')],
    breaks: [t('极少量核时涨落大，指数规律是统计平均', 'With very few nuclei fluctuations are large; the law is a statistical average')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('单位时间衰变数正比于现存数', 'Decays per unit time ∝ number present'), latex: String.raw`dN=-\lambda N\,dt` },
    { n: 2, op: 'transform', title: t('分离变量积分', 'Separate variables and integrate'), latex: String.raw`\int_{N_0}^{N}\frac{dN}{N}=-\lambda\int_0^t dt` },
    { n: 3, op: 'algebra', title: t('得指数规律', 'Get the exponential law'), latex: String.raw`\ln\frac{N}{N_0}=-\lambda t\;\Rightarrow\;N=N_0e^{-\lambda t}` },
  ],
  viz: [
    {
      id: 'decay-curve',
      level: 'V1',
      title: t('放射性核数随时间的指数衰减', 'Exponential decay of radioactive nuclei'),
      xlabel: t('时间 t (以半衰期为单位)', 'time t (in half-lives)'),
      ylabel: t('相对剩余核数 N/N₀', 'relative remaining nuclei N/N0'),
      controls: [
        { id: 'lam', label: t('衰变常数 λ (1/年)', 'decay constant lambda (1/year)'), min: 0.05, max: 1.0, step: 0.01, value: 0.1, unit: '/yr' },
      ],
      xRange: [0, 30],
      note: t('曲线在每个半衰期下降一半。λ 越大（衰变越快），曲线掉得越快；3 个半衰期后只剩 1/8，10 个半衰期后只剩约 1/1000。',
        'The curve halves every half-life. Larger lambda (faster decay) drops the curve faster: after 3 half-lives only 1/8 remains; after 10 half-lives about 1/1000.'),
      compute: (p) => {
        const lam = p['lam']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const t = (i / 300) * 30
          pts.push([t, Math.exp(-lam * t)])
        }
        return [{ label: t('N(t)/N₀', 'N(t)/N0'), color: '#185FA5', points: pts }]
      },
    },
  ],
  links: {
    upstream: [{ id: 'nuc-binding-energy-per-nucleon' }],
    downstream: [{ id: 'nuc-half-life-mean-life' }, { id: 'nuc-activity' }],
  },
  refs: [{ text: 'Krane, Introductory Nuclear Physics, §6' }],
}

export default nucRadioactiveDecayLaw
