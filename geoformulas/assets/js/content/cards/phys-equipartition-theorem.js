import { t } from '../../core/types.js';
/** phys-equipartition-theorem */
const physEquipartitionTheorem = {
    id: 'phys-equipartition-theorem',
    name: t('能量均分定理与内能', 'Equipartition Theorem and Internal Energy'),
    aliases: { zh: ['能量均分', '自由度与内能'], en: ['equipartition theorem', 'degrees of freedom'] },
    node: 'S18.6',
    tags: {
        math: ['MATH.STAT', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('能量均分 自由度 内能 双原子分子 转动', 'equipartition degrees of freedom internal energy diatomic rotation'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `U=\frac{f}{2}nRT`,
        variants: [
            { name: t('单原子气体（f=3）', 'monatomic (f = 3)'), latex: String.raw `U=\dfrac{3}{2}nRT` },
            { name: t('常温双原子气体（f=5）', 'diatomic at room T (f = 5)'), latex: String.raw `U=\dfrac{5}{2}nRT` },
        ],
    },
    meaning: t('热平衡时，每个自由度平均分摊到 ½kT 的能量。单原子分子只有 3 个平动自由度，内能是 3/2 nRT；双原子分子常温下还多出 2 个转动自由度，内能是 5/2 nRT。这一定理直接决定了气体的热容——也是后面 Cp−Cv=R 的微观根源。', 'At thermal equilibrium every degree of freedom carries ½kT on average. A monatomic molecule has only 3 translational degrees, giving U = 3/2 nRT; a diatomic one at room T adds 2 rotational degrees, giving U = 5/2 nRT. The theorem fixes the heat capacities — and is the microscopic origin of Cp − Cv = R.'),
    symbols: [
        { sym: 'U', name: t('内能', 'internal energy'), unit: 'J' },
        { sym: 'f', name: t('自由度数目', 'number of degrees of freedom'), unit: '—' },
        { sym: 'n,R,T', name: t('物质的量、气体常数、温度', 'amount, gas constant, temperature'), unit: 'mol, J/(mol·K), K' },
    ],
    conditions: {
        applies: [t('经典理想气体、热平衡', 'Classical ideal gas in equilibrium')],
        assumes: [t('各自由度被充分激发', 'All degrees of freedom thermally excited')],
        breaks: [t('低温下振动自由度冻结', 'Vibrational degrees freeze out at low T')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('每个自由度平均 ½kT', '½kT per degree of freedom'), latex: String.raw `\langle E\rangle=\dfrac{f}{2}k_B T` },
        { n: 2, op: 'algebra', title: t('乘以分子数 N=nN_A', 'Multiply by N = nN_A'), latex: String.raw `U=N\cdot\dfrac{f}{2}k_B T=\dfrac{f}{2}n R T` },
    ],
    links: {
        upstream: [{ id: 'phys-mean-translational-kinetic-energy' }],
        downstream: [{ id: 'phys-mayer-relation' }],
    },
};
export default physEquipartitionTheorem;
//# sourceMappingURL=phys-equipartition-theorem.js.map