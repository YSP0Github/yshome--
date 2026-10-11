import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** recursive-impedance-inversion */
const recursiveImpedanceInversion: FormulaCard = {
  id: 'recursive-impedance-inversion',
  name: t('递推波阻抗反演', 'Recursive Impedance Inversion'),
  aliases: { zh: ['递推反演', '道积分', '阻抗递推'], en: ['recursive inversion', 'trace integration', 'impedance recursion'] },
  node: 'S3.1',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.EXPL', 'METH.INV'],
    quantity: ['Q.MAT', 'Q.AMP'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`Z_{n+1} = Z_{n}\,\frac{1+r_{n}}{1-r_{n}}`,
    variants: [
      { name: t('对数形式（更稳定）', 'Logarithmic form (more stable)'), latex: String.raw`\ln Z_{n+1} = \ln Z_{n} + 2\,\mathrm{artanh}\,r_{n} \approx \ln Z_{n} + 2r_{n}` },
      { name: t('连续形式', 'Continuous form'), latex: String.raw`Z(t) = Z_{0}\exp\!\left(2\int_{0}^{t} r(\tau)\,d\tau\right)` },
      { name: t('密度恒定时退化为速度', 'Degenerates to velocity when density is constant'), latex: String.raw`v_{n+1} = v_{n}\frac{1+r_{n}}{1-r_{n}}` },
    ],
  },
  meaning: t(
    '反射系数序列逐层「积分」就能得到波阻抗剖面 —— 这是最简单的地震反演。它的致命弱点是误差累积：反射系数里哪怕只有一点点直流偏置，递推几十层之后阻抗就会漂移到离谱的量级。所以实际工作中必须靠测井低频模型来锚定趋势。',
    'Integrating the reflectivity series layer by layer recovers the impedance profile — the simplest seismic inversion. Its fatal weakness is error accumulation: even a tiny DC bias in the reflectivity makes the impedance drift wildly after a few tens of layers. In practice a well-log low-frequency model must anchor the trend.',
  ),
  symbols: [
    { sym: 'Z_{n}', name: t('第 n 层的波阻抗', 'impedance of layer n'), unit: 'kg/(m²·s)' },
    { sym: 'r_{n}', name: t('第 n 个界面的反射系数', 'reflection coefficient at interface n'), unit: '无量纲' },
    { sym: 'Z_{0}', name: t('初始（锚定）阻抗', 'initial (anchor) impedance'), unit: 'kg/(m²·s)' },
    { sym: '\\varepsilon', name: t('反射系数中的直流偏置', 'DC bias in the reflectivity'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('由已去除子波、标定为反射系数的地震道恢复相对波阻抗', 'Recovering relative impedance from a wavelet-free, reflectivity-calibrated trace')],
    assumes: [
      t('垂直入射、无多次波、无透射损失', 'Normal incidence, no multiples, no transmission loss'),
      t('Z₀ 已知或由测井给定', 'Z₀ is known or supplied by well logs'),
    ],
    breaks: [
      t('反射系数含噪声或偏置时低频趋势严重漂移', 'Noise or bias in the reflectivity makes the low-frequency trend drift badly'),
      t('强反射界面（|r| > 0.3）处递推公式对误差极其敏感', 'At strong reflectors (|r| > 0.3) the recursion is extremely sensitive to error'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('从反射系数定义出发', 'Start from the definition of reflectivity'),
      latex: String.raw`r_n = \frac{Z_{n+1}-Z_{n}}{Z_{n+1}+Z_{n}}` },
    { n: 2, op: 'algebra', title: t('解出 Z_{n+1}', 'Solve for Z_{n+1}'),
      latex: String.raw`r_n(Z_{n+1}+Z_n) = Z_{n+1}-Z_n \Longrightarrow Z_{n+1}(1-r_n) = Z_n(1+r_n)` },
    { n: 3, op: 'result', title: t('递推式', 'The recursion'),
      latex: String.raw`Z_{n+1} = Z_{n}\frac{1+r_{n}}{1-r_{n}}` },
    { n: 4, op: 'taylor', title: t('小反射系数时取对数线性化', 'Log-linearise for small reflectivity'),
      latex: String.raw`\ln\frac{1+r}{1-r} = 2\,\mathrm{artanh}\,r \approx 2r` },
    { n: 5, op: 'identity', title: t('写成积分形式', 'Integral form'),
      latex: String.raw`\ln Z(t) = \ln Z_0 + 2\int_0^t r(\tau)\,d\tau` },
  ],
  viz: [
    {
      id: 'recursive-drift',
      level: 'V2',
      title: t('反射系数偏置造成的阻抗漂移', 'Impedance drift caused by a reflectivity bias'),
      xlabel: t('层号 n', 'layer index n'),
      ylabel: t('波阻抗 Z', 'impedance Z'),
      controls: [
        { id: 'z0', label: t('初始阻抗 Z₀', 'initial impedance Z₀'), min: 2000, max: 12000, step: 100, value: 6000 },
        { id: 'eps', label: t('反射系数偏置 ε × 10³', 'reflectivity bias ε × 10³'), min: -10, max: 10, step: 0.1, value: 1.0 },
      ],
      note: t('把 ε 从 0 调到 0.001 试试 —— 一百层之后阻抗会完全跑偏。这就是递推反演不能独立使用的原因。', 'Try moving ε from 0 to 0.001 — after a hundred layers the impedance is completely off. That is why recursive inversion is never used alone.'),
      compute: (p) => {
        const z0 = p['z0'], eps = p['eps'] * 1e-3
        const truth: Array<[number, number]> = []
        const rec: Array<[number, number]> = []
        let zTrue = z0
        let zRec = z0
        truth.push([0, zTrue])
        rec.push([0, zRec])
        for (let n = 1; n <= 200; n++) {
          const zNextTrue = z0 * (1 + 0.25 * Math.sin((2 * Math.PI * n) / 80))
          const r = (zNextTrue - zTrue) / (zNextTrue + zTrue)
          zTrue = zNextTrue
          zRec = zRec * (1 + r + eps) / (1 - r - eps)
          truth.push([n, zTrue])
          rec.push([n, zRec])
        }
        return [
          { label: t('真实阻抗', 'true impedance'), color: '#185FA5', points: truth },
          { label: t('递推结果', 'recursive result'), color: '#993C1D', points: rec, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('偏置 0.001 的后果', 'Consequence of a 0.001 bias'),
    input: t('Z₀ = 6000，ε = 0.001，n = 200 层', 'Z₀ = 6000, ε = 0.001, n = 200 layers'),
    steps: [
      t('每层放大因子 ≈ (1+ε)/(1−ε) ≈ 1 + 2ε', 'Per-layer amplification ≈ (1+ε)/(1−ε) ≈ 1 + 2ε'),
      t('200 层后放大 ≈ (1.002)²⁰⁰ = 1.49 倍', 'After 200 layers the amplification ≈ (1.002)²⁰⁰ = 1.49×'),
    ],
    output: t('阻抗被抬高约 50%，完全掩盖真实地质趋势', 'The impedance is inflated by about 50%, completely masking the true geological trend'),
  },
  links: {
    upstream: [{ id: 'acoustic-reflection-coefficient', note: t('反射系数是输入', 'Reflectivity is the input') }],
    downstream: [{ id: 'synthetic-seismogram', note: t('反过来的过程是合成记录', 'The reverse process is synthetic seismograms') }],
    seealso: [{ id: 'reflectivity-log-conversion', note: t('与测井的换算关系', 'Conversion with well logs') }],
  },
  refs: [{ text: 'Russell, B. (1988). Introduction to Seismic Inversion Methods. SEG Course Notes' }],
}

export default recursiveImpedanceInversion
