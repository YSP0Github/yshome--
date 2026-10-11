import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** moment-tensor-inversion-linear */
const momentTensorInversionLinear: FormulaCard = {
  id: 'moment-tensor-inversion-linear',
  name: t('线性矩张量反演', 'Linear Moment-tensor Inversion'),
  aliases: { zh: ['矩张量反演', '六个分量', 'Green 函数'], en: ['moment tensor inversion', 'six components', 'Green functions'] },
  node: 'S4.7',
  tags: {
    math: ['MATH.LINALG', 'MATH.STAT'],
    method: ['METH.INV', 'METH.TELE'],
    quantity: ['Q.TENSOR', 'Q.SOURCE'],
  },
  audience: 'phd',
  complete: 'L3',
  statement: {
    main: String.raw`\mathbf{m} = \left(\mathbf{G}^{T}\mathbf{G}\right)^{-1}\mathbf{G}^{T}\mathbf{d},\qquad \mathbf{m} = \left(M_{xx},M_{yy},M_{zz},M_{xy},M_{xz},M_{yz}\right)^{T}`,
    variants: [
      { name: t('P 波的敏感度核', 'P-wave sensitivity kernel'), latex: String.raw`g^{P}_{k} \propto \gamma_i\gamma_j \Longrightarrow (\gamma_1^{2},\ \gamma_2^{2},\ \gamma_3^{2},\ 2\gamma_1\gamma_2,\ 2\gamma_1\gamma_3,\ 2\gamma_2\gamma_3)` },
      { name: t('偏量约束（去掉 ISO）', 'Deviatoric constraint (removing ISO)'), latex: String.raw`M_{xx}+M_{yy}+M_{zz} = 0 \Longrightarrow 5\ \text{个自由度}` },
      { name: t('带协方差的解', 'Solution with data covariance'), latex: String.raw`\mathbf{m} = (\mathbf{G}^{T}\mathbf{C}_d^{-1}\mathbf{G})^{-1}\mathbf{G}^{T}\mathbf{C}_d^{-1}\mathbf{d}` },
    ],
  },
  meaning: t(
    '在固定震源位置与 Green 函数的前提下，波形与矩张量的六个分量是线性关系 —— 所以矩张量反演本质上就是一次最小二乘。难点不在求解，而在观测几何：如果台站只覆盖很窄的方位角或很小的离源角，ISO 与 CLVD 在数学上几乎无法区分，反演结果会剧烈震荡。',
    'With the source location and Green functions fixed, waveforms are linear in the six moment-tensor components, so moment-tensor inversion is essentially one least-squares solve. The difficulty is not the solve but the observation geometry: with narrow azimuthal coverage or a narrow range of take-off angles, ISO and CLVD are mathematically near-degenerate and the solution oscillates wildly.',
  ),
  symbols: [
    { sym: '\\mathbf{m}', name: t('六个独立矩张量分量', 'the six independent moment-tensor components'), unit: 'N·m' },
    { sym: '\\mathbf{G}', name: t('Green 函数导数构成的敏感矩阵', 'sensitivity matrix built from Green-function derivatives'), unit: '1/(N·m)' },
    { sym: '\\mathbf{d}', name: t('波形数据', 'waveform data'), unit: 'm' },
    { sym: '\\gamma', name: t('射线出射方向的单位矢量', 'unit vector along the ray take-off direction'), unit: '无量纲' },
    { sym: '\\mathbf{C}_{d}', name: t('数据协方差矩阵', 'data covariance matrix'), unit: 'm²' },
  ],
  conditions: {
    applies: [t('区域与全球台网的中强震震源机制解算', 'Focal mechanism determination for moderate and large events with regional and global networks')],
    assumes: [
      t('震源位置与速度模型已知', 'Source location and velocity model are known'),
      t('点源近似成立（周期远长于破裂时间）', 'The point-source approximation holds (periods far longer than the rupture time)'),
    ],
    breaks: [
      t('大地震必须做有限断层反演', 'Great earthquakes require finite-fault inversion'),
      t('速度模型误差是最大的系统误差来源', 'Velocity-model error is the largest source of systematic error'),
    ],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('位移的表示定理', 'Representation theorem for displacement'),
      latex: String.raw`u_n(\mathbf{x},t) = M_{pq}\left[G_{np,q} * s(t)\right]` },
    { n: 2, op: 'identity', title: t('对矩张量线性', 'Linear in the moment tensor'),
      latex: String.raw`\mathbf{d} = \mathbf{G}\mathbf{m}` },
    { n: 3, op: 'algebra', title: t('最小二乘解', 'Least-squares solution'),
      latex: String.raw`\mathbf{m} = (\mathbf{G}^{T}\mathbf{G})^{-1}\mathbf{G}^{T}\mathbf{d}` },
    { n: 4, op: 'identity', title: t('P 波对各分量的敏感度', 'P-wave sensitivity to each component'),
      latex: String.raw`g^{P} \propto \gamma_i\gamma_j` },
    { n: 5, op: 'result', title: t('加权形式', 'Weighted form'),
      latex: String.raw`\mathbf{m} = (\mathbf{G}^{T}\mathbf{C}_d^{-1}\mathbf{G})^{-1}\mathbf{G}^{T}\mathbf{C}_d^{-1}\mathbf{d}` },
  ],
  viz: [
    {
      id: 'iso-dc-degeneracy',
      level: 'V2',
      title: t('ISO 与 DC 的辐射花样随离源角的分化', 'ISO and DC radiation patterns diverge with take-off angle'),
      xlabel: t('离源角 θ (°)', 'take-off angle θ (°)'),
      ylabel: t('归一化 P 波辐射', 'normalised P radiation'),
      controls: [
        { id: 'dip', label: t('断层面倾角 (°)', 'fault dip (°)'), min: 5, max: 85, step: 1, value: 45 },
      ],
      note: t('在近垂直出射（θ 小）时两者几乎重合 —— 只用远震 P 波的台网很难约束 ISO 成分。', 'At near-vertical take-off (small θ) the two nearly coincide — a network using only teleseismic P struggles to constrain the ISO component.'),
      compute: (p) => {
        const dip = (p['dip'] * Math.PI) / 180
        const iso: Array<[number, number]> = []
        const dc: Array<[number, number]> = []
        for (let i = 0; i <= 180; i++) {
          const th = (i / 180) * 90
          const t = (th * Math.PI) / 180
          iso.push([th, 1])
          // 倾角 ξ 的纯双力偶，P 辐射 ∝ sin2(θ−ξ) 的归一化幅度
          dc.push([th, Math.abs(Math.sin(2 * (t - dip)))])
        }
        return [
          { label: t('ISO（各向同性，恒为 1）', 'ISO (isotropic, constant 1)'), color: '#888780', points: iso, dash: true },
          { label: t('双力偶 |sin2(θ−ξ)|', 'double couple |sin2(θ−ξ)|'), color: '#185FA5', points: dc },
        ]
      },
    },
  ],
  example: {
    title: t('六个分量需要多少台站', 'How many stations for six components'),
    input: t('最少需要 6 个独立观测；实际要求方位覆盖 > 180°', 'Six independent observations minimum; in practice azimuthal coverage > 180° is required'),
    steps: [
      t('单个台站只提供一个方向的 γ_i γ_j 投影', 'One station gives the projection γ_iγ_j in a single direction'),
      t('方位覆盖不足时 G^T G 接近奇异，解不稳定', 'Insufficient azimuthal coverage makes G^T G nearly singular and the solution unstable'),
    ],
    output: t('全球台网的 CMT 解通常要求至少 20–30 个方位分布良好的台站', 'Global CMT solutions typically require at least 20–30 well-distributed stations'),
  },
  links: {
    upstream: [{ id: 'moment-tensor-definition', note: t('待求的六个量', 'The six unknowns') }],
    downstream: [{ id: 'centroid-moment-tensor', note: t('实际操作中的标准做法', 'The standard practical implementation') }],
    seealso: [{ id: 'dc-iso-clvd-decomposition', note: t('解出来之后的分解', 'Decomposition after solving') }],
  },
  refs: [{ text: 'Dziewonski, A., Chou, T.-A. & Woodhouse, J. (1981). Determination of earthquake source parameters. J. Geophys. Res., 86, 2825–2852' }],
}

export default momentTensorInversionLinear
