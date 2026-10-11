import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** stokes-theorem */
const stokesTheorem: FormulaCard = {
  id: 'stokes-theorem',
  name: t('Stokes 定理', 'Stokes Theorem'),
  aliases: { zh: ['斯托克斯定理', '环量定理'], en: ['Stokes theorem', 'circulation theorem', 'Kelvin-Stokes'] },
  node: 'S0.3',
  tags: {
    math: ['MATH.VECTOR', 'MATH.DIFF'],
    method: ['METH.STRUCT'],
    quantity: ['Q.TENSOR'],
    keywords: t('斯托克斯定理 环量 面积分 线积分 边界 有向曲面 右手定则', 'Stokes theorem circulation surface integral line integral boundary oriented surface right-hand rule'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\iint_{S}(\nabla\times\mathbf{u})\cdot\hat{\mathbf{n}}\,\dd S=\oint_{\partial S}\mathbf{u}\cdot\dd\mathbf{l}`,
    variants: [
      { name: t('分量形式', 'Component form'), latex: String.raw`\iint_S \varepsilon_{ijk}\,\partial_j u_k\,n_i\,\dd S=\oint_{\partial S}u_i\,\dd l_i` },
      { name: t('二维退化：Green 定理', 'The two-dimensional degenerate form: Green theorem'), latex: String.raw`\iint_A\left(\partial_x Q-\partial_y P\right)\dd A=\oint_{\partial A}\left(P\,\dd x+Q\,\dd y\right)` },
      { name: t('梯度场的特例：环量为零', 'The special case of a gradient field: zero circulation'), latex: String.raw`\mathbf{u}=\nabla f\;\Longrightarrow\;\oint_{\partial S}\mathbf{u}\cdot\dd\mathbf{l}=0` },
      { name: t('常用于电磁感应的形式', 'The form familiar from electromagnetic induction'), latex: String.raw`\oint_{\partial S}\mathbf{E}\cdot\dd\mathbf{l}=-\frac{\dd}{\dd t}\iint_S\mathbf{B}\cdot\hat{\mathbf{n}}\,\dd S` },
    ],
  },
  meaning: t(
    'Stokes 定理说：曲面上每一点的「局部打转强度」加起来，等于沿着曲面边界绕行一周的环量。它和散度定理是一对：一个把面积分变成线积分，一个把体积分变面积分；一个是旋度的整体形式，一个是散度的整体形式。它也解释了为什么无旋场（u = ∇f）沿任意闭合路径的环量为零 —— 这正是走时场可以定义为标量势的前提。',
    'Stokes theorem says that adding up the local swirling strength at every point of a surface gives the circulation once around the boundary of that surface. It is one of a pair with the divergence theorem: one converts a surface integral into a line integral, the other a volume integral into a surface integral; one is the global form of the curl, the other of the divergence. It also explains why an irrotational field, u = ∇f, has zero circulation around any closed path, which is exactly the prerequisite for defining a scalar travel-time potential.',
  ),
  symbols: [
    { sym: 'S', name: t('有向曲面（开曲面）', 'an oriented surface, an open one'), unit: 'm²' },
    { sym: '\\partial S', name: t('曲面的闭合边界曲线', 'the closed boundary curve of the surface'), unit: 'm' },
    { sym: '\\hat{\\mathbf{n}}', name: t('曲面的单位法向（与边界走向满足右手定则）', 'unit normal of the surface, right-handed with respect to the boundary orientation'), unit: '1' },
    { sym: '\\dd\\mathbf{l}', name: t('沿边界的线元矢量', 'line element vector along the boundary'), unit: 'm' },
    { sym: '\\varepsilon_{ijk}', name: t('Levi-Civita 符号', 'the Levi-Civita symbol'), unit: '1' },
    { sym: 'P, Q', name: t('二维场 u = (P, Q) 的两个分量', 'the two components of the planar field u = (P, Q)'), unit: '任意' },
  ],
  conditions: {
    applies: [
      t('S 为分片光滑、可定向的曲面，边界 ∂S 为分段光滑闭曲线', 'S is piecewise smooth and orientable, with a piecewise smooth closed boundary ∂S'),
      t('u 在 S 的邻域内连续可微', 'u is continuously differentiable in a neighbourhood of S'),
    ],
    assumes: [
      t('曲面法向与边界走向按右手定则配套；反向则整体变号', 'The surface normal and the boundary orientation are right-hand matched; reversing one flips the sign'),
      t('曲面内部无奇点；点涡等奇点需单独计入', 'No singularities inside the surface; point vortices and similar must be added separately'),
    ],
    breaks: [
      t('不可定向曲面（如莫比乌斯带）上定理不适用', 'The theorem does not apply on non-orientable surfaces such as a Mobius strip'),
      t('边界不闭合（有缺口）时右侧需补上缺口处的线积分', 'If the boundary is not closed, the missing segment must be added to the right side'),
      t('场在曲面上不连续时需分片处理并计入内部边界', 'A field discontinuous on the surface requires splitting into pieces and adding the internal boundaries'),
    ],
  },
  derivation: [
    {
      n: 1,
      op: 'geometry',
      title: t('把曲面切成许多小方格', 'Cut the surface into many small patches'),
      latex: String.raw`S=\bigcup_{\alpha}S_{\alpha}`,
      note: t('相邻小格的公共边被走两次，方向相反，线积分正好抵消。', 'Each shared edge between neighbours is traversed twice in opposite directions, so those line integrals cancel exactly.'),
    },
    {
      n: 2,
      op: 'physics',
      title: t('对每个小格用旋度的极限定义', 'Apply the limit definition of the curl to each patch'),
      latex: String.raw`\oint_{\partial S_{\alpha}}\mathbf{u}\cdot\dd\mathbf{l}\approx(\nabla\times\mathbf{u})\cdot\hat{\mathbf{n}}\big|_{\mathbf{x}_{\alpha}}\,S_{\alpha}`,
      note: t('这正是「旋度 = 单位面积环量」的定义（见旋度卡片）。', 'This is precisely the definition of the curl as circulation per unit area.'),
    },
    {
      n: 3,
      op: 'algebra',
      title: t('对所有小格求和，内部边界全部抵消', 'Sum over the patches; all internal boundaries cancel'),
      latex: String.raw`\sum_{\alpha}\oint_{\partial S_{\alpha}}\mathbf{u}\cdot\dd\mathbf{l}=\oint_{\partial S}\mathbf{u}\cdot\dd\mathbf{l}`,
    },
    {
      n: 4,
      op: 'transform',
      title: t('右端取极限成为面积分', 'The right side becomes a surface integral in the limit'),
      latex: String.raw`\lim_{\max S_{\alpha}\to 0}\sum_{\alpha}(\nabla\times\mathbf{u})\cdot\hat{\mathbf{n}}\,S_{\alpha}=\iint_S(\nabla\times\mathbf{u})\cdot\hat{\mathbf{n}}\,\dd S`,
    },
    {
      n: 5,
      op: 'result',
      title: t('得到 Stokes 定理', 'Stokes theorem'),
      latex: String.raw`\iint_S(\nabla\times\mathbf{u})\cdot\hat{\mathbf{n}}\,\dd S=\oint_{\partial S}\mathbf{u}\cdot\dd\mathbf{l}`,
      note: t('关键直觉：旋度是「局部的环量密度」，把密度积分起来自然得到总环量。', 'The key intuition: the curl is a local density of circulation, and integrating a density naturally gives the total circulation.'),
    },
    {
      n: 6,
      op: 'result',
      title: t('推论：梯度场的环量为零，势函数才有意义', 'Corollary: a gradient field has zero circulation, which makes potentials meaningful'),
      latex: String.raw`\nabla\times\nabla f=\mathbf{0}\;\Longrightarrow\;\oint \nabla f\cdot\dd\mathbf{l}=0\;\Longrightarrow\;f(\mathbf{x})=\int_{\mathbf{x}_0}^{\mathbf{x}}\mathbf{u}\cdot\dd\mathbf{l}\ \text{与路径无关}`,
      note: t('地震学里，只要传播介质无旋（不产生 S 波的纯 P 情形），走时就能定义为标量势 T(x)。', 'In seismology, whenever the medium is irrotational, the pure P case with no S motion, travel time can be defined as a scalar potential T(x).'),
    },
  ],
  example: {
    title: t('圆盘上的刚性转动', 'Rigid rotation over a disc'),
    input: t('u = Ω × x，取半径 R 的水平圆盘，Ω 竖直向上', 'u = Ω × x on a horizontal disc of radius R, with Ω pointing up'),
    steps: [
      t('∇×u = 2Ω，故左侧 = 2Ω · πR²', '∇×u = 2Ω, so the left side is 2Ω · πR²'),
      t('边界上 |u| = ΩR 且处处沿切向，右侧 = ΩR · 2πR = 2πΩR²', 'On the boundary |u| = ΩR everywhere and purely tangential, so the right side is ΩR · 2πR = 2πΩR²'),
    ],
    output: t('两侧都是 2πΩR²；这个例子也是「旋度 = 2Ω」最直观的验证', 'Both sides give 2πΩR², and the example is the most direct verification that the curl equals 2Ω'),
  },
  links: {
    upstream: [
      { id: 'curl', note: t('定理的被积量', 'the integrand of the theorem') },
      { id: 'index-notation-kronecker', note: t('分量形式用到 ε_ijk', 'the component form uses ε_ijk') },
    ],
    seealso: [
      { id: 'divergence-theorem', note: t('与之对偶的散度版定理', 'its dual, the divergence version') },
      { id: 'gradient' },
    ],
  },
  refs: [
    { text: 'Arfken, Weber & Harris, Mathematical Methods for Physicists, 7th ed., §1.12' },
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
  ],
}

export default stokesTheorem
