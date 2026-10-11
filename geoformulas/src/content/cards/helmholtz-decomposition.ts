import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** helmholtz-decomposition */
const helmholtzDecomposition: FormulaCard = {
  id: 'helmholtz-decomposition',
  name: t('位移场的 Helmholtz 分解', 'Helmholtz Decomposition of the Displacement Field'),
  aliases: {
    zh: ['亥姆霍兹分解', '纵波横波分解', '标量势与矢量势'],
    en: ['Helmholtz decomposition', 'irrotational and solenoidal split', 'scalar and vector potentials'],
  },
  node: 'S1.4',
  tags: {
    math: ['MATH.VECTOR', 'MATH.DIFF'],
    method: ['METH.STRUCT'],
    quantity: ['Q.TENSOR', 'Q.VEL'],
    keywords: t('Helmholtz 分解 标量势 矢量势 无旋场 无散场 规范条件 纵波 横波 唯一性', 'Helmholtz decomposition scalar potential vector potential irrotational solenoidal gauge condition longitudinal transverse uniqueness'),
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\boldsymbol{u}=\nabla\phi+\nabla\times\boldsymbol{\psi},\qquad \nabla\cdot\boldsymbol{\psi}=0`,
    variants: [
      { name: t('P 波部分与 S 波部分', 'The P-wave and S-wave parts'), latex: String.raw`\boldsymbol{u}_P=\nabla\phi\ \ \text{(无旋)},\qquad \boldsymbol{u}_S=\nabla\times\boldsymbol{\psi}\ \ \text{(无散)}` },
      { name: t('频域（平面波）形式', 'Frequency-domain (plane-wave) form'), latex: String.raw`\tilde{\boldsymbol{u}}=i\,\boldsymbol{k}\,\tilde{\phi}+i\,\boldsymbol{k}\times\tilde{\boldsymbol{\psi}},\qquad \boldsymbol{k}\cdot\tilde{\boldsymbol{\psi}}=0` },
      { name: t('二维问题（x–z 平面内传播）', 'Two dimensions (propagation in the x–z plane)'), latex: String.raw`\boldsymbol{\psi}=\left(0,\psi,0\right)\;\Rightarrow\; \nabla\times\boldsymbol{\psi}=\left(-\frac{\partial\psi}{\partial z},\,0,\,\frac{\partial\psi}{\partial x}\right)` },
      { name: t('势的积分表达式（Helmholtz 定理）', 'Integral expressions for the potentials (Helmholtz theorem)'), latex: String.raw`\phi=-\frac{1}{4\pi}\int\frac{\nabla'\cdot\boldsymbol{u}}{\left|\boldsymbol{x}-\boldsymbol{x}'\right|}\,\mathrm{d}V',\qquad \boldsymbol{\psi}=\frac{1}{4\pi}\int\frac{\nabla'\times\boldsymbol{u}}{\left|\boldsymbol{x}-\boldsymbol{x}'\right|}\,\mathrm{d}V'` },
    ],
  },
  meaning: t(
    '这是弹性波理论里最关键的一招"换元"：任何一个位移场都能拆成"只压缩、不旋转"的部分和"只旋转、不压缩"的部分。拆完之后，原本耦合在一起的 Navier 方程立刻分成两个互不相干的波动方程，P 波与 S 波从此分家。地震学里说"P 波是纵波、S 波是横波"，严格的表述就来自这个分解。',
    'This is the single most important change of variables in elastic wave theory: any displacement field splits into a part that only compresses without rotating and a part that only rotates without compressing. After the split, the once-coupled Navier equation separates into two independent wave equations, and P and S waves go their separate ways. When seismologists say "P is longitudinal and S is transverse", this decomposition is the rigorous statement behind it.',
  ),
  symbols: [
    { sym: '\\boldsymbol{u}', name: t('位移矢量场', 'displacement vector field'), unit: 'm' },
    { sym: '\\phi', name: t('标量位移势（P 波势）', 'scalar displacement potential (P-wave potential)'), unit: 'm²' },
    { sym: '\\boldsymbol{\\psi}', name: t('矢量位移势（S 波势）', 'vector displacement potential (S-wave potential)'), unit: 'm²' },
    { sym: '\\boldsymbol{k}', name: t('波数矢量', 'wave-number vector'), unit: 'rad/m' },
    { sym: '\\boldsymbol{x}', name: t('观测点位置', 'observation point'), unit: 'm' },
    { sym: '\\chi', name: t('规范函数（不改变 u 的自由度）', 'gauge function (a freedom that leaves u unchanged)'), unit: 'm²' },
  ],
  conditions: {
    applies: [
      t('位移场在无穷远衰减足够快（1/r 量级或更快）', 'The displacement field decays fast enough at infinity (1/r or faster)'),
      t('光滑场；有间断界面时分区使用并在界面上连接', 'Smooth fields; with interfaces apply it piecewise and match across them'),
    ],
    assumes: [
      t('单连通区域；多连通区域的调和场需要额外处理', 'Simply connected region; multiply connected regions need extra harmonic fields'),
      t('规范条件 ∇·ψ = 0 只是约定，不是物理约束', 'The gauge ∇·ψ = 0 is a convention, not a physical constraint'),
    ],
    breaks: [
      t('无界增长场（如无限平面波的全局势）不能直接用积分式', 'Fields with unbounded growth need care; the integral form assumes decay'),
      t('强非均匀介质中 P、S 在界面上会重新耦合', 'In strongly heterogeneous media P and S recouple at interfaces'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把位移写成两部分之和', 'Write the displacement as a sum of two parts'),
      latex: String.raw`\boldsymbol{u}=\boldsymbol{u}_{P}+\boldsymbol{u}_{S},\qquad \nabla\times\boldsymbol{u}_{P}=\boldsymbol{0},\quad \nabla\cdot\boldsymbol{u}_{S}=0`,
      note: t('一部分无旋、一部分无散，剩下的工作就是证明这种拆分一定存在。', 'One part curl-free, one part divergence-free; what remains is to prove that such a split always exists.') },
    { n: 2, op: 'identity', title: t('无旋场必是某个标量的梯度', 'A curl-free field is the gradient of a scalar'),
      latex: String.raw`\nabla\times\boldsymbol{u}_{P}=\boldsymbol{0}\;\Rightarrow\; \boldsymbol{u}_{P}=\nabla\phi` },
    { n: 3, op: 'identity', title: t('无散场必是某个矢量的旋度', 'A divergence-free field is the curl of a vector'),
      latex: String.raw`\nabla\cdot\boldsymbol{u}_{S}=0\;\Rightarrow\; \boldsymbol{u}_{S}=\nabla\times\boldsymbol{\psi}` },
    { n: 4, op: 'transform', title: t('取散度：得到 φ 的 Poisson 方程', 'Take the divergence: a Poisson equation for φ'),
      latex: String.raw`\nabla\cdot\boldsymbol{u}=\nabla^{2}\phi\;\Rightarrow\; \phi=-\frac{1}{4\pi}\int\frac{\nabla'\cdot\boldsymbol{u}}{\left|\boldsymbol{x}-\boldsymbol{x}'\right|}\,\mathrm{d}V'`,
      note: t('散度这一半的物理含义是体应变，也就是 P 波的"源"。', 'The divergence half is physically the volumetric strain, the source of P waves.') },
    { n: 5, op: 'transform', title: t('取旋度：得到 ψ 的 Poisson 方程', 'Take the curl: a Poisson equation for ψ'),
      latex: String.raw`\nabla\times\boldsymbol{u}=-\nabla^{2}\boldsymbol{\psi}\;\Rightarrow\; \boldsymbol{\psi}=\frac{1}{4\pi}\int\frac{\nabla'\times\boldsymbol{u}}{\left|\boldsymbol{x}-\boldsymbol{x}'\right|}\,\mathrm{d}V'`,
      note: t('旋度这一半是转动，也就是 S 波的"源"。', 'The curl half is rotation, the source of S waves.') },
    { n: 6, op: 'result', title: t('规范自由度与唯一性', 'Gauge freedom and uniqueness'),
      latex: String.raw`\boldsymbol{\psi}\to\boldsymbol{\psi}+\nabla\chi\ \text{不改变}\ \boldsymbol{u};\qquad \nabla\cdot\boldsymbol{\psi}=0\ \text{配衰减条件}\Rightarrow\ \text{分解唯一}`,
      note: t('ψ 有三分量但只有两个独立自由度，正好对应 S 波的两个偏振（SV 与 SH）。', 'ψ has three components but only two degrees of freedom, matching the two S polarisations, SV and SH.') },
  ],
  links: {
    upstream: [
      { id: 'navier-equation', note: t('分解就是为了解它', 'the decomposition exists to solve it') },
    ],
    downstream: [
      { id: 'ps-potential-decoupling', note: t('分解之后两个势各满足一个波动方程', 'after decomposition each potential obeys its own wave equation') },
      { id: 'ps-wave-velocities' },
    ],
    seealso: [
      { id: 'reduced-wave-equation' },
      { id: 'harmonic-plane-wave' },
    ],
  },
  refs: [
    { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
    { text: 'Shearer, Introduction to Seismology, 2nd ed., §2.2' },
  ],
}

export default helmholtzDecomposition
