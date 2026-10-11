import { t } from '../../core/types.js';
/** phys-bernoulli-equation */
const physBernoulliEquation = {
    id: 'phys-bernoulli-equation',
    name: t('Bernoulli 方程', "Bernoulli's Equation"),
    aliases: { zh: ['伯努利方程', '定常流动能量方程'], en: ["Bernoulli's equation", 'Bernoulli principle'] },
    node: 'S18.4',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.DIFF'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY', 'Q.VEL'],
        keywords: t('伯努利方程 流速大压强小 机翼升力 文丘里', 'Bernoulli faster lower pressure lift airplane wing venturi'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `p+\tfrac{1}{2}\rho v^{2}+\rho g h=\text{沿流线常量}`,
        variants: [
            { name: t('水平管', 'horizontal pipe'), latex: String.raw `p_1+\tfrac{1}{2}\rho v_1^{2}=p_2+\tfrac{1}{2}\rho v_2^{2}` },
            { name: t('托里拆利出流', "Torricelli's efflux"), latex: String.raw `v=\sqrt{2 g h}` },
        ],
    },
    meaning: t('Bernoulli 方程是能量守恒在理想流体中的形式：沿同一条流线，压强能、动能、重力势能三项之和不变。最反直觉的结论是「流速大的地方压强小」——机翼上表面弧度大使气流加速、压强降低，上下压差就产生升力；两船并行会互相吸引也是同一道理。', 'Bernoulli’s equation is energy conservation for an ideal fluid: along a streamline the pressure energy, kinetic energy and gravitational potential energy sum to a constant. The counter-intuitive takeaway is “where the speed is high, the pressure is low”: the curved top of a wing accelerates the air and lowers the pressure, and the pressure difference gives lift; two ships sailing close together are drawn together for the same reason.'),
    symbols: [
        { sym: 'p', name: t('压强', 'pressure'), unit: 'Pa' },
        { sym: '\\rho', name: t('流体密度', 'fluid density'), unit: 'kg/m³' },
        { sym: 'v', name: t('流速', 'flow speed'), unit: 'm/s' },
        { sym: 'h', name: t('高度', 'elevation'), unit: 'm' },
    ],
    conditions: {
        applies: [t('定常、不可压缩、无黏、沿同一条流线', 'Steady, incompressible, inviscid flow along one streamline')],
        assumes: [t('无能量损耗', 'No energy dissipation')],
        breaks: [t('黏性显著或湍流时需修正', 'Needs correction when viscosity or turbulence matters')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('沿流线对单位体积流体列能量守恒', 'Energy conservation per unit volume along a streamline'), latex: String.raw `p+\tfrac{1}{2}\rho v^{2}+\rho g h=\text{const}` },
        { n: 2, op: 'substitute', title: t('水平管 h 相同', 'Horizontal pipe: h is the same'), latex: String.raw `p_1+\tfrac{1}{2}\rho v_1^{2}=p_2+\tfrac{1}{2}\rho v_2^{2}` },
        { n: 3, op: 'result', title: t('故 v 增大处 p 减小', 'Hence p drops where v rises'), latex: String.raw `v_2>v_1\;\Rightarrow\; p_2<p_1` },
    ],
    viz: [
        {
            id: 'venturi',
            level: 'V1',
            title: t('文丘里管：收缩段流速加快、压强下降', 'Venturi tube: throat speeds up, pressure drops'),
            xlabel: t('沿管轴位置 (m)', 'position along pipe (m)'),
            ylabel: t('流速 v (m/s)', 'flow speed v (m/s)'),
            controls: [
                { id: 'v1', label: t('入口流速 v₁', 'inlet speed v₁'), min: 0.5, max: 5, step: 0.1, value: 1, unit: 'm/s' },
                { id: 'throat', label: t('喉部收缩比', 'throat contraction ratio'), min: 0.2, max: 1, step: 0.05, value: 0.5 },
            ],
            xRange: [0, 1],
            note: t('喉部截面积小 → 流速升高 → 压强下降；连续性与 Bernoulli 联合的直接后果。', 'Smaller throat area → higher speed → lower pressure; a direct consequence of continuity plus Bernoulli.'),
            compute: (p) => {
                const v1 = p['v1'];
                const c = p['throat'];
                const vth = v1 / c;
                const spd = [];
                for (let i = 0; i <= 200; i++) {
                    const x = i / 200;
                    let v = v1;
                    if (x > 0.3 && x < 0.7)
                        v = vth;
                    spd.push([x, v]);
                }
                return [{ label: t('流速 v(x)', 'flow speed v(x)'), color: '#185FA5', points: spd }];
            },
        },
    ],
    links: {
        upstream: [{ id: 'phys-continuity-equation' }, { id: 'phys-conservation-mechanical-energy' }],
        seealso: [{ id: 'phys-hydrostatic-pressure' }],
    },
};
export default physBernoulliEquation;
//# sourceMappingURL=phys-bernoulli-equation.js.map