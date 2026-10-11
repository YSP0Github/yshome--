import { t } from '../../core/types.js';
/** uem-capacitor-energy */
const uemCapacitorEnergy = {
    id: 'uem-capacitor-energy',
    name: t('电容器的能量', 'Energy Stored in a Capacitor'),
    aliases: { zh: ['½CU²', '电场能'], en: ['capacitor energy', '½CV²'] },
    node: 'S19.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY', 'Q.ELEC'],
        keywords: t('电容储能 ½CU² ½Q²/C 充电做功 闪光灯', 'capacitor energy half C U squared charge squared over C charging work flash'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `U_{E}=\frac{1}{2}CU^{2}=\frac{1}{2}\frac{Q^{2}}{C}=\frac{1}{2}QU`,
        variants: [
            { name: t('能量密度', 'Energy density'), latex: String.raw `u_{e}=\dfrac{1}{2}\varepsilon_{0}E^{2}` },
        ],
    },
    meaning: t('给电容器充电的功以电场能的形式储存在两极板之间。U_E=½CU²：电压加倍储能变四倍。它是相机闪光灯、脉冲电源释放能量的来源。', 'The work done to charge a capacitor is stored as electric-field energy between the plates. U_E=½CU²: doubling the voltage quadruples the stored energy. It powers camera flashes and pulsed sources.'),
    symbols: [
        { sym: 'U_{E}', name: t('储存的电场能', 'stored energy'), unit: 'J' },
        { sym: 'C', name: t('电容', 'capacitance'), unit: 'F' },
        { sym: 'U', name: t('电压', 'voltage'), unit: 'V' },
        { sym: 'Q', name: t('电荷', 'charge'), unit: 'C' },
    ],
    conditions: {
        applies: [t('已充电的电容器；线性介质', 'A charged capacitor; linear dielectric')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('再搬 dq 需做功', 'Work to add dq'),
            latex: String.raw `dW=U\,dq=\dfrac{q}{C}\,dq` },
        { n: 2, op: 'transform', title: t('从 0 充到 Q 积分', 'Integrate from 0 to Q'),
            latex: String.raw `W=\int_{0}^{Q}\dfrac{q}{C}dq=\dfrac{Q^{2}}{2C}` },
        { n: 3, op: 'algebra', title: t('用 U=Q/C 改写', 'Rewrite with U=Q/C'),
            latex: String.raw `U_{E}=\dfrac{1}{2}\dfrac{Q^{2}}{C}=\dfrac{1}{2}CU^{2}=\dfrac{1}{2}QU` },
    ],
    links: {
        upstream: [{ id: 'uem-capacitance' }, { id: 'uem-electrostatic-energy' }],
        downstream: [{ id: 'uem-rc-transient' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §25' }],
};
export default uemCapacitorEnergy;
//# sourceMappingURL=uem-capacitor-energy.js.map