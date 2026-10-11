import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** surface-wave-sensitivity-kernel */
const surfaceWaveSensitivityKernel: FormulaCard = {
  id: 'surface-wave-sensitivity-kernel',
  name: t('面波灵敏度核', 'Surface-wave Sensitivity Kernels'),
  aliases: { zh: ['灵敏度核', '深度灵敏', '频散反演'], en: ['sensitivity kernel', 'depth sensitivity', 'dispersion inversion'] },
  node: 'S5.3',
  tags: {
    math: ['MATH.DIFF', 'MATH.LINALG'],
    method: ['METH.SURF', 'METH.INV'],
    quantity: ['Q.VEL', 'Q.GEOM'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`\delta c(\omega) = \int_{0}^{\infty} K_{\beta}(z,\omega)\,\delta\beta(z)\,dz`,
    variants: [
      { name: t('离散形式（反演用）', 'Discrete form (used in inversion)'), latex: String.raw`\delta c_i = \sum_j K_{ij}\,\delta\beta_j\,\Delta z_j` },
      { name: t('由偏导数定义', 'Defined as a partial derivative'), latex: String.raw`K_{\beta}(z,\omega) = \frac{\partial c(\omega)}{\partial\beta(z)}` },
      { name: t('经验法则：灵敏深度约 λ/3', 'Rule of thumb: sensitive depth ≈ λ/3'), latex: String.raw`z_{\text{sens}} \approx \frac{\lambda}{3} = \frac{c}{3f}` },
    ],
  },
  meaning: t(
    '面波为什么能探测地下结构？因为不同周期的面波「摸」到不同深度：长周期摸得深，短周期摸得浅。灵敏度核把这个直觉量化 —— 它告诉你某一周期的相速度对某一深度的 S 波速度有多敏感。有了它，频散曲线反演就变成一次带核的线性反演。',
    'Why can surface waves probe the subsurface? Because waves of different periods feel different depths: long periods feel deep, short periods shallow. The sensitivity kernel quantifies this intuition — it tells you how sensitive the phase velocity at a given period is to the S velocity at a given depth. With it, dispersion-curve inversion becomes a linear inversion with kernels.',
  ),
  symbols: [
    { sym: 'K_{\\beta}(z,\\omega)', name: t('对 S 波速度的灵敏度核', 'sensitivity kernel for S velocity'), unit: '无量纲' },
    { sym: '\\delta c', name: t('相速度的扰动', 'perturbation of phase velocity'), unit: 'km/s' },
    { sym: '\\delta\\beta', name: t('S 波速度的扰动', 'perturbation of S velocity'), unit: 'km/s' },
    { sym: '\\lambda', name: t('波长', 'wavelength'), unit: 'km' },
    { sym: 'z_{\\text{sens}}', name: t('最灵敏深度', 'depth of maximum sensitivity'), unit: 'km' },
  ],
  conditions: {
    applies: [t('面波频散反演、Vs 剖面成像', 'Surface-wave dispersion inversion and Vs profiling')],
    assumes: [
      t('一维水平层状介质', '1D horizontally layered media'),
      t('Born/一阶扰动近似', 'Born (first-order perturbation) approximation'),
    ],
    breaks: [
      t('强反差介质中一阶近似不够，需迭代更新核', 'Strong contrasts need iterative kernel updates beyond first order'),
      t('横向非均匀时需三维核，计算量剧增', 'Lateral heterogeneity requires 3D kernels at much greater cost'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('相速度是速度结构的泛函', 'Phase velocity is a functional of the velocity structure'),
      latex: String.raw`c(\omega) = \mathcal{F}[\alpha(z),\beta(z),\rho(z)]` },
    { n: 2, op: 'taylor', title: t('取一阶变分', 'Take the first variation'),
      latex: String.raw`\delta c = \int\left[\frac{\partial c}{\partial\alpha}\delta\alpha + \frac{\partial c}{\partial\beta}\delta\beta + \frac{\partial c}{\partial\rho}\delta\rho\right]dz` },
    { n: 3, op: 'identity', title: t('面波对 β 最敏感', 'Surface waves are most sensitive to β'),
      latex: String.raw`|K_\beta| \gg |K_\alpha|,\ |K_\rho| \Longrightarrow \text{通常只反演 } \beta` },
    { n: 4, op: 'algebra', title: t('离散化得到线性系统', 'Discretise to get a linear system'),
      latex: String.raw`\delta c_i = \sum_j K_{ij}\delta\beta_j\Delta z_j` },
    { n: 5, op: 'result', title: t('灵敏深度的估计', 'Estimating the sensitive depth'),
      latex: String.raw`z_{\text{sens}} \approx \frac{\lambda}{3}` },
  ],
  viz: [
    {
      id: 'kernel-vs-depth',
      level: 'V2',
      title: t('不同周期的灵敏度核', 'Sensitivity kernels at different periods'),
      xlabel: t('归一化灵敏度', 'normalised sensitivity'),
      ylabel: t('深度 z (km)', 'depth z (km)'),
      controls: [
        { id: 'T', label: t('周期 T (s)', 'period T (s)'), min: 2, max: 80, step: 1, value: 20 },
        { id: 'c', label: t('相速度 c (km/s)', 'phase velocity c (km/s)'), min: 1, max: 4, step: 0.05, value: 3.0 },
      ],
      note: t('周期加倍，灵敏深度大致也加倍 —— 这就是「长周期看深、短周期看浅」的定量版本。', 'Doubling the period roughly doubles the sensitive depth — the quantitative version of “long periods see deep, short periods see shallow”.'),
      compute: (p) => {
        const T = p['T'], c = p['c']
        const lam = c * T
        const zs = lam / 3
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 240; i++) {
          const z = (i / 240) * 120
          const x = z / zs
          // 半空间 Rayleigh 波能量随深度的典型衰减形态
          const k = x * Math.exp(-x + 1) * 0.6 + 0.15 * Math.exp(-x * x)
          pts.push([k, z])
        }
        return [{ label: t('K_β(z)', 'K_β(z)'), color: '#185FA5', points: pts }]
      },
    },
  ],
  example: {
    title: t('20 s 面波看多深', 'How deep does a 20 s surface wave see'),
    input: t('c = 3.0 km/s，T = 20 s', 'c = 3.0 km/s, T = 20 s'),
    steps: [
      t('λ = 3.0 × 20 = 60 km', 'λ = 3.0 × 20 = 60 km'),
      t('z_sens ≈ 60/3 = 20 km', 'z_sens ≈ 60/3 = 20 km'),
    ],
    output: t('20 s 面波主要约束 20 km 附近的 S 波速度', 'A 20 s surface wave mainly constrains the S velocity near 20 km depth'),
  },
  links: {
    upstream: [{ id: 'phase-group-velocity', note: t('频散曲线是输入', 'Dispersion curves are the input') }],
    downstream: [{ id: 'travel-time-tomography', note: t('同类线性反演框架', 'The same linear inversion framework') }],
    seealso: [{ id: 'resolution-matrix', note: t('核决定分辨率', 'The kernel determines resolution') }],
  },
  refs: [{ text: 'Dahlen, F. & Tromp, J. (1998). Theoretical Global Seismology, ch. 12' }],
}

export default surfaceWaveSensitivityKernel
