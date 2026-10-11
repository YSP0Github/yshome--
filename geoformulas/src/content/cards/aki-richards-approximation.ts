import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** aki-richards-approximation */
const akiRichardsApproximation: FormulaCard = {
  id: 'aki-richards-approximation',
  name: t('Aki–Richards 近似式', 'The Aki–Richards Approximation'),
  aliases: { zh: ['Aki-Richards 方程', 'AVO 三项近似'], en: ['Aki-Richards equation', 'three-term AVO'] },
  node: 'S3.3',
  tags: {
    math: ['MATH.APPROX', 'MATH.ALGEBRA'],
    method: ['METH.EXPL'],
    quantity: ['Q.AMP', 'Q.VEL'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`R_{PP}(\theta)\approx\frac{1}{2\cos^{2}\theta}\frac{\Delta\alpha}{\alpha}-4\frac{\beta^{2}}{\alpha^{2}}\sin^{2}\theta\,\frac{\Delta\beta}{\beta}+\frac{1}{2}\left(1-4\frac{\beta^{2}}{\alpha^{2}}\sin^{2}\theta\right)\frac{\Delta\rho}{\rho}`,
    variants: [
      { name: t('定义：差与平均', 'Definitions: contrast and average'), latex: String.raw`\Delta\alpha=\alpha_2-\alpha_1,\quad \alpha=\frac{\alpha_1+\alpha_2}{2},\quad \frac{\Delta\alpha}{\alpha}\approx\frac{1}{2}\frac{\Delta Z}{Z}\ \text{当}\ \frac{\Delta\rho}{\rho}\ll\frac{\Delta\alpha}{\alpha}` },
      { name: t('垂直入射时退化为声学式', 'Normal-incidence limit'), latex: String.raw`R_{PP}(0)=\frac{1}{2}\left(\frac{\Delta\alpha}{\alpha}+\frac{\Delta\rho}{\rho}\right)=\frac{\Delta Z}{2Z}\cdot 2=\frac{Z_2-Z_1}{Z_2+Z_1}` },
    ],
  },
  meaning: t(
    '这是把 Zoeppritz 精确解在「介质参数反差很小」的条件下线性化后的结果。它把反射系数拆成三个独立贡献：速度项、剪切模量项、密度项，各自带不同的角度权重 —— 正是这种可分离性让 AVO 反演成为可能。',
    'This is the Zoeppritz exact solution linearised under the assumption of small parameter contrasts. It splits the reflection coefficient into three independent contributions — velocity, shear and density — each with a different angular weight. That separability is exactly what makes AVO inversion feasible.',
  ),
  symbols: [
    { sym: 'R_{PP}(\\theta)', name: t('P→P 反射系数', 'P-to-P reflection coefficient'), unit: '无量纲', typical: '−0.3 – 0.3' },
    { sym: '\\theta', name: t('入射角（P 波）', 'P-wave incidence angle'), unit: '°', typical: '0 – 45' },
    { sym: '\\Delta\\alpha/\\alpha', name: t('P 波速度相对反差', 'fractional P-velocity contrast'), unit: '无量纲' },
    { sym: '\\Delta\\beta/\\beta', name: t('S 波速度相对反差', 'fractional S-velocity contrast'), unit: '无量纲' },
    { sym: '\\Delta\\rho/\\rho', name: t('密度相对反差', 'fractional density contrast'), unit: '无量纲' },
    { sym: '\\beta^{2}/\\alpha^{2}', name: t('速度比平方，常用 γ = (β/α)² ≈ 0.25', 'squared velocity ratio, often γ = (β/α)² ≈ 0.25'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('弱反差界面的 P→P 反射，入射角小于临界角', 'P-to-P reflection from a weak-contrast interface, below the critical angle')],
    assumes: [
      t('Δα/α、Δβ/β、Δρ/ρ 都远小于 1', 'Δα/α, Δβ/β and Δρ/ρ are all much less than 1'),
      t('保留到反差的一阶项', 'Terms are retained to first order in the contrasts'),
      t('介质各向同性、弹性', 'Isotropic, elastic media'),
    ],
    breaks: [
      t('强反差界面（如海底、盐丘顶）误差可达 20% 以上', 'Strong-contrast interfaces such as the seafloor or salt flanks can err by over 20%'),
      t('接近临界角时完全失效，必须回到 Zoeppritz', 'It fails completely near the critical angle; return to Zoeppritz'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('从 Zoeppritz 的四个边界条件出发', 'Start from the four Zoeppritz conditions'),
      latex: String.raw`\text{位移连续（2 条）}+\text{牵引力连续（2 条）}` },
    { n: 2, op: 'taylor', title: t('假设界面两侧参数反差很小', 'Assume small contrasts across the interface'),
      latex: String.raw`\alpha_2=\alpha+\frac{\Delta\alpha}{2},\quad \alpha_1=\alpha-\frac{\Delta\alpha}{2},\quad \beta_2=\beta+\frac{\Delta\beta}{2},\ \ldots`,
      note: t('用平均值加半差表示两侧，这样一阶展开的记号最干净。', 'Writing both sides as mean plus/minus half-difference keeps the first-order expansion tidy.') },
    { n: 3, op: 'taylor', title: t('保留一阶、丢掉二阶交叉项', 'Keep first order, drop second-order cross terms'),
      latex: String.raw`O\!\left(\frac{\Delta\alpha}{\alpha}\cdot\frac{\Delta\beta}{\beta}\right)\to 0`,
      note: t('例如 (Δα/α)(Δρ/ρ) 这类乘积项全部忽略。', 'Products such as (Δα/α)(Δρ/ρ) are discarded.') },
    { n: 4, op: 'algebra', title: t('整理出三个角度权重', 'Collect three angular weights'),
      latex: String.raw`R_{PP}(\theta)=A+B\sin^{2}\theta+C\sin^{2}\theta\tan^{2}\theta`,
      note: t('注意 1/cos²θ = 1 + tan²θ，所以速度项里藏着一个远角会爆炸的 tan²θ 项。', 'Since 1/cos²θ = 1 + tan²θ, the velocity term hides a tan²θ term that blows up at far offsets.') },
    { n: 5, op: 'result', title: t('写成标准的三项形式', 'The standard three-term form'),
      latex: String.raw`R_{PP}(\theta)\approx\frac{1}{2\cos^{2}\theta}\frac{\Delta\alpha}{\alpha}-4\gamma\sin^{2}\theta\,\frac{\Delta\beta}{\beta}+\frac{1}{2}\left(1-4\gamma\sin^{2}\theta\right)\frac{\Delta\rho}{\rho},\quad \gamma=\frac{\beta^{2}}{\alpha^{2}}` },
  ],
  viz: [
    {
      id: 'aki-richards-angle',
      level: 'V1',
      title: t('三项各自的贡献随角度的变化', 'Angular contribution of each of the three terms'),
      xlabel: t('入射角 θ (°)', 'incidence angle θ (°)'),
      ylabel: t('反射系数 R_PP', 'reflection coefficient R_PP'),
      controls: [
        { id: 'ga', label: t('Δα/α', 'Δα/α'), min: -0.3, max: 0.3, step: 0.01, value: 0.1 },
        { id: 'gb', label: t('Δβ/β', 'Δβ/β'), min: -0.3, max: 0.3, step: 0.01, value: 0.15 },
        { id: 'gr', label: t('Δρ/ρ', 'Δρ/ρ'), min: -0.3, max: 0.3, step: 0.01, value: 0.05 },
      ],
      note: t('把 S 波反差调成与 P 波反差同号/反号，就能看出 AVO 的 III 类与 IV 类差异。', 'Set the S contrast in phase or out of phase with the P contrast to see class III versus class IV AVO behaviour.'),
      compute: (p) => {
        const ga = p['ga'], gb = p['gb'], gr = p['gr']
        const gamma = 0.25
        const tot: Array<[number, number]> = []
        const sA: Array<[number, number]> = []
        const sB: Array<[number, number]> = []
        const sR: Array<[number, number]> = []
        for (let i = 0; i <= 180; i++) {
          const th = (i / 180) * 60
          const rad = (th * Math.PI) / 180
          const s2 = Math.sin(rad) ** 2
          const c2 = Math.cos(rad) ** 2
          const a = (1 / (2 * c2)) * ga
          const b = -4 * gamma * s2 * gb
          const r = 0.5 * (1 - 4 * gamma * s2) * gr
          tot.push([th, a + b + r])
          sA.push([th, a])
          sB.push([th, b])
          sR.push([th, r])
        }
        return [
          { label: t('R_PP 合计', 'R_PP total'), color: '#185FA5', points: tot },
          { label: t('速度项', 'velocity term'), color: '#0F6E56', points: sA, dash: true },
          { label: t('剪切项', 'shear term'), color: '#BA7517', points: sB, dash: true },
          { label: t('密度项', 'density term'), color: '#993C1D', points: sR, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('典型含气砂岩顶界面', 'A typical gas-sand top interface'),
    input: t('Δα/α = −0.08，Δβ/β = +0.05，Δρ/ρ = −0.05，γ = 0.25', 'Δα/α = −0.08, Δβ/β = +0.05, Δρ/ρ = −0.05, γ = 0.25'),
    steps: [
      t('θ = 0°：R = 0.5(−0.08 − 0.05) = −0.065', 'θ = 0°: R = 0.5(−0.08 − 0.05) = −0.065'),
      t('θ = 30°：sin²θ = 0.25，1/cos²θ = 1.333', 'θ = 30°: sin²θ = 0.25, 1/cos²θ = 1.333'),
      t('R = 0.667(−0.08) − 4(0.25)(0.25)(0.05) + 0.5(1−0.25)(−0.05) = −0.053 − 0.0125 − 0.0188 = −0.084', 'R = 0.667(−0.08) − 4(0.25)(0.25)(0.05) + 0.5(1−0.25)(−0.05) = −0.053 − 0.0125 − 0.0188 = −0.084'),
    ],
    output: t('反射系数随角度变负得更快 —— 这是 AVO III 类（亮点）的典型特征', 'The reflection coefficient becomes more negative with angle — the hallmark of a class III (bright spot) AVO response'),
  },
  links: {
    upstream: [
      { id: 'zoeppritz-boundary-conditions', note: t('它的一阶线性化', 'Its first-order linearisation') },
      { id: 'acoustic-reflection-coefficient', note: t('θ = 0 时的极限', 'The θ = 0 limit') },
    ],
    seealso: [{ id: 'shuey-approximation', note: t('另一种参量化', 'An alternative parameterisation') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2.3' }],
}

export default akiRichardsApproximation
