import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** gravity-free-air-anomaly */
const gravityFreeAirAnomaly: FormulaCard = {
  id: 'gravity-free-air-anomaly',
  name: t('自由空气重力异常', 'Free-air Gravity Anomaly'),
  aliases: { zh: ['自由空气异常', 'FAA'], en: ['free-air anomaly', 'FAA'] },
  node: 'S14.3',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.GRAV'],
    quantity: ['Q.GRAV'],
    keywords: t('自由空气异常 FAA 定义', 'free-air anomaly definition'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\Delta g_{\text{FA}}=g_{\text{obs}}+\delta g_{\text{FA}}-g(\varphi)`,
  },
  meaning: t(
    '自由空气异常 = 经高度（自由空气）校正的观测重力减去正常重力。它保留了测点下方那层岩石板的引力，因此在高山上为正、在深海为负。海洋上因无岩石板可减，自由空气异常接近布格异常，是均衡研究与大地水准面反演的常用量。',
    'The free-air anomaly is the height-reduced observed gravity minus normal gravity. It keeps the attraction of the slab beneath the station, so it is positive over mountains and negative over deep ocean. At sea — where there is no slab to remove — the free-air anomaly nearly equals the Bouguer anomaly, making it the workhorse of isostatic and geoid studies.',
  ),
  symbols: [
    { sym: '\\Delta g_{\\text{FA}}', name: t('自由空气异常', 'free-air anomaly'), unit: 'mGal' },
    { sym: 'g_{\\text{obs}}', name: t('经仪器/潮汐改正的观测重力', 'instrument/tide-corrected observed gravity'), unit: 'mGal' },
    { sym: '\\delta g_{\\text{FA}}', name: t('自由空气校正', 'free-air correction'), unit: 'mGal' },
    { sym: 'g(\\varphi)', name: t('正常重力', 'normal gravity'), unit: 'mGal' },
  ],
  conditions: {
    applies: [t('海面或近平坦陆地', 'Sea surface or nearly flat land')],
    assumes: [t('仅做高度与纬度归算', 'Only height and latitude reduction')],
    breaks: [t('山区未减岩石板，偏高', 'Over mountains, high because slab not removed')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('观测归算到基准面', 'Reduce observation to datum'),
      latex: String.raw`g_{\text{red}}=g_{\text{obs}}+\delta g_{\text{FA}}` },
    { n: 2, op: 'setup', title: t('取参考椭球正常重力', 'Take reference normal gravity'),
      latex: String.raw`g(\varphi)` },
    { n: 3, op: 'result', title: t('相减得自由空气异常', 'Subtract for free-air anomaly'),
      latex: String.raw`\Delta g_{\text{FA}}=g_{\text{obs}}+\delta g_{\text{FA}}-g(\varphi)` },
  ],
  links: {
    upstream: [{ id: 'gravity-free-air-correction' }, { id: 'gravity-normal-formula' }],
    downstream: [{ id: 'gravity-bouguer-anomaly' }],
  },
  refs: [{ text: 'Hofmann-Wellenhof & Moritz, Physical Geodesy, §7' }],
}

export default gravityFreeAirAnomaly
