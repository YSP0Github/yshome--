import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-ac-power-factor */
const uemAcPowerFactor: FormulaCard = {
  id: 'uem-ac-power-factor',
  name: t('交流平均功率与功率因数', 'AC Average Power and Power Factor'),
  aliases: { zh: ['功率因数 cosφ', '有功功率 P=UIcosφ'], en: ['average AC power', 'power factor'] },
  node: 'S19.5',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.COMPLEX'],
    method: ['METH.PHYS'],
    quantity: ['Q.ENERGY', 'Q.ELEC'],
    keywords: t('交流平均功率 P=UIcosφ 功率因数 有功 视在功率', 'AC average power P UI cos phi power factor real apparent power'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`P_{\mathrm{avg}}=U\,I\cos\varphi`,
    variants: [
      { name: t('功率因数', 'Power factor'), latex: String.raw`\cos\varphi=\dfrac{R}{Z}` },
      { name: t('视在功率', 'Apparent power'), latex: String.raw`S=UI\quad(\mathrm{VA})` },
    ],
  },
  meaning: t(
    '交流电路中真正做功的平均功率等于电压、电流有效值乘积再乘功率因数 cosφ。只有电阻消耗有功，电感电容只吞吐无功。功率因数越低，输送同样有功需要越大电流，电网损耗越高。',
    'The average power that actually does work is the product of the RMS voltage and current times the power factor cosφ. Only resistance dissipates real power; inductors and capacitors exchange reactive power. A low power factor means larger currents and higher grid losses for the same real power.',
  ),
  symbols: [
    { sym: 'P_{\\mathrm{avg}}', name: t('平均（有功）功率', 'average (real) power'), unit: 'W' },
    { sym: 'U,I', name: t('电压/电流有效值', 'RMS voltage/current'), unit: 'V / A' },
    { sym: '\\cos\\varphi', name: t('功率因数', 'power factor'), unit: '—' },
  ],
  conditions: {
    applies: [t('正弦稳态交流电路', 'Sinusoidal steady-state AC circuit')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('瞬时功率平均', 'Average instantaneous power'),
      latex: String.raw`P_{\mathrm{avg}}=\langle u(t)i(t)\rangle=UI\cos\varphi` },
    { n: 2, op: 'algebra', title: t('用阻抗表示', 'Express via impedance'),
      latex: String.raw`\cos\varphi=\dfrac{R}{Z}` },
  ],
  links: {
    upstream: [{ id: 'uem-rlc-impedance' }, { id: 'uem-ac-peak-rms' }],
    seealso: [{ id: 'uem-electric-power' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §31' }],
}

export default uemAcPowerFactor
