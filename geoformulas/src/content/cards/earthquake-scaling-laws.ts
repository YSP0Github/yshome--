import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** earthquake-scaling-laws */
const earthquakeScalingLaws: FormulaCard = {
  id: 'earthquake-scaling-laws',
  name: t('震源自相似尺度律', 'Self-similar Source Scaling Laws'),
  aliases: { zh: ['尺度律', '自相似'], en: ['source scaling', 'self-similarity', 'Kanamori-Anderson'] },
  node: 'S4.3',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.STAT'],
    method: ['METH.TELE'],
    quantity: ['Q.SOURCE', 'Q.GEOM'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`M_0\propto L^{3},\qquad \bar{D}\propto L,\qquad \Delta\sigma=\text{常数}`,
    variants: [
      { name: t('Kanamori–Anderson 关系', 'The Kanamori–Anderson relation'), latex: String.raw`\log_{10}M_0=\frac{3}{2}M_S+\text{const}\;\Longrightarrow\; M_w\propto\frac{2}{3}\log_{10}M_0-\text{const}` },
      { name: t('矩—面积经验关系', 'Empirical moment–area relation'), latex: String.raw`A\approx10^{\,M_w-4}\ \text{km}^2\quad\text{（粗略估计）}` },
      { name: t('滑移—长度比（应变降）', 'Slip-to-length ratio (strain drop)'), latex: String.raw`\frac{\bar{D}}{L}\approx10^{-5}\text{–}10^{-4}` },
    ],
  },
  meaning: t(
    '自相似假设说：大地震和小地震在几何上只是「按比例放大」，应力降与应变降都不随大小变化。它把 M₀、破裂面积、平均滑移、应力降四个量锁成一套自洽关系，只要测到其中两个就能推出另外两个。实测上这套关系在 Mw 6–9 之间吻合得不错，但在小震端和大震端都有争议。',
    'The self-similar hypothesis says large and small earthquakes differ only by geometric scaling, with stress drop and strain drop independent of size. It locks moment, rupture area, average slip and stress drop into a self-consistent set: measure any two and the other two follow. Observationally the relations hold reasonably between Mw 6 and 9, but remain controversial at both the small and large ends.',
  ),
  symbols: [
    { sym: 'M_0', name: t('地震矩', 'seismic moment'), unit: 'N·m' },
    { sym: 'L', name: t('破裂特征尺度', 'characteristic rupture dimension'), unit: 'm' },
    { sym: '\\bar{D}', name: t('平均滑移', 'average slip'), unit: 'm' },
    { sym: '\\Delta\\sigma', name: t('应力降', 'stress drop'), unit: 'Pa' },
    { sym: 'A', name: t('破裂面积', 'rupture area'), unit: 'm²' },
  ],
  conditions: {
    applies: [t('构造地震的一阶尺度估算', 'First-order scaling estimates for tectonic earthquakes')],
    assumes: [t('断层几何自相似、应力降恒定', 'Fault geometry is self-similar and stress drop is constant')],
    breaks: [
      t('大海啸地震（tsunami earthquake）破裂尺度异常大、应力降异常小', 'Tsunami earthquakes have anomalously large rupture dimensions and small stress drops'),
      t('小震（Mw < 3）应力降是否恒定仍有争议', 'Whether stress drop is constant for Mw < 3 remains debated'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('写出地震矩', 'Write the seismic moment'),
      latex: String.raw`M_0=\mu\,A\,\bar{D}` },
    { n: 2, op: 'setup', title: t('自相似：A ∝ L²，D̄ ∝ L', 'Self-similarity: A ∝ L², D̄ ∝ L'),
      latex: String.raw`A\propto L^{2},\qquad \bar{D}\propto L` },
    { n: 3, op: 'substitute', title: t('代入 M₀', 'Substitute into M₀'),
      latex: String.raw`M_0\propto L^{2}\cdot L=L^{3}` },
    { n: 4, op: 'setup', title: t('应力降的尺度依赖', 'Scaling of stress drop'),
      latex: String.raw`\Delta\sigma\sim\frac{\mu\bar{D}}{L}\propto\frac{L}{L}=\text{常数}` },
    { n: 5, op: 'result', title: t('推出矩震级关系', 'Derive the moment–magnitude relation'),
      latex: String.raw`\log_{10}M_0=1.5\,M_w+9.1` },
  ],
  viz: [
    {
      id: 'scaling-curves',
      level: 'V1',
      title: t('破裂尺度、滑移量与地震矩随震级的变化', 'Rupture dimension, slip and moment versus magnitude'),
      xlabel: t('矩震级 Mw', 'moment magnitude Mw'),
      ylabel: t('数值（对数）', 'value (log)'),
      yScale: 'log',
      controls: [
        { id: 'ds', label: t('应力降 Δσ', 'stress drop Δσ'), min: 0.1, max: 10, step: 0.1, value: 3, unit: 'MPa' },
      ],
      compute: (p) => {
        const ds = p['ds'] * 1e6
        const mu = 3e10
        const L: Array<[number, number]> = []
        const D: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const mw = 2 + (i / 200) * 7
          const m0 = Math.pow(10, 1.5 * mw + 9.1)
          const a = Math.pow((7 * m0) / (16 * ds), 1 / 3)
          L.push([mw, a])
          D.push([mw, m0 / (mu * Math.PI * a * a)])
        }
        return [
          { label: t('破裂半径 a (m)', 'rupture radius a (m)'), color: '#185FA5', points: L },
          { label: t('平均滑移 D̄ (m)', 'average slip D̄ (m)'), color: '#0F6E56', points: D },
        ]
      },
      note: t('震级每加 2 级，破裂半径增大 10 倍、滑移增大 10 倍、地震矩增大 1000 倍。', 'Each two magnitude units multiply the rupture radius by 10, the slip by 10 and the moment by 1000.'),
    },
  ],
  links: {
    upstream: [
      { id: 'seismic-moment', note: t('M₀ 的定义', 'Definition of M₀') },
      { id: 'static-stress-drop', note: t('Δσ 的定义', 'Definition of Δσ') },
    ],
    seealso: [{ id: 'corner-frequency-source-dimension', note: t('从频谱测震源尺度', 'Measuring source dimension from spectra') }],
  },
  refs: [{ text: 'Kanamori & Anderson (1975), Bull. Seismol. Soc. Am., 65' }],
}

export default earthquakeScalingLaws
