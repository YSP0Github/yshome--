import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** seismic-moment-rate */
const seismicMomentRate: FormulaCard = {
  id: 'seismic-moment-rate',
  name: t('地震矩率与地壳应变率', 'Seismic Moment Rate & Crustal Strain Rate'),
  aliases: { zh: ['地震矩率', '矩率预算', '应变率'], en: ['seismic moment rate', 'moment budget', 'strain rate'] },
  node: 'S12.1',
  tags: {
    math: ['MATH.STAT', 'MATH.ALGEBRA'],
    method: ['METH.STAT', 'METH.HAZARD'],
    quantity: ['Q.SOURCE', 'Q.HAZARD'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`\dot{M}_0^{\text{seis}} = \frac{1}{T}\sum_i M_{0,i}
= \frac{a\,\beta\,10^{d}}{1.5-\beta/(\ln 10)}M_{\max}^{1.5-\beta/\ln 10}\ \ \text{的常用近似形式}`,
    variants: [
      { name: t('由 GR 律积分（连续形式）', 'Integrating the GR law (continuous form)'), latex: String.raw`\dot{M}_0 = \int_{-\infty}^{M_{\max}} 10^{1.5M + c}\,\lambda(M)\,\mathrm{d}M,\quad \lambda(M)=10^{a-bM}` },
      { name: t('归一化矩率', 'Normalised moment rate'), latex: String.raw`\dot{M}_0 = \frac{b}{1.5-b}\cdot\frac{10^{a+1.5c}}{\beta/\ln 10}\cdot 10^{(1.5-b)M_{\max}}` },
      { name: t('与 GPS 应变率的比较', 'Comparison with GPS strain rate'), latex: String.raw`\dot{M}_0^{\text{geo}} = 2\mu H\,A\,\dot{\varepsilon},\qquad R = \frac{\dot{M}_0^{\text{seis}}}{\dot{M}_0^{\text{geo}}}` },
      { name: t('复发间隔的矩平衡估计', 'Moment-balance estimate of the recurrence interval'), latex: String.raw`T_R = \frac{M_0^{\text{特征}}}{\dot{M}_0^{\text{seis}}}` },
    ],
  },
  meaning: t(
    '把一段时间内所有地震的地震矩加起来除以时间，得到「地震矩率」—— 它衡量一个地区由地震释放的构造变形有多快。把它和 GPS 测到的地壳应变率换算出的「几何矩率」相比，就得到地震耦合比：接近 1 说明变形几乎全靠地震释放（如俯冲带浅部），远小于 1 说明大部分变形以蠕动或塑性方式悄悄发生（如某些走滑段）。这个比值是评价一个断层段地震危险性的核心物理量。',
    'Summing the seismic moment of all earthquakes over a period and dividing by time gives the "seismic moment rate" — a measure of how fast a region releases tectonic deformation through earthquakes. Comparing it with the "geodetic moment rate" converted from GPS strain rate yields the seismic coupling ratio: near 1 means deformation is released almost entirely by earthquakes (e.g. the shallow part of subduction zones); far below 1 means most deformation occurs silently by creep or plastic flow (e.g. some strike-slip segments). This ratio is the core physical quantity for assessing the seismic hazard of a fault segment.',
  ),
  symbols: [
    { sym: '\\dot{M}_0', name: t('地震矩率', 'seismic moment rate'), unit: 'N·m/yr' },
    { sym: 'a, b', name: t('GR 律参数', 'GR law parameters'), unit: '—' },
    { sym: 'M_{\\max}', name: t('最大震级', 'maximum magnitude'), unit: '无量纲' },
    { sym: '\\dot{\\varepsilon}', name: t('地壳应变率', 'crustal strain rate'), unit: '1/yr' },
    { sym: 'R', name: t('地震耦合比', 'seismic coupling ratio'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('区域地震危险性评价、地震—大地测量对比、复发间隔估计', 'Regional hazard assessment, seismic–geodetic comparison, recurrence-interval estimation')],
    assumes: [t('目录完备且时段足够长（覆盖多个地震周期）', 'The catalogue is complete and the period long enough to cover several cycles')],
    breaks: [t('时段短于一个复发间隔时矩率估计严重偏低', 'The moment rate is badly underestimated when the period is shorter than one recurrence interval'), t('b 值或 M_max 变化时积分结果敏感', 'The integral is sensitive to changes in b or M_max')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('地震矩与震级的关系', 'Relation between moment and magnitude'), latex: String.raw`\log_{10}M_0 = 1.5M + c,\qquad c \approx 9.1` },
    { n: 2, op: 'identity', title: t('GR 律给出震级的发生率密度', 'The GR law gives the rate density of magnitudes'), latex: String.raw`\lambda(M) = 10^{a-bM}` },
    { n: 3, op: 'substitute', title: t('矩率 = 矩 × 发生率 的积分', 'Moment rate is the integral of moment times rate'), latex: String.raw`\dot{M}_0 = \int^{M_{\max}}10^{1.5M+c}\,10^{a-bM}\,\mathrm{d}M` },
    { n: 4, op: 'algebra', title: t('合并指数并积分', 'Combine exponents and integrate'), latex: String.raw`\dot{M}_0 = \frac{10^{a+c}}{\beta - 1.5\ln 10}\left[10^{(1.5-b)M}\right]^{M_{\max}}` },
    { n: 5, op: 'result', title: t('与大地测量矩率相比得到耦合比', 'Compare with the geodetic moment rate to obtain the coupling ratio'), latex: String.raw`R = \frac{\dot{M}_0^{\text{seis}}}{2\mu H A\dot{\varepsilon}}` },
  ],
  viz: [
    {
      id: 'moment-rate',
      level: 'V2',
      title: t('矩率如何随 b 值与最大震级变化', 'How moment rate varies with b and maximum magnitude'),
      xlabel: t('b 值', 'b value'),
      ylabel: t('log₁₀ 矩率 (N·m/yr)', 'log₁₀ moment rate (N·m/yr)'),
      controls: [
        { id: 'a', label: t('GR 参数 a (年发生率)', 'GR parameter a (annual rate)'), min: 2, max: 7, step: 0.05, value: 4.5 },
        { id: 'mmax', label: t('最大震级 M_max', 'maximum magnitude M_max'), min: 4, max: 9.5, step: 0.1, value: 7.5 },
      ],
      note: t('这是地震学里最反直觉的结论之一：b 值越大（小震相对越多），总矩率反而越小，因为大地震才贡献绝大部分矩。当 b 接近 1.5 时积分发散 —— 意味着「矩率完全由最大地震决定」，这时再用矩率做预报就失去意义了。', 'One of the most counter-intuitive results in seismology: a larger b (relatively more small events) gives a *smaller* total moment rate, because large earthquakes contribute almost all the moment. As b approaches 1.5 the integral diverges — meaning the moment rate is entirely determined by the largest event, at which point forecasting with moment rates loses meaning.'),
      compute: (p) => {
        const a = p['a'], mmax = p['mmax']
        const c = 9.1
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const b = 0.6 + (i / 200) * 1.3
          const k = 1.5 - b
          const v = Math.abs(k) < 1e-6
            ? a + c + b * mmax + Math.log10(mmax * Math.LN10)
            : Math.log10(Math.pow(10, a + c) * Math.pow(10, k * mmax) / Math.abs(k))
          pts.push([b, v])
        }
        return [{ label: t('log₁₀ 矩率', 'log₁₀ moment rate'), color: '#185FA5', points: pts }]
      },
    },
    {
      id: 'coupling',
      level: 'V1',
      title: t('地震耦合比的含义', 'Meaning of the seismic coupling ratio'),
      xlabel: t('地震矩率 / 几何矩率', 'seismic / geodetic moment rate'),
      ylabel: t('相对危险性', 'relative hazard'),
      controls: [{ id: 'skew', label: t('曲线陡度', 'curve steepness'), min: 0.5, max: 5, step: 0.1, value: 2 }],
      note: t('耦合比接近 1 意味着「地壳在积累的应变几乎全部会在地震中释放」—— 短期内危险性高；接近 0 则意味着断层以蠕动方式释放，大震潜力小。真实断层上的耦合比在空间上变化很大，这正是锁定区（asperity）成像要测的东西。', 'A coupling ratio near 1 means "almost all the strain the crust accumulates will be released in earthquakes" — high short-term hazard; near 0 means the fault releases strain by creep and has little potential for large events. Real coupling ratios vary strongly in space, which is exactly what asperity imaging aims to measure.'),
      compute: (p) => {
        const sk = p['skew']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const r = (i / 200)
          pts.push([r, 1 - Math.exp(-sk * r)])
        }
        return [{ label: t('相对危险性', 'relative hazard'), color: '#993C1D', points: pts }]
      },
    },
  ],
  example: {
    title: t('俯冲带的矩平衡', 'Moment balance for a subduction zone'),
    input: t('a = 5.0，b = 1.0，M_max = 9.0', 'a = 5.0, b = 1.0, M_max = 9.0'),
    steps: [
      t('k = 1.5 − 1.0 = 0.5', 'k = 1.5 − 1.0 = 0.5'),
      t('log₁₀ Ṁ₀ = 5.0 + 9.1 + 0.5×9.0 − log₁₀0.5 = 14.6 + 0.30 = 14.9', 'log₁₀ Ṁ₀ = 5.0 + 9.1 + 0.5×9.0 − log₁₀0.5 = 14.6 + 0.30 = 14.9'),
    ],
    output: t('Ṁ₀ ≈ 8×10¹⁴ N·m/yr，与大型俯冲带的 GPS 观测同量级', 'Ṁ₀ ≈ 8×10¹⁴ N·m/yr, the same order as GPS observations for large subduction zones'),
  },
  links: {
    upstream: [
      { id: 'gutenberg-richter-law', note: t('GR 律是积分的起点', 'The GR law is the starting point of the integral') },
      { id: 'mw-moment-magnitude', note: t('矩—震级换算关系', 'The moment–magnitude conversion') },
    ],
    downstream: [{ id: 'psha-integral', note: t('矩率约束震源的发生率', 'Moment rate constrains source rates in PSHA') }],
    seealso: [{ id: 'earthquake-scaling-laws', note: t('标度律给出 M_max 与破裂尺度的关系', 'Scaling laws relate M_max to rupture dimension') }],
  },
  refs: [{ text: 'Kostrov (1974), Seismic moment and energy of earthquakes, and seismic flow of rock, Izv. Phys. Solid Earth 1, 23–40' }],
}

export default seismicMomentRate
