import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** mag-earth-dipole-moment */
const magEarthDipoleMoment: FormulaCard = {
  id: 'mag-earth-dipole-moment',
  name: t('地球磁偶极矩', "Earth's Magnetic Dipole Moment"),
  aliases: { zh: ['地球磁矩', '地心偶极矩'], en: ["Earth's dipole moment"] },
  node: 'S15.2',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.MAG'],
    quantity: ['Q.MAG'],
    keywords: t('地球磁矩 7.8e22 A m² 衰减', "Earth's dipole moment decay"),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`m=\frac{4\pi}{\mu_0}B_0\,R^{3}\approx7.8\times10^{22}\ \mathrm{A\cdot m^{2}}`,
  },
  meaning: t(
    '由赤道偶极场强 B₀≈30500 nT 和地球半径 R 反推，地球的等效磁偶极矩约为 7.8×10²² A·m²。它近 180 年来以约每百年 5% 的速率衰减，是地磁倒转可能正在酝酿的间接信号之一。磁矩大小也是古地磁重建古纬度的桥梁。',
    'Inverting the equatorial dipole field B₀≈30500 nT and Earth radius R gives an equivalent dipole moment of about 7.8×10²² A·m². It has decayed ~5% per century over the past 180 years — one indirect sign that a reversal may be brewing. The dipole moment is also the bridge by which palaeomagnetism reconstructs ancient latitudes.',
  ),
  symbols: [
    { sym: 'm', name: t('地球等效磁偶极矩', "Earth's dipole moment"), unit: 'A·m²', typical: '7.8×10²²' },
    { sym: 'B_0', name: t('赤道偶极场强', 'equatorial dipole field'), unit: 'nT', typical: '≈30500' },
    { sym: 'R', name: t('地球半径', 'Earth radius'), unit: 'm', typical: '6.371×10⁶' },
    { sym: '\\mu_0', name: t('真空磁导率', 'vacuum permeability'), unit: 'H/m' },
  ],
  conditions: {
    applies: [t('主磁场的偶极近似', 'Dipole approximation of main field')],
    assumes: [t('偶极位于地心', 'Dipole at geocentre')],
    breaks: [t('非偶极场使真实分布偏离', 'Non-dipole field causes deviations')],
  },
  derivation: [
    { n: 1, op: 'setup', title: t('赤道偶极场 B₀=μ₀m/4πR³', 'Equatorial field B₀=μ₀m/4πR³'),
      latex: String.raw`B_0=\frac{\mu_0}{4\pi}\frac{m}{R^{3}}` },
    { n: 2, op: 'algebra', title: t('解出磁矩', 'Solve for moment'),
      latex: String.raw`m=\frac{4\pi}{\mu_0}B_0 R^{3}` },
    { n: 3, op: 'substitute', title: t('代入数值', 'Plug in numbers'),
      latex: String.raw`m=\frac{4\pi}{4\pi\times10^{-7}}\times3.05\times10^{-5}\times(6.371\times10^{6})^{3}` },
    { n: 4, op: 'result', title: t('得 m≈7.8×10²² A·m²', 'Obtain m≈7.8×10²² A·m²'),
      latex: String.raw`m\approx7.8\times10^{22}\ \mathrm{A\cdot m^{2}}` },
  ],
  links: {
    upstream: [{ id: 'mag-central-dipole-field' }],
    downstream: [{ id: 'mag-geomagnetic-reversal', note: t('磁矩衰减与倒转', 'Moment decay and reversals') }],
  },
  refs: [{ text: 'Johnson & Constable, Reports on Progress in Physics (2016)' }],
}

export default magEarthDipoleMoment
