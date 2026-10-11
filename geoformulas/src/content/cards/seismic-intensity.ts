import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** seismic-intensity */
const seismicIntensity: FormulaCard = {
  id: 'seismic-intensity',
  name: t('地震烈度与烈度—地震动换算', 'Seismic Intensity & Intensity–Motion Conversion'),
  aliases: { zh: ['烈度', 'MMI', 'EMS-98'], en: ['macroseismic intensity', 'MMI', 'EMS-98', 'ShakeMap'] },
  node: 'S11.4',
  tags: {
    math: ['MATH.STAT', 'MATH.APPROX'],
    method: ['METH.HAZARD'],
    quantity: ['Q.HAZARD'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\mathrm{MMI}\approx a+b\,\log_{10}(\mathrm{PGA})\quad\text{或}\quad \mathrm{MMI}=c+d\,\log_{10}(\mathrm{PGV})`,
    variants: [
      { name: t('Wald 等（1999）的常用关系', 'Commonly used relations of Wald et al. (1999)'), latex: String.raw`\mathrm{MMI}=3.66\,\log_{10}(\mathrm{PGA})-1.66\quad (\mathrm{PGA}\ \text{单位}\ \mathrm{cm/s^2})` },
      { name: t('用 PGV 的关系（往往更稳）', 'The PGV-based relation, often more robust'), latex: String.raw`\mathrm{MMI}=3.47\,\log_{10}(\mathrm{PGV})+2.35\quad (\mathrm{PGV}\ \text{单位}\ \mathrm{cm/s})` },
      { name: t('中国烈度表', 'The Chinese intensity scale'), latex: String.raw`I=0.24+1.40\,\log_{10}(\mathrm{PGA})\quad (\mathrm{PGA}\ \text{单位}\ \mathrm{cm/s^2}),\ \text{另有 I–PGV 版本}` },
    ],
  },
  meaning: t(
    '烈度是把「人感受到什么、房子坏成什么样」压缩成一个罗马数字的经验标度，它不是物理量，却是最贴近灾害的量。ShakeMap 之类的系统靠 PGA/PGV 与烈度的经验换算，把仪器记录实时翻译成公众能懂的烈度图。注意这些换算关系只是统计拟合，散布可达 ±1 度。',
    'Intensity compresses "what people felt and how buildings were damaged" into a single Roman numeral. It is not a physical quantity, yet it is the quantity closest to actual damage. Systems such as ShakeMap use empirical conversions from PGA/PGV to translate instrumental records into intensity maps the public can read. Remember these are statistical fits with scatter of about ±1 intensity unit.',
  ),
  symbols: [
    { sym: '\\mathrm{MMI}', name: t('修正麦加利烈度', 'Modified Mercalli intensity'), unit: '无量纲', typical: 'I – XII' },
    { sym: '\\mathrm{PGA}', name: t('峰值地面加速度', 'peak ground acceleration'), unit: 'cm/s²' },
    { sym: '\\mathrm{PGV}', name: t('峰值地面速度', 'peak ground velocity'), unit: 'cm/s' },
    { sym: 'a,b,c,d', name: t('回归系数', 'regression coefficients'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('由仪器地震动估计宏观烈度，或反之', 'Estimating macroseismic intensity from instrumental motion, or vice versa')],
    assumes: [t('回归样本与目标区域的震源、场地特征相近', 'The regression sample resembles the source and site characteristics of the target region')],
    breaks: [t('烈度受建筑质量、人口密度影响极大，跨区域套用关系会出错', 'Intensity depends strongly on building quality and population density; applying relations across regions is error-prone')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('收集同一地震的烈度点与仪器记录', 'Collect intensity points and instrumental records for the same earthquake'),
      latex: String.raw`\left\{\left(\mathrm{MMI}_i,\mathrm{PGA}_i\right)\right\}_{i=1}^{N}` },
    { n: 2, op: 'setup', title: t('假设幂律关系', 'Assume a power-law relation'),
      latex: String.raw`\mathrm{PGA}\propto10^{\,\mathrm{MMI}/b}` },
    { n: 3, op: 'identity', title: t('取对数线性化', 'Linearise by taking logarithms'),
      latex: String.raw`\mathrm{MMI}=a+b\log_{10}(\mathrm{PGA})` },
    { n: 4, op: 'result', title: t('最小二乘回归定出系数', 'Least-squares regression fixes the coefficients'),
      latex: String.raw`\hat b=\frac{\sum\left(x_i-\bar x\right)\left(y_i-\bar y\right)}{\sum\left(x_i-\bar x\right)^{2}},\qquad \hat a=\bar y-\hat b\,\bar x` },
  ],
  links: {
    upstream: [{ id: 'ground-motion-parameters', note: t('PGA、PGV 的定义', 'Definitions of PGA and PGV') }],
    seealso: [{ id: 'gmpe-functional-form', note: t('另一个方向的预测', 'Prediction in the other direction') }],
  },
  refs: [{ text: 'Wald et al. (1999), Earthquake Spectra, 15' }],
}

export default seismicIntensity
