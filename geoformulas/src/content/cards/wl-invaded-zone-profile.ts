import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** wl-invaded-zone-profile */
const wlInvadedZoneProfile: FormulaCard = {
  id: 'wl-invaded-zone-profile',
  name: t('泥浆侵入剖面', 'Mud Invasion Profile'),
  aliases: { zh: ['冲洗带 过渡带 原状地层', 'invaded zone'], en: ['flushed zone', 'transition zone', 'invaded profile'] },
  node: 'S17.1',
  tags: {
    math: ['MATH.GEOM'],
    method: ['METH.LOG'],
    quantity: ['Q.ELEC', 'Q.GEOM'],
    keywords: t('泥浆侵入 冲洗带 过渡带 原状地层 径向电阻率剖面', 'mud invasion flushed transition undisturbed radial profile'),
  },
  audience: 'bachelor',
  complete: 'L1',
  statement: {
    main: String.raw`\text{冲洗带 }R_{xo}\;-\;\text{过渡带 }\;-\;\text{原状地层 }R_{t}`,    variants: [
      { name: t('径向分区', 'Radial zones'), latex: String.raw`r_{well}<r<r_{xo}\;(R_{xo})\;;\quad r>r_{t}\;(R_{t})` },
    ],
  },
  meaning: t(
    '钻井泥浆柱压力略高于地层压力，泥浆滤液沿径向渗入渗透性地层，把地层原生流体向外推：靠近井壁是被滤液基本冲洗干净的冲洗带 Rxo，往外是流体饱和度渐变的过渡带，最外侧才是未受扰动的原状地层 Rt。多探测深度电阻率曲线正是为了分别"够到"这三个区。',
    'Because mud pressure slightly exceeds formation pressure, mud filtrate invades permeable beds radially, displacing native fluids: near the borehole wall is the flushed zone Rxo, then a transition zone, and finally the undisturbed Rt. Multi-depth resistivity tools are designed to reach each of these three zones separately.',
  ),
  symbols: [
    { sym: 'R_{xo}', name: t('冲洗带电阻率', 'flushed-zone resistivity'), unit: 'Ω·m' },
    { sym: 'R_{t}', name: t('原状地层电阻率', 'undisturbed resistivity'), unit: 'Ω·m' },
    { sym: 'r_{xo}', name: t('冲洗带外缘半径', 'flushed-zone outer radius'), unit: 'm' },
  ],
  conditions: {
    applies: [t('渗透性地层、正压差钻井', 'Permeable beds, overbalanced drilling')],
  },
  links: {
    upstream: [{ id: 'wl-resistivity-log' }],
    seealso: [{ id: 'wl-spontaneous-potential' }],
  },
  refs: [{ text: 'Ellis & Singer, Well Logging, 2nd ed., §5' }],
}

export default wlInvadedZoneProfile
