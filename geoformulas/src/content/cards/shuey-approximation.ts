import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** shuey-approximation */
const shueyApproximation: FormulaCard = {
  id: 'shuey-approximation',
  name: t('Shuey AVO 近似式', 'The Shuey AVO Approximation'),
  aliases: { zh: ['AVO', '振幅随偏移距变化', 'Shuey'], en: ['AVO', 'amplitude versus offset', 'Shuey'] },
  node: 'S3.3',
  tags: {
    math: ['MATH.APPROX'],
    method: ['METH.EXPL'],
    quantity: ['Q.AMP', 'Q.GEOM'],
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`R(\theta)\simeq R_{0}+G\sin^{2}\theta`,
    variants: [
      { name: t('截距与梯度', 'Intercept and gradient'), latex: String.raw`R_{0}=\frac{1}{2}\!\left(\frac{\Delta\alpha}{\alpha}+\frac{\Delta\rho}{\rho}\right),\qquad G=\frac{1}{2}\frac{\Delta\alpha}{\alpha}-2\frac{\beta^{2}}{\alpha^{2}}\!\left(2\frac{\Delta\beta}{\beta}+\frac{\Delta\rho}{\rho}\right)` },
      { name: t('三项式', 'Three-term form'), latex: String.raw`R(\theta)\simeq R_{0}+G\sin^{2}\theta+F\sin^{2}\theta\left(\tan^{2}\theta-1\right),\quad F=\frac{1}{2}\frac{\Delta\alpha}{\alpha}` },
    ],
  },
  meaning: t(
    '把「垂直入射的反射系数」和「反射系数随入射角怎么变」分开。前者由波阻抗决定，后者对泊松比极敏感 —— 而含气会让泊松比骤降。所以 AVO 异常（负梯度、III 类）本质是找 Poisson 比异常。',
    'It separates the vertical-incidence reflectivity from how that reflectivity changes with angle. The first comes from impedance; the second is highly sensitive to Poisson ratio — and gas makes Poisson ratio drop sharply. AVO anomalies are, at heart, Poisson-ratio anomalies.',
  ),
  symbols: [
    { sym: 'R(\\theta)', name: t('入射角 θ 处的 P 波反射系数', 'P-wave reflection coefficient at incidence angle θ'), unit: '', dimension: '无量纲' },
    { sym: 'R_0', name: t('AVO 截距（垂直入射 R）', 'AVO intercept (normal-incidence R)'), unit: '', dimension: '无量纲' },
    { sym: 'G', name: t('AVO 梯度', 'AVO gradient'), unit: '', dimension: '无量纲' },
    { sym: '\\theta', name: t('入射角', 'incidence angle'), unit: '°' },
    { sym: '\\alpha,\\beta', name: t('界面两侧平均的 P、S 波速度', 'average P and S velocities across the interface'), unit: 'm/s' },
    { sym: '\\Delta\\alpha', name: t('α₂ − α₁', 'α₂ − α₁'), unit: 'm/s' },
  ],
  conditions: {
    applies: [t('反射系数 ≲ 0.3，弹性参数反差较小', 'Reflection coefficients ≲ 0.3, small elastic contrasts')],
    assumes: [
      t('把 α、β、ρ 当作两侧的平均值，反差用差分表示', 'α, β, ρ are treated as averages with difference terms'),
      t('忽略多次波与透射损失', 'Multiples and transmission losses ignored'),
    ],
    breaks: [
      t('大角度（> 40°）或强反差：必须用完整 Zoeppritz', 'Large angles (> 40°) or strong contrast: the full Zoeppritz equations are required'),
      t('强各向异性层会改变 θ 的有效值', 'Strong anisotropy changes the effective θ'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('从 Aki–Richards 线性化形式出发', 'Start from the Aki–Richards linearised form'),
      latex: String.raw`R(\theta)\simeq\frac{1}{2\cos^{2}\theta}\frac{\Delta\alpha}{\alpha}-4\frac{\beta^{2}}{\alpha^{2}}\sin^{2}\theta\,\frac{\Delta\beta}{\beta}+\frac{1}{2}\!\left(1-4\frac{\beta^{2}}{\alpha^{2}}\sin^{2}\theta\right)\frac{\Delta\rho}{\rho}`,
      note: t('这是对完整 Zoeppritz 方程在「弹性参数反差很小」下一阶展开的结果。', 'This is the first-order expansion of the full Zoeppritz equations for small elastic contrasts.') },
    { n: 2, op: 'identity', title: t('把 1/cos²θ 展开到 θ 的一阶小量', 'Expand 1/cos²θ to first order in θ'),
      latex: String.raw`\frac{1}{\cos^{2}\theta}=1+\tan^{2}\theta\simeq 1+\sin^{2}\theta` },
    { n: 3, op: 'substitute', title: t('代入并整理', 'Substitute and regroup'),
      latex: String.raw`R(\theta)=\underbrace{\frac{1}{2}\!\left(\frac{\Delta\alpha}{\alpha}+\frac{\Delta\rho}{\rho}\right)}_{R_0}+\underbrace{\left[\frac{1}{2}\frac{\Delta\alpha}{\alpha}-4\frac{\beta^{2}}{\alpha^{2}}\frac{\Delta\beta}{\beta}-2\frac{\beta^{2}}{\alpha^{2}}\frac{\Delta\rho}{\rho}\right]}_{G}\sin^{2}\theta` },
    { n: 4, op: 'algebra', title: t('合并梯度中 κ 的两项', 'Collect the two terms in the gradient'),
      latex: String.raw`G=\frac{1}{2}\frac{\Delta\alpha}{\alpha}-2\frac{\beta^{2}}{\alpha^{2}}\!\left(2\frac{\Delta\beta}{\beta}+\frac{\Delta\rho}{\rho}\right)` },
    { n: 5, op: 'result', title: t('得到 Shuey 两项式', 'The Shuey two-term formula'),
      latex: String.raw`R(\theta)\simeq R_{0}+G\sin^{2}\theta` },
    { n: 6, op: 'result', title: t('物理读数', 'Reading it physically'),
      latex: String.raw`\frac{\beta^{2}}{\alpha^{2}}=\frac{1-2\nu}{2(1-\nu)}`,
      note: t('梯度项带着 β²/α²，也就是带着泊松比 ν。含气使 ν 下降 ⇒ β²/α² 上升 ⇒ G 变负 ⇒ 出现「振幅随偏移距增大」的 III 类 AVO。', 'The gradient carries β²/α², hence carries ν. Gas lowers ν, raising β²/α², making G more negative and producing the classic Class III AVO where amplitude grows with offset.') },
  ],
  viz: [
    {
      id: 'avo-curves',
      level: 'V1',
      title: t('三类典型 AVO 响应', 'Three canonical AVO responses'),
      xlabel: t('入射角 θ (度)', 'incidence angle θ (deg)'),
      ylabel: t('反射系数 R', 'reflection coefficient R'),
      controls: [
        { id: 'dalpha', label: t('Δα/α', 'Δα/α'), min: -0.4, max: 0.4, step: 0.01, value: -0.10 },
        { id: 'dbeta', label: t('Δβ/β', 'Δβ/β'), min: -0.6, max: 0.6, step: 0.01, value: 0.15 },
        { id: 'drho', label: t('Δρ/ρ', 'Δρ/ρ'), min: -0.4, max: 0.4, step: 0.01, value: -0.05 },
        { id: 'nu', label: t('平均泊松比 ν', 'average Poisson ratio ν'), min: 0.10, max: 0.45, step: 0.01, value: 0.30 },
      ],
      xRange: [0, 45],
      note: t('把 Δβ/β 从正调到负，观察曲线如何翻转 —— 这就是含气砂岩与含水砂岩在 AVO 上的分野。', 'Flip Δβ/β from positive to negative and watch the curve turn over — that is the AVO distinction between water sand and gas sand.'),
      compute: (p) => {
        const da = p['dalpha'], db = p['dbeta'], dr = p['drho'], nu = p['nu']
        const b2a2 = (1 - 2 * nu) / (2 * (1 - nu))
        const R0 = 0.5 * (da + dr)
        const G = 0.5 * da - 2 * b2a2 * (2 * db + dr)
        const lin: Array<[number, number]> = []
        const three: Array<[number, number]> = []
        const F = 0.5 * da
        for (let i = 0; i <= 200; i++) {
          const deg = (i / 200) * 45
          const th = (deg * Math.PI) / 180
          const s2 = Math.sin(th) ** 2
          lin.push([deg, R0 + G * s2])
          three.push([deg, R0 + G * s2 + F * s2 * (Math.tan(th) ** 2 - 1)])
        }
        return [
          { label: t('Shuey 两项式', 'Shuey two-term'), color: '#185FA5', points: lin },
          { label: t('Shuey 三项式', 'Shuey three-term'), color: '#A32D2D', dash: true, points: three },
        ]
      },
    },
  ],
  numerics: [
    { note: t('实际处理中 θ 需由偏移距换算（层状介质用射线追踪或 Dix 递推）', 'In practice θ must be converted from offset, via ray tracing or Dix recursion'), snippet: String.raw`\sin\theta=\frac{p\,\alpha\left(z\right)}{1},\qquad p\ \text{由射线追踪给出}` },
  ],
  links: {
    upstream: [
      { id: 'acoustic-reflection-coefficient', note: t('R₀ 即垂直入射 R', 'R₀ is the normal-incidence R') },
      { id: 'ps-wave-velocities', note: t('提供 β²/α²', 'supplies β²/α²') },
    ],
  },
  refs: [
    { text: 'Shuey (1985), Geophysics 50, 609–614' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2' },
  ],

}

export default shueyApproximation
