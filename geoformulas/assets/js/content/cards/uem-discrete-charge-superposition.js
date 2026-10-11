import { t } from '../../core/types.js';
/** uem-discrete-charge-superposition */
const uemDiscreteChargeSuperposition = {
    id: 'uem-discrete-charge-superposition',
    name: t('点电荷系电场叠加原理', 'Superposition of Discrete Charges'),
    aliases: { zh: ['电场叠加原理', '矢量叠加'], en: ['field superposition', 'vector sum of fields'] },
    node: 'S19.1',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('叠加原理 点电荷系 电场矢量和 分量', 'superposition principle charge system vector sum components'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\mathbf{E}=\sum_{i=1}^{n}\mathbf{E}_{i}=\frac{1}{4\pi\varepsilon_{0}}\sum_{i=1}^{n}\frac{q_{i}}{r_{i}^{2}}\,\hat{\mathbf{r}}_{i}`,
        variants: [
            { name: t('直角分量', 'Cartesian components'), latex: String.raw `E_{x}=\sum_{i}E_{i}\cos\theta_{i},\quad E_{y}=\sum_{i}E_{i}\sin\theta_{i}` },
        ],
    },
    meaning: t('多个点电荷产生的总电场等于各电荷单独产生电场的矢量和。场满足线性叠加：一个电荷对另一个电荷的作用不受其他电荷影响。这使复杂电荷分布可分解为单个点电荷场再相加。', 'The total field from several point charges is the vector sum of the fields each charge would make alone. Fields obey linear superposition: one charge\'s effect on another is unaffected by the others. This lets us decompose a complex distribution into point-charge fields and add them.'),
    symbols: [
        { sym: '\\mathbf{E}', name: t('总电场', 'total electric field'), unit: 'V/m' },
        { sym: '\\mathbf{E}_{i}', name: t('第 i 个电荷的场', 'field of charge i'), unit: 'V/m' },
        { sym: 'q_{i}', name: t('第 i 个点电荷', 'i-th point charge'), unit: 'C' },
        { sym: 'r_{i}', name: t('第 i 电荷到场点距离', 'distance from charge i'), unit: 'm' },
    ],
    conditions: {
        applies: [t('真空、静电、线性介质中任意点电荷集合', 'Any set of point charges in vacuum or a linear medium, electrostatic')],
        assumes: [t('场点处各场矢量按平行四边形法则相加', 'Vectors add by the parallelogram rule')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('每电荷单独产生一场', 'Each charge produces its own field'),
            latex: String.raw `\mathbf{E}_{i}=\dfrac{1}{4\pi\varepsilon_{0}}\dfrac{q_{i}}{r_{i}^{2}}\hat{\mathbf{r}}_{i}` },
        { n: 2, op: 'physics', title: t('叠加：总力=各力之和', 'Superposition: total force = sum of forces'),
            latex: String.raw `\mathbf{F}=\sum_{i}\mathbf{F}_{i}=\sum_{i}q_{0}\mathbf{E}_{i}` },
        { n: 3, op: 'algebra', title: t('除以 q0 得总场', 'Divide by q0 for total field'),
            latex: String.raw `\mathbf{E}=\dfrac{\mathbf{F}}{q_{0}}=\sum_{i}\mathbf{E}_{i}` },
    ],
    links: {
        upstream: [{ id: 'uem-electric-field-point-charge' }],
        downstream: [{ id: 'uem-continuous-charge-field' }, { id: 'uem-electric-potential-point-charge' }],
    },
    refs: [{ text: 'Griffiths, Introduction to Electrodynamics, 4e, §2.1' }],
};
export default uemDiscreteChargeSuperposition;
//# sourceMappingURL=uem-discrete-charge-superposition.js.map