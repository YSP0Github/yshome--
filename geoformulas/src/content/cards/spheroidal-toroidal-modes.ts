import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** spheroidal-toroidal-modes */
const spheroidalToroidalModes: FormulaCard = {
  id: 'spheroidal-toroidal-modes',
  name: t('球型模与环型模', 'Spheroidal & Toroidal Modes'),
  aliases: { zh: ['球型振荡', '环型振荡', '自由振荡分类'], en: ['spheroidal modes', 'toroidal modes', 'free oscillation classification'] },
  node: 'S5.5',
  tags: {
    math: ['MATH.VECTOR', 'MATH.DIFF'],
    method: ['METH.SURF', 'METH.STRUCT'],
    quantity: ['Q.FREQ', 'Q.TENSOR'],
  },
  audience: 'phd',
  complete: 'L2',
  statement: {
    main: String.raw`{}_{n}S_{\ell}\ (\text{球型}),\qquad {}_{n}T_{\ell}\ (\text{环型})`,
    variants: [
      { name: t('位移场的矢量球谐展开', 'Expansion in vector spherical harmonics'), latex: String.raw`\mathbf{u} = \sum_{n,\ell,m}\left[U_{n\ell}P_{\ell m} + V_{n\ell}B_{\ell m} + W_{n\ell}C_{\ell m}\right]` },
      { name: t('环型模只含 C（无径向位移）', 'Toroidal modes contain only C (no radial displacement)'), latex: String.raw`{}_{n}T_{\ell}:\ U = V = 0,\ W \ne 0` },
      { name: t('球型模含 U 与 V', 'Spheroidal modes contain U and V'), latex: String.raw`{}_{n}S_{\ell}:\ U\ne 0,\ V\ne 0,\ W = 0` },
      { name: t('基频量级', 'Fundamental frequency scale'), latex: String.raw`{}_{0}S_{2} \approx 0.31\ \text{mHz},\qquad {}_{0}T_{2} \approx 0.38\ \text{mHz}` },
    ],
  },
  meaning: t(
    '整个地球的简正振动分成互不相干的两族：球型模有径向位移、伴随体积变化，像地球的「呼吸」与「摇晃」；环型模只有水平扭转位移，不产生体积变化，因此重力仪和应变仪看不到它。这两族用不同的本征方程描述，可以分开反演，是地球大尺度结构最干净的约束之一。',
    'The normal modes of the whole Earth split into two decoupled families. Spheroidal modes have radial displacement and volume change — the Earth breathing and wobbling. Toroidal modes are purely torsional, with no volume change, so gravimeters and strainmeters cannot see them. The two families obey different eigen-equations and can be inverted separately, giving some of the cleanest constraints on large-scale Earth structure.',
  ),
  symbols: [
    { sym: '_{n}S_{\\ell}', name: t('球型模：n 为径向阶数，ℓ 为角阶数', 'spheroidal mode: n radial order, ℓ angular order'), unit: '无量纲' },
    { sym: '_{n}T_{\\ell}', name: t('环型模', 'toroidal mode'), unit: '无量纲' },
    { sym: 'U, V, W', name: t('径向、极向、环向位移函数', 'radial, poloidal and toroidal displacement functions'), unit: 'm' },
    { sym: 'P_{\\ell m}', name: t('标量球谐的梯度项', 'gradient term from scalar spherical harmonics'), unit: '无量纲' },
  ],
  conditions: {
    applies: [t('全球自由振荡谱的分析与地球大尺度结构反演', 'Analysis of global free-oscillation spectra and inversion for large-scale structure')],
    assumes: [
      t('球对称、非自转、弹性（SNREI）地球', 'Spherically symmetric, non-rotating, elastic (SNREI) Earth'),
      t('简并：同一 ℓ 的 2ℓ+1 个 m 频率相同', 'Degeneracy: the 2ℓ+1 values of m for a given ℓ share one frequency'),
    ],
    breaks: [
      t('自转与椭率使简并被打破，产生模态分裂', 'Rotation and ellipticity break the degeneracy, splitting the modes'),
      t('三维结构引起模态耦合，单一模的简单描述失效', '3D structure causes mode coupling, invalidating the single-mode picture'),
    ],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('位移场用矢量球谐展开', 'Expand the displacement in vector spherical harmonics'),
      latex: String.raw`\mathbf{u} = \sum\left[U\,P_{\ell m} + V\,B_{\ell m} + W\,C_{\ell m}\right]` },
    { n: 2, op: 'identity', title: t('代入运动方程后 UV 与 W 解耦', 'Substituting into the equations of motion decouples (U,V) from W'),
      latex: String.raw`\text{球型:}\ (U,V),\qquad \text{环型:}\ (W)` },
    { n: 3, op: 'physics', title: t('边界条件给出两套本征方程', 'Boundary conditions give two eigen-equations'),
      latex: String.raw`\det\mathbf{S}(\omega) = 0\ \text{(球型)},\qquad \det\mathbf{T}(\omega)=0\ \text{(环型)}` },
    { n: 4, op: 'identity', title: t('环型模不引起体积变化', 'Toroidal modes produce no volume change'),
      latex: String.raw`\nabla\cdot\mathbf{u}_{T} = 0 \Longrightarrow \text{无重力扰动}` },
    { n: 5, op: 'result', title: t('两族模各自编号', 'Each family is numbered separately'),
      latex: String.raw`{}_{n}S_{\ell},\ {}_{n}T_{\ell},\qquad n=0,1,2,\dots,\ \ell = 0,1,2,\dots` },
  ],
  viz: [
    {
      id: 'mode-branches',
      level: 'V1',
      title: t('基频随角阶数 ℓ 的变化', 'Fundamental frequency versus angular order ℓ'),
      xlabel: t('角阶数 ℓ', 'angular order ℓ'),
      ylabel: t('频率 (mHz)', 'frequency (mHz)'),
      controls: [
        { id: 'scale', label: t('频率标度 (mHz/ℓ)', 'frequency scale (mHz/ℓ)'), min: 0.05, max: 0.3, step: 0.005, value: 0.13 },
      ],
      note: t('频率随 ℓ 近似线性增长：ℓ 越大，波长越短，等效于面波沿地表绕行越快。', 'The frequency grows nearly linearly with ℓ: larger ℓ means shorter wavelength, equivalent to a surface wave circling the Earth faster.'),
      compute: (p) => {
        const s = p['scale']
        const S: Array<[number, number]> = []
        const T: Array<[number, number]> = []
        for (let l = 2; l <= 60; l++) {
          S.push([l, s * l])
          T.push([l, s * l * 1.22])
        }
        return [
          { label: t('₀S_ℓ 球型', '₀S_ℓ spheroidal'), color: '#185FA5', points: S },
          { label: t('₀T_ℓ 环型', '₀T_ℓ toroidal'), color: '#993C1D', points: T, dash: true },
        ]
      },
    },
  ],
  example: {
    title: t('₀S₂ 与 ₀T₂', '₀S₂ and ₀T₂'),
    input: t('地球最低阶的球型与环型模', 'The lowest-order spheroidal and toroidal modes'),
    steps: [
      t('₀S₂ ≈ 0.309 mHz，周期约 54 分钟', '₀S₂ ≈ 0.309 mHz, a period of about 54 minutes'),
      t('₀T₂ ≈ 0.379 mHz，周期约 44 分钟', '₀T₂ ≈ 0.379 mHz, a period of about 44 minutes'),
    ],
    output: t('大地震之后地球会「响」上好几天甚至几周', 'After a great earthquake the Earth rings for days or even weeks'),
  },
  links: {
    upstream: [{ id: 'free-oscillation-modes', note: t('自由振荡的总体介绍', 'General introduction to free oscillations') }],
    downstream: [{ id: 'normal-mode-summation', note: t('用这些模合成地震图', 'Synthesising seismograms from these modes') }],
    seealso: [{ id: 'spherical-harmonics', note: t('球谐函数基础', 'Spherical harmonic background') }],
  },
  refs: [{ text: 'Dahlen, F. & Tromp, J. (1998). Theoretical Global Seismology, ch. 8' }],
}

export default spheroidalToroidalModes
