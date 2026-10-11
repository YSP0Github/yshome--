import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** d-double-prime-post-perovskite */
const dDoublePrimePostPerovskite: FormulaCard = {
  id: 'd-double-prime-post-perovskite',
  name: t('D″ 层与后钙钛矿相变', 'The D″ Layer & the Post-perovskite Transition'),
  aliases: { zh: ['D″ 层', '后钙钛矿', '核幔边界'], en: ['D-double-prime', 'post-perovskite', 'core–mantle boundary'] },
  node: 'S7.3',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.STRUCT'],
    quantity: ['Q.VEL', 'Q.GEOM'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`\text{MgSiO}_3\ \text{(钙钛矿)} \xrightarrow{\ \sim 125\ \text{GPa},\ \sim 2500\ \text{K}\ } \text{MgSiO}_3\ \text{(后钙钛矿)},\qquad
\Delta V < 0,\ \Delta S < 0`,
    variants: [
      { name: t('相变边界的 Clapeyron 斜率', 'Clapeyron slope of the phase boundary'), latex: String.raw`\frac{\mathrm{d}P}{\mathrm{d}T} = \frac{\Delta S}{\Delta V}` },
      { name: t('正斜率时冷的下沉板片内相变加深', 'With a positive slope the transition deepens inside cold slabs'), latex: String.raw`\text{冷异常} \Rightarrow T \downarrow \Rightarrow P_{\text{相变}} \downarrow \Rightarrow \text{深度} \downarrow` },
      { name: t('双重不连续面的深度差', 'Depth separation of the double discontinuity'), latex: String.raw`\Delta z \approx \frac{\Delta T}{|\mathrm{d}T/\mathrm{d}z|}\cdot\frac{(\mathrm{d}P/\mathrm{d}T)}{(\mathrm{d}P/\mathrm{d}z)}\ \text{量级估计}` },
      { name: t('D″ 层厚度', 'Thickness of the D″ layer'), latex: String.raw`\text{约}\ 200\text{–}300\ \text{km，位于 CMB 之上}` },
    ],
  },
  meaning: t(
    '核幔边界之上约 200–300 km 的 D″ 层是地球内部最诡异的一层：速度梯度异常低、横向变化极强、还常常出现一个速度随深度下降的反常区。2004 年发现的 MgSiO₃ 后钙钛矿相变给了一个统一的解释 —— 它发生在 D″ 顶部的温压条件下，正的 Clapeyron 斜率意味着在冷板片里相变面变浅、在热区变深，这正好解释了观测中时而出现「双重不连续面」的现象。',
    'The D″ layer, about 200–300 km above the core–mantle boundary, is the strangest layer in the Earth: anomalously low velocity gradient, extremely strong lateral variability, and often a region where velocity decreases with depth. The 2004 discovery of the MgSiO₃ post-perovskite transition offered a unifying explanation — it occurs at D″ pressure–temperature conditions, and its positive Clapeyron slope means the transition shallows in cold slabs and deepens in hot regions, exactly explaining the occasionally observed "double discontinuity".',
  ),
  symbols: [
    { sym: '\\Delta V, \\Delta S', name: t('相变的体积与熵变化', 'volume and entropy change of the transition'), unit: 'm³/mol, J/(mol·K)' },
    { sym: '\\mathrm{d}P/\\mathrm{d}T', name: t('Clapeyron 斜率', 'Clapeyron slope'), unit: 'MPa/K' },
    { sym: 'D^{\\prime\\prime}', name: t('核幔边界之上的最下地幔层', 'the lowermost mantle layer above the CMB'), unit: '—' },
    { sym: '\\Delta z', name: t('双重不连续面的深度差', 'depth separation of the double discontinuity'), unit: 'km' },
  ],
  conditions: {
    applies: [t('下地幔底部结构解释、板片最终归宿、ULVZ 研究', 'Interpreting the base of the lower mantle, slab graveyards, ULVZ studies')],
    assumes: [t('MgSiO₃ 体系足以代表下地幔矿物学', 'The MgSiO₃ system adequately represents lower-mantle mineralogy')],
    breaks: [t('含 Fe、Al 时相变压力与斜率会显著改变', 'Fe and Al content significantly shifts the transition pressure and slope'), t('化学分层（而非相变）也可能是速度跳变的来源', 'Chemical layering rather than a phase change may also produce the velocity jump')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('两相平衡时化学势相等', 'At equilibrium the chemical potentials of the two phases are equal'), latex: String.raw`\mu_{\text{Pv}}(P,T) = \mu_{\text{pPv}}(P,T)` },
    { n: 2, op: 'identity', title: t('沿相变边界微分', 'Differentiate along the phase boundary'), latex: String.raw`\mathrm{d}\mu = -S\,\mathrm{d}T + V\,\mathrm{d}P \Longrightarrow \Delta S\,\mathrm{d}T = \Delta V\,\mathrm{d}P` },
    { n: 3, op: 'algebra', title: t('得到 Clapeyron 方程', 'Obtain the Clapeyron equation'), latex: String.raw`\frac{\mathrm{d}P}{\mathrm{d}T} = \frac{\Delta S}{\Delta V}` },
    { n: 4, op: 'substitute', title: t('实测斜率为正且陡，意味着 ΔS<0（低压相 Pv 熵更高）', 'The measured slope is positive and steep, implying ΔS<0 (the low-pressure Pv phase has higher entropy)'), latex: String.raw`\frac{\mathrm{d}P}{\mathrm{d}T}=\frac{\Delta S}{\Delta V}\approx +8\ \text{MPa/K},\quad \Delta V<0\ \Rightarrow\ \Delta S<0` },
    { n: 5, op: 'result', title: t('冷板片内温度低 → 相变压力低 → 深度浅，出现双重界面', 'Cold slabs are cooler, so the transition pressure is lower and the depth shallower, producing a double interface'), latex: String.raw`T_{\text{板片}} < T_{\text{周围}} \Longrightarrow z_{\text{pPv}} \text{变浅} \Longrightarrow \text{Pv→pPv 与 pPv→Pv 两个界面}` },
  ],
  viz: [
    {
      id: 'clapeyron',
      level: 'V2',
      title: t('Clapeyron 斜率如何把温度异常映射成界面深度起伏', 'How the Clapeyron slope maps temperature anomalies into interface depth undulations'),
      xlabel: t('横向距离 (km)', 'lateral distance (km)'),
      ylabel: t('深度 z (km)', 'depth z (km)'),
      controls: [
        { id: 'slope', label: t('Clapeyron 斜率 (MPa/K)', 'Clapeyron slope (MPa/K)'), min: -10, max: 15, step: 0.5, value: 8 },
        { id: 'dT', label: t('板片温度异常 ΔT (K)', 'slab temperature anomaly ΔT (K)'), min: -1500, max: 500, step: 25, value: -800 },
        { id: 'z0', label: t('周围地幔的相变深度 (km)', 'ambient transition depth (km)'), min: 2550, max: 2750, step: 5, value: 2650 },
      ],
      note: t('正斜率下，冷的板片（ΔT < 0）把相变面往上拉，热的区域把它往下推 —— 界面起伏的幅度正比于斜率与温度异常的乘积。把斜率改成负值，起伏方向立刻反转。', 'With a positive slope, a cold slab (ΔT < 0) pulls the transition upward while hot regions push it downward — the amplitude of the undulation scales with the product of slope and temperature anomaly. Flip the slope negative and the undulation immediately reverses.'),
      compute: (p) => {
        const slope = p['slope'], dT = p['dT'], z0 = p['z0']
        const dPdz = 0.045 // GPa/km ≈ 45 MPa/km near CMB
        // Δz = (dP/dT)·ΔT / (dP/dz)，z 向下为正；冷板片 ΔT<0、正斜率 => Δz<0（变浅）
        const dz = (slope * dT) / (dPdz * 1000) // 单位 km
        const top: Array<[number, number]> = []
        const bot: Array<[number, number]> = []
        for (let i = 0; i <= 300; i++) {
          const x = (i / 300) * 4000 - 2000
          const g = Math.exp(-(x * x) / (2 * 550 * 550))
          top.push([x, z0 - 40 + dz * g])
          bot.push([x, z0 + 40 + dz * g])
        }
        return [
          { label: t('Pv → pPv 界面', 'Pv → pPv interface'), color: '#185FA5', points: top },
          { label: t('pPv → Pv 界面（热区回返）', 'pPv → Pv interface (return in hot regions)'), color: '#993C1D', points: bot },
        ]
      },
    },
  ],
  example: {
    title: t('板片内的相变深度偏移', 'Transition depth shift inside a slab'),
    input: t('斜率 = 8 MPa/K，ΔT = −800 K，dP/dz ≈ 45 MPa/km', 'slope = 8 MPa/K, ΔT = −800 K, dP/dz ≈ 45 MPa/km'),
    steps: [
      t('ΔP = 8 × (−800) = −6400 MPa = −6.4 GPa', 'ΔP = 8 × (−800) = −6400 MPa = −6.4 GPa'),
      t('Δz = ΔP / (dP/dz) = −6400 / 45 = −142 km（深度变小，即抬升 142 km）', 'Δz = ΔP / (dP/dz) = −6400 / 45 = −142 km (depth decreases, i.e. rises 142 km)'),
    ],
    output: t('冷板片内相变面抬升约 140 km，与地震学观测的界面起伏量级吻合', 'The transition surface rises by about 140 km inside a cold slab, matching the order of seismologically observed undulations'),
  },
  links: {
    upstream: [
      { id: 'mantle-discontinuities', note: t('D″ 是下地幔最深的界面', 'D″ is the deepest lower-mantle interface') },
      { id: 'prem-velocity-model', note: t('PREM 给出了参考深度', 'PREM provides the reference depths') },
    ],
    seealso: [
      { id: 'hydrostatic-equilibrium', note: t('dP/dz 来自静水压平衡', 'dP/dz comes from hydrostatic equilibrium') },
      { id: 'core-shadow-zone', note: t('核幔边界的几何约束', 'Geometrical constraints at the core–mantle boundary') },
    ],
  },
  refs: [{ text: 'Murakami et al. (2004), Post-perovskite phase transition in MgSiO₃, Science 304, 855–858' }],
}

export default dDoublePrimePostPerovskite
