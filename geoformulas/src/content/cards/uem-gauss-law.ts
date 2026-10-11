import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-gauss-law */
const uemGaussLaw: FormulaCard = {
  id: 'uem-gauss-law',
  name: t('Gauss 定律', "Gauss's Law"),
  aliases: { zh: ['高斯定理', '电场通量定理'], en: ["Gauss's law", 'Gauss flux theorem'] },
  node: 'S19.1',
  tags: {
    math: ['MATH.VECTOR', 'MATH.DIFF'],
    method: ['METH.PHYS'],
    quantity: ['Q.ELEC'],
    keywords: t('高斯定律 电通量 闭合曲面 包围电荷 球对称 线对称 面对称', 'Gauss law flux closed surface enclosed charge spherical planar symmetry'),
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\oint_{S}\mathbf{E}\cdot d\mathbf{A}=\frac{Q_{\mathrm{enc}}}{\varepsilon_{0}}`,
    variants: [
      { name: t('微分形式', 'Differential form'), latex: String.raw`\nabla\cdot\mathbf{E}=\dfrac{\rho_{q}}{\varepsilon_{0}}` },
      { name: t('球对称：均匀带电球', 'Spherical: uniform sphere'), latex: String.raw`E=\dfrac{1}{4\pi\varepsilon_{0}}\dfrac{Q}{r^{2}}\ (r\ge R)` },
      { name: t('无限长直线', 'Infinite line'), latex: String.raw`E=\dfrac{\lambda}{2\pi\varepsilon_{0}r}` },
      { name: t('无限大带电平板', 'Infinite sheet'), latex: String.raw`E=\dfrac{\sigma}{2\varepsilon_{0}}` },
    ],
  },
  meaning: t(
    '穿过任意闭合曲面的净电通量，只正比于曲面所包围的净电荷，与外部电荷无关。它是 Coulomb 平方反比律的积分形式，在高度对称（球、柱、平面）下能一步直接求出场，远比对微元积分快。',
    'The net electric flux through any closed surface depends only on the net charge enclosed, not on external charges. It is the integral form of the Coulomb inverse-square law and, for high symmetry (sphere, cylinder, plane), yields the field in one step, far faster than integrating elements.',
  ),
  symbols: [
    { sym: '\\oint_{S}', name: t('闭合曲面积分', 'closed-surface integral'), unit: '—' },
    { sym: 'Q_{\\mathrm{enc}}', name: t('曲面内净电荷', 'enclosed net charge'), unit: 'C' },
    { sym: '\\varepsilon_{0}', name: t('真空介电常数', 'permittivity'), unit: 'F/m' },
    { sym: '\\rho_{q}', name: t('体电荷密度', 'volume charge density'), unit: 'C/m³' },
  ],
  conditions: {
    applies: [t('任意电荷分布均成立；对称时可由通量直接解 E', 'Holds for any distribution; symmetry lets us solve E directly')],
    assumes: [t('选与电荷同对称的高斯面，使 E 在面上大小恒定', 'Choose a Gaussian surface matching the symmetry so |E| is constant on it')],
    breaks: [t('无对称性时通量已知也无法分离出 E', 'Without symmetry, known flux alone cannot isolate E')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('点电荷的球面通量', 'Flux of a point charge through a sphere'),
      latex: String.raw`\Phi_{E}=E\cdot 4\pi r^{2}=\dfrac{1}{4\pi\varepsilon_{0}}\dfrac{Q}{r^{2}}\cdot 4\pi r^{2}=\dfrac{Q}{\varepsilon_{0}}` },
    { n: 2, op: 'physics', title: t('叠加：多电荷通量相加', 'Superposition: fluxes add'),
      latex: String.raw`\oint\mathbf{E}\cdot d\mathbf{A}=\dfrac{1}{\varepsilon_{0}}\sum Q_{i}=\dfrac{Q_{\mathrm{enc}}}{\varepsilon_{0}}` },
    { n: 3, op: 'transform', title: t('用散度定理得微分形式', 'Divergence theorem gives differential form'),
      latex: String.raw`\oint\mathbf{E}\cdot d\mathbf{A}=\int\nabla\cdot\mathbf{E}\,dV=\int\dfrac{\rho_{q}}{\varepsilon_{0}}dV` },
  ],
  viz: [
    {
      id: 'gauss-e-r',
      level: 'V1',
      title: t('对称电荷分布的场强 E(r)', 'Field E(r) for symmetric charge distributions'),
      xlabel: t('距离 r (m)', 'distance r (m)'),
      ylabel: t('场强 E (V/m)', 'field E (V/m)'),
      xRange: [0, 5],
      controls: [
        { id: 'qval', label: t('总电荷 Q (μC)', 'total charge Q'), min: 0.1, max: 50, step: 0.1, value: 1, unit: 'μC' },
      ],
      compute: (p) => {
        const Q = p['qval'] * 1e-6
        const R = 1.0 // sphere radius
        const sphere: Array<[number, number]> = []
        const line: Array<[number, number]> = []
        for (let i = 1; i <= 200; i++) {
          const r = (i / 200) * 5 + 0.02
          const k = 1 / (4 * Math.PI * 8.854e-12)
          // uniformly charged sphere radius R: inside linear, outside 1/r^2
          const Ein = (r <= R) ? k * Q * r / (R * R * R) : k * Q / (r * r)
          sphere.push([r, Ein])
          // infinite line with total charge spread -> use lambda = Q/(2*R) for comparable scale
          const lam = Q / (2 * R)
          line.push([r, lam / (2 * Math.PI * 8.854e-12 * r)])
        }
        return [
          { label: t('均匀带电球 E(r)', 'uniform sphere E(r)'), color: '#185FA5', points: sphere },
          { label: t('无限长直线 E(r)', 'infinite line E(r)'), color: '#BA7517', points: line, dash: true },
        ]
      },
      note: t('球内 E∝r、球外 E∝1/r²（连续相接）；直线场 E∝1/r。', 'Inside a sphere E∝r, outside E∝1/r² (continuous join); a line gives E∝1/r.'),
    },
  ],
  links: {
    upstream: [{ id: 'uem-electric-flux' }, { id: 'uem-coulomb-law' }],
    downstream: [{ id: 'uem-conductor-electrostatic-equilibrium' }],
    seealso: [{ id: 'divergence-theorem' }],
  },
  refs: [{ text: 'Griffiths, Introduction to Electrodynamics, 4e, §2.2' }],
}

export default uemGaussLaw
