import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wl-resistivity-log */
const wlResistivityLog: FormulaCard = {
  id: 'wl-resistivity-log',
  name: t('电阻率测井（浅/中/深探测）', 'Resistivity Logging (Shallow/Medium/Deep)'),
  aliases: { zh: ['侧向测井', '感应测井', '探测深度'], en: ['laterolog', 'induction log', 'depth of investigation'] },
  node: 'S17.1',
  tags: {
    math: ['MATH.ALGEBRA'],
    method: ['METH.LOG'],
    quantity: ['Q.ELEC'],
    keywords: t('电阻率测井 浅中深探测 冲洗带 原状地层 Rxo Rt 侧向 感应', 'resistivity log shallow medium deep invaded Rxo Rt laterolog induction'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`R_{xo}\ (\text{冲洗带})\;,\quad R_{t}\ (\text{原状地层})`,    variants: [
      { name: t('多探测深度组合', 'Multiple depths of investigation'), latex: String.raw`R_{\text{deep}}\to R_{t}\;;\quad R_{\text{shallow}}\to R_{xo}` },
    ],
  },
  meaning: t(
    '电阻率测井用不同电极/线圈布置，测量不同探测深度的地层电阻率：深探测（侧向/感应）读原状地层 Rt，浅探测读被泥浆滤液冲洗过的冲洗带 Rxo。浅、中、深曲线叠加对比，既可判别油水层，又可估计泥浆侵入程度。Rt 是代入 Archie 算 Sw 的关键输入。',
    'Resistivity logging uses different electrode/coil layouts to read resistivity at different depths: deep devices read the undisturbed Rt, shallow ones the mud-filtrate-flushed Rxo. Overlaying shallow/medium/deep curves discriminates oil/water pay and quantifies invasion. Rt is the key input into Archie for Sw.',
  ),
  symbols: [
    { sym: 'R_{t}', name: t('原状地层真电阻率', 'true undisturbed formation resistivity'), unit: 'Ω·m' },
    { sym: 'R_{xo}', name: t('冲洗带电阻率', 'flushed-zone resistivity'), unit: 'Ω·m' },
  ],
  conditions: {
    applies: [t('盐水钻井液下侧向测井；淡水泥浆下感应测井', 'Laterolog for salty mud; induction for fresh mud')],
    assumes: [t('井眼、侵入影响已用校正图版扣除', 'Borehole and invasion corrections applied')],
  },
  links: {
    upstream: [{ id: 'dc-apparent-resistivity' }],
    downstream: [{ id: 'wl-archie-water-saturation' }, { id: 'wl-invaded-zone-profile' }],
  },
  refs: [{ text: 'Ellis & Singer, Well Logging, 2nd ed., §5–6' }],
}

export default wlResistivityLog
