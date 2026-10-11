import { t } from '../../core/types.js';
/** uem-capacitance */
const uemCapacitance = {
    id: 'uem-capacitance',
    name: t('电容', 'Capacitance'),
    aliases: { zh: ['电容 C=Q/U', '电容器'], en: ['capacitance', 'capacitor'] },
    node: 'S19.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('电容 C=Q/U 电容器 储存电荷 法拉', 'capacitance C=Q/U capacitor store charge farad'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `C=\frac{Q}{U}`,
        variants: [
            { name: t('给定电容求电荷/电压', 'Charge or voltage from C'), latex: String.raw `Q=C\,U,\qquad U=\dfrac{Q}{C}` },
        ],
    },
    meaning: t('电容 C 描述电容器在单位电压下能储存多少电荷，是几何与介质决定的常数，与 Q、U 无关。C 越大，同样电压下存的电荷越多。它是电路中储存电场能的基本元件。', 'Capacitance C measures how much charge a capacitor holds per unit voltage; it is set by geometry and dielectric, independent of Q and U. Larger C stores more charge at the same voltage. It is the basic circuit element that stores electric-field energy.'),
    symbols: [
        { sym: 'C', name: t('电容', 'capacitance'), unit: 'F' },
        { sym: 'Q', name: t('一极板带电量绝对值', 'charge on one plate'), unit: 'C' },
        { sym: 'U', name: t('两极板间电压', 'voltage between plates'), unit: 'V' },
    ],
    conditions: {
        applies: [t('任意形状电容器；线性介质', 'Any capacitor geometry; linear dielectric')],
        assumes: [t('C 只由几何与介质决定', 'C depends only on geometry and dielectric')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('极板带 ±Q，产生电压 U', 'Plates carry ±Q, giving voltage U'),
            latex: String.raw `U=V_{+}-V_{-}=\int_{-}^{+}\mathbf{E}\cdot d\mathbf{l}` },
        { n: 2, op: 'algebra', title: t('定义 C=Q/U', 'Define C=Q/U'),
            latex: String.raw `C=\dfrac{Q}{U}` },
    ],
    links: {
        downstream: [{ id: 'uem-parallel-plate-capacitor' }, { id: 'uem-capacitor-series-parallel' }, { id: 'uem-capacitor-energy' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §25' }],
};
export default uemCapacitance;
//# sourceMappingURL=uem-capacitance.js.map