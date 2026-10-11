import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** stress-invariants */
const stressInvariants: FormulaCard = {
  id: 'stress-invariants',
  name: t('应力的三个不变量', 'The Three Stress Invariants'),
  aliases: { zh: ['应力不变量', '第一不变量', '平均应力'], en: ['stress invariants', 'first invariant', 'mean stress', 'octahedral stress'] },
  node: 'S1.1',
  tags: {
    math: ['MATH.LINALG'],
    method: ['METH.STRUCT', 'METH.ROCK'],
    quantity: ['Q.TENSOR'],
    keywords: t('应力不变量 迹 行列式 主应力 特征多项式 平均压力 八面体剪应力', 'stress invariants trace determinant principal stress characteristic polynomial mean pressure octahedral shear'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`I_1=\sigma_{kk},\qquad I_2=\frac{1}{2}\left(\sigma_{ii}\sigma_{jj}-\sigma_{ij}\sigma_{ji}\right),\qquad I_3=\det\boldsymbol{\sigma}`,
    variants: [
      { name: t('用主应力写出', 'In terms of principal stresses'), latex: String.raw`I_1=\sigma_1+\sigma_2+\sigma_3,\quad I_2=\sigma_1\sigma_2+\sigma_2\sigma_3+\sigma_3\sigma_1,\quad I_3=\sigma_1\sigma_2\sigma_3` },
      { name: t('用迹（trace）写 I₂', 'I₂ written with traces'), latex: String.raw`I_2=\frac{1}{2}\left[\left(\operatorname{tr}\boldsymbol{\sigma}\right)^{2}-\operatorname{tr}\!\left(\boldsymbol{\sigma}^{2}\right)\right]` },
      { name: t('平均应力（球应力）与压力', 'Mean stress and pressure'), latex: String.raw`\bar{\sigma}=\frac{I_1}{3}=\frac{\sigma_{kk}}{3},\qquad p=-\bar{\sigma}` },
      { name: t('八面体剪应力', 'Octahedral shear stress'), latex: String.raw`\tau_{\mathrm{oct}}=\frac{1}{3}\sqrt{\left(\sigma_1-\sigma_2\right)^{2}+\left(\sigma_2-\sigma_3\right)^{2}+\left(\sigma_3-\sigma_1\right)^{2}}` },
      { name: t('特征多项式', 'Characteristic polynomial'), latex: String.raw`\lambda^{3}-I_1\lambda^{2}+I_2\lambda-I_3=0` },
    ],
  },
  meaning: t(
    '把坐标轴随便怎么转，σ 的九个分量都会变，但迹、二次缩并和行列式这三个组合岿然不动。它们就是应力状态的「指纹」：任何屈服准则、任何破裂判据，都只能是这三个数的函数，否则就会随观察者的取向而改变结论 —— 那在物理上是荒谬的。',
    'Rotate the coordinate axes however you like and the nine components of σ all change, yet these three combinations stay put. They are the fingerprint of a stress state: any yield criterion or failure criterion can only be a function of these three numbers, otherwise its verdict would depend on how the observer happened to orient the axes, which is physically absurd.',
  ),
  symbols: [
    { sym: 'I_1', name: t('第一不变量（应力张量的迹）', 'first invariant (trace of the stress tensor)'), unit: 'Pa' },
    { sym: 'I_2', name: t('第二不变量（两两主应力乘积之和）', 'second invariant (sum of pairwise principal-stress products)'), unit: 'Pa²' },
    { sym: 'I_3', name: t('第三不变量（行列式）', 'third invariant (determinant)'), unit: 'Pa³' },
    { sym: '\\bar{\\sigma}', name: t('平均正应力', 'mean normal stress'), unit: 'Pa' },
    { sym: 'p', name: t('压力（此处为力学压力，不是射线参数）', 'pressure (mechanical pressure here, not ray parameter)'), unit: 'Pa', typical: '0 – 10⁹ Pa' },
    { sym: '\\tau_{\\mathrm{oct}}', name: t('八面体剪应力', 'octahedral shear stress'), unit: 'Pa' },
  ],
  conditions: {
    applies: [
      t('任意三维应力状态；二维情形只需令 σ₂ = 相应值', 'Any three-dimensional stress state; for 2D simply drop one principal value'),
      t('构造与坐标无关的屈服 / 破裂准则时', 'Whenever a coordinate-free yield or failure criterion is needed'),
    ],
    assumes: [
      t('σ 对称（否则 I₂、I₃ 的定义需修正）', 'σ is symmetric, otherwise the definitions of I₂ and I₃ need amending'),
      t('符号约定全文统一：拉为正；地震学若取压为正则 I₁ 反号', 'A single sign convention throughout: tension positive; if compression is taken positive, as in seismology, I₁ flips sign'),
    ],
    breaks: [
      t('不变量本身永远存在，但「屈服只依赖 I₁、I₂」这类简化对岩石并不严格成立（静水压力会影响摩擦）', 'The invariants always exist, but simplifications such as "yielding depends only on I₁ and I₂" are not strictly valid for rock, since confining pressure affects friction'),
      t('非连续 / 微极介质中 σ 不对称，三个量不再是不变量', 'Where σ is asymmetric the three quantities cease to be invariants'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('出发点：特征多项式与坐标系无关', 'Start from the characteristic polynomial'),
      latex: String.raw`\det\!\left(\boldsymbol{\sigma}-\lambda\boldsymbol{I}\right)=0`,
      note: t('主应力是物理实在，不随坐标变化，所以这个方程的根不变 ⟹ 它的系数也不变。', 'Principal stresses are physically real and coordinate-independent, so the roots of this equation are fixed — and therefore so are its coefficients.') },
    { n: 2, op: 'identity', title: t('在主轴坐标系下写下这个行列式', 'Write the determinant in the principal frame'),
      latex: String.raw`\det\!\left(\boldsymbol{\sigma}-\lambda\boldsymbol{I}\right)=\left(\sigma_1-\lambda\right)\left(\sigma_2-\lambda\right)\left(\sigma_3-\lambda\right)` },
    { n: 3, op: 'algebra', title: t('展开并整理成 λ 的降幂', 'Expand and collect powers of λ'),
      latex: String.raw`-\lambda^{3}+\left(\sigma_1+\sigma_2+\sigma_3\right)\lambda^{2}-\left(\sigma_1\sigma_2+\sigma_2\sigma_3+\sigma_3\sigma_1\right)\lambda+\sigma_1\sigma_2\sigma_3=0` },
    { n: 4, op: 'identity', title: t('把系数写成任意坐标系都能算的形式', 'Rewrite each coefficient in a frame-independent way'),
      latex: String.raw`I_1=\operatorname{tr}\boldsymbol{\sigma},\qquad I_2=\frac{1}{2}\left[\left(\operatorname{tr}\boldsymbol{\sigma}\right)^{2}-\operatorname{tr}\!\left(\boldsymbol{\sigma}^{2}\right)\right],\qquad I_3=\det\boldsymbol{\sigma}`,
      note: t('迹与行列式在任何基下取值相同，这是线性代数的标准结论 —— 它们正是特征值的和与积。', 'Trace and determinant take the same value in any basis, a standard result of linear algebra: they are the sum and the product of the eigenvalues.') },
    { n: 5, op: 'algebra', title: t('还原成指标记号', 'Restore index notation'),
      latex: String.raw`I_1=\sigma_{kk},\qquad I_2=\frac{1}{2}\left(\sigma_{ii}\sigma_{jj}-\sigma_{ij}\sigma_{ji}\right),\qquad I_3=\epsilon_{ijk}\,\sigma_{1i}\sigma_{2j}\sigma_{3k}` },
    { n: 6, op: 'result', title: t('I₁ 的物理含义：平均压力', 'Physical meaning of I₁: the mean pressure'),
      latex: String.raw`\bar{\sigma}=\frac{I_1}{3},\qquad \tau_{\mathrm{oct}}=\frac{1}{3}\sqrt{2\left(I_1^{2}-3I_2\right)}`,
      note: t('I₁ 只管「压得多狠」（体积），剩下的形状改变全部由偏应力承担 —— 这正是下一条分解式要做的切分。', 'I₁ only says how hard the rock is squeezed, that is the volumetric part; all shape change is carried by the deviatoric stress, which is exactly the split made in the next card.') },
  ],
  viz: [
    {
      id: 'characteristic-cubic',
      level: 'V1',
      title: t('特征多项式：三次曲线的三个根就是主应力', 'The characteristic cubic: its three roots are the principal stresses'),
      xlabel: t('试算应力 λ (MPa)', 'trial stress λ (MPa)'),
      ylabel: t('P(λ) = λ³ − I₁λ² + I₂λ − I₃ (MPa³)', 'P(λ) = λ³ − I₁λ² + I₂λ − I₃ (MPa³)'),
      controls: [
        { id: 'q1', label: t('主应力 σ₁', 'principal stress σ₁'), min: 0, max: 300, step: 5, value: 120, unit: 'MPa' },
        { id: 'q2', label: t('主应力 σ₂', 'principal stress σ₂'), min: 0, max: 300, step: 5, value: 70, unit: 'MPa' },
        { id: 'q3', label: t('主应力 σ₃', 'principal stress σ₃'), min: 0, max: 300, step: 5, value: 20, unit: 'MPa' },
      ],
      xRange: [-40, 320],
      note: t('曲线与横轴的三个交点就是 σ₁、σ₂、σ₃。拖动任一个主应力，整条曲线的三个根一起移动，但曲线形状只由 I₁、I₂、I₃ 决定 —— 这三个数才是应力状态的真身。把 σ₂ 调到靠近 σ₁ 时，两个根会合并成一个重根。', 'The three intersections with the horizontal axis are σ₁, σ₂ and σ₃. Drag any principal stress and all three roots move together, yet the shape of the curve is fixed by I₁, I₂ and I₃ alone — those three numbers are what the stress state really is. Bring σ₂ close to σ₁ and two roots merge into a double root.'),
      compute: (p) => {
        const s1 = p['q1'], s2 = p['q2'], s3 = p['q3']
        const I1 = s1 + s2 + s3
        const I2 = s1 * s2 + s2 * s3 + s3 * s1
        const I3 = s1 * s2 * s3
        const curve: Array<[number, number]> = []
        const lo = Math.min(0, s1, s2, s3) - 40
        const hi = Math.max(100, s1, s2, s3) + 40
        const N = 600
        for (let i = 0; i <= N; i++) {
          const lam = lo + (i / N) * (hi - lo)
          const val = lam * lam * lam - I1 * lam * lam + I2 * lam - I3
          curve.push([lam, val])
        }
        const zero: Array<[number, number]> = [[lo, 0], [hi, 0]]
        return [
          { label: t('特征多项式 P(λ)', 'characteristic polynomial P(λ)'), color: '#185FA5', points: curve },
          { label: t('P = 0', 'P = 0'), color: '#B4B2A9', dash: true, points: zero },
        ]
      },
    },
  ],
  example: {
    title: t('由分量矩阵求三个不变量', 'Invariants from a component matrix'),
    input: t('主应力 σ₁ = 120 MPa，σ₂ = 70 MPa，σ₃ = 20 MPa。', 'Principal stresses σ₁ = 120 MPa, σ₂ = 70 MPa, σ₃ = 20 MPa.'),
    steps: [
      t('I₁ = 120 + 70 + 20 = 210 MPa', 'I₁ = 120 + 70 + 20 = 210 MPa'),
      t('I₂ = 120×70 + 70×20 + 20×120 = 8400 + 1400 + 2400 = 12200 MPa²', 'I₂ = 120×70 + 70×20 + 20×120 = 8400 + 1400 + 2400 = 12200 MPa²'),
      t('I₃ = 120 × 70 × 20 = 168000 MPa³', 'I₃ = 120 × 70 × 20 = 168000 MPa³'),
      t('平均应力 = I₁/3 = 70 MPa；τ_oct = √[2(210² − 3×12200)] / 3 ≈ 40.8 MPa', 'mean stress = I₁/3 = 70 MPa; τ_oct = √[2(210² − 3×12200)] / 3 ≈ 40.8 MPa'),
    ],
    output: t('三个不变量 (210, 12200, 168000) 完全刻画了这个应力状态；无论坐标怎么转，它们都不变。', 'The triplet (210, 12200, 168000) characterises the stress state completely and is unchanged by any rotation of the axes.'),
  },
  links: {
    upstream: [{ id: 'principal-stress-eigenvalues', note: t('不变量来自特征多项式的系数', 'the invariants are the coefficients of the characteristic polynomial') }],
    downstream: [{ id: 'deviatoric-stress' }],
    seealso: [{ id: 'mohr-circle-max-shear' }],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
    { text: 'Jaeger, Cook & Zimmerman, Fundamentals of Rock Mechanics, 4th ed., §2.4' },
  ],

}

export default stressInvariants
