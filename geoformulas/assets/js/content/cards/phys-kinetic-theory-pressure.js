import { t } from '../../core/types.js';
/** phys-kinetic-theory-pressure */
const physKineticTheoryPressure = {
    id: 'phys-kinetic-theory-pressure',
    name: t('分子动理论压强公式', 'Kinetic-Theory Formula for Pressure'),
    aliases: { zh: ['气体压强微观解释 p=⅓nmv²'], en: ['kinetic theory pressure', 'p = ⅓ n m v²'] },
    node: 'S18.6',
    tags: {
        math: ['MATH.STAT', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('分子动理论 压强 微观解释 平均动能 碰撞器壁', 'kinetic theory pressure microscopic wall collisions mean speed squared'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `p=\tfrac{1}{3} n\,m\,\overline{v^{2}}`,
        variants: [
            { name: t('用均方根速率', 'in terms of rms speed'), latex: String.raw `p=\dfrac{1}{3}\rho\,\overline{v^{2}},\quad v_{\mathrm{rms}}=\sqrt{\overline{v^{2}}}` },
        ],
    },
    meaning: t('气体压强不是什么神秘的「压力」，而是大量分子持续撞击器壁产生的平均冲力。把每个分子撞壁的动量改变对时间、对全体分子平均，就得到 p=⅓nm v̄²。它把宏观量 p 和微观量（分子数密度 n、分子质量 m、平均速率平方）直接挂起钩来。', 'Gas pressure is not mysterious; it is the average force of countless molecules hitting the walls. Averaging the momentum kick of each collision over time and over all molecules gives p = ⅓ n m v̄². It ties the macroscopic p directly to microscopic quantities (number density n, molecular mass m, mean squared speed).'),
    symbols: [
        { sym: 'p', name: t('压强', 'pressure'), unit: 'Pa' },
        { sym: 'n', name: t('分子数密度', 'number density'), unit: 'm⁻³' },
        { sym: 'm', name: t('每个分子质量', 'mass of one molecule'), unit: 'kg' },
        { sym: '\\overline{v^{2}}', name: t('速率平方平均', 'mean squared speed'), unit: 'm²/s²' },
    ],
    conditions: {
        applies: [t('理想气体、平衡态', 'Ideal gas in equilibrium')],
        assumes: [t('分子混沌、各向同性', 'Molecular chaos, isotropy')],
        breaks: [t('稠密气体分子间碰撞主导时修正', 'Corrections in dense gases where collisions dominate')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('单分子撞壁一次动量改变 2mv_x', 'One wall kick changes momentum by 2mv_x'), latex: String.raw `\Delta p_x=2m v_x` },
        { n: 2, op: 'physics', title: t('单位时间撞 L 壁 v_x/(2L) 次', 'Hits wall L at frequency v_x/(2L)'), latex: String.raw `F=\Delta p\times\dfrac{v_x}{2L}=m\dfrac{v_x^{2}}{L}` },
        { n: 3, op: 'algebra', title: t('N 个分子平均，各向同性 v̄²=3v̄_x²', 'Average over N; isotropy v̄² = 3v̄_x²'), latex: String.raw `p=\dfrac{F\cdot N}{L^{2}}=\dfrac{N m}{3 V}\overline{v^{2}}=\dfrac{1}{3}nm\overline{v^{2}}` },
    ],
    links: {
        upstream: [{ id: 'phys-ideal-gas-law' }],
        downstream: [{ id: 'phys-mean-translational-kinetic-energy' }],
    },
};
export default physKineticTheoryPressure;
//# sourceMappingURL=phys-kinetic-theory-pressure.js.map