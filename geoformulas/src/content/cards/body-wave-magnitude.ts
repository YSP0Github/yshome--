import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** body-wave-magnitude */
const bodyWaveMagnitude: FormulaCard = {
  id: 'body-wave-magnitude',
  name: t('体波震级 m_b', 'Body-wave Magnitude m_b'),
  aliases: { zh: ['mb', '体波震级', '短周期震级'], en: ['body-wave magnitude', 'mb', 'short-period magnitude'] },
  node: 'S4.2',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.GEOM'],
    method: ['METH.TELE'],
    quantity: ['Q.SOURCE', 'Q.AMP'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`m_b=\log_{10}\left(\frac{A}{T}\right)+Q(\Delta,h)`,
    variants: [
      { name: t('A/T 的含义', 'Meaning of A/T'), latex: String.raw`\frac{A}{T}\propto\text{地面运动速度，单位}\ \mu\mathrm{m/s}` },
      { name: t('常用量规函数（NEIC）', 'Commonly used calibration function (NEIC)'), latex: String.raw`Q(\Delta,h)\ \text{由 Gutenberg–Richter 与后续工作经验标定，随}\ \Delta\ \text{与震源深度}\ h\ \text{变化}` },
      { name: t('饱和行为', 'Saturation behaviour'), latex: String.raw`m_b\ \text{在约}\ 6.0\text{–}6.5\ \text{饱和}` },
    ],
  },
  meaning: t(
    '远震台网需要一个不依赖地方震量的标度，于是用 1 秒左右的短周期 P 波振幅定义 m_b。它的问题恰恰出在「短周期」三个字上：大地震辐射的主要是长周期能量，短周期振幅增长很慢，于是 m_b 在 6 级左右就饱和了 —— 1960 年智利地震的 m_b 只有 7 点几，而它的 Mw 是 9.5。',
    'Teleseismic networks need a scale independent of local magnitude, so m_b is defined from short-period P amplitude near 1 s. The problem lies precisely in "short-period": great earthquakes radiate mostly long-period energy, so short-period amplitude grows slowly and m_b saturates near 6. The 1960 Chile earthquake had m_b of only about 7, against Mw 9.5.',
  ),
  symbols: [
    { sym: 'm_b', name: t('体波震级', 'body-wave magnitude'), unit: '无量纲', typical: '3.5 – 7' },
    { sym: 'A', name: t('P 波最大地动位移振幅', 'maximum P-wave ground displacement amplitude'), unit: 'μm' },
    { sym: 'T', name: t('对应周期', 'corresponding period'), unit: 's', typical: '0.5 – 3' },
    { sym: 'Q(\\Delta,h)', name: t('量规函数（距离与深度校正）', 'calibration function (distance and depth correction)'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('远震（Δ > 20°）的短周期 P 波', 'Teleseismic (Δ > 20°) short-period P waves')],
    assumes: [t('震源深度已知、路径校正可靠', 'Source depth is known and path corrections are reliable')],
    breaks: [t('深震、特殊路径（俯冲带）需专门校正，否则系统性偏差可达 0.3 级', 'Deep events and special paths such as subduction zones need dedicated corrections, otherwise bias reaches 0.3 magnitude units')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('用速度而非位移做振幅量', 'Use velocity rather than displacement as the amplitude measure'),
      latex: String.raw`\frac{A}{T}\propto v_{\text{地面}}` },
    { n: 2, op: 'setup', title: t('取对数并加距离—深度校正', 'Take the logarithm and add distance–depth correction'),
      latex: String.raw`m_b=\log_{10}\frac{A}{T}+Q(\Delta,h)` },
    { n: 3, op: 'physics', title: t('短周期辐射随震级增长趋缓', 'Short-period radiation grows more slowly with magnitude'),
      latex: String.raw`A_{1s}\ \text{在}\ M_0\to\infty\ \text{时趋于饱和}` },
    { n: 4, op: 'result', title: t('表现为 m_b 的饱和', 'This shows up as saturation of m_b'),
      latex: String.raw`m_b\lesssim6.5\quad \text{无论地震多大}` },
  ],
  links: {
    seealso: [
      { id: 'local-magnitude', note: t('地方震的对应标度', 'The local counterpart') },
      { id: 'mw-moment-magnitude', note: t('不饱和的替代', 'The non-saturating alternative') },
    ],
  },
  refs: [{ text: 'Gutenberg & Richter (1956), Bull. Seismol. Soc. Am., 46' }],
}

export default bodyWaveMagnitude
