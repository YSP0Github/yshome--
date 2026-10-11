import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** spherical-harmonics */
const sphericalHarmonics: FormulaCard = {
  id: 'spherical-harmonics',
  name: t('球谐函数', 'Spherical Harmonics'),
  aliases: { zh: ['球面调和函数', '球谐展开', 'Ylm'], en: ['spherical harmonics', 'Ylm', 'spherical harmonic expansion'] },
  node: 'S0.5',
  tags: {
    math: ['MATH.DIFF', 'MATH.GEOM'],
    method: ['METH.STRUCT'],
    quantity: ['Q.GEOM'],
    keywords: t('球谐函数 球谐展开 正交归一 加法定理 缔合勒让德 全球层析 自由振荡', 'spherical harmonics orthonormality addition theorem associated Legendre global tomography free oscillations'),
  },
  audience: 'master',
  complete: 'L3',
  statement: {
    main: String.raw`Y_{l}^{m}(\theta,\varphi)=\sqrt{\frac{(2l+1)(l-m)!}{4\pi\,(l+m)!}}\;P_{l}^{m}(\cos\theta)\,e^{im\varphi}`,
    variants: [
      { name: t('正交归一性', 'Orthonormality'), latex: String.raw`\int_{0}^{2\pi}\!\int_{0}^{\pi}Y_{l}^{m}\,Y_{l'}^{m'*}\,\sin\theta\,\mathrm{d}\theta\,\mathrm{d}\varphi=\delta_{ll'}\delta_{mm'}` },
      { name: t('加法定理', 'Addition theorem'), latex: String.raw`\sum_{m=-l}^{l}Y_{l}^{m}(\hat{\mathbf r})\,Y_{l}^{m*}(\hat{\mathbf r}')=\frac{2l+1}{4\pi}P_{l}(\cos\gamma)` },
      { name: t('负次数关系', 'Relation for negative orders'), latex: String.raw`Y_{l}^{-m}=(-1)^{m}\,Y_{l}^{m*}` },
      { name: t('实球谐（用于绘制地球结构图）', 'Real spherical harmonics (used for mapping Earth structure)'), latex: String.raw`\mathcal{Y}_{l}^{m}\propto P_{l}^{m}(\cos\theta)\begin{cases}\cos m\varphi,& m>0\\ \sin|m|\varphi,& m<0\end{cases}` },
      { name: t('任意球面函数的展开', 'Expansion of an arbitrary function on the sphere'), latex: String.raw`f(\theta,\varphi)=\sum_{l=0}^{\infty}\sum_{m=-l}^{l}c_{lm}\,Y_{l}^{m}(\theta,\varphi),\qquad c_{lm}=\int f\,Y_{l}^{m*}\,\mathrm{d}\Omega` },
    ],
  },
  meaning: t(
    '球谐函数是球面上的正交归一基，地位和 Fourier 级数在区间上的地位完全一样。全球地震层析成像把三维速度扰动按 Y_l^m 展开，l 是横向波数（l 越大越细），m 控制方位角的节线数目。地球自由振荡的每一个多线态也用 (l, m) 标记，观测到的谱峰分裂正是偏离球对称的直接证据。',
    'Spherical harmonics are the orthonormal basis on the sphere, playing exactly the role that Fourier series play on an interval. Global seismic tomography expands three-dimensional velocity perturbations in Y_l^m, where l is the lateral wavenumber (larger l means finer structure) and m controls the number of azimuthal nodal lines. Every multiplet of Earth free oscillations is likewise labelled by (l, m), and the splitting of observed spectral peaks is direct evidence of departure from spherical symmetry.',
  ),
  symbols: [
    { sym: 'Y_l^m', name: t('l 阶 m 次球谐函数', 'spherical harmonic of degree l and order m'), unit: '1' },
    { sym: '\\theta', name: t('余纬（从北极量起）', 'colatitude (measured from the north pole)'), unit: 'rad' },
    { sym: '\\varphi', name: t('经度（方位角）', 'longitude (azimuth)'), unit: 'rad' },
    { sym: 'P_l^m', name: t('缔合 Legendre 函数', 'associated Legendre function'), unit: '1' },
    { sym: 'l', name: t('角向阶数，决定横向尺度', 'angular degree, sets the lateral scale'), unit: '1' },
    { sym: 'm', name: t('方位角次数，−l ≤ m ≤ l', 'azimuthal order, −l ≤ m ≤ l'), unit: '1' },
    { sym: '\\gamma', name: t('两个方向之间的夹角', 'angle between two directions'), unit: 'rad' },
    { sym: '\\mathrm{d}\\Omega', name: t('立体角元 sin θ dθ dφ', 'solid-angle element sin θ dθ dφ'), unit: 'sr' },
  ],
  conditions: {
    applies: [
      t('球面上的平方可积函数', 'Square-integrable functions on the sphere'),
      t('球对称背景介质上的扰动展开', 'Perturbations on a spherically symmetric background medium'),
    ],
    assumes: [
      t('采用 Condon–Shortley 相位约定，归一化使 ∫|Y|²dΩ = 1', 'Condon–Shortley phase convention, normalised so that ∫|Y|² dΩ = 1'),
      t('θ 是余纬而非纬度；若用纬度 λ 则 cos θ = sin λ', 'θ is colatitude, not latitude; with latitude λ one has cos θ = sin λ'),
    ],
    breaks: [
      t('|m| > l 时 Y_l^m = 0', 'Y_l^m = 0 whenever |m| > l'),
      t('局部（区域）问题用平面波或小波基更合适，球谐展开会引入大量冗余系数', 'For regional problems plane waves or wavelets are more efficient; a spherical-harmonic expansion introduces many redundant coefficients'),
      t('截断到有限 L 时，尖锐边界会出现 Gibbs 振铃', 'Truncating at finite L produces Gibbs ringing at sharp boundaries'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('球面上的 Laplace 算符', 'The Laplace operator on the sphere'),
      latex: String.raw`\nabla^{2}=\frac{1}{r^{2}}\frac{\partial}{\partial r}\!\left(r^{2}\frac{\partial}{\partial r}\right)-\frac{L^{2}}{r^{2}},\qquad L^{2}=-\frac{1}{\sin\theta}\frac{\partial}{\partial\theta}\!\left(\sin\theta\frac{\partial}{\partial\theta}\right)-\frac{1}{\sin^{2}\theta}\frac{\partial^{2}}{\partial\varphi^{2}}` },
    { n: 2, op: 'setup', title: t('要求球谐是角向算符的本征函数', 'Require the harmonics to be eigenfunctions of the angular operator'),
      latex: String.raw`L^{2}Y_{l}^{m}=l(l+1)\,Y_{l}^{m},\qquad -i\frac{\partial}{\partial\varphi}Y_{l}^{m}=m\,Y_{l}^{m}` },
    { n: 3, op: 'transform', title: t('方位角部分立刻给出 e^{imφ}', 'The azimuthal part immediately gives e^{imφ}'),
      latex: String.raw`\Phi(\varphi)=e^{im\varphi},\qquad m\in\mathbb{Z}\ \text{（单值性要求）}` },
    { n: 4, op: 'substitute', title: t('经向部分即缔合 Legendre 方程', 'The colatitudinal part is the associated Legendre equation'),
      latex: String.raw`Y_{l}^{m}(\theta,\varphi)=N_{lm}\,P_{l}^{m}(\cos\theta)\,e^{im\varphi}` },
    { n: 5, op: 'identity', title: t('由正交归一条件定出常数', 'Fix the constant from the orthonormality condition'),
      latex: String.raw`N_{lm}=\sqrt{\frac{(2l+1)(l-m)!}{4\pi(l+m)!}}`,
      note: t('这个因子保证了 ∫|Y|²dΩ = 1，展开系数才可以直接当作能量份额来读。', 'This factor guarantees ∫|Y|²dΩ = 1, so expansion coefficients can be read directly as shares of energy.') },
    { n: 6, op: 'result', title: t('完备性：任何球面函数都可以这样展开', 'Completeness: any function on the sphere can be expanded this way'),
      latex: String.raw`f(\hat{\mathbf r})=\sum_{l=0}^{\infty}\sum_{m=-l}^{l}c_{lm}Y_{l}^{m}(\hat{\mathbf r}),\qquad c_{lm}=\int f\,Y_{l}^{m*}\,\mathrm{d}\Omega` },
  ],
  viz: [
    {
      id: 'sh-colatitude',
      level: 'V1',
      title: t('球谐随余纬的变化', 'Variation of a harmonic with colatitude'),
      xlabel: t('余纬 θ (rad)', 'colatitude θ (rad)'),
      ylabel: t('Y_l^m(θ, φ)', 'Y_l^m(θ, φ)'),
      controls: [
        { id: 'll', label: t('阶数 l', 'degree l'), min: 0, max: 6, step: 1, value: 3, unit: '1' },
        { id: 'mm', label: t('次数 |m|', 'order |m|'), min: 0, max: 6, step: 1, value: 2, unit: '1' },
        { id: 'ph', label: t('固定经度 φ', 'fixed longitude φ'), min: 0, max: 6.28, step: 0.05, value: 0, unit: 'rad' },
      ],
      xRange: [0, 3.1416],
      note: t('l − |m| 就是 θ 方向上的零点个数：把 m 调到 l，曲线变成只在赤道附近有一个鼓包（P_l^l ∝ sin^l θ）。这就是「阶数越高、结构越细」的直接体现。', 'l − |m| is the number of zeros in θ: setting m = l leaves a single hump near the equator (P_l^l proportional to sin^l θ). This is the direct manifestation of higher degree meaning finer structure.'),
      compute: (p) => {
        const l = Math.round(p['ll'])
        const m0 = Math.round(p['mm'])
        const phi = p['ph']
        const m = Math.min(m0, l)
        const N = normSH(l, m)
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 400; i++) {
          const th = (i / 400) * Math.PI
          const y = assocLegendre(l, m, Math.cos(th))
          pts.push([th, N * y * Math.cos(m * phi)])
        }
        return [{ label: t(`Y_${l}^${m} (实部)`, `Y_${l}^${m} (real part)`), color: '#185FA5', points: pts }]
      },
    },
    {
      id: 'sh-spectrum',
      level: 'V1',
      title: t('球谐展开的功率谱：结构有多细', 'Power spectrum of a harmonic expansion: how fine is the structure'),
      xlabel: t('阶数 l', 'degree l'),
      ylabel: t('每阶的自由度数 2l + 1', 'degrees of freedom per degree, 2l + 1'),
      controls: [
        { id: 'Lmax', label: t('截断阶数 L', 'truncation degree L'), min: 2, max: 40, step: 1, value: 20, unit: '1' },
      ],
      xRange: [0, 40],
      note: t('展开到 L 阶共有 (L+1)² 个系数。自由度随 L² 增长，而地震数据的有效约束远少于此 —— 这就是为什么全球层析必须做正则化。', 'Truncating at degree L leaves (L+1)² coefficients. The degrees of freedom grow like L² while the effective constraints in seismic data are far fewer, which is why global tomography must be regularised.'),
      compute: (p) => {
        const L = Math.round(p['Lmax'])
        const pts: Array<[number, number]> = []
        for (let l = 0; l <= 40; l++) {
          pts.push([l, l <= L ? 2 * l + 1 : 0])
        }
        return [{ label: t('第 l 阶的自由度', 'degrees of freedom at degree l'), color: '#0F6E56', points: pts }]
      },
    },
  ],
  example: {
    title: t('l = 2, m = 0 的球谐', 'The harmonic with l = 2, m = 0'),
    input: t('Y₂⁰(θ, φ)', 'Y₂⁰(θ, φ)'),
    steps: [
      t('归一化因子 N = √(5/(4π)) = 0.631', 'Normalisation N = √(5/(4π)) = 0.631'),
      t('P₂(cos θ) = (3cos²θ − 1)/2', 'P₂(cos θ) = (3cos²θ − 1)/2'),
      t('Y₂⁰ = 0.631 × (3cos²θ − 1)/2', 'Y₂⁰ = 0.631 × (3cos²θ − 1)/2'),
      t('在 θ = 0（北极）取 +0.631，在 θ = 54.7° 处过零，赤道取 −0.315', 'It equals +0.631 at θ = 0 (north pole), vanishes at θ = 54.7° and equals −0.315 at the equator'),
    ],
    output: t('这就是著名的「梨形/扁球形」二阶项，与地球动力学扁率、长波长重力场 J₂ 项直接对应。', 'This is the well-known degree-two spheroid term, directly related to the geodynamic flattening and to the J₂ term of the long-wavelength gravity field.'),
  },
  links: {
    upstream: [
      { id: 'legendre-polynomials', note: t('经向部分就是缔合 Legendre 函数', 'the colatitudinal part is the associated Legendre function') },
    ],
    seealso: [
      { id: 'adams-williamson', note: t('球对称参考模型的构建', 'construction of a spherically symmetric reference model') },
    ],
  },
  refs: [
    { text: 'Dahlen & Tromp, Theoretical Global Seismology, §B.3' },
    { text: 'Abramowitz & Stegun, Handbook of Mathematical Functions, Ch. 8' },
  ],
}

function normSH(l: number, m: number): number {
  const am = Math.abs(m)
  let f1 = 1
  for (let k = 2; k <= l - am; k++) f1 *= k
  let f2 = 1
  for (let k = 2; k <= l + am; k++) f2 *= k
  return Math.sqrt(((2 * l + 1) * f1) / (4 * Math.PI * f2))
}

function assocLegendre(l: number, m: number, x: number): number {
  if (m === 0) return legendreP(l, x)
  let dfact = 1
  for (let k = 1; k <= 2 * m - 1; k += 2) dfact *= k
  const s = Math.sqrt(Math.max(0, 1 - x * x))
  let pmm = dfact * Math.pow(s, m)
  if (m % 2 === 1) pmm = -pmm
  if (l === m) return pmm
  let pmmp1 = x * (2 * m + 1) * pmm
  if (l === m + 1) return pmmp1
  let plm = 0
  let a = pmm
  let b = pmmp1
  for (let k = m + 2; k <= l; k++) {
    plm = ((2 * k - 1) * x * b - (k + m - 1) * a) / (k - m)
    a = b
    b = plm
  }
  return plm
}

function legendreP(l: number, x: number): number {
  if (l === 0) return 1
  if (l === 1) return x
  let pm1 = 1
  let p = x
  for (let k = 1; k < l; k++) {
    const pn = ((2 * k + 1) * x * p - k * pm1) / (k + 1)
    pm1 = p
    p = pn
  }
  return p
}

export default sphericalHarmonics
