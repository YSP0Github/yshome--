import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** love-wave-higher-modes */
const loveWaveHigherModes: FormulaCard = {
  id: 'love-wave-higher-modes',
  name: t('面波高阶模态', 'Higher Surface-wave Modes'),
  aliases: { zh: ['高阶模', '模态叠加', '频散分支'], en: ['higher modes', 'mode superposition', 'dispersion branches'] },
  node: 'S5.1',
  tags: {
    math: ['MATH.ROOT', 'MATH.FOURIER'],
    method: ['METH.SURF'],
    quantity: ['Q.VEL', 'Q.FREQ'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`\omega H\eta_{1} = \arctan\!\left(\frac{\mu_2\hat{\eta}_2}{\mu_1\eta_1}\right) + n\pi,\qquad n = 0,1,2,\dots`,
    variants: [
      { name: t('第 n 阶模的截止频率', 'Cut-off frequency of mode n'), latex: String.raw`f_c^{(n)} = \frac{n\beta_1\beta_2}{2H\sqrt{\beta_2^{2}-\beta_1^{2}}}` },
      { name: t('总波场是所有模的叠加', 'The total field is the sum over all modes'), latex: String.raw`u(x,t) = \sum_{n} A_n(x,t)\,e^{i(\omega t - k_n x)}` },
      { name: t('高频极限', 'High-frequency limit'), latex: String.raw`f\to\infty:\ c_n \to \beta_1\ \text{对任意 } n` },
    ],
  },
  meaning: t(
    '一层低速夹层不止能导一个波，而是能导一整族：基阶模加无数个高阶模。每个高阶模都有自己的截止频率，只有在频率高于截止值时才存在。短周期面波记录之所以看起来「乱」，正是因为多个模态叠在一起 —— 忽略这一点会让频散反演得到的 Vs 剖面系统性偏快。',
    'A low-velocity layer guides not one wave but a whole family: the fundamental mode plus infinitely many higher modes. Each higher mode has its own cut-off frequency and exists only above it. Short-period surface-wave records look messy precisely because several modes superpose — ignoring this biases the inverted Vs profile systematically fast.',
  ),
  symbols: [
    { sym: 'n', name: t('模态阶次（0 = 基阶）', 'mode order (0 = fundamental)'), unit: '无量纲' },
    { sym: 'H', name: t('夹层厚度', 'layer thickness'), unit: 'km' },
    { sym: '\\eta_{1}', name: t('层内垂直慢度', 'vertical slowness in the layer'), unit: 's/km' },
    { sym: 'f_c^{(n)}', name: t('第 n 阶模的截止频率', 'cut-off frequency of mode n'), unit: 'Hz' },
    { sym: '\\beta_1, \\beta_2', name: t('层内与半空间的 S 波速度', 'S velocity in the layer and half-space'), unit: 'km/s' },
  ],
  conditions: {
    applies: [t('短周期面波频散分析、高阶模反演', 'Short-period dispersion analysis and higher-mode inversion')],
    assumes: [
      t('水平层状介质', 'Horizontally layered media'),
      t('β₁ < β₂（低速夹层）', 'β₁ < β₂ (low-velocity layer)'),
    ],
    breaks: [
      t('横向非均匀时模态之间发生耦合', 'Modes couple in laterally heterogeneous media'),
      t('强衰减使高阶模在传播中快速消失', 'Strong attenuation makes higher modes vanish quickly'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('频散方程含正切函数，天然多解', 'The dispersion equation contains a tangent, hence multiple roots'),
      latex: String.raw`\tan(\omega H\eta_1) = \frac{\mu_2\hat{\eta}_2}{\mu_1\eta_1}` },
    { n: 2, op: 'identity', title: t('正切周期为 π，故解可写成 + nπ', 'The tangent has period π, so roots come as + nπ'),
      latex: String.raw`\omega H\eta_1 = \arctan(\cdots) + n\pi` },
    { n: 3, op: 'algebra', title: t('截止时 c = β₂，即 η̂₂ = 0', 'At cut-off c = β₂ so η̂₂ = 0'),
      latex: String.raw`c\to\beta_2:\ \hat{\eta}_2=0 \Longrightarrow \omega H\eta_1 = n\pi` },
    { n: 4, op: 'substitute', title: t('代入 η₁ 的表达式', 'Insert the expression for η₁'),
      latex: String.raw`\eta_1 = \sqrt{\frac{1}{\beta_1^{2}}-\frac{1}{\beta_2^{2}}} = \frac{\sqrt{\beta_2^{2}-\beta_1^{2}}}{\beta_1\beta_2}` },
    { n: 5, op: 'result', title: t('解出截止频率', 'Solve for the cut-off frequency'),
      latex: String.raw`f_c^{(n)} = \frac{n\beta_1\beta_2}{2H\sqrt{\beta_2^{2}-\beta_1^{2}}}` },
  ],
  viz: [
    {
      id: 'love-modes',
      level: 'V2',
      title: t('Love 波前三个模态的频散曲线', 'Dispersion curves of the first three Love modes'),
      xlabel: t('周期 T (s)', 'period T (s)'),
      ylabel: t('相速度 c (km/s)', 'phase velocity c (km/s)'),
      controls: [
        { id: 'b1', label: t('层内 β₁ (km/s)', 'layer β₁ (km/s)'), min: 0.5, max: 3, step: 0.02, value: 1.2 },
        { id: 'b2', label: t('半空间 β₂ (km/s)', 'half-space β₂ (km/s)'), min: 1.5, max: 4.5, step: 0.02, value: 3.2 },
        { id: 'H', label: t('层厚 H (km)', 'layer thickness H (km)'), min: 0.5, max: 20, step: 0.1, value: 4 },
      ],
      note: t('高阶模在长周期处消失、在短周期处陆续出现，并全部趋向 β₁ —— 这就是频散图上「多支」的来源。', 'Higher modes vanish at long period, appear successively at short period, and all converge to β₁ — the origin of multiple branches on a dispersion diagram.'),
      compute: (p) => {
        const b1 = p['b1'], b2 = p['b2'], H = p['H']
        const mu = 1
        const F = (c: number, w: number, n: number) => {
          const e1 = Math.sqrt(1 / (b1 * b1) - 1 / (c * c))
          const e2 = Math.sqrt(1 / (c * c) - 1 / (b2 * b2))
          return w * H * e1 - Math.atan((mu * e2) / (mu * e1)) - n * Math.PI
        }
        const out: Array<{ label: any; color: string; points: Array<[number, number]> }> = []
        const cols = ['#185FA5', '#993C1D', '#0F6E56']
        for (let n = 0; n < 3; n++) {
          const pts: Array<[number, number]> = []
          for (let i = 0; i <= 160; i++) {
            const T = 1 + (i / 160) * 39
            const w = (2 * Math.PI) / T
            let lo = b1 * 1.0000001
            let hi = b2 * 0.9999999
            let c = NaN
            if (F(lo, w, n) < 0 && F(hi, w, n) > 0) {
              for (let it = 0; it < 80; it++) {
                const mid = (lo + hi) / 2
                if (F(mid, w, n) > 0) hi = mid
                else lo = mid
              }
              c = (lo + hi) / 2
            }
            if (Number.isFinite(c)) pts.push([T, c])
          }
          out.push({ label: t('第 ' + n + ' 阶模', 'mode ' + n), color: cols[n], points: pts })
        }
        return out
      },
    },
  ],
  example: {
    title: t('一阶模何时出现', 'When does the first higher mode appear'),
    input: t('β₁ = 1.2，β₂ = 3.2 km/s，H = 4 km', 'β₁ = 1.2, β₂ = 3.2 km/s, H = 4 km'),
    steps: [
      t('√(β₂²−β₁²) = √(10.24−1.44) = 2.966', '√(β₂²−β₁²) = √(10.24−1.44) = 2.966'),
      t('f_c^(1) = 1×1.2×3.2/(2×4×2.966) = 0.162 Hz，即周期 6.2 s', 'f_c^(1) = 1×1.2×3.2/(2×4×2.966) = 0.162 Hz, i.e. a period of 6.2 s'),
    ],
    output: t('周期短于 6.2 s 时一阶模开始出现，频散图上出现第二支', 'Below 6.2 s period the first higher mode appears and a second branch shows up'),
  },
  links: {
    upstream: [{ id: 'love-wave-dispersion', note: t('基阶模的频散方程', 'The fundamental-mode dispersion equation') }],
    seealso: [{ id: 'phase-group-velocity', note: t('群速度与相速度的换算', 'Converting between group and phase velocity') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §7.4' }],
}

export default loveWaveHigherModes
