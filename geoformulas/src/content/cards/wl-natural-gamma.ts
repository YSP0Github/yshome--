import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wl-natural-gamma */
const wlNaturalGamma: FormulaCard = {
  id: 'wl-natural-gamma',
  name: t('自然伽马测井 GR', 'Natural Gamma-ray Log (GR)'),
  aliases: { zh: ['GR 曲线', '自然伽马'], en: ['GR log', 'gamma ray'] },
  node: 'S17.1',
  tags: {
    math: ['MATH.STAT'],
    method: ['METH.LOG'],
    quantity: ['Q.POR', 'Q.AMP'],
    keywords: t('自然伽马 GR 泥质含量 放射性 铀钍钾 岩性', 'gamma ray GR shale volume radioactivity uranium thorium potassium lithology'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`GR\propto \sum_{i\in\{U,Th,K\}} C_{i}`,
    variants: [
      { name: t('泥质指示', 'Shale indicator'), latex: String.raw`V_{sh}=f(GR_{log}-GR_{clean})` },
    ],
  },
  meaning: t(
    'GR 测井记录地层天然放射性（铀、钍、钾）的强度。泥岩富含粘土矿物和吸附的铀、钍，GR 显著偏高；纯净砂岩、碳酸盐岩 GR 低。因此 GR 是识别泥质、划分渗透层、对比地层最基本的曲线，也是估算泥质含量 Vsh 的入口。',
    'The GR log records natural formation radioactivity (U, Th, K). Shales are rich in clay minerals and adsorbed U/Th, so GR is high; clean sandstones and carbonates are low. GR is therefore the basic curve for detecting shales, picking permeable beds and correlating strata, and the starting point for estimating shale volume Vsh.',
  ),
  symbols: [
    { sym: 'GR', name: t('自然伽马强度', 'natural gamma ray'), unit: 'API', typical: 'API 单位' },
    { sym: 'C_{i}', name: t('U/Th/K 含量', 'U, Th, K concentrations'), unit: 'ppm / %' },
  ],
  conditions: {
    applies: [t('裸眼或套管井均可，不受泥浆导电性影响', 'Open or cased hole, independent of mud conductivity')],
    assumes: [t('放射性主要来自泥质，无放射性矿物干扰', 'Radioactivity mainly from shale, no radioactive minerals')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('总计数率正比于放射核素含量', 'Count rate ∝ radionuclide content'),
      latex: String.raw`GR\propto C_{U}+C_{Th}+C_{K}` },
    { n: 2, op: 'identity', title: t('泥岩高、净砂岩低', 'Shale high, clean sand low'),
      latex: String.raw`GR_{shale}>GR_{sand}` },
    { n: 3, op: 'result', title: t('归一化为 Vsh', 'Normalize to Vsh'),
      latex: String.raw`V_{sh}=f\!\left(\dfrac{GR-GR_{clean}}{GR_{shale}-GR_{clean}}\right)` },
  ],
  links: {
    downstream: [{ id: 'wl-shale-volume-larionov', note: t('由 GR 定量 Vsh', 'Quantitative Vsh from GR') }],
    seealso: [{ id: 'wl-spontaneous-potential' }],
  },
  refs: [{ text: 'Ellis & Singer, Well Logging for Earth Scientists, 2nd ed.' }],
}

export default wlNaturalGamma
