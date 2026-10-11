import { t } from '../../core/types.js';
/** rel-mass-energy-equivalence */
const relMassEnergyEquivalence = {
    id: 'rel-mass-energy-equivalence',
    name: t('质能方程 E=mc²', 'Mass–Energy Equivalence E = mc²'),
    aliases: { zh: ['质能方程', '质能关系', '总能量 E=γmc²'], en: ['mass-energy equivalence', 'total energy E = gamma m c^2'] },
    node: 'S20.4',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('质能方程 E=mc² 质能关系 原子能 核能 总能量 γmc²', 'mass energy equivalence E = mc2 nuclear energy total energy gamma m c squared'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `E=mc^2,\qquad E=\gamma mc^2`,
        variants: [
            { name: t('静能（v=0）', 'Rest energy (v = 0)'), latex: String.raw `E_0=mc^2` },
            { name: t('动能 = 总能量 − 静能', 'Kinetic energy = total − rest energy'), latex: String.raw `K=E-E_0=(\gamma-1)mc^2` },
        ],
    },
    meaning: t('质量和能量不是两回事，而是同一事物的两种单位：E=mc²。哪怕静止物体也藏着巨大的"静能" mc²——c²≈9×10¹⁶ J/kg，所以 1 克物质完全释放相当于 2 万吨 TNT。裂变、聚变、正反物质湮灭都靠它。它也解释了为什么原子核的质量亏损就是结合能的来源。', 'Mass and energy are not two things but two units of the same quantity: E = mc². Even a stationary object carries enormous "rest energy" mc² — c² ≈ 9×10¹⁶ J/kg, so fully converting 1 gram of matter releases 20 kilotons of TNT. Fission, fusion and matter–antimatter annihilation all rely on it. It also explains why the nuclear mass defect is the source of binding energy.'),
    symbols: [
        { sym: 'E', name: t('总能量', 'total energy'), unit: 'J' },
        { sym: 'm', name: t('静质量', 'rest mass'), unit: 'kg' },
        { sym: 'c', name: t('真空中光速', 'speed of light in vacuum'), unit: 'm/s' },
        { sym: 'E_0', name: t('静能', 'rest energy'), unit: 'J' },
        { sym: 'K', name: t('动能', 'kinetic energy'), unit: 'J' },
    ],
    conditions: {
        applies: [t('一切过程，尤其核反应与粒子物理', 'All processes, especially nuclear and particle physics')],
        assumes: [t('孤立系统总能量（含静能）守恒', 'Total energy (including rest energy) of an isolated system is conserved')],
        breaks: [t('不是"质量变能量"，而是质量—能量整体守恒', 'Not "mass turns into energy"; mass–energy as a whole is conserved')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('相对论总能量', 'Relativistic total energy'), latex: String.raw `E=\gamma mc^2` },
        { n: 2, op: 'algebra', title: t('v=0 时 γ=1 得静能', 'At v = 0, γ = 1 gives rest energy'), latex: String.raw `E_0=mc^2` },
        { n: 3, op: 'result', title: t('质量亏损对应结合能', 'Mass defect corresponds to binding energy'), latex: String.raw `\Delta E=\Delta m\,c^2` },
    ],
    viz: [
        {
            id: 'energy-vs-speed',
            level: 'V1',
            title: t('总能量、动能随速度的变化', 'Total energy and kinetic energy versus speed'),
            xlabel: t('速度比 β=v/c', 'speed ratio beta = v/c'),
            ylabel: t('以 mc² 为单位的能量', 'energy in units of mc^2'),
            controls: [
                { id: 'dummy', label: t('（曲线为全集，无额外控件）', '(curve is a full profile, no control)'), min: 0, max: 1, step: 1, value: 0, unit: '1' },
            ],
            xRange: [0, 0.99],
            note: t('总能量 E/mc²=γ 随 β→1 发散；动能 K/mc²=γ−1 在 β 小时≈½β²（退回经典 ½mv²）。这就是为什么把粒子加速到 c 需要无限能量。', 'Total energy E/mc² = gamma diverges as beta → 1; kinetic K/mc² = gamma − 1 ≈ ½ beta² at small beta (recovering classical ½mv²). This is why accelerating a particle to c needs infinite energy.'),
            compute: () => {
                const ptsE = [];
                const ptsK = [];
                for (let i = 0; i <= 400; i++) {
                    const b = (i / 400) * 0.99;
                    const g = 1 / Math.sqrt(1 - b * b);
                    ptsE.push([b, g]);
                    ptsK.push([b, g - 1]);
                }
                return [
                    { label: t('总能量 γ', 'total energy gamma'), color: '#993C1D', points: ptsE },
                    { label: t('动能 γ−1', 'kinetic gamma - 1'), color: '#0F6E56', points: ptsK },
                ];
            },
        },
    ],
    links: {
        upstream: [{ id: 'rel-relativistic-momentum' }],
        downstream: [{ id: 'rel-energy-momentum-relation' }, { id: 'nuc-mass-defect-binding-energy' }],
    },
    refs: [{ text: 'Taylor & Wheeler, Spacetime Physics, Ch. 4' }],
};
export default relMassEnergyEquivalence;
//# sourceMappingURL=rel-mass-energy-equivalence.js.map