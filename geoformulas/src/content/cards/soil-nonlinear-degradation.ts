import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** soil-nonlinear-degradation */
const soilNonlinearDegradation: FormulaCard = {
  id: 'soil-nonlinear-degradation',
  name: t('土的非线性：模量衰减与阻尼增长', 'Soil Nonlinearity: Modulus Degradation & Damping Growth'),
  aliases: { zh: ['土的非线性', 'G/Gmax 曲线', '阻尼比曲线', '等效线性化'], en: ['soil nonlinearity', 'G/Gmax curve', 'damping curve', 'equivalent linearisation'] },
  node: 'S11.3',
  tags: {
    math: ['MATH.APPROX', 'MATH.DIFF'],
    method: ['METH.HAZARD'],
    quantity: ['Q.HAZARD', 'Q.MAT'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`\frac{G}{G_{\max}} = \frac{1}{1+\left(\dfrac{\gamma}{\gamma_r}\right)^{a}},\qquad
D = D_{\min} + \frac{D_{\max}\,\left(\dfrac{\gamma}{\gamma_r}\right)^{b}}{1+\left(\dfrac{\gamma}{\gamma_r}\right)^{b}}`,
    variants: [
      { name: t('参考剪应变', 'Reference shear strain'), latex: String.raw`\gamma_r = \frac{\tau_{\max}}{G_{\max}}` },
      { name: t('Hardin–Drnevich 双曲线模型', 'The Hardin–Drnevich hyperbolic model'), latex: String.raw`\frac{G}{G_{\max}} = \frac{1}{1+\gamma/\gamma_r}\ \ (a = 1)` },
      { name: t('等效线性化迭代', 'Equivalent-linear iteration'), latex: String.raw`G^{(k+1)}, D^{(k+1)} \leftarrow f\big(\gamma_{\text{eff}}^{(k)} = 0.65\,\gamma_{\max}^{(k)}\big)` },
      { name: t('由 G 的衰减推算共振频率的移动', 'Shift of resonance frequency inferred from G degradation'), latex: String.raw`f_0 \propto V_S = \sqrt{G/\rho} \Longrightarrow \frac{f_0^{\text{非线性}}}{f_0^{\text{线性}}} = \sqrt{\frac{G}{G_{\max}}}` },
    ],
  },
  meaning: t(
    '土层在大震中并不是线性的：剪应变一大，剪切模量就掉、阻尼就涨。后果有两个 —— 共振频率向低频移动（因为 Vs 降低），以及高频成分被额外吸收。1985 年墨西哥城和 1995 年神户都观测到强震期间场地主频明显下降，这正是非线性的直接证据。忽略非线性会高估高频地震动，在软土场地上尤其危险。',
    'Soil is not linear during strong shaking: as shear strain grows, the shear modulus falls and damping rises. There are two consequences — the resonance frequency shifts to lower frequency (because Vs drops) and high-frequency content is additionally absorbed. Both the 1985 Mexico City and 1995 Kobe earthquakes showed a clear drop in site dominant frequency during strong shaking, direct evidence of nonlinearity. Ignoring nonlinearity overestimates high-frequency ground motion, which is especially dangerous on soft-soil sites.',
  ),
  symbols: [
    { sym: 'G/G_{\\max}', name: t('归一化剪切模量', 'normalised shear modulus'), unit: '无量纲' },
    { sym: '\\gamma', name: t('剪应变', 'shear strain'), unit: '无量纲' },
    { sym: '\\gamma_r', name: t('参考剪应变（G 降到一半处）', 'reference shear strain (where G halves)'), unit: '无量纲' },
    { sym: 'D', name: t('阻尼比', 'damping ratio'), unit: '无量纲' },
    { sym: 'a, b', name: t('曲线形状参数', 'curve-shape parameters'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('土层地震反应分析、场地放大评估、设计谱的场地修正', 'Soil seismic-response analysis, site amplification assessment, site correction of design spectra')],
    assumes: [t('等效线性化：用恒定 G、D 近似一个循环内的非线性行为', 'Equivalent linearisation: constant G, D approximate the nonlinear behaviour over a cycle')],
    breaks: [t('应变极大、接近液化时需完全非线性本构', 'Fully nonlinear constitutive models are needed at very large strain near liquefaction'), t('等效线性化在高频与低频两端都高估响应', 'Equivalent linearisation overestimates response at both high and low frequency')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('由循环剪切试验测得 G 与 D 随 γ 的变化', 'Cyclic shear tests give G and D versus γ'), latex: String.raw`G(\gamma),\ D(\gamma)` },
    { n: 2, op: 'physics', title: t('骨干曲线在小应变处趋于 G_max，大应变处趋于零', 'The backbone curve tends to G_max at small strain and to zero at large strain'), latex: String.raw`\gamma \to 0:\ G\to G_{\max};\qquad \gamma\to\infty:\ G\to 0` },
    { n: 3, op: 'substitute', title: t('用 Hardin–Drnevich 型双曲函数拟合', 'Fit with a Hardin–Drnevich-type hyperbola'), latex: String.raw`\frac{G}{G_{\max}} = \frac{1}{1+(\gamma/\gamma_r)^{a}}` },
    { n: 4, op: 'identity', title: t('阻尼随应变单调增长并趋于上限', 'Damping grows monotonically with strain toward an upper bound'), latex: String.raw`D = D_{\min}+\frac{D_{\max}(\gamma/\gamma_r)^{b}}{1+(\gamma/\gamma_r)^{b}}` },
    { n: 5, op: 'result', title: t('迭代：用有效应变更新 G、D 直至自洽', 'Iterate: update G and D with the effective strain until self-consistent'), latex: String.raw`\gamma_{\text{eff}} = 0.65\,\gamma_{\max}` },
  ],
  viz: [
    {
      id: 'modulus-curve',
      level: 'V2',
      title: t('模量衰减曲线与阻尼增长曲线', 'Modulus degradation and damping growth curves'),
      xlabel: t('剪应变 γ (log)', 'shear strain γ (log)'),
      ylabel: t('G/G_max 与 D', 'G/G_max and D'),
      controls: [
        { id: 'gr', label: t('参考应变 γ_r', 'reference strain γ_r'), min: 0.00005, max: 0.005, step: 0.00005, value: 0.0005 },
        { id: 'a', label: t('形状参数 a', 'shape parameter a'), min: 0.6, max: 1.4, step: 0.02, value: 1 },
        { id: 'dmax', label: t('最大阻尼 D_max', 'maximum damping D_max'), min: 0.05, max: 0.35, step: 0.005, value: 0.2 },
      ],
      note: t('两条曲线是一枚硬币的两面：G 掉到一半的地方（γ = γ_r）恰好是阻尼快速上升的地方。粘土比砂土的 γ_r 大得多，因此在同样应变下保持线性更久 —— 这就是为什么软粘土场地在大震中的非线性效应反而可能弱于砂土。', 'The two curves are two sides of one coin: where G has halved (γ = γ_r) is exactly where damping rises fastest. Clay has a much larger γ_r than sand, so it stays linear to higher strain — which is why soft-clay sites may show weaker nonlinearity under strong shaking than sand sites.'),
      compute: (p) => {
        const gr = p['gr'], a = p['a'], dmax = p['dmax']
        const gg: Array<[number, number]> = []
        const dd: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const lg = -5 + (i / 300) * 4
          const g = Math.pow(10, lg)
          const r = Math.pow(g / gr, a)
          gg.push([lg, 1 / (1 + r)])
          dd.push([lg, 0.01 + (dmax * r) / (1 + r)])
        }
        return [
          { label: t('G/G_max', 'G/G_max'), color: '#185FA5', points: gg },
          { label: t('阻尼比 D', 'damping ratio D'), color: '#993C1D', points: dd },
        ]
      },
    },
    {
      id: 'nonlin-shift',
      level: 'V2',
      title: t('共振频率随地震动强度的移动', 'Resonance frequency shift with shaking intensity'),
      xlabel: t('频率 (Hz)', 'frequency (Hz)'),
      ylabel: t('放大倍数', 'amplification'),
      controls: [
        { id: 'f0', label: t('线性共振频率 (Hz)', 'linear resonance frequency (Hz)'), min: 0.3, max: 6, step: 0.05, value: 1.2 },
        { id: 'strain', label: t('剪应变（对数）', 'shear strain (log)'), min: -4.5, max: -1, step: 0.05, value: -3.5 },
        { id: 'damp', label: t('小应变阻尼', 'small-strain damping'), min: 0.01, max: 0.1, step: 0.005, value: 0.03 },
      ],
      note: t('应变增大时谱峰向低频移动并变矮变宽 —— 这两点正是强震记录中经常看到的场地响应变化。把应变从 10⁻⁴·⁵ 调到 10⁻²·⁵，可以看到主频下降近一半。这意味着「用弱震记录测得的场地周期」在强震中会偏短，如果直接用于设计会低估长周期结构的响应。', 'As strain grows the spectral peak moves to lower frequency and becomes shorter and broader — exactly the site-response change often seen in strong-motion records. Sweeping strain from 10⁻⁴·⁵ to 10⁻²·⁵ drops the dominant frequency by nearly half. That means "the site period measured from weak-motion records" is too short in strong shaking, and using it directly in design underestimates the response of long-period structures.'),
      compute: (p) => {
        const f0 = p['f0'], lg = p['strain'], dmin = p['damp']
        const g = Math.pow(10, lg)
        const gr = 5e-4
        const ratio = 1 / (1 + g / gr)
        const fn = f0 * Math.sqrt(ratio)
        const D = dmin + (0.22 * (g / gr)) / (1 + g / gr)
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const f = 0.05 + (i / 400) * 4.95
          const x = f / fn
          const den = Math.sqrt((1 - x * x) * (1 - x * x) + (2 * D * x) * (2 * D * x))
          pts.push([f, Math.max(0.15, 1 / Math.max(den, 0.1))])
        }
        const lin: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const f = 0.05 + (i / 400) * 4.95
          const x = f / f0
          const den = Math.sqrt((1 - x * x) * (1 - x * x) + (2 * dmin * x) * (2 * dmin * x))
          lin.push([f, Math.max(0.15, 1 / Math.max(den, 0.1))])
        }
        return [
          { label: t('线性响应', 'linear response'), color: '#888780', points: lin },
          { label: t('非线性响应（f₀ → ' + fn.toFixed(2) + ' Hz）', 'nonlinear response (f₀ → ' + fn.toFixed(2) + ' Hz)'), color: '#185FA5', points: pts },
        ]
      },
    },
  ],
  example: {
    title: t('墨西哥城的主频下降', 'The dominant-frequency drop in Mexico City'),
    input: t('线性共振 0.5 Hz，强震中 G/G_max 降到 0.4', 'Linear resonance 0.5 Hz; G/G_max drops to 0.4 during strong shaking'),
    steps: [
      t('f₀^非线性 = 0.5 × √0.4 = 0.316 Hz', 'f₀^nonlinear = 0.5 × √0.4 = 0.316 Hz'),
      t('主周期从 2.0 s 拉长到 3.2 s', 'The dominant period lengthens from 2.0 s to 3.2 s'),
    ],
    output: t('共振周期明显拉长，与强震记录中观测到的谱峰移动一致', 'The resonance period lengthens markedly, consistent with the peak shift observed in strong-motion records'),
  },
  links: {
    upstream: [
      { id: 'quarter-wavelength-amplification', note: t('线性情形给出基准共振频率', 'The linear case gives the baseline resonance frequency') },
      { id: 'damping-ratio', note: t('阻尼比的定义', 'Definition of the damping ratio') },
    ],
    downstream: [{ id: 'vs30-site-term', note: t('Vs30 场地项是非线性的工程简化', 'The Vs30 site term is the engineering simplification of nonlinearity') }],
    seealso: [{ id: 'site-amplification-hv', note: t('H/V 峰值频率在小应变下测得', 'The H/V peak frequency is measured at small strain') }],
  },
  refs: [{ text: 'Hardin & Drnevich (1972), Shear modulus and damping in soils: measurement and parameter effects, J. Soil Mech. Found. Div. 98, 603–624' }],
}

export default soilNonlinearDegradation
