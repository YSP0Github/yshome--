import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** velocity-model-parameterization */
const velocityModelParameterization: FormulaCard = {
  id: 'velocity-model-parameterization',
  name: t('一维速度模型的参数化', 'Parametrizing a 1-D Velocity Model'),
  aliases: { zh: ['模型参数化', '层状模型', '线性梯度层'], en: ['model parametrization', 'layered model', 'linear-gradient layer'] },
  node: 'S7.1',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.APPROX'],
    method: ['METH.STRUCT', 'METH.INV'],
    quantity: ['Q.VEL', 'Q.GEOM'],
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`v(z) = v_k + \frac{v_{k+1}-v_k}{z_{k+1}-z_k}(z-z_k),\qquad z_k \le z \le z_{k+1}`,
    variants: [
      { name: t('常速度层中的走时与水平距离', 'Travel time and horizontal distance in a constant-velocity layer'), latex: String.raw`\Delta t = \Delta z\,\sqrt{v^{-2}-p^{2}},\qquad \Delta X = \frac{p\,\Delta z}{\sqrt{v^{-2}-p^{2}}}` },
      { name: t('线性梯度层中的走时（v = a + bz）', 'Travel time in a linear-gradient layer (v = a + bz)'), latex: String.raw`T = \frac{1}{b}\,\mathrm{arcosh}\!\left(\frac{1}{p v_1}\right)\ \text{的差形式},\qquad X = \frac{1}{bp}\sqrt{1-p^{2}v^{2}}` },
      { name: t('均匀球壳中的走时（扁平化后）', 'Travel time in a homogeneous spherical shell (after flattening)'), latex: String.raw`T(p) = \frac{1}{\zeta}\left[\sqrt{1-p^{2}v^{2}}\ \right]_{r_1}^{r_2}\ \text{形式},\qquad \zeta = \frac{v}{r}\ \text{的对数导数}` },
      { name: t('模型参数个数与分辨率的矛盾', 'Tension between parameter count and resolution'), latex: String.raw`N_{\text{参数}} \uparrow \Rightarrow \text{拟合残差} \downarrow,\ \text{但}\ \mathrm{Var}(\hat{m}) \uparrow` },
    ],
  },
  meaning: t(
    '「地球的速度随深度怎么变」必须先被写成有限个数字，才能被反演。最简单的写法是分常速层，但它会造成虚假的速度阶跃；更常用的写法是让速度在每层内线性变化（v = a + bz），这样速度连续、走时可以解析积分。参数化方式的选择直接决定了反演的分辨率矩阵 —— 用比数据能支撑的更多的层，得到的只是把噪声画成了结构。',
    '"How velocity varies with depth" must first be written as a finite set of numbers before it can be inverted. The simplest form is constant-velocity layers, but that produces spurious velocity jumps; a more common form lets velocity vary linearly within each layer (v = a + bz), so velocity is continuous and travel times can be integrated analytically. The choice of parametrization directly determines the resolution matrix — using more layers than the data can support merely maps noise into structure.',
  ),
  symbols: [
    { sym: 'v(z)', name: t('随深度变化的速度', 'velocity as a function of depth'), unit: 'km/s' },
    { sym: 'z_k', name: t('第 k 个层界面的深度', 'depth of the k-th layer boundary'), unit: 'km' },
    { sym: 'p', name: t('射线参数', 'ray parameter'), unit: 's/km' },
    { sym: '\\zeta', name: t('速度—半径的对数导数 d ln v / d ln r', 'logarithmic velocity–radius derivative d ln v / d ln r'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('走时反演、射线追踪的正演引擎、模型比较', 'Travel-time inversion, forward engines for ray tracing, model comparison')],
    assumes: [t('径向对称，忽略横向变化', 'Radial symmetry, lateral variations ignored')],
    breaks: [t('需要三维结构时必须用球谐或网格参数化', 'Spherical-harmonic or grid parametrization is required for 3-D structure')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('把连续函数离散成层', 'Discretise the continuous function into layers'), latex: String.raw`v(z) \to \{v_0, v_1, \dots, v_K\}\ \text{在}\ \{z_0, z_1, \dots, z_K\}` },
    { n: 2, op: 'geometry', title: t('层内线性插值保证速度连续', 'Linear interpolation within a layer keeps velocity continuous'), latex: String.raw`v(z) = v_k + \frac{v_{k+1}-v_k}{z_{k+1}-z_k}(z-z_k)` },
    { n: 3, op: 'identity', title: t('射线参数守恒：p = sin i / v', 'The ray parameter is conserved: p = sin i / v'), latex: String.raw`p = \frac{\sin i}{v} = \text{const}` },
    { n: 4, op: 'substitute', title: t('水平慢度段 ΔX = p·Δz/√(v⁻²−p²) 的积分', 'Integrate the horizontal slowness segment ΔX = p·Δz/√(v⁻²−p²)'), latex: String.raw`X(p) = \int \frac{p}{\sqrt{v^{-2}-p^{2}}}\,\mathrm{d}z` },
    { n: 5, op: 'result', title: t('常速层与线性梯度层都有闭式解，故正演很快', 'Both constant-velocity and linear-gradient layers have closed-form solutions, so forward modelling is fast'), latex: String.raw`\tau(p),\ X(p)\ \text{可解析计算} \Rightarrow \text{反迭代可行}` },
  ],
  viz: [
    {
      id: 'param-model',
      level: 'V1',
      title: t('两种参数化下的速度剖面', 'Velocity profiles under two parametrizations'),
      xlabel: t('速度 v (km/s)', 'velocity v (km/s)'),
      ylabel: t('深度 z (km)', 'depth z (km)'),
      controls: [
        { id: 'nl', label: t('层数', 'number of layers'), min: 2, max: 20, step: 1, value: 8 },
        { id: 'mode', label: t('0 = 常速层, 1 = 线性梯度', '0 = constant velocity, 1 = linear gradient'), min: 0, max: 1, step: 1, value: 1 },
      ],
      note: t('常速层给出阶梯状剖面（速度不连续，会产生虚假的折射与反射），线性梯度层给出折线状剖面（速度连续）。层数越多越贴近真实，但反演的方差也随之增大。', 'Constant-velocity layers give a staircase profile (velocity discontinuous, producing spurious refractions and reflections); linear-gradient layers give a piecewise-linear profile (velocity continuous). More layers approach reality but increase the inversion variance.'),
      compute: (p) => {
        const nl = Math.max(2, Math.round(p['nl'])), mode = Math.round(p['mode'])
        const vtrue = (z: number) => 5.5 + 3.0 * (1 - Math.exp(-z / 200)) + 1.2 * (z / 700)
        const pts: Array<[number, number]> = []
        const dz = 700 / nl
        for (let k = 0; k < nl; k++) {
          const z0 = k * dz
          if (mode === 0) {
            const vm = vtrue(z0 + dz / 2)
            pts.push([vm, z0])
            pts.push([vm, z0 + dz])
          } else {
            pts.push([vtrue(z0), z0])
            pts.push([vtrue(z0 + dz), z0 + dz])
          }
        }
        const truth: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const z = (i / 200) * 700
          truth.push([vtrue(z), z])
        }
        return [
          { label: t('参数化模型', 'parametrized model'), color: '#185FA5', points: pts },
          { label: t('真实剖面', 'true profile'), color: '#993C1D', points: truth },
        ]
      },
    },
  ],
  example: {
    title: t('层数选多少', 'How many layers'),
    input: t('700 km 深度范围，8 层线性梯度', '700 km depth range, 8 linear-gradient layers'),
    steps: [
      t('每层厚 87.5 km', 'Each layer is 87.5 km thick'),
      t('若数据只有 200 个走时残差，8 层意味着每层约 25 个观测约束一层', 'With only 200 travel-time residuals, 8 layers means about 25 observations constrain each layer'),
    ],
    output: t('参数个数远小于数据个数，反演稳定', 'Parameter count well below data count, so the inversion is stable'),
  },
  links: {
    upstream: [
      { id: 'iasp91-model', note: t('IASP91 就是这种参数化的产物', 'IASP91 is a product of this parametrization') },
      { id: 'ray-parameter-conservation', note: t('p 守恒是积分的起点', 'Conservation of p is the starting point of the integral') },
    ],
    downstream: [{ id: 'resolution-matrix', note: t('参数化直接决定分辨率矩阵', 'Parametrization directly determines the resolution matrix') }],
    seealso: [{ id: 'wiechert-herglotz-inversion', note: t('经典的一维反演方法', 'The classical 1-D inversion method') }],
  },
  refs: [{ text: 'Kennett & Engdahl (1991), IASP91, Geophys. J. Int. 105, 429–465' }],
}

export default velocityModelParameterization
