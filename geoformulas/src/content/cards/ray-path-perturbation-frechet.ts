import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** ray-path-perturbation-frechet */
const rayPathPerturbationFrechet: FormulaCard = {
  id: 'ray-path-perturbation-frechet',
  name: t('走时的 Fréchet 核与费马原理', 'Travel-time Fréchet Kernels & Fermat\'s Principle'),
  aliases: { zh: ['Fréchet 核', '灵敏度核', '费马原理', '香蕉甜甜圈核'], en: ['Fréchet kernel', 'sensitivity kernel', 'Fermat principle', 'banana-doughnut kernel'] },
  node: 'S10.2',
  tags: {
    math: ['MATH.DIFF', 'MATH.APPROX'],
    method: ['METH.INV'],
    quantity: ['Q.TIME', 'Q.VEL'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`\delta T = \int_{V} K(\mathbf{x})\,\delta s(\mathbf{x})\,\mathrm{d}^{3}\mathbf{x},\qquad
K(\mathbf{x}) = \frac{\partial T}{\partial s(\mathbf{x})}`,
    variants: [
      { name: t('射线理论极限：核退化为沿射线的 δ 函数', 'Ray-theory limit: the kernel collapses to a delta on the ray'), latex: String.raw`K(\mathbf{x}) \to \int_{\text{ray}} \delta(\mathbf{x}-\mathbf{x}_{\text{ray}}(\ell))\,\mathrm{d}\ell` },
      { name: t('有限频极限：核是「香蕉—甜甜圈」', 'Finite-frequency limit: the banana–doughnut kernel'), latex: String.raw`K(\mathbf{x}) \ne 0\ \text{在第一 Fresnel 带内}\ (r \lesssim \sqrt{\lambda L})` },
      { name: t('费马原理：一阶扰动可沿未扰动射线计算', "Fermat's principle: first-order perturbations can be evaluated along the unperturbed ray"), latex: String.raw`\delta T = -\int_{\text{ray}} s^{2}\,\delta v\,\mathrm{d}\ell = -\int_{\text{ray}}\delta s\,\mathrm{d}\ell` },
      { name: t('有限频走时核（傍轴近似）', 'Finite-frequency travel-time kernel (paraxial approximation)'), latex: String.raw`K(\mathbf{x}) \propto \frac{1}{\omega}\,\mathrm{Im}\!\left[\frac{G_0(\mathbf{x},\mathbf{r})}{G_0(\mathbf{s},\mathbf{r})}\right]` },
    ],
  },
  meaning: t(
    '「走时对速度的偏导数是什么」是走时层析的全部基础。费马原理给了一个漂亮的简化：一阶近似下，你只需要沿未扰动的那条射线积分，不必重新追踪被扰动后的射线。但高频近似是有代价的 —— 真实的灵敏度核不是一条线，而是一个围绕射线的三维核，中心还有一个洞（射线上的点其实最不敏感），形状像一根香蕉套一个甜甜圈。忽略这个结构会把小尺度异常的位置和幅度都弄错。',
    '"What is the derivative of travel time with respect to velocity" is the entire foundation of travel-time tomography. Fermat\'s principle gives an elegant simplification: to first order you integrate along the unperturbed ray and need not retrace the perturbed ray. But the high-frequency approximation has a cost — the true sensitivity kernel is not a line but a three-dimensional kernel around the ray, with a hole in the middle (points on the ray are actually least sensitive), shaped like a banana wrapped in a doughnut. Ignoring this structure misplaces and mis-scales small anomalies.',
  ),
  symbols: [
    { sym: 'K(\\mathbf{x})', name: t('走时对慢度的 Fréchet 核', 'Fréchet kernel of travel time with respect to slowness'), unit: 's/(s/km)' },
    { sym: '\\delta s', name: t('慢度扰动', 'slowness perturbation'), unit: 's/km' },
    { sym: 'G_0', name: t('参考介质中的 Green 函数', 'Green function in the reference medium'), unit: '—' },
    { sym: '\\lambda, L', name: t('波长与传播距离（决定 Fresnel 带宽度）', 'wavelength and propagation distance (set the Fresnel-zone width)'), unit: 'km' },
  ],
  conditions: {
    applies: [t('走时层析的核构建、有限频层析、分辨率分析', 'Kernel construction for travel-time tomography, finite-frequency tomography, resolution analysis')],
    assumes: [t('扰动为一阶小量', 'Perturbations are first order')],
    breaks: [t('强扰动（速度差 > 10%）时一阶核不准确', 'For strong perturbations (>10% velocity contrast) first-order kernels are inaccurate'), t('焦散附近傍轴近似失效', 'The paraxial approximation fails near caustics')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('走时是慢度沿路径的线积分', 'Travel time is the line integral of slowness along the path'), latex: String.raw`T = \int_{\Gamma} s(\mathbf{x})\,\mathrm{d}\ell` },
    { n: 2, op: 'physics', title: t('费马原理：真实路径使 T 取驻值', "Fermat's principle: the true path makes T stationary"), latex: String.raw`\delta_\Gamma T = 0` },
    { n: 3, op: 'identity', title: t('故慢度扰动引起的一阶走时变化只需沿原路径积分', 'So the first-order travel-time change from a slowness perturbation needs only the original path'), latex: String.raw`\delta T = \int_{\Gamma_0}\delta s\,\mathrm{d}\ell` },
    { n: 4, op: 'substitute', title: t('把 δs 写成体分布形式', 'Write δs as a volumetric distribution'), latex: String.raw`\delta T = \int_V \delta(\mathbf{x}-\Gamma_0)\,\delta s(\mathbf{x})\,\mathrm{d}^{3}\mathbf{x}` },
    { n: 5, op: 'result', title: t('射线核 K 是沿射线的 δ；有限频时它展宽为三维核', 'The ray kernel K is a delta along the ray; at finite frequency it broadens into a 3-D kernel'), latex: String.raw`K_{\text{ray}} = \delta(\mathbf{x}-\Gamma_0);\qquad K_{\text{FF}} \ne 0\ \text{在 Fresnel 带内}` },
  ],
  viz: [
    {
      id: 'frechet-kernel',
      level: 'V2',
      title: t('从射线核到有限频核', 'From the ray kernel to the finite-frequency kernel'),
      xlabel: t('沿路径距离 (km)', 'distance along path (km)'),
      ylabel: t('横向偏移 (km)', 'transverse offset (km)'),
      controls: [
        { id: 'whz', label: t('0 = 射线核, 1 = 有限频核', '0 = ray kernel, 1 = finite-frequency'), min: 0, max: 1, step: 1, value: 1 },
        { id: 'f', label: t('频率 f (Hz)', 'frequency f (Hz)'), min: 0.02, max: 2, step: 0.02, value: 0.2 },
        { id: 'v', label: t('速度 v (km/s)', 'velocity v (km/s)'), min: 3, max: 12, step: 0.1, value: 8 },
        { id: 'L', label: t('传播距离 L (km)', 'propagation distance L (km)'), min: 100, max: 3000, step: 20, value: 800 },
      ],
      note: t('射线核是一条零宽度的线；有限频核是一根「香蕉」—— 沿路径方向拉长、在中心横截面上有叶瓣结构，而且正好在射线上灵敏度为零（甜甜圈的洞）。频率越低、距离越长，核越宽。', 'The ray kernel is a zero-width line; the finite-frequency kernel is a "banana" — elongated along the path, lobed in the central cross-section, and with exactly zero sensitivity on the ray itself (the doughnut hole). Lower frequency and longer distance give a wider kernel.'),
      compute: (p) => {
        const whz = Math.round(p['whz']), f = p['f'], v = p['v'], L = p['L']
        const lam = v / f
        const W = Math.sqrt(lam * L) // Fresnel 带半宽
        const pts: Array<[number, number]> = []
        if (whz === 0) {
          for (let i = 0; i <= 200; i++) {
            const s = (i / 200) * L
            pts.push([s, 0])
          }
          return [{ label: t('射线核（零宽度）', 'ray kernel (zero width)'), color: '#185FA5', points: pts }]
        }
        // 画出核的等值轮廓（上下边界 + 中心零线）
        const top: Array<[number, number]> = []
        const bot: Array<[number, number]> = []
        const zero: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const s = (i / 200) * L
          const width = W * Math.sqrt((4 * s * (L - s)) / (L * L))
          top.push([s, width])
          bot.push([s, -width])
          zero.push([s, 0])
        }
        return [
          { label: t('Fresnel 带上边界', 'upper Fresnel-zone boundary'), color: '#185FA5', points: top },
          { label: t('Fresnel 带下边界', 'lower Fresnel-zone boundary'), color: '#185FA5', points: bot },
          { label: t('零灵敏度轴（甜甜圈的洞）', 'zero-sensitivity axis (doughnut hole)'), color: '#993C1D', points: zero },
        ]
      },
    },
    {
      id: 'fresnel-width',
      level: 'V1',
      title: t('Fresnel 带半宽随距离与频率的变化', 'Fresnel-zone half width versus distance and frequency'),
      xlabel: t('传播距离 L (km)', 'propagation distance L (km)'),
      ylabel: t('Fresnel 带半宽 (km)', 'Fresnel-zone half width (km)'),
      controls: [
        { id: 'f', label: t('频率 f (Hz)', 'frequency f (Hz)'), min: 0.02, max: 2, step: 0.02, value: 0.2 },
        { id: 'v', label: t('速度 v (km/s)', 'velocity v (km/s)'), min: 3, max: 12, step: 0.1, value: 8 },
      ],
      note: t('半宽 ∝ √(λL)：距离增大 4 倍，宽度只增大 2 倍。所以远震走时对深部结构的横向分辨率并不像直觉那么差，但也远达不到射线理论给出的「点」分辨率。', 'Half width ∝ √(λL): quadrupling the distance only doubles the width. Teleseismic travel times therefore have worse lateral resolution at depth than intuition suggests, but still far better than the "point" resolution of ray theory.'),
      compute: (p) => {
        const f = p['f'], v = p['v']
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 200; i++) {
          const L = 50 + (i / 200) * 2950
          pts.push([L, Math.sqrt((v / f) * L)])
        }
        return [{ label: t('√(λL)', '√(λL)'), color: '#993C1D', points: pts }]
      },
    },
  ],
  example: {
    title: t('区域走时的 Fresnel 带', 'Fresnel zone for a regional phase'),
    input: t('v = 8 km/s，f = 0.2 Hz，L = 800 km', 'v = 8 km/s, f = 0.2 Hz, L = 800 km'),
    steps: [
      t('λ = v/f = 40 km', 'λ = v/f = 40 km'),
      t('W = √(40 × 800) = 179 km', 'W = √(40 × 800) = 179 km'),
    ],
    output: t('Fresnel 带半宽近 180 km —— 远大于射线理论的「零宽度」假设', 'Fresnel-zone half width nearly 180 km — far larger than the "zero width" of ray theory'),
  },
  links: {
    upstream: [
      { id: 'eikonal-equation', note: t('走时的高频定义来自程函方程', 'The high-frequency definition of travel time comes from the eikonal equation') },
      { id: 'fresnel-zone-radius', note: t('Fresnel 带决定核的宽度', 'The Fresnel zone sets the kernel width') },
    ],
    downstream: [{ id: 'travel-time-tomography', note: t('核就是层析矩阵 G 的每一行', 'The kernel is each row of the tomographic matrix G') }],
    seealso: [{ id: 'surface-wave-sensitivity-kernel', note: t('面波核是同类概念', 'Surface-wave kernels are the same idea') }],
  },
  refs: [{ text: 'Dahlen, Hung & Nolet (2000), Fréchet kernels for finite-frequency traveltimes — I. Theory, GJI 141, 157–174' }],
}

export default rayPathPerturbationFrechet
