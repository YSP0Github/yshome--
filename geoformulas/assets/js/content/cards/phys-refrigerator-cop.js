import { t } from '../../core/types.js';
/** phys-refrigerator-cop */
const physRefrigeratorCop = {
    id: 'phys-refrigerator-cop',
    name: t('制冷系数', 'Coefficient of Performance of a Refrigerator'),
    aliases: { zh: ['制冷机 COP', '热泵'], en: ['coefficient of performance', 'COP', 'heat pump'] },
    node: 'S18.6',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('制冷系数 热泵 冰箱 空调 反向 Carnot', 'coefficient of performance refrigerator heat pump reversed Carnot'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\mathrm{COP}_{\text{冷}}=\frac{Q_c}{W}=\frac{T_c}{T_h-T_c}`,
        variants: [
            { name: t('热泵供暖系数', 'heat-pump heating COP'), latex: String.raw `\mathrm{COP}_{\text{热}}=\dfrac{Q_h}{W}=\dfrac{T_h}{T_h-T_c}` },
        ],
    },
    meaning: t('冰箱、空调是反向运行的热机：外界做功 W，把热量 Qc 从低温箱搬到高温房间。制冷系数 COP=Qc/W 衡量「花一份电能能搬走多少热量」。理论上限就是可逆 Carnot 的 Tc/(Th−Tc)。它可以大于 1——这正是热泵比电暖气省电的原因。', 'Refrigerators and air conditioners are heat engines run backwards: work W pumps heat Qc from a cold box to a warm room. The COP = Qc/W measures how much heat is moved per unit of electricity, with the reversible Carnot bound Tc/(Th−Tc). It can exceed 1 — which is why a heat pump beats direct electric heating.'),
    symbols: [
        { sym: 'COP', name: t('制冷系数', 'coefficient of performance'), unit: '—' },
        { sym: 'Q_c', name: t('从低温处吸收的热量', 'heat extracted from the cold reservoir'), unit: 'J' },
        { sym: 'W', name: t('外界做功', 'work input'), unit: 'J' },
        { sym: 'T_h,T_c', name: t('高温、低温热源温度', 'hot and cold temperatures'), unit: 'K' },
    ],
    conditions: {
        applies: [t('可逆制冷循环理论上限', 'Reversible refrigeration bound')],
        assumes: [t('理想循环', 'Ideal cycle')],
        breaks: [t('真实 COP 低于此值', 'Real COP is lower')],
    },
    links: { upstream: [{ id: 'phys-carnot-efficiency' }] },
};
export default physRefrigeratorCop;
//# sourceMappingURL=phys-refrigerator-cop.js.map