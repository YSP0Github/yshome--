import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** em-maxwell-equations */
const emMaxwellEquations: FormulaCard = {
  id: 'em-maxwell-equations',
  name: t('Maxwell 方程组（导电介质）', "Maxwell's Equations in a Conducting Medium"),
  aliases: { zh: ['麦克斯韦方程组', '电磁控制方程'], en: ["Maxwell's equations", 'EM governing equations'] },
  node: 'S16.2',
  tags: {
    math: ['MATH.VECTOR', 'MATH.DIFF'],
    method: ['METH.EM'],
    quantity: ['Q.ELEC', 'Q.TENSOR'],
    keywords: t('Maxwell方程 法拉第 安培 位移电流 导电介质 旋度', 'Maxwell equations Faraday Ampere displacement current conductor curl'),
  },
  audience: 'master',
  complete: 'L1',
  statement: {
    main: String.raw`\nabla\times\mathbf{E}=-\frac{\partial\mathbf{B}}{\partial t}\;,\quad \nabla\times\mathbf{H}=\sigma\mathbf{E}+\frac{\partial\mathbf{D}}{\partial t}`,
    variants: [
      { name: t('高斯定律', "Gauss's laws"), latex: String.raw`\nabla\cdot\mathbf{D}=\rho_{e,ch}\;,\quad \nabla\cdot\mathbf{B}=0` },
      { name: t('低频（位移电流可略）', 'Low-frequency (neglect displacement current)'), latex: String.raw`\nabla\times\mathbf{H}\approx\sigma\mathbf{E}\quad(\omega\varepsilon\ll\sigma)` },
    ],
  },
  meaning: t(
    '电磁法的全部正演都从这四个方程出发。在地球物理关心的低频范围内，位移电流 ∂D/∂t 远小于传导电流 σE，可以忽略，旋度方程简化为 ∇×H≈σE 与 ∇×E=−∂B/∂t。消去 E、H 即得到电磁场在导电介质中的扩散方程——这就是趋肤效应与大地电磁的数学根源。',
    'Every EM forward problem starts from these four equations. At the low frequencies of exploration, the displacement current ∂D/∂t is negligible compared with conduction σE, reducing the curl equations to ∇×H≈σE and ∇×E=−∂B/∂t. Eliminating E and H yields the diffusion equation for fields in a conductor — the mathematical root of the skin effect and magnetotellurics.',
  ),
  symbols: [
    { sym: '\\mathbf{E}', name: t('电场', 'electric field'), unit: 'V/m' },
    { sym: '\\mathbf{B}', name: t('磁感应', 'magnetic induction'), unit: 'T' },
    { sym: '\\mathbf{H}', name: t('磁场强度', 'magnetic field strength'), unit: 'A/m' },
    { sym: '\\mathbf{D}', name: t('电位移', 'electric displacement'), unit: 'C/m²' },
    { sym: '\\sigma', name: t('电导率', 'conductivity'), unit: 'S/m' },
  ],
  conditions: {
    applies: [t('线性、各向同性介质，准静态近似', 'Linear isotropic medium, quasi-static approximation')],
    assumes: [t('ωε ≪ σ（电磁勘探低频成立）', 'ωε ≪ σ (valid at exploration frequencies)')],
  },
  links: {
    upstream: [{ id: 'em-faraday-induction' }],
    downstream: [{ id: 'em-skin-depth' }, { id: 'em-plane-wave-in-conductor' }],
    seealso: [{ id: 'divergence-theorem' }, { id: 'stokes-theorem' }],
  },
  refs: [{ text: 'Grant & West (1965), Interpretation Theory in Applied Geophysics' }],
}

export default emMaxwellEquations
