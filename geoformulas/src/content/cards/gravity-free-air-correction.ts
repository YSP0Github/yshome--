import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-free-air-correction */
const gravityFreeAirCorrection: FormulaCard = {
  id: 'gravity-free-air-correction',
  name: t('自由空气校正', 'Free-air Correction'),
  aliases: { zh: ['FA校正', '自由空气改正'], en: ['free-air correction'] },
  node: 'S14.3',
  tags: {
    math: ['MATH.APPROX'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV', 'Q.TIME'],
    keywords: t('自由空气校正 高度 0.3086', 'free-air correction height 0.3086'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\delta g_{\text{FA}}=+0.3086\,h\ \ \mathrm{mGal}\quad(h\text{ 单位 m})`,
  },
  meaning: t(
    '重力仪架在海拔 h 处时，比在海平面测得的引力小（因为离球心更远）。为把观测归算到大地水准面，需加回 +0.3086h mGal。它完全忽略了站与基准面之间那块岩石的引力——所以叫"自由空气"（仿佛中间是空的）。',
    'A gravimeter at elevation h reads less than it would at sea level because it is farther from Earth’s centre. To reduce the observation to the geoid we add back +0.3086h mGal. It entirely ignores the attraction of the rock between station and datum — hence "free-air" (as if the space were empty).',
  ),
  symbols: [
    { sym: '\\delta g_{\\text{FA}}', name: t('自由空气校正量', 'free-air correction'), unit: 'mGal' },
    { sym: 'h', name: t('测点海拔（高出基准面）', 'station elevation above datum'), unit: 'm' },
  ],
  conditions: {
    applies: [t('高出基准面的陆地测点', 'Land stations above the datum')],
    assumes: [t('垂直梯度常数 ≈0.3086 mGal/m', 'Constant vertical gradient ≈0.3086 mGal/m')],
    breaks: [t('高程很大时需非线性项', 'Non-linear terms needed at large elevation')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('垂直梯度 dg/dh≈−0.3086 mGal/m', 'Vertical gradient ≈−0.3086 mGal/m'),
      latex: String.raw`\frac{dg}{dh}\approx-0.3086\ \mathrm{mGal/m}` },
    { n: 2, op: 'algebra', title: t('升高 h 使观测偏小', 'Elevation h makes observation smaller'),
      latex: String.raw`g_{\text{obs}}=g_{\text{datum}}-0.3086\,h` },
    { n: 3, op: 'substitute', title: t('归算到基准面需加回', 'To reduce to datum, add back'),
      latex: String.raw`g_{\text{datum}}=g_{\text{obs}}+0.3086\,h` },
    { n: 4, op: 'result', title: t('自由空气校正为正', 'Free-air correction is positive'),
      latex: String.raw`\delta g_{\text{FA}}=+0.3086\,h` },
  ],
  links: {
    upstream: [{ id: 'gravity-free-air-gradient' }],
    downstream: [{ id: 'gravity-bouguer-simple', note: t('再去掉中间岩石板的引力', 'Then remove the slab attraction') }],
    seealso: [{ id: 'gravity-free-air-anomaly' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, §3.5' }],
}

export default gravityFreeAirCorrection
