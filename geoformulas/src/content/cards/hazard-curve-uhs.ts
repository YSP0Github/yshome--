import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** hazard-curve-uhs */
const hazardCurveUhs: FormulaCard = {
  id: 'hazard-curve-uhs',
  name: t('危险性曲线与一致危险谱', 'Hazard Curves & the Uniform Hazard Spectrum'),
  aliases: { zh: ['危险性曲线', 'UHS', '超越概率'], en: ['hazard curve', 'UHS', 'exceedance probability'] },
  node: 'S11.5',
  tags: {
    math: ['MATH.STAT', 'MATH.ALGEBRA'],
    method: ['METH.HAZARD'],
    quantity: ['Q.HAZARD'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\lambda(Y > y) = \sum_{i=1}^{N_s}\nu_i\int\!\!\int P(Y > y \mid m, r)\,f_M(m)\,f_R(r)\,\mathrm{d}m\,\mathrm{d}r`,
    variants: [
      { name: t('泊松模型下的超越概率', 'Exceedance probability under the Poisson model'), latex: String.raw`P(Y>y\ \text{in}\ T) = 1 - e^{-\lambda(y)T}` },
      { name: t('由年超越概率换算回归期', 'Converting annual exceedance probability to return period'), latex: String.raw`T_R = \frac{1}{\lambda(y)}` },
      { name: t('50 年超越概率 10% 对应的年概率', 'Annual probability corresponding to 10% in 50 years'), latex: String.raw`\lambda = -\frac{\ln(1-0.10)}{50} = 0.0021\ \text{/年}\ \Rightarrow T_R \approx 475\ \text{年}` },
      { name: t('一致危险谱的定义', 'Definition of the uniform hazard spectrum'), latex: String.raw`\mathrm{UHS}(T) = \{y:\ \lambda(Y(T) > y) = \lambda_{\text{目标}}\} `},
    ],
  },
  meaning: t(
    '概率地震危险性分析的输出是一条「危险性曲线」：横轴是地震动强度，纵轴是每年被超越的概率。曲线通常在小地震动处接近 1、在大地震动处拖着一条长尾。把多个周期的危险性曲线在同一超越概率处横切一刀，就得到一致危险谱（UHS）—— 它是规范设计谱的来源。要注意 UHS 并不是任何一次真实地震的谱：每一个周期点来自不同的震级—距离组合，因此它偏保守。',
    'The output of probabilistic seismic hazard analysis is a "hazard curve": ground-motion intensity on the horizontal axis, annual probability of exceedance on the vertical. The curve is near 1 for small motions and has a long tail for large ones. Slicing the hazard curves of many periods at the same exceedance probability gives the uniform hazard spectrum (UHS) — the source of code design spectra. Note that the UHS is not the spectrum of any real earthquake: each period point comes from a different magnitude–distance combination, so it is deliberately conservative.',
  ),
  symbols: [
    { sym: '\\lambda(Y>y)', name: t('年超越率', 'annual exceedance rate'), unit: '1/year' },
    { sym: '\\nu_i', name: t('第 i 个震源的年发生率', 'annual rate of source i'), unit: '1/year' },
    { sym: 'P(Y>y\\mid m,r)', name: t('GMPE 给出的超越概率', 'exceedance probability from the GMPE'), unit: '无量纲' },
    { sym: 'T_R', name: t('回归期', 'return period'), unit: 'year' },
    { sym: '\\mathrm{UHS}(T)', name: t('一致危险谱', 'uniform hazard spectrum'), unit: 'g' },
  ],
  conditions: {
    applies: [t('地震区划图编制、工程场址危险性分析、设计地震动确定', 'Seismic zonation maps, site-specific hazard analysis, determining design motion')],
    assumes: [t('地震发生为泊松过程、GMPE 及其不确定性已知', 'Earthquake occurrence is Poisson; the GMPE and its uncertainty are known')],
    breaks: [t('时间相关（如 BPT）模型下不能用简单的 1 − e^{−λT}', 'With time-dependent models such as BPT the simple 1 − e^{−λT} does not hold'), t('近断层脉冲型地震动需另外处理', 'Near-fault pulse-like motion needs separate treatment')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('对所有震源、所有震级、所有距离求和', 'Sum over all sources, magnitudes and distances'), latex: String.raw`\lambda(Y>y) = \sum_i \nu_i \iint P(Y>y\mid m,r)f_M f_R\,\mathrm{d}m\,\mathrm{d}r` },
    { n: 2, op: 'identity', title: t('GMPE 给出 ln Y 的正态分布', 'The GMPE gives a normal distribution for ln Y'), latex: String.raw`P(Y>y\mid m,r) = 1-\Phi\!\left(\frac{\ln y - \overline{\ln Y}}{\sigma_{\ln Y}}\right)` },
    { n: 3, op: 'physics', title: t('泊松过程下 T 年内至少超越一次的概率', 'Probability of at least one exceedance in T years under a Poisson process'), latex: String.raw`P = 1-e^{-\lambda T}` },
    { n: 4, op: 'algebra', title: t('由目标概率反解年率', 'Invert the target probability to obtain the annual rate'), latex: String.raw`\lambda = -\frac{\ln(1-P_{\text{目标}})}{T}` },
    { n: 5, op: 'result', title: t('在每个周期 T 上求 λ⁻¹(λ_目标)，即得 UHS', 'At each period T evaluate λ⁻¹(λ_target) to obtain the UHS'), latex: String.raw`\mathrm{UHS}(T) = \lambda_T^{-1}(\lambda_{\text{目标}})` },
  ],
  viz: [
    {
      id: 'haz-curve',
      level: 'V2',
      title: t('危险性曲线及其对参数的敏感性', 'Hazard curve and its sensitivity to parameters'),
      xlabel: t('PGA (g)', 'PGA (g)'),
      ylabel: t('年超越概率', 'annual exceedance probability'),
      controls: [
        { id: 'nu', label: t('年发生率 ν (1/年)', 'annual rate ν (1/year)'), min: 0.001, max: 0.2, step: 0.001, value: 0.02 },
        { id: 'sig', label: t('GMPE 标准差 σ_lnY', 'GMPE standard deviation σ_lnY'), min: 0.2, max: 1.2, step: 0.02, value: 0.65 },
        { id: 'med', label: t('中位 PGA (g)', 'median PGA (g)'), min: 0.02, max: 1.5, step: 0.01, value: 0.25 },
      ],
      note: t('关键的反直觉结论：σ 越大（不确定性越大），大地震动的年超越概率反而越高 —— 因为分布的上尾被拉长了。这就是为什么「不确定性」本身会推高危险性：在概率框架里， ignorance 不是中性的。', 'A key counter-intuitive result: the larger σ (the greater the uncertainty), the higher the annual probability of large ground motion — because the upper tail of the distribution is stretched. That is why uncertainty itself raises hazard: in a probabilistic framework, ignorance is not neutral.'),
      compute: (p) => {
        const nu = p['nu'], sg = p['sig'], med = p['med']
        const erf = (x: number) => {
          const s = x < 0 ? -1 : 1
          const xa = Math.abs(x)
          const tt = 1 / (1 + 0.3275911 * xa)
          const y = 1 - (((((1.061405429 * tt - 1.453152027) * tt) + 1.421413741) * tt - 0.284496736) * tt + 0.254829592) * tt * Math.exp(-xa * xa)
          return s * y
        }
        const Phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2))
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const y = 0.01 + (i / 300) * 1.99
          const z = (Math.log(y) - Math.log(med)) / sg
          const pex = 1 - Phi(z)
          const lam = nu * pex
          pts.push([y, 1 - Math.exp(-lam)])
        }
        return [{ label: t('年超越概率', 'annual exceedance probability'), color: '#185FA5', points: pts }]
      },
    },
    {
      id: 'uhs-build',
      level: 'V1',
      title: t('从多条危险性曲线构造一致危险谱', 'Building the UHS from several hazard curves'),
      xlabel: t('周期 T (s)', 'period T (s)'),
      ylabel: t('谱加速度 S_a (g)', 'spectral acceleration S_a (g)'),
      controls: [{ id: 'lam', label: t('目标年超越概率', 'target annual probability'), min: 0.0002, max: 0.02, step: 0.0002, value: 0.0021 }],
      note: t('在每个周期上找到「年超越概率等于目标值」的谱值，连成一条线就是 UHS。它比任何单条真实记录谱都平滑，而且在高周期（> 1 s）处往往偏高 —— 因为长周期主要由远震大地震控制，而这些事件的贡献在不同周期上并不来自同一次地震。', 'At each period find the spectral value whose annual exceedance probability equals the target; joining them gives the UHS. It is smoother than any single real record spectrum and tends to be high at long periods (> 1 s), because long periods are controlled mainly by large distant earthquakes whose contributions at different periods do not come from the same event.'),
      compute: (p) => {
        const lamT = p['lam']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 100; i++) {
          const T = 0.05 + (i / 100) * 4.95
          // 简化的中位谱形：短周期平台、0.2–1 s 峰、长周期衰减
          const shape = T < 0.2 ? 1 + 1.6 * (T / 0.2) : T < 1 ? 2.6 * Math.pow(0.2 / T, 0.55) : 2.6 * Math.pow(0.2, 0.55) / Math.pow(T, 0.9)
          const sig = 0.65
          const med = 0.12 * shape
          // 反解：1 − exp(−ν·P) = lamT ⇒ P = −ln(1−lamT)/ν
          const nu = 0.05
          const pex = -Math.log(1 - lamT) / nu
          const z = -Math.log(pex) // 近似：由 1−Φ(z)=pex 反解
          const sa = med * Math.exp(sig * Math.min(z, 3))
          pts.push([T, sa])
        }
        return [{ label: t('一致危险谱 UHS', 'uniform hazard spectrum'), color: '#993C1D', points: pts }]
      },
    },
  ],
  example: {
    title: t('475 年回归期的含义', 'The meaning of the 475-year return period'),
    input: t('50 年超越概率 10%', '10% probability of exceedance in 50 years'),
    steps: [
      t('λ = −ln(1 − 0.10)/50 = 0.00211 /年', 'λ = −ln(1 − 0.10)/50 = 0.00211 /year'),
      t('T_R = 1/λ = 475 年', 'T_R = 1/λ = 475 years'),
    ],
    output: t('这是中国抗震规范「中震」（50 年 10%）的标准定义', 'This is the standard definition of the "moderate earthquake" (10% in 50 years) in the Chinese seismic code'),
  },
  links: {
    upstream: [
      { id: 'psha-integral', note: t('PSHA 积分给出危险性曲线', 'The PSHA integral gives the hazard curve') },
      { id: 'gmpe-functional-form', note: t('GMPE 提供中位值与 σ', 'The GMPE provides the median and σ') },
    ],
    downstream: [{ id: 'response-spectrum-oscillator', note: t('UHS 最终用于结构设计', 'The UHS ends up driving structural design') }],
    seealso: [{ id: 'brownian-passage-time', note: t('时间相关模型改变 λ 的定义', 'Time-dependent models change the definition of λ') }],
  },
  refs: [{ text: 'McGuire (2004), Seismic Hazard and Risk Analysis, EERI Monograph MNO-10' }],
}

export default hazardCurveUhs
