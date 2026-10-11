import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** reflection-hyperbola */
const reflectionHyperbola: FormulaCard = {
  id: 'reflection-hyperbola',
  name: t('水平层反射时距方程（双曲关系）', 'Reflection Travel-time Equation for a Horizontal Layer'),
  aliases: { zh: ['双曲时距', '走时曲线', 'NMO 方程'], en: ['hyperbolic travel time', 'moveout', 'NMO'] },
  node: 'S2.3',
  tags: {
    math: ['MATH.GEOM', 'MATH.APPROX'],
    method: ['METH.EXPL'],
    quantity: ['Q.TIME', 'Q.VEL'],
  },
  audience: 'bachelor',
  complete: 'L4',
  statement: {
    main: String.raw`t^{2}=t_{0}^{2}+\frac{x^{2}}{v^{2}}`,
    variants: [
      { name: t('显式解出 t', 'Solved for t'), latex: String.raw`t(x)=\sqrt{t_{0}^{2}+x^{2}/v^{2}}` },
      { name: t('层状介质用均方根速度', 'Layered media use rms velocity'), latex: String.raw`t^{2}=t_{0}^{2}+\frac{x^{2}}{v_{\mathrm{rms}}^{2}},\qquad v_{\mathrm{rms}}^{2}=\frac{\sum v_i^{2}t_i}{\sum t_i}` },
      { name: t('倾斜界面（倾角 φ）', 'Dipping interface (dip φ)'), latex: String.raw`t^{2}=t_{0}^{2}+\frac{x^{2}\cos^{2}\varphi}{v^{2}}` },
    ],
  },
  meaning: t(
    '一条双曲线。整个反射地震勘探的速度分析、动校正、水平叠加，全部建立在这一个二次关系上。改用一个参数——叠加前的 CMP 道集上每个同相轴都是它。',
    'A single hyperbola. Velocity analysis, NMO correction and CMP stacking in reflection seismology all rest on this one quadratic relation — every event on a pre-stack CMP gather is one of these.',
  ),
  symbols: [
    { sym: 't', name: t('双程反射走时', 'two-way reflection travel time'), unit: 's', typical: '0.5 – 5 s' },
    { sym: 't_0', name: t('零偏移距双程走时', 'zero-offset two-way travel time'), unit: 's' },
    { sym: 'x', name: t('炮检距（偏移距）', 'offset (source–receiver distance)'), unit: 'm', typical: '100 – 6000 m' },
    { sym: 'v', name: t('上覆介质速度（层状时为 v_rms）', 'velocity above the reflector'), unit: 'm/s' },
    { sym: 'z', name: t('反射界面深度', 'reflector depth'), unit: 'm' },
    { sym: 'v_{\\mathrm{rms}}', name: t('均方根速度', 'root-mean-square velocity'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('单一水平反射界面，上覆速度恒定或可用 v_rms 近似的水平层状介质', 'Single horizontal reflector, constant velocity or a layered medium well approximated by v_rms')],
    assumes: [
      t('各向同性、界面倾角为零', 'Isotropic, zero dip'),
      t('只追踪同类波，不发生波型转换', 'Single mode, no conversions'),
    ],
    breaks: [
      t('倾角不为零时必须引入 cos φ 或做 DMO', 'Non-zero dip requires the cos φ term or DMO'),
      t('大偏移距 x/z ≳ 1：需高阶非双曲校正', 'Large offsets x/z ≳ 1 need non-hyperbolic correction'),
    ],
  },
  derivation: [
    { n: 1, op: 'geometry', title: t('由对称性：反射点在炮检中点正上方', 'By symmetry the reflection point sits above the midpoint'),
      latex: String.raw`\ell=\sqrt{z^{2}+\left(\frac{x}{2}\right)^{2}}`,
      note: t('整段推导唯一的物理输入，剩下的全是代数。', 'The only physical input of the whole derivation; everything else is algebra.') },
    { n: 2, op: 'physics', title: t('双程路径除以速度', 'Two-way path divided by speed'),
      latex: String.raw`t=\frac{2\ell}{v}=\frac{2}{v}\sqrt{z^{2}+\frac{x^{2}}{4}}` },
    { n: 3, op: 'setup', title: t('定义 t₀ 并消去不可直接观测的 z', 'Define t₀ and eliminate the unobservable z'),
      latex: String.raw`t_{0}=\frac{2z}{v}\;\Longleftrightarrow\; z=\frac{v\,t_{0}}{2}`,
      note: t('把 z 换成可从剖面上直接读出的 t₀，这是地震处理里反复出现的技巧。', 'Swapping z for the directly readable t₀ is a trick that recurs throughout seismic processing.') },
    { n: 4, op: 'substitute', title: t('代入并化简', 'Substitute and simplify'),
      latex: String.raw`t=\sqrt{\frac{4z^{2}}{v^{2}}+\frac{x^{2}}{v^{2}}}=\sqrt{t_{0}^{2}+\frac{x^{2}}{v^{2}}}` },
    { n: 5, op: 'result', title: t('标准形式', 'Standard form'),
      latex: String.raw`t^{2}=t_{0}^{2}+\frac{x^{2}}{v^{2}}\qquad\text{（在 }(x,t)\text{ 平面上是一条双曲线）}` },
    { n: 6, op: 'taylor', title: t('（附）小偏移距展开：NMO 校正量', '(Appendix) small-offset expansion: the NMO correction'),
      latex: String.raw`\Delta t_{\mathrm{NMO}}=t-t_{0}\simeq\frac{x^{2}}{2v^{2}t_{0}}\quad (x\ll v t_{0})`,
      note: t('校正量随偏移距平方增长 —— 远道被拉得很厉害，这就是实际处理中必须做拉伸切除（stretch mute）的原因。', 'The correction grows as the square of offset — far traces get stretched hard, which is why stretch muting is mandatory in practice.') },
  ],
  viz: [
    {
      id: 'nmo-family',
      level: 'V1',
      title: t('时距曲线随速度的展布', 'Travel-time curves for different velocities'),
      xlabel: t('偏移距 x (m)', 'offset x (m)'),
      ylabel: t('双程走时 t (s)', 'two-way time t (s)'),
      controls: [
        { id: 't0', label: t('零偏移距走时 t₀', 'zero-offset time t₀'), min: 0.3, max: 4, step: 0.05, value: 1.0, unit: 's' },
        { id: 'vc', label: t('速度 v', 'velocity v'), min: 1500, max: 5000, step: 50, value: 2500, unit: 'm/s' },
      ],
      xRange: [0, 6000],
      note: t('速度越大曲线越「平」。速度分析做的事反过来看：已知曲线的弯曲程度，反算出 v。', 'Faster velocities make the flatter curves. Velocity analysis simply runs this backwards: given the curvature, recover v.'),
      compute: (p) => {
        const t0 = p['t0'], v = p['vc']
        const out: Array<{ label: { zh: string; en: string }; color: string; points: Array<[number, number]> }> = []
        const palette = ['#A32D2D', '#BA7517', '#639922', '#185FA5', '#7F77DD']
        ;[0.7, 0.85, 1.0, 1.2, 1.5].forEach((mult, i) => {
          const vv = v * mult
          const pts: Array<[number, number]> = []
          for (let k = 0; k <= 300; k++) {
            const x = (k / 300) * 6000
            pts.push([x, Math.sqrt(t0 * t0 + (x * x) / (vv * vv))])
          }
          const label = t(`v = ${Math.round(vv)} m/s`, `v = ${Math.round(vv)} m/s`)
          out.push({ label, color: palette[i % palette.length], points: pts })
        })
        return out
      },
    },
    {
      id: 'nmo-correction',
      level: 'V1',
      title: t('NMO 校正量 vs 偏移距', 'NMO correction versus offset'),
      xlabel: t('偏移距 x (m)', 'offset x (m)'),
      ylabel: t('Δt_NMO (s)', 'Δt_NMO (s)'),
      controls: [
        { id: 't0b', label: t('零偏移距走时 t₀', 'zero-offset time t₀'), min: 0.3, max: 4, step: 0.05, value: 1.0, unit: 's' },
        { id: 'vb', label: t('速度 v', 'velocity v'), min: 1500, max: 5000, step: 50, value: 2500, unit: 'm/s' },
      ],
      xRange: [0, 6000],
      note: t('浅层（t₀ 小）时校正量暴涨，且|x|较大时近似值与精确值明显分叉 —— 这正是浅层远道必须切除的定量依据。', 'For shallow events (small t₀) the correction blows up, and the approximation visibly diverges from the exact curve at large offsets — the quantitative basis for muting shallow far traces.'),
      compute: (p) => {
        const t0 = p['t0b'], v = p['vb']
        const exact: Array<[number, number]> = []
        const approx: Array<[number, number]> = []
        for (let k = 0; k <= 300; k++) {
          const x = (k / 300) * 6000
          const t = Math.sqrt(t0 * t0 + (x * x) / (v * v))
          exact.push([x, t - t0])
          approx.push([x, (x * x) / (2 * v * v * t0)])
        }
        return [
          { label: t('精确 √(t₀²+x²/v²) − t₀', 'exact √(t₀²+x²/v²) − t₀'), color: '#185FA5', points: exact },
          { label: t('近似 x²/(2v²t₀)', 'approx x²/(2v²t₀)'), color: '#A32D2D', dash: true, points: approx },
        ]
      },
    },
  ],
  example: {
    title: t('典型浅层工业 Data', 'Typical shallow industrial data'),
    input: t('t₀ = 0.5 s，v = 1800 m/s，x = 1800 m', 't₀ = 0.5 s, v = 1800 m/s, x = 1800 m'),
    steps: [
      t('x²/v² = 1800²/1800² = 1.0 s²', 'x²/v² = 1800²/1800² = 1.0 s²'),
      t('t = √(0.25 + 1.0) = 1.118 s', 't = √(0.25 + 1.0) = 1.118 s'),
      t('Δt_NMO = 0.618 s', 'Δt_NMO = 0.618 s'),
    ],
    output: t('校正量达到原始 t₀ 的 124%，子波被拉长一倍以上 —— 必须切除', 'The correction reaches 124% of t₀, stretching the wavelet more than twofold — mute is required'),
  },
  links: {
    upstream: [
      { id: 'snell-ray-parameter' },
      { id: 'harmonic-plane-wave' },
    ],
    downstream: [
      { id: 'acoustic-reflection-coefficient', note: t('同一界面上还要决定振幅', 'The same interface also sets amplitudes') },
    ],
  },
  refs: [
    { text: 'Yilmaz, Seismic Data Analysis, Vol. 1, Ch. 3' },
    { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §4.3' },
  ],

}

export default reflectionHyperbola
