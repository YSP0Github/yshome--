import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mag-magnetization-susceptibility */
const magMagnetizationSusceptibility: FormulaCard = {
  id: 'mag-magnetization-susceptibility',
  name: t('磁化强度与磁化率', 'Magnetization and Magnetic Susceptibility'),
  aliases: { zh: ['M=χH', '磁化率'], en: ['magnetization', 'susceptibility'] },
  node: 'S15.3',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.MAG', 'METH.ROCK'],
    quantity: ['Q.MAT', 'Q.MAG'],
    keywords: t('磁化强度 磁化率 M=χH 感应磁化', 'magnetization susceptibility induced magnetization'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\mathbf{M}=\chi\,\mathbf{H}`,
    variants: [
      { name: t('介质内 B 与 H 关系', 'B–H relation in a medium'), latex: String.raw`\mathbf{B}=\mu_0(\mathbf{H}+\mathbf{M})=\mu_0(1+\chi)\mathbf{H}=\mu_0\mu_r\mathbf{H}` },
    ],
  },
  meaning: t(
    '磁化强度 M 是单位体积岩石的磁偶极矩，是磁法勘探真正的场源。在线性介质中，它正比于外加磁场强度 H，比例系数 χ 叫磁化率（无量纲）。磁性铁矿 χ 可达 10⁻¹–10⁰，普通沉积岩仅 10⁻⁵–10⁻³。磁异常正演的第一步就是把感磁化 M_i=χH 算出来。',
    'Magnetization M is the magnetic dipole moment per unit volume — the true source of magnetic anomalies. In a linear medium it is proportional to the ambient field H via the dimensionless susceptibility χ. Magnetite ores have χ≈10⁻¹–10⁰, ordinary sediments only 10⁻⁵–10⁻³. The first step of magnetic forward modelling is computing induced magnetization M_i=χH.',
  ),
  symbols: [
    { sym: '\\mathbf{M}', name: t('磁化强度', 'magnetization'), unit: 'A/m' },
    { sym: '\\mathbf{H}', name: t('外加磁场强度', 'ambient field strength'), unit: 'A/m' },
    { sym: '\\chi', name: t('体积磁化率', 'volume susceptibility'), unit: '—' },
    { sym: '\\mu_r', name: t('相对磁导率', 'relative permeability'), unit: '—' },
  ],
  conditions: {
    applies: [t('弱磁性、线性、各向同性介质', 'Weakly magnetic, linear, isotropic media')],
    assumes: [t('无磁滞、无剩磁', 'No hysteresis or remanence')],
    breaks: [t('强磁性矿物非线性、各向异性', 'Non-linear/anisotropic in strong magnetic minerals')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('介质内 B=μ₀(H+M)', 'In a medium B=μ₀(H+M)'),
      latex: String.raw`\mathbf{B}=\mu_0(\mathbf{H}+\mathbf{M})` },
    { n: 2, op: 'setup', title: t('定义 M 正比于 H', 'Define M proportional to H'),
      latex: String.raw`\mathbf{M}=\chi\mathbf{H}` },
    { n: 3, op: 'substitute', title: t('代入得 B=μ₀(1+χ)H', 'Substitute: B=μ₀(1+χ)H'),
      latex: String.raw`\mathbf{B}=\mu_0(1+\chi)\mathbf{H}=\mu_0\mu_r\mathbf{H}` },
    { n: 4, op: 'result', title: t('μ_r=1+χ', 'μ_r=1+χ'),
      latex: String.raw`\mu_r=1+\chi` },
  ],
  links: {
    downstream: [{ id: 'mag-induced-vs-remanent', note: t('总磁化 = 感应 + 剩余', 'Total magnetization = induced + remanent') }],
    seealso: [{ id: 'mag-curie-law' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, §4.2' }],
}

export default magMagnetizationSusceptibility
