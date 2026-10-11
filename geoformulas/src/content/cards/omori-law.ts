import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** omori-law */
const omoriLaw: FormulaCard = {
  id: 'omori-law',
  name: t('大森定律（余震衰减）', 'Omori’s Law (Aftershock Decay)'),
  aliases: { zh: ['大森定律', '余震衰减', '修正大森定律'], en: ['Omori law', 'modified Omori law', 'aftershock decay'] },
  node: 'S12.2',
  tags: {
    math: ['MATH.STAT', 'MATH.APPROX'],
    method: ['METH.STAT'],
    quantity: ['Q.TIME', 'Q.SOURCE'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`n(t)=\frac{K}{\left(t+c\right)^{p}}`,
    variants: [
      { name: t('原始大森定律', 'The original Omori law'), latex: String.raw`n(t)=\frac{K}{t+c}\quad (p=1)` },
      { name: t('累积余震数', 'Cumulative aftershock count'), latex: String.raw`N(t)=\frac{K\,c^{1-p}}{1-p}\left[\left(1+\frac{t}{c}\right)^{1-p}-1\right],\qquad p\neq1` },
      { name: t('p = 1 时的累积形式', 'Cumulative form for p = 1'), latex: String.raw`N(t)=K\ln\!\left(1+\frac{t}{c}\right)` },
    ],
  },
  meaning: t(
    '大地震之后余震的发生率随时间按幂律衰减。这是极少数「能预测」的地震学规律之一：衰减指数 p 通常在 0.9–1.5 之间，c 反映早期目录的缺失（主震后短时间内小震被大震尾波淹没而记录不到）。p 值的区域差异被认为与地壳温度、应力状态和流体有关。',
    'After a large earthquake the aftershock rate decays with time as a power law. This is one of the very few predictive regularities in seismology: the decay exponent p usually lies between 0.9 and 1.5, and c reflects early catalogue incompleteness, when small events are buried in the coda of the mainshock. Regional differences in p are thought to reflect crustal temperature, stress state and fluids.',
  ),
  symbols: [
    { sym: 'n(t)', name: t('主震后 t 时刻的余震发生率', 'aftershock rate at time t after the mainshock'), unit: '个/天' },
    { sym: 'K', name: t('生产率，与主震大小和区域有关', 'productivity, depends on mainshock size and region'), unit: '个/天' },
    { sym: 'c', name: t('时间偏移，反映早期目录缺失', 'time offset reflecting early catalogue incompleteness'), unit: '天', typical: '0.001 – 1' },
    { sym: 'p', name: t('衰减指数', 'decay exponent'), unit: '无量纲', typical: '0.9 – 1.5' },
  ],
  conditions: {
    applies: [t('主震之后数小时到数年的余震序列', 'Aftershock sequences from hours to years after the mainshock')],
    assumes: [t('余震区范围已界定，目录在该区完备', 'The aftershock zone is defined and the catalogue is complete there')],
    breaks: [t('强余震触发的次级序列会造成叠加，需分离或用 ETAS 建模', 'Secondary sequences triggered by strong aftershocks superpose; they must be separated or modelled with ETAS')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('大森 1894 年的经验观察', 'Omori’s empirical observation of 1894'),
      latex: String.raw`n(t)\propto\frac{1}{t}` },
    { n: 2, op: 'taylor', title: t('加入时间偏移以处理早期缺失', 'Add a time offset to handle early incompleteness'),
      latex: String.raw`n(t)=\frac{K}{t+c}` },
    { n: 3, op: 'setup', title: t('Utsu 1961 年推广为可变指数', 'Utsu (1961) generalised it to a variable exponent'),
      latex: String.raw`n(t)=\frac{K}{\left(t+c\right)^{p}}` },
    { n: 4, op: 'identity', title: t('积分得到累积数', 'Integrate to obtain the cumulative count'),
      latex: String.raw`N(t)=\int_0^{t}\frac{K\,\mathrm{d}\tau}{\left(\tau+c\right)^{p}}=\frac{K}{1-p}\left[\left(t+c\right)^{1-p}-c^{1-p}\right]` },
  ],
  viz: [
    {
      id: 'omori-decay',
      level: 'V1',
      title: t('余震发生率随时间的衰减', 'Aftershock rate decay with time'),
      xlabel: t('主震后时间 t (天)', 'time after mainshock t (days)'),
      ylabel: t('发生率 n(t) (个/天)', 'rate n(t) (events/day)'),
      xScale: 'log',
      yScale: 'log',
      controls: [
        { id: 'p', label: t('衰减指数 p', 'decay exponent p'), min: 0.6, max: 1.8, step: 0.01, value: 1.1 },
        { id: 'c', label: t('时间偏移 c', 'time offset c'), min: 0.01, max: 2, step: 0.01, value: 0.1, unit: '天' },
      ],
      compute: (p) => {
        const pp = p['p'], c = p['c'], K = 100
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const t = 0.05 * Math.pow(10, (i / 300) * 3)
          pts.push([t, K / Math.pow(t + c, pp)])
        }
        return [{ label: t('n(t)', 'n(t)'), color: '#185FA5', points: pts }]
      },
      note: t('在双对数坐标上，晚期是一条斜率为 −p 的直线；早期被 c 拉平。', 'On a log–log plot the late part is a straight line of slope −p; the early part is flattened by c.'),
    },
  ],
  links: {
    seealso: [
      { id: 'gutenberg-richter-law', note: t('余震在大小上的分布', 'Distribution of aftershocks in size') },
      { id: 'etas-model', note: t('把大小与时间统一建模', 'Models size and time together') },
    ],
  },
  refs: [{ text: 'Utsu (1961), Geophys. Mag., 30' }, { text: 'Utsu et al. (1995), J. Phys. Earth, 43' }],
}

export default omoriLaw
