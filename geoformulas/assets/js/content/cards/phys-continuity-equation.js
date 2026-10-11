import { t } from '../../core/types.js';
/** phys-continuity-equation */
const physContinuityEquation = {
    id: 'phys-continuity-equation',
    name: t('流体连续性方程', 'Continuity Equation for Fluids'),
    aliases: { zh: ['连续性方程', '流量守恒 Av=const'], en: ['continuity equation', 'flow conservation'] },
    node: 'S18.4',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.VEL', 'Q.GEOM'],
        keywords: t('连续性方程 流量 截面积 细处流速快 不可压缩', 'continuity flow rate area narrower faster incompressible'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `A_1 v_1=A_2 v_2=\text{常量}`,
        variants: [
            { name: t('含密度的一般形式', 'general form with density'), latex: String.raw `\rho_1 A_1 v_1=\rho_2 A_2 v_2` },
        ],
    },
    meaning: t('对不可压缩流体，单位时间流过任一截面的体积（流量 Q=Av）必须相同——水既不会凭空产生也不会消失。因此管子越细，水流得越快：捏住水管口喷得更远正是这个道理。它是质量守恒在流体中的表达。', 'For an incompressible fluid the volume flow Q = Av through any cross-section must be the same — water is neither created nor destroyed. Hence a narrower tube means a faster flow: pinching a hose makes the jet shoot farther. It is mass conservation written for a fluid.'),
    symbols: [
        { sym: 'A_1,A_2', name: t('两处截面积', 'cross-sectional areas at two points'), unit: 'm²' },
        { sym: 'v_1,v_2', name: t('两处流速', 'flow speeds at two points'), unit: 'm/s' },
        { sym: 'Q', name: t('体积流量', 'volume flow rate'), unit: 'm³/s' },
    ],
    conditions: {
        applies: [t('定常流动、不可压缩', 'Steady, incompressible flow')],
        assumes: [t('无漏流、一维近似', 'No leakage, 1-D approximation')],
        breaks: [t('可压缩气体或有分叉时须用一般式', 'Use the general form for compressible gas or branches')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('质量守恒：流入=流出', 'Mass conservation: inflow = outflow'), latex: String.raw `\rho A_1 v_1=\rho A_2 v_2` },
        { n: 2, op: 'algebra', title: t('不可压缩时 ρ 相同约去', 'Incompressible: ρ cancels'), latex: String.raw `A_1 v_1=A_2 v_2` },
    ],
    links: {
        downstream: [{ id: 'phys-bernoulli-equation' }],
    },
};
export default physContinuityEquation;
//# sourceMappingURL=phys-continuity-equation.js.map