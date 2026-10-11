import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** prem-velocity-model */
const premVelocityModel: FormulaCard = {
  id: 'prem-velocity-model',
  name: t('一维地球速度模型（PREM / IASP91 / AK135）', '1D Earth Velocity Models (PREM / IASP91 / AK135)'),
  aliases: { zh: ['PREM', 'IASP91', 'AK135'], en: ['PREM', 'IASP91', 'AK135', 'reference Earth model'] },
  node: 'S7.1',
  tags: {
    math: ['MATH.APPROX'],
    method: ['METH.STRUCT', 'METH.TELE'],
    quantity: ['Q.VEL', 'Q.GEOM'],
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`v_P(r),\ v_S(r),\ \rho(r)\ \text{以离散深度节点 + 层内插值的形式给出}`,
    variants: [
      { name: t('PREM 层内插值（多项式）', 'PREM intra-layer interpolation (polynomial)'), latex: String.raw`v(r)=\sum_{k=0}^{3}a_k\,r^{k}\quad (\text{在给定层内})` },
      { name: t('主要间断面深度', 'Depths of the main discontinuities'), latex: String.raw`\text{莫霍}\approx24.4\ \text{km（全球平均）},\ 410,\ 660\ \text{km},\ \text{CMB}=2891\ \text{km},\ \text{ICB}=5154\ \text{km}` },
      { name: t('PREM 的几个关键数值', 'Some key PREM values'), latex: String.raw`v_P(\text{上地幔顶})\approx8.04,\quad v_P(\text{外核顶})\approx8.06\rightarrow10.36,\quad v_S(\text{外核})=0\ \text{km/s}` },
    ],
  },
  meaning: t(
    '一维参考模型是全球地震学的共同语言：走时计算、震源定位、层析成像的初始模型都建立在它之上。三者的定位不同 —— PREM 含密度与自由振荡约束，适合长周期与全球问题；IASP91 与 AK135 专精于短周期体波走时，是 ISC、NEIC 等机构定位所用的实际标准。',
    'One-dimensional reference models are the common language of global seismology: travel-time calculation, event location and tomographic starting models all rest on them. They differ in purpose: PREM includes density and free-oscillation constraints and suits long periods and global problems; IASP91 and AK135 specialise in short-period body-wave travel times and are the practical standards used by ISC and NEIC for routine location.',
  ),
  symbols: [
    { sym: 'v_P,v_S', name: t('P 波与 S 波速度', 'P- and S-wave velocity'), unit: 'km/s' },
    { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
    { sym: 'r', name: t('地心半径', 'radius from Earth centre'), unit: 'km' },
    { sym: '\\text{CMB}', name: t('核幔边界', 'core–mantle boundary'), unit: 'km', typical: '2891' },
    { sym: '\\text{ICB}', name: t('内外核边界', 'inner-core boundary'), unit: 'km', typical: '5154' },
  ],
  conditions: {
    applies: [t('球对称地球走时计算、震源定位与层析初始模型', 'Spherically symmetric travel-time computation, event location and tomographic starting models')],
    assumes: [t('地球横向平均为球对称', 'The Earth is spherically symmetric after lateral averaging')],
    breaks: [t('精细研究（上地幔低速带、俯冲板片）必须加三维扰动', 'Detailed studies of, e.g., the low-velocity zone or slabs require 3D perturbations')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把地球分成若干层', 'Divide the Earth into layers'),
      latex: String.raw`r_0>r_1>\cdots>r_N` },
    { n: 2, op: 'setup', title: t('在每层内用低阶多项式插值', 'Interpolate with a low-order polynomial within each layer'),
      latex: String.raw`v(r)=a_0+a_1r+a_2r^{2}+a_3r^{3}` },
    { n: 3, op: 'physics', title: t('约束来自走时、自由振荡与质量—转动惯量', 'Constraints from travel times, free oscillations and mass/inertia'),
      latex: String.raw`\int\rho\,\mathrm{d}V=M_{\oplus},\qquad \int\rho\,r^{2}\mathrm{d}V=I_{\oplus}` },
    { n: 4, op: 'result', title: t('得到分段光滑的 v_P(r)、v_S(r)、ρ(r)', 'Obtain piecewise-smooth v_P(r), v_S(r) and ρ(r)'),
      latex: String.raw`\text{间断面处速度阶跃，其余处连续可微}` },
  ],
  example: {
    title: t('为什么外核没有 S 波', 'Why the outer core has no S waves'),
    input: t('PREM 在 2891 km 以下给出 v_S = 0', 'PREM gives v_S = 0 below 2891 km'),
    steps: [
      t('v_S = √(μ/ρ) = 0 ⟹ μ = 0', 'v_S = √(μ/ρ) = 0 means μ = 0'),
      t('剪切模量为零即液体', 'Zero shear modulus means a liquid'),
    ],
    output: t('这是外核为液态铁镍的最直接证据 —— 一条公式直接推出地球内部状态', 'The most direct evidence that the outer core is liquid iron–nickel: one formula settles a question about Earth’s interior'),
  },
  links: {
    upstream: [{ id: 'spherical-earth-travel-time', note: t('模型用于计算走时', 'The model feeds travel-time computation') }],
    seealso: [{ id: 'adams-williamson', note: t('密度剖面的独立约束', 'An independent constraint on density') }],
  },
  refs: [{ text: 'Dziewonski & Anderson (1981), Phys. Earth Planet. Inter., 25' }, { text: 'Kennett & Engdahl (1991), Geophys. J. Int., 105' }],
}

export default premVelocityModel
