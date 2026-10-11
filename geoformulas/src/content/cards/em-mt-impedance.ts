import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** em-mt-impedance */
const emMtImpedance: FormulaCard = {
  id: 'em-mt-impedance',
  name: t('大地电磁阻抗 Z=E/H', 'Magnetotelluric Impedance Z=E/H'),
  aliases: { zh: ['MT阻抗', '张量阻抗'], en: ['MT impedance', 'impedance tensor'] },
  node: 'S16.2',
  tags: {
    math: ['MATH.COMPLEX', 'MATH.LINALG'],
    method: ['METH.EM'],
    quantity: ['Q.ELEC'],
    keywords: t('大地电磁 MT 阻抗 E H 张量阻抗 Zxy Zyx', 'magnetotellurics impedance E H tensor Zxy Zyx'),
  },
  audience: 'master',
  complete: 'L2',
  statement: {
    main: String.raw`\begin{bmatrix}E_{x}\\ E_{y}\end{bmatrix}=\begin{bmatrix}Z_{xx}&Z_{xy}\\ Z_{yx}&Z_{yy}\end{bmatrix}\begin{bmatrix}H_{x}\\ H_{y}\end{bmatrix}`,
    variants: [
      { name: t('一维（各向同性）', '1D (isotropic)'), latex: String.raw`Z_{xx}=Z_{yy}=0,\; Z_{xy}=-Z_{yx}=Z_{MT}` },
    ],
  },
  meaning: t(
    '在地表同时测正交的电场 E 与磁场 H，它们的比值即复阻抗 Z（单位 V/m 除以 A/m = Ω）。MT 不靠人工源，靠天然风场—电离层耦合的平面波入射。阻抗是频率的复函数：它的振幅和相位直接编码了地下电阻率随深度的分布。',
    'Measuring the orthogonal E and H fields at the surface, their ratio is the complex impedance Z (units V/m ÷ A/m = Ω). MT uses natural plane waves from ionospheric–magnetospheric currents rather than an artificial source. The impedance is a complex function of frequency whose amplitude and phase encode the depth distribution of subsurface resistivity.',
  ),
  symbols: [
    { sym: 'Z', name: t('MT 阻抗（复数）', 'MT impedance (complex)'), unit: 'Ω' },
    { sym: '\\mathbf{E}', name: t('正交电场分量', 'orthogonal electric components'), unit: 'V/m' },
    { sym: '\\mathbf{H}', name: t('正交磁场分量', 'orthogonal magnetic components'), unit: 'A/m' },
  ],
  conditions: {
    applies: [t('天然平面波场、远场、无强工业游散电流', 'Natural plane-wave field, far field, no strong cultural noise')],
    assumes: [t('场是平面波垂直入射', 'Plane waves incident vertically')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('平面波 E、H 线性相关', 'E and H are linearly related for plane waves'),
      latex: String.raw`E_{i}=Z_{ij}H_{j}` },
    { n: 2, op: 'algebra', title: t('写成张量矩阵', 'Write as a tensor matrix'),
      latex: String.raw`\begin{pmatrix}E_{x}\\ E_{y}\end{pmatrix}=\begin{pmatrix}Z_{xx}&Z_{xy}\\ Z_{yx}&Z_{yy}\end{pmatrix}\begin{pmatrix}H_{x}\\ H_{y}\end{pmatrix}` },
    { n: 3, op: 'result', title: t('1D 下只剩 Zxy', 'In 1D only Zxy survives'),
      latex: String.raw`Z_{xy}=E_{x}/H_{y}=-E_{y}/H_{x}` },
  ],
  links: {
    upstream: [{ id: 'em-plane-wave-in-conductor' }],
    downstream: [{ id: 'em-cagniard-apparent-resistivity' }],
    seealso: [{ id: 'complex-phasor-representation' }],
  },
  refs: [{ text: 'Cagniard (1953); Vozoff (1972), Magnetotellurics' }],
}

export default emMtImpedance
