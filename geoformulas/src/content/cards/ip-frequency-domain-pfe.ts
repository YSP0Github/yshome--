import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** ip-frequency-domain-pfe */
const ipFrequencyDomainPfe: FormulaCard = {
  id: 'ip-frequency-domain-pfe',
  name: t('频率域激发极化（PFE）', 'Frequency-domain IP (PFE)'),
  aliases: { zh: ['百分频率效应', '频率效应 FE'], en: ['percent frequency effect', 'PFE', 'frequency effect'] },
  node: 'S16.3',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.EM'],
    quantity: ['Q.ELEC', 'Q.FREQ'],
    keywords: t('频率域 激发极化 PFE 百分频率效应 低频 高频 复电阻率', 'frequency domain IP PFE percent frequency effect low high complex resistivity'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`PFE=\frac{\rho_{a}(f_{L})-\rho_{a}(f_{H})}{\rho_{a}(f_{L})}\times 100\%`,
    variants: [
      { name: t('金属因子 MF', 'Metal factor'), latex: String.raw`MF=2\pi\times\dfrac{\rho_{a}(f_{L})-\rho_{a}(f_{H})}{\rho_{a}(f_{L})\rho_{a}(f_{H})}\times 10^{5}` },
    ],
  },
  meaning: t(
    '岩石电阻率其实随频率略变：低频时极化充分、视电阻率略高；高频时极化来不及建立、视电阻率略低。频率效应 PFE 就是低、高频两个视电阻率的相对差。它与时间域充电率 M 等价，只是在频率域测量，仪器更轻便、抗干扰。',
    'Rock resistivity varies slightly with frequency: at low frequency polarisation is fully developed and ρa is slightly higher; at high frequency it cannot build up and ρa drops. The percent frequency effect PFE is the relative difference between low- and high-frequency ρa. It is equivalent to the time-domain chargeability M but measured in the frequency domain with lighter, more noise-robust instruments.',
  ),
  symbols: [
    { sym: 'PFE', name: t('百分频率效应', 'percent frequency effect'), unit: '%' },
    { sym: '\\rho_{a}(f_{L})', name: t('低频视电阻率', 'low-frequency apparent resistivity'), unit: 'Ω·m' },
    { sym: '\\rho_{a}(f_{H})', name: t('高频视电阻率', 'high-frequency apparent resistivity'), unit: 'Ω·m' },
    { sym: 'MF', name: t('金属因子', 'metal factor'), unit: 'ppm' },
  ],
  conditions: {
    applies: [t('频率域 IP，双频或多频测量', 'Frequency-domain IP, dual/multi-frequency')],
    assumes: [t('fL≪特征频率≪fH', 'fL ≪ characteristic ≪ fH')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('低频 ρa 略高、高频略低', 'ρa slightly higher at low f'),
      latex: String.raw`\rho_{a}(f_{L})>\rho_{a}(f_{H})` },
    { n: 2, op: 'algebra', title: t('相对差即 PFE', 'Relative difference is PFE'),
      latex: String.raw`PFE=\dfrac{\rho_{a}(f_{L})-\rho_{a}(f_{H})}{\rho_{a}(f_{L})}\times 100\%` },
    { n: 3, op: 'result', title: t('与时间域 M 近似等价', 'Approximately equivalent to M'),
      latex: String.raw`PFE\approx 2\pi\,M\ \ (\text{经验换算})` },
  ],
  links: {
    upstream: [{ id: 'ip-polarizability-definition' }],
    downstream: [{ id: 'ip-cole-cole-model' }],
    seealso: [{ id: 'ip-time-domain-chargeability' }],
  },
  refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §6.4' }],
}

export default ipFrequencyDomainPfe
