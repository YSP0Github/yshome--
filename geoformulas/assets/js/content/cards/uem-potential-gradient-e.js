import { t } from '../../core/types.js';
/** uem-potential-gradient-e */
const uemPotentialGradientE = {
    id: 'uem-potential-gradient-e',
    name: t('电势差与电场（梯度关系）', 'Potential Difference and E = −∇V'),
    aliases: { zh: ['E=-dV/dx', '电场是电势负梯度'], en: ['E = -grad V', 'field as potential gradient'] },
    node: 'S19.1',
    tags: {
        math: ['MATH.VECTOR', 'MATH.DIFF'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('电势差 U=Ed E=-梯度 匀强电场 等势面间距', 'potential difference U=Ed E negative gradient uniform field equipotential spacing'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\mathbf{E}=-\nabla V,\qquad E_{x}=-\frac{\partial V}{\partial x},\qquad U=V_{a}-V_{b}=\int_{a}^{b}\mathbf{E}\cdot d\mathbf{l}`,
        variants: [
            { name: t('匀强电场平行板', 'Uniform field (parallel plates)'), latex: String.raw `E=\dfrac{U}{d}` },
        ],
    },
    meaning: t('电场等于电势的负梯度：场强方向是电势降落最快的方向，大小等于单位距离上电势的下降量。知道电势分布求 E 只需求导，比积分求场方便。匀强电场中 U=Ed。', 'The field is the negative gradient of the potential: E points in the direction of steepest potential drop and equals the potential decrease per unit distance. Given V, finding E is just differentiation—easier than integrating to get the field. In a uniform field U=Ed.'),
    symbols: [
        { sym: '\\nabla V', name: t('电势梯度', 'gradient of potential'), unit: 'V/m' },
        { sym: 'U', name: t('电势差', 'potential difference'), unit: 'V' },
        { sym: 'd', name: t('沿场方向距离', 'distance along field'), unit: 'm' },
    ],
    conditions: {
        applies: [t('静电场中由 V 分布求 E', 'Find E from a known V distribution in electrostatics')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('电势差的线积分定义', 'Define potential difference by line integral'),
            latex: String.raw `U_{ab}=V_{a}-V_{b}=\int_{a}^{b}\mathbf{E}\cdot d\mathbf{l}` },
        { n: 2, op: 'algebra', title: t('微分位移', 'Infinitesimal displacement'),
            latex: String.raw `dV=-\mathbf{E}\cdot d\mathbf{l}=-(E_{x}dx+E_{y}dy+E_{z}dz)` },
        { n: 3, op: 'result', title: t('读出分量关系', 'Read off component relations'),
            latex: String.raw `E_{x}=-\dfrac{\partial V}{\partial x}\ \Rightarrow\ \mathbf{E}=-\nabla V` },
    ],
    links: {
        upstream: [{ id: 'uem-electric-potential-point-charge' }],
        downstream: [{ id: 'uem-parallel-plate-capacitor' }],
        seealso: [{ id: 'gradient' }],
    },
    refs: [{ text: 'Griffiths, Introduction to Electrodynamics, 4e, §2.3' }],
};
export default uemPotentialGradientE;
//# sourceMappingURL=uem-potential-gradient-e.js.map