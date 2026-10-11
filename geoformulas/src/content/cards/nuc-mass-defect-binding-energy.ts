import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** nuc-mass-defect-binding-energy */
const nucMassDefectBindingEnergy: FormulaCard = {
  id: 'nuc-mass-defect-binding-energy',
  name: t('质量亏损与结合能', 'Mass Defect and Binding Energy'),
  aliases: { zh: ['质量亏损 结合能 ΔE=Δmc²'], en: ['mass defect binding energy delta E = delta m c^2'] },
  node: 'S20.5',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY'],
    keywords: t('质量亏损 结合能 ΔE=Δmc² 核子分开 需要能量', 'mass defect binding energy delta E delta m c squared separating nucleons'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\Delta m=Zm_p+Nm_n-M_{\text{核}},\qquad E_b=\Delta m\,c^2`,
    variants: [
      { name: t('用原子质量单位', 'In atomic mass units'), latex: String.raw`1\ \mathrm{u}=931.5\ \mathrm{MeV}/c^2` },
    ],
  },
  meaning: t(
    '把核子拆散到无穷远所需的能量叫结合能 E_b。实验上发现原子核质量 M 小于组成它的自由核子质量之和——这个差就是质量亏损 Δm。按 E=mc²，E_b=Δm·c²：核子抱得越紧，原子核质量比"零件之和"轻得越多。它是核能（裂变、聚变）的来源。',
    'The energy required to pull all nucleons apart to infinity is the binding energy E_b. Experimentally the nuclear mass M is less than the sum of the free nucleon masses — the difference is the mass defect Δm. By E = mc², E_b = Δm·c²: the more tightly nucleons are bound, the more the nucleus weighs less than the sum of its parts. It is the source of nuclear energy (fission and fusion).',
  ),
  symbols: [
    { sym: '\\Delta m', name: t('质量亏损', 'mass defect'), unit: 'kg' },
    { sym: 'm_p,m_n', name: t('质子、中子质量', 'proton and neutron masses'), unit: 'kg' },
    { sym: 'M_{\\text{核}}', name: t('原子核总质量', 'total nuclear mass'), unit: 'kg' },
    { sym: 'E_b', name: t('结合能', 'binding energy'), unit: 'J' },
  ],
  conditions: {
    applies: [t('核子束缚为原子核的系统', 'Bound system of nucleons')],
    assumes: [t('用原子质量时需抵消电子质量', 'When using atomic masses, electron masses must cancel')],
    breaks: [t('自由核子单独不存在"结合能"', 'Free nucleons alone have no binding energy')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('自由核子质量之和', 'Sum of free nucleon masses'), latex: String.raw`M_{\text{零件}}=Zm_p+Nm_n` },
    { n: 2, op: 'algebra', title: t('质量亏损 = 零件和 − 核质量', 'Mass defect = sum of parts − nuclear mass'), latex: String.raw`\Delta m=M_{\text{零件}}-M_{\text{核}}` },
    { n: 3, op: 'result', title: t('E_b=Δm c²', 'Binding energy E_b = Δm c²'), latex: String.raw`E_b=\Delta m\,c^2` },
  ],
  links: {
    upstream: [{ id: 'rel-mass-energy-equivalence' }, { id: 'nuc-nuclear-radius' }],
    downstream: [{ id: 'nuc-binding-energy-per-nucleon' }],
  },
  refs: [{ text: 'Krane, Introductory Nuclear Physics, §3' }],
}

export default nucMassDefectBindingEnergy
