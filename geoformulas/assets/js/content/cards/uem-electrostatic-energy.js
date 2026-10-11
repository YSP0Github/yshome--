import { t } from '../../core/types.js';
/** uem-electrostatic-energy */
const uemElectrostaticEnergy = {
    id: 'uem-electrostatic-energy',
    name: t('静电能', 'Electrostatic Energy'),
    aliases: { zh: ['电荷系统势能', '电场能量密度'], en: ['electrostatic energy', 'energy density of field'] },
    node: 'S19.1',
    tags: {
        math: ['MATH.DIFF', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY', 'Q.ELEC'],
        keywords: t('静电能 电荷系统 能量密度 ½ε0E² 组装功', 'electrostatic energy charge assembly work energy density half epsilon0 E squared'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `U=\frac{1}{2}\int \rho_{q}V\,dV=\frac{1}{2}\varepsilon_{0}\int E^{2}\,dV`,
        variants: [
            { name: t('能量密度', 'Energy density'), latex: String.raw `u_{e}=\dfrac{1}{2}\varepsilon_{0}E^{2}` },
            { name: t('两电荷系统', 'Two-charge system'), latex: String.raw `U=\dfrac{1}{4\pi\varepsilon_{0}}\dfrac{q_{1}q_{2}}{r}` },
        ],
    },
    meaning: t('把分散电荷组装成某分布所需的功就是静电能。它既可用电荷与电势的积分表示，也可写成电场能量密度 ½ε0E² 在全空间的积分——说明能量储存在电场本身之中，而不是电荷上。', 'The work needed to assemble a charge distribution from infinity is its electrostatic energy. It can be written either as an integral of ρ_q V or as the integral of the field energy density ½ε0E² over all space—showing that energy resides in the field itself, not on the charges.'),
    symbols: [
        { sym: 'U', name: t('静电能', 'electrostatic energy'), unit: 'J' },
        { sym: 'u_{e}', name: t('电场能量密度', 'energy density'), unit: 'J/m³' },
        { sym: '\\rho_{q}', name: t('体电荷密度', 'charge density'), unit: 'C/m³' },
        { sym: 'E', name: t('场强', 'field strength'), unit: 'V/m' },
    ],
    conditions: {
        applies: [t('静电场、线性介质；真空 ε0', 'Electrostatic field, linear medium; vacuum ε0')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('逐次搬运电荷做功', 'Work to bring charges in successively'),
            latex: String.raw `dW=V\,dq` },
        { n: 2, op: 'algebra', title: t('叠加并补 1/2 避免重复计数', 'Superpose and add 1/2 to avoid double counting'),
            latex: String.raw `U=\dfrac{1}{2}\int \rho_{q}V\,dV` },
        { n: 3, op: 'transform', title: t('用 ∇·E=ρq/ε0 改写为场积分', 'Use ∇·E=ρq/ε0 to recast as field integral'),
            latex: String.raw `U=\dfrac{1}{2}\varepsilon_{0}\int E^{2}\,dV` },
    ],
    links: {
        upstream: [{ id: 'uem-electric-potential-point-charge' }],
        downstream: [{ id: 'uem-capacitor-energy' }],
    },
    refs: [{ text: 'Griffiths, Introduction to Electrodynamics, 4e, §2.5' }],
};
export default uemElectrostaticEnergy;
//# sourceMappingURL=uem-electrostatic-energy.js.map