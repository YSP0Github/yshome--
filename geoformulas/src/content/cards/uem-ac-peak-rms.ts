import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-ac-peak-rms */
const uemAcPeakRms: FormulaCard = {
  id: 'uem-ac-peak-rms',
  name: t('交流电的峰值与有效值', 'AC Peak and RMS Values'),
  aliases: { zh: ['交流有效值 U=Um/√2', '正弦交流电'], en: ['AC RMS', 'peak and rms'] },
  node: 'S19.5',
  tags: {
    math: ['MATH.TRANSFORM', 'MATH.ALGEBRA'],
    method: ['METH.PHYS'],
    quantity: ['Q.AMP', 'Q.FREQ'],
    keywords: t('交流 峰值 有效值 根号2 正弦 220V 市电', 'AC peak rms root 2 sine mains 220V'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`u(t)=U_{m}\sin(\omega t),\qquad U=\frac{U_{m}}{\sqrt{2}}`,
    variants: [
      { name: t('电流有效值', 'Current RMS'), latex: String.raw`I=\dfrac{I_{m}}{\sqrt{2}}` },
    ],
  },
  meaning: t(
    '正弦交流电的有效值（RMS）是与之热效应等效的直流值，等于峰值除以 √2。市电标称 220 V 即有效值，峰值约 311 V。有效值用于计算平均功率。',
    'The RMS (effective) value of a sinusoidal AC is the DC value with the same heating effect, equal to the peak divided by √2. Mains rated 220 V is an RMS value with peak ≈311 V. RMS values are used to compute average power.',
  ),
  symbols: [
    { sym: 'u(t)', name: t('瞬时电压', 'instantaneous voltage'), unit: 'V' },
    { sym: 'U_{m}', name: t('电压峰值', 'peak voltage'), unit: 'V' },
    { sym: 'U', name: t('电压有效值', 'RMS voltage'), unit: 'V' },
    { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
  ],
  conditions: {
    applies: [t('正弦（简谐）交流电', 'Sinusoidal AC')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('热效应等效', 'Equal heating over a cycle'),
      latex: String.raw`\dfrac{U^{2}}{R}T=\dfrac{1}{R}\int_{0}^{T}u^{2}(t)\,dt` },
    { n: 2, op: 'transform', title: t('积分 sin²', 'Integrate sin²'),
      latex: String.raw`U=\sqrt{\dfrac{1}{T}\int_{0}^{T}U_{m}^{2}\sin^{2}(\omega t)\,dt}=\dfrac{U_{m}}{\sqrt{2}}` },
  ],
  links: {
    downstream: [{ id: 'uem-inductive-reactance' }, { id: 'uem-capacitive-reactance' }, { id: 'uem-ac-power-factor' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §31' }],
}

export default uemAcPeakRms
