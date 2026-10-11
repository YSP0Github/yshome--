import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mag-diurnal-correction */
const magDiurnalCorrection: FormulaCard = {
  id: 'mag-diurnal-correction',
  name: t('地磁日变改正', 'Diurnal Variation Correction'),
  aliases: { zh: ['日变改正', '日变'], en: ['diurnal correction', 'solar daily variation'] },
  node: 'S15.4',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.MAG', 'METH.PROC', 'METH.INSTR'],
    quantity: ['Q.MAG', 'Q.TIME'],
    keywords: t('日变改正 磁测 日变站 太阳静日', 'diurnal correction magnetic survey base station solar quiet'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\Delta g_{\text{survey}}(t)=B_{\text{survey}}(t)-B_{\text{base}}(t)+\overline{B}_{\text{base}}`,
  },
  meaning: t(
    '地磁场叠加有约 ±10–50 nT、周期 24 小时的太阳静日变化（Sq），由电离层电流驱动。野外观测必须扣除这个时间项：在工区内设一个固定日变站，记录 B_base(t)，各测点观测值减去同时刻日变值，再加上日变站全日均值，得到同一基准下的"稳定"磁测结果。磁暴期间日变可达数百 nT，必须停工。',
    'The geomagnetic field carries a ~±10–50 nT, 24-hour solar quiet daily variation (Sq) driven by ionospheric currents. Field observations must remove this time-dependent term: a fixed base station records B_base(t); each survey station subtracts the simultaneous base value and adds the station’s daily mean to produce a stable result on a common datum. During magnetic storms diurnal shifts reach hundreds of nT and surveys must stop.',
  ),
  symbols: [
    { sym: 'B_{\\text{survey}}(t)', name: t('测点某时刻观测值', 'survey station reading at time t'), unit: 'nT' },
    { sym: 'B_{\\text{base}}(t)', name: t('日变站同时刻观测', 'base station simultaneous reading'), unit: 'nT' },
    { sym: '\\overline{B}_{\\text{base}}', name: t('日变站全日均值', 'base station daily mean'), unit: 'nT' },
  ],
  conditions: {
    applies: [t('地面、航空磁测的日变校正', 'Diurnal correction for ground/airborne surveys')],
    assumes: [t('日变站距工区近、变化一致', 'Base station close, same variation')],
    breaks: [t('磁暴、亚暴期数据不可用', 'Data unusable during storms/substorms')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('观测 = 主磁场 + 异常 + 日变', 'Observation = main + anomaly + diurnal'),
      latex: String.raw`B_{\text{survey}}(t)=B_{\text{main}}+\Delta B_{\text{anom}}+\delta B_{\text{diurnal}}(t)` },
    { n: 2, op: 'setup', title: t('日变站只测主场+日变', 'Base station sees only main + diurnal'),
      latex: String.raw`B_{\text{base}}(t)=B_{\text{main}}+\delta B_{\text{diurnal}}(t)` },
    { n: 3, op: 'algebra', title: t('相减消去日变', 'Subtract to cancel diurnal'),
      latex: String.raw`B_{\text{survey}}(t)-B_{\text{base}}(t)=\Delta B_{\text{anom}}-B_{\text{main}}+\overline{B}_{\text{base}}` },
    { n: 4, op: 'result', title: t('归算到同一基准', 'Reduce to a common datum'),
      latex: String.raw`\Delta B_{\text{survey}}=B_{\text{survey}}(t)-B_{\text{base}}(t)+\overline{B}_{\text{base}}` },
  ],
  links: {
    upstream: [{ id: 'mag-igrf-reference-field' }],
    seealso: [{ id: 'mag-element-conversions' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, §4.4' }],
}

export default magDiurnalCorrection
