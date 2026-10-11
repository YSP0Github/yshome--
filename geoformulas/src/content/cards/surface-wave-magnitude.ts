import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** surface-wave-magnitude */
const surfaceWaveMagnitude: FormulaCard = {
  id: 'surface-wave-magnitude',
  name: t('面波震级 M_s', 'Surface-wave Magnitude M_s'),
  aliases: { zh: ['Ms', '面波震级'], en: ['surface-wave magnitude', 'Ms', '20-second magnitude'] },
  node: 'S4.2',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.GEOM'],
    method: ['METH.TELE'],
    quantity: ['Q.SOURCE', 'Q.AMP'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`M_s=\log_{10}\left(\frac{A}{T}\right)_{\max}+1.66\log_{10}\Delta+3.3`,
    variants: [
      { name: t('适用震中距范围', 'Applicable epicentral distance range'), latex: String.raw`20^{\circ}<\Delta<160^{\circ}` },
      { name: t('IASPEI 标准形式', 'The IASPEI standard form'), latex: String.raw`M_s=\log_{10}\left(\frac{A}{T}\right)_{\max}+\sigma(\Delta),\qquad \sigma(\Delta)=1.66\log_{10}\Delta+3.3` },
      { name: t('饱和行为', 'Saturation behaviour'), latex: String.raw`M_s\ \text{在约}\ 8.0\text{–}8.3\ \text{饱和}` },
    ],
  },
  meaning: t(
    '用 20 秒周期左右的瑞利波振幅定义的震级。因为面波周期长、能量大，它比 m_b 能撑到更大的震级才饱和（约 8.0–8.3），所以在矩震级普及之前，M_s 是描述大地震的标准。今天 M_s 仍被保留，一个重要原因是它能与海啸预警、历史地震目录衔接。',
    'Magnitude defined from Rayleigh-wave amplitude near 20 s period. Because surface waves are long-period and energetic, M_s survives to much larger sizes than m_b before saturating (around 8.0–8.3), so it was the standard for great earthquakes before Mw became common. M_s is still retained today largely because it connects to tsunami warning practice and to historical catalogues.',
  ),
  symbols: [
    { sym: 'M_s', name: t('面波震级', 'surface-wave magnitude'), unit: '无量纲', typical: '4 – 8.5' },
    { sym: 'A', name: t('瑞利波最大地动位移', 'maximum Rayleigh-wave ground displacement'), unit: 'μm' },
    { sym: 'T', name: t('对应周期', 'corresponding period'), unit: 's', typical: '18 – 22' },
    { sym: '\\Delta', name: t('震中距（度）', 'epicentral distance (degrees)'), unit: '°', typical: '20 – 160' },
  ],
  conditions: {
    applies: [t('远震、浅源地震的 20 s 瑞利波', 'Teleseismic, shallow events with 20 s Rayleigh waves')],
    assumes: [t('震源深度浅（h < 40 km 左右）', 'Source depth is shallow (roughly h < 40 km)')],
    breaks: [t('深震基本不激发长周期面波，M_s 无法测量', 'Deep events barely excite long-period surface waves, so M_s cannot be measured')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('取面波振幅与周期之比', 'Take the ratio of surface-wave amplitude to period'),
      latex: String.raw`\frac{A}{T}\propto\text{地面速度}` },
    { n: 2, op: 'geometry', title: t('面波按柱面扩散', 'Surface waves spread cylindrically'),
      latex: String.raw`A\propto\frac{1}{\sqrt{r}}\;\Longrightarrow\; \text{距离校正项}\ \approx1.66\log_{10}\Delta` },
    { n: 3, op: 'result', title: t('加上常数定标', 'Add the constant calibration'),
      latex: String.raw`M_s=\log_{10}\frac{A}{T}+1.66\log_{10}\Delta+3.3` },
  ],
  links: {
    seealso: [
      { id: 'body-wave-magnitude', note: t('短周期对应标度', 'The short-period counterpart') },
      { id: 'mw-moment-magnitude', note: t('不饱和的现代标度', 'The non-saturating modern scale') },
    ],
  },
  refs: [{ text: 'IASPEI standard (IASPEI Seismological Tables)' }],
}

export default surfaceWaveMagnitude
