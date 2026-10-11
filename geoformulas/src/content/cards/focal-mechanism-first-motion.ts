import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** focal-mechanism-first-motion */
const focalMechanismFirstMotion: FormulaCard = {
  id: 'focal-mechanism-first-motion',
  name: t('初动符号解震源机制', 'Focal Mechanism from First-motion Polarities'),
  aliases: { zh: ['初动解', '沙滩球'], en: ['first-motion focal mechanism', 'beach ball', 'fault plane solution'] },
  node: 'S4.1',
  tags: {
    math: ['MATH.GEOM', 'MATH.VECTOR'],
    method: ['METH.TELE'],
    quantity: ['Q.TENSOR', 'Q.SOURCE'],
  },
  audience: 'bachelor',
  complete: 'L3',
  statement: {
    main: String.raw`\text{sign}(u_{\text{初动}})=\text{sign}\!\left(\hat{\boldsymbol{\gamma}}\cdot\mathbf{M}\cdot\hat{\boldsymbol{\gamma}}\right)\ \propto\ \text{sign}\!\left(\sin 2\theta\cos\phi\right)\ \text{(双力偶)}`,
    variants: [
      { name: t('P 波初动的辐射花样', 'Radiation pattern of the P-wave first motion'), latex: String.raw`u_P\propto\frac{1}{r^{3}}*\text{远场}\ \to\ \hat{\gamma}_i\hat{\gamma}_j M_{ij}` },
      { name: t('节面（位移为零的面）', 'Nodal planes (surfaces of zero displacement)'), latex: String.raw`\hat{\boldsymbol{\gamma}}\cdot\mathbf{M}\cdot\hat{\boldsymbol{\gamma}}=0\quad\Rightarrow\quad \text{两个正交节面}` },
      { name: t('P、B、T 轴', 'P, B and T axes'), latex: String.raw`\mathbf{P}=\frac{\hat{\boldsymbol{n}}-\hat{\boldsymbol{d}}}{\sqrt2},\quad \mathbf{T}=\frac{\hat{\boldsymbol{n}}+\hat{\boldsymbol{d}}}{\sqrt2},\quad \mathbf{B}=\hat{\boldsymbol{n}}\times\hat{\boldsymbol{d}}` },
    ],
  },
  meaning: t(
    '只靠「第一个波是向上还是向下」这一种信息，就能定出断层的两个节面 —— 这是地震学里最经济的信息提取。台站分布越均匀，节面约束越好；两个节面哪个是真断层面，初动本身无法区分，必须借助余震分布、地表破裂或地质资料。',
    'Using only whether the first arrival is up or down, one can determine the two nodal planes of a fault — the most economical information extraction in seismology. The more uniform the station distribution, the better constrained the nodal planes. Which of the two planes is the real fault cannot be decided from first motions alone; aftershock distribution, surface rupture or geological data are needed.',
  ),
  symbols: [
    { sym: '\\hat{\\boldsymbol{\\gamma}}', name: t('从震源指向台站的单位矢量', 'unit vector from source to station'), unit: '无量纲' },
    { sym: '\\mathbf{M}', name: t('矩张量（双力偶部分）', 'moment tensor (double-couple part)'), unit: 'N·m' },
    { sym: '\\hat{\\boldsymbol{n}}', name: t('断层面法向', 'fault-plane normal'), unit: '无量纲' },
    { sym: '\\hat{\\boldsymbol{d}}', name: t('滑动方向', 'slip direction'), unit: '无量纲' },
    { sym: '\\theta,\\phi', name: t('节面坐标下的极角与方位角', 'polar and azimuthal angles in nodal-plane coordinates'), unit: '°' },
  ],
  conditions: {
    applies: [t('P 波初动清晰、台站方位覆盖良好的地震', 'Earthquakes with clear P first motions and good azimuthal station coverage')],
    assumes: [t('震源为双力偶、速度模型足以算出离源角', 'The source is a double couple and the velocity model suffices to compute take-off angles')],
    breaks: [t('台站集中在某一象限、或初动被噪声淹没时解不稳定', 'When stations cluster in one quadrant or first motions are buried in noise the solution is unstable')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('双力偶的远场 P 波位移', 'Far-field P displacement of a double couple'),
      latex: String.raw`u_P\propto\hat{\gamma}_i\hat{\gamma}_j M_{ij}` },
    { n: 2, op: 'substitute', title: t('代入双力偶形式', 'Substitute the double-couple form'),
      latex: String.raw`M_{ij}=M_0\left(n_i d_j+n_j d_i\right)\;\Longrightarrow\; u_P\propto2M_0\left(\hat{\boldsymbol{\gamma}}\cdot\hat{\boldsymbol{n}}\right)\left(\hat{\boldsymbol{\gamma}}\cdot\hat{\boldsymbol{d}}\right)` },
    { n: 3, op: 'geometry', title: t('乘积为零给出两个节面', 'A vanishing product defines two nodal planes'),
      latex: String.raw`\hat{\boldsymbol{\gamma}}\cdot\hat{\boldsymbol{n}}=0\ \text{或}\ \hat{\boldsymbol{\gamma}}\cdot\hat{\boldsymbol{d}}=0` },
    { n: 4, op: 'result', title: t('四个象限符号交替', 'Signs alternate across four quadrants'),
      latex: String.raw`\text{sign}\!\left(u_P\right)=\text{sign}\!\left[\left(\hat{\boldsymbol{\gamma}}\cdot\hat{\boldsymbol{n}}\right)\left(\hat{\boldsymbol{\gamma}}\cdot\hat{\boldsymbol{d}}\right)\right]` },
  ],
  viz: [
    {
      id: 'beachball',
      level: 'V1',
      title: t('P 波辐射花样的四象限分布', 'Four-quadrant pattern of P-wave radiation'),
      xlabel: t('方位角 (°)', 'azimuth (°)'),
      ylabel: t('P 波辐射振幅（相对）', 'P-wave radiation amplitude (relative)'),
      controls: [
        { id: 'dip', label: t('节面倾角', 'nodal plane dip'), min: 5, max: 90, step: 5, value: 45, unit: '°' },
        { id: 'rake', label: t('滑动角', 'rake'), min: -180, max: 180, step: 5, value: 0, unit: '°' },
      ],
      compute: (p) => {
        const dip = (p['dip'] * Math.PI) / 180
        const rake = (p['rake'] * Math.PI) / 180
        const pts: Array<[number, number]> = []
        for (let i = 0; i <= 360; i++) {
          const az = (i / 360) * 360
          const a = (az * Math.PI) / 180
          // 在水平面内取离源角为 45° 的射线，辐射 ≈ sin2θcosφ 型
          const n = [0, Math.cos(dip), -Math.sin(dip)]
          const d = [Math.cos(rake), Math.sin(rake) * Math.cos(dip), Math.sin(rake) * Math.sin(dip)]
          const g = [Math.sin(a) * 0.7071, Math.cos(a) * 0.7071, -0.7071]
          const gn = g[0] * n[0] + g[1] * n[1] + g[2] * n[2]
          const gd = g[0] * d[0] + g[1] * d[1] + g[2] * d[2]
          pts.push([az, 2 * gn * gd])
        }
        return [{ label: t('u_P', 'u_P'), color: '#185FA5', points: pts }]
      },
      note: t('符号改变的地方就是节面。真实解需要三维的台站分布（不同离源角），这里只在一条离源角为 45° 的圆锥上取样。', 'The sign changes mark the nodal planes. A real solution needs 3D station distribution with varied take-off angles; here we sample only a cone at 45°.'),
    },
  ],
  links: {
    upstream: [{ id: 'moment-tensor-definition', note: t('辐射花样的来源', 'Origin of the radiation pattern') }],
    seealso: [{ id: 'centroid-moment-tensor', note: t('波形反演的现代方法', 'The modern waveform-based method') }],
  },
  refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.2' }],
}

export default focalMechanismFirstMotion
