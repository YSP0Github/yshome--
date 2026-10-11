import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wl-spontaneous-potential */
const wlSpontaneousPotential: FormulaCard = {
  id: 'wl-spontaneous-potential',
  name: t('自然电位测井 SP', 'Spontaneous Potential Log (SP)'),
  aliases: { zh: ['SP 曲线', '自然电位'], en: ['SP log', 'self-potential'] },
  node: 'S17.1',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.LOG'],
    quantity: ['Q.ELEC'],
    keywords: t('自然电位 SP 扩散电位 薄膜电位 静自然电位 SSP Rw', 'spontaneous potential SP electrochemical static SSP Rw'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`SP=K\log_{10}\frac{R_{mf}}{R_{w}}`,    variants: [
      { name: t('静自然电位 SSP', 'Static self-potential'), latex: String.raw`SSP=-K\log_{10}(R_{mfe}/R_{w}),\ K\approx 60-70\ \mathrm{mV}` },
    ],
  },
  meaning: t(
    '当泥浆滤液与地层水矿化度不同、且钻穿渗透性地层时，井壁上会自然产生电化学电位（扩散+薄膜电位），即 SP。在泥岩基线一侧为基线，在渗透性砂岩处向负方向偏转。偏转幅度 SP=K·log(Rmf/Rw) 直接给出 Rmf/Rw 比值——这是确定地层水电阻率 Rw 的经典方法。',
    'When mud filtrate and formation water differ in salinity and a permeable bed is penetrated, an electrochemical potential (diffusion + membrane) appears across the borehole wall: the SP. It sits on a shale baseline and deflects (negative) across permeable sands. The deflection SP=K·log(Rmf/Rw) directly gives Rmf/Rw — a classic way to determine formation-water resistivity Rw.',
  ),
  symbols: [
    { sym: 'SP', name: t('自然电位', 'spontaneous potential'), unit: 'mV' },
    { sym: 'K', name: t('电化学系数（与温度有关）', 'electrochemical coefficient'), unit: 'mV' },
    { sym: 'R_{mf}', name: t('泥浆滤液电阻率', 'mud-filtrate resistivity'), unit: 'Ω·m' },
    { sym: 'R_{w}', name: t('地层水电阻率', 'formation-water resistivity'), unit: 'Ω·m' },
  ],
  conditions: {
    applies: [t('淡水泥浆、渗透性地层、无厚泥饼屏蔽', 'Fresh mud, permeable beds, no thick mud-cake shielding')],
    assumes: [t('井内无外加电流', 'No applied current in the borehole')],
    breaks: [t('盐水泥浆 SP 偏转很小甚至反向', 'Salt-based mud makes SP small or reversed')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('浓差扩散电位', 'Concentration diffusion potential'),
      latex: String.raw`E_{diff}\propto\log(C_{mf}/C_{w})` },
    { n: 2, op: 'physics', title: t('粘土薄膜电位叠加', 'Add membrane potential'),
      latex: String.raw`SSP=E_{diff}+E_{membrane}` },
    { n: 3, op: 'algebra', title: t('合并为 K·log(Rmf/Rw)', 'Combine to K·log(Rmf/Rw)'),
      latex: String.raw`SSP=K\log_{10}(R_{mfe}/R_{w})` },
  ],
  links: {
    downstream: [{ id: 'wl-formation-water-resistivity', note: t('由 SP 求 Rw', 'Derive Rw from SP') }],
    seealso: [{ id: 'wl-natural-gamma' }],
  },
  refs: [{ text: 'Ellis & Singer, Well Logging, 2nd ed., §4' }],
}

export default wlSpontaneousPotential
