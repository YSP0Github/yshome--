import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-solenoid-b */
const uemSolenoidB: FormulaCard = {
  id: 'uem-solenoid-b',
  name: t('长螺线管的磁场', 'Field of a Long Solenoid'),
  aliases: { zh: ['螺线管 B=μ0nI', '螺绕环'], en: ['solenoid field', 'toroid field'] },
  node: 'S19.3',
  tags: {
    math: ['MATH.VECTOR'],
    method: ['METH.PHYS'],
    quantity: ['Q.MAG'],
    keywords: t('螺线管 内部匀强场 μ0nI n匝每米 电磁铁', 'solenoid uniform interior field mu0 n I turns per meter electromagnet'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`B_{\mathrm{in}}=\mu_{0}\,n\,I,\qquad B_{\mathrm{out}}\approx 0`,
    variants: [
      { name: t('螺绕环', 'Toroid'), latex: String.raw`B=\dfrac{\mu_{0}NI}{2\pi r}` },
    ],
  },
  meaning: t(
    '密绕长螺线管内部是近似均匀的平行磁场 B=μ0nI（n 为单位长度匝数），外部场几乎为零。它是实验室获得匀强磁场、做电磁铁与磁共振的常用装置。',
    'A tightly wound long solenoid produces a nearly uniform, axial field inside B=μ0nI (n = turns per unit length) and almost zero field outside. It is the standard way to make a uniform field in the lab, used in electromagnets and magnetic resonance.',
  ),
  symbols: [
    { sym: 'B_{\\mathrm{in}}', name: t('内部磁感应强度', 'interior magnetic field'), unit: 'T' },
    { sym: 'n', name: t('单位长度匝数', 'turns per unit length'), unit: 'm⁻¹' },
    { sym: 'I', name: t('电流', 'current'), unit: 'A' },
    { sym: '\\mu_{0}', name: t('真空磁导率', 'permeability'), unit: 'H/m' },
  ],
  conditions: {
    applies: [t('长而密绕的螺线管；场点远离两端', 'Long, closely wound solenoid; point away from ends')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('取矩形安培回路', 'Take a rectangular Amperian loop'),
      latex: String.raw`\oint\mathbf{B}\cdot d\mathbf{l}=B_{\mathrm{in}}\,L` },
    { n: 2, op: 'physics', title: t('包围电流=nLI', 'Enclosed current = nLI'),
      latex: String.raw`B_{\mathrm{in}}L=\mu_{0}nLI\ \Rightarrow\ B_{\mathrm{in}}=\mu_{0}nI` },
  ],
  links: {
    upstream: [{ id: 'uem-ampere-loop-law' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §29' }],
}

export default uemSolenoidB
