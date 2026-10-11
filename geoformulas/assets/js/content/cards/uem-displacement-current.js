import { t } from '../../core/types.js';
/** uem-displacement-current */
const uemDisplacementCurrent = {
    id: 'uem-displacement-current',
    name: t('位移电流', 'Displacement Current'),
    aliases: { zh: ['位移电流 Id=ε0 dΦE/dt', 'Maxwell 修正'], en: ['displacement current', "Maxwell's correction"] },
    node: 'S19.5',
    tags: {
        math: ['MATH.VECTOR', 'MATH.DIFF'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('位移电流 ε0 dΦE/dt 变化电场 电容器充电 Maxwell 修正', 'displacement current epsilon0 flux change changing electric field capacitor charging'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `I_{d}=\varepsilon_{0}\frac{d\Phi_{E}}{dt}`,
        variants: [
            { name: t('修正后的 Ampere 定律', 'Modified Ampere law'), latex: String.raw `\oint\mathbf{B}\cdot d\mathbf{l}=\mu_{0}(I+I_{d})=\mu_{0}\left(I+\varepsilon_{0}\dfrac{d\Phi_{E}}{dt}\right)` },
        ],
    },
    meaning: t('Maxwell 引入位移电流：即使没有真实电荷流动，变化的电场也像电流一样激发磁场。它补上了电容器充电时极板间"断流"的缺口，使 Ampere 定律在非稳恒情形自洽，也是电磁波存在的关键一环。', 'Maxwell introduced displacement current: even without real charge flow, a changing electric field produces a magnetic field just like a current. It closes the "open circuit" gap between capacitor plates during charging, makes Ampere\'s law consistent for non-steady cases, and is essential to electromagnetic waves.'),
    symbols: [
        { sym: 'I_{d}', name: t('位移电流', 'displacement current'), unit: 'A' },
        { sym: '\\Phi_{E}', name: t('电通量', 'electric flux'), unit: 'N·m²/C' },
        { sym: '\\varepsilon_{0}', name: t('真空介电常数', 'permittivity'), unit: 'F/m' },
    ],
    conditions: {
        applies: [t('非稳恒、含变化电场的情形', 'Non-steady situations with a changing electric field')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('电容器充电时极板间无传导电流', 'No conduction current between plates while charging'),
            latex: String.raw `I_{\text{conduction}}=0\ \text{（极板间）}` },
        { n: 2, op: 'physics', title: t('Maxwell：变化电场=等效电流', 'Maxwell: changing E = equivalent current'),
            latex: String.raw `I_{d}=\varepsilon_{0}\dfrac{d\Phi_{E}}{dt}` },
        { n: 3, op: 'result', title: t('补入 Ampere 定律', 'Add to Ampere law'),
            latex: String.raw `\oint\mathbf{B}\cdot d\mathbf{l}=\mu_{0}(I+I_{d})` },
    ],
    links: {
        upstream: [{ id: 'uem-electric-flux' }],
        downstream: [{ id: 'uem-maxwell-equations' }],
    },
    refs: [{ text: 'Griffiths, Introduction to Electrodynamics, 4e, §7.3' }],
};
export default uemDisplacementCurrent;
//# sourceMappingURL=uem-displacement-current.js.map