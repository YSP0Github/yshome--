import { t } from '../../core/types.js';
/** gravity-potential-second-derivatives */
const gravityPotentialSecondDerivatives = {
    id: 'gravity-potential-second-derivatives',
    name: t('引力位的二阶导数与 Laplace 方程', 'Second Derivatives of Potential and Laplace Equation'),
    aliases: { zh: ['Laplace 方程', 'Poisson 方程', '位场二阶导数'], en: ["Laplace's equation", "Poisson's equation", 'gradient gravity'] },
    node: 'S14.1',
    tags: {
        math: ['MATH.VECTOR', 'MATH.DIFF'],
        method: ['METH.GRAV'],
        quantity: ['Q.GRAV'],
        keywords: t('二阶导数 Laplace Poisson 位场 曲率', 'second derivative Laplace Poisson potential curvature'),
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `\nabla^{2}V=4\pi G\,\rho\ \ (\text{有质量区}),\qquad \nabla^{2}V=0\ \ (\text{无质量区})`,
        variants: [
            { name: t('重力垂直梯度（位的 z 二阶导）', 'vertical gravity gradient (second z-derivative)'), latex: String.raw `g_z=-\frac{\partial V}{\partial z},\quad \frac{\partial g_z}{\partial z}=-\frac{\partial^{2}V}{\partial z^{2}}` },
        ],
    },
    meaning: t('引力位在质量区满足 Poisson 方程、在外部真空区满足 Laplace 方程。二阶导数（重力梯度张量）刻画重力场的空间变化率，是梯度重力测量（gradiometry）的观测对象。位场外部调和（满足 Laplace）这一性质，决定了重力反演的固有非唯一性：外部场无法唯一确定内部质量分布。', 'The potential obeys Poisson’s equation in mass-bearing regions and Laplace’s equation in free space. Its second derivatives — the gravity gradient tensor — encode the spatial rate of change of the field and are what gradiometers measure. That the external field is harmonic (Laplace) is precisely why gravity inversion is non-unique: the external field does not uniquely fix the internal mass distribution.'),
    symbols: [
        { sym: '\\nabla^{2}', name: t('Laplace 算子', 'Laplace operator'), unit: 'm⁻²' },
        { sym: 'V', name: t('引力位', 'gravitational potential'), unit: 'm²/s²' },
        { sym: 'G', name: t('万有引力常数', 'gravitational constant'), unit: 'm³ kg⁻¹ s⁻²' },
        { sym: '\\rho', name: t('体积密度', 'volume density'), unit: 'kg/m³' },
        { sym: '\\partial^{2}V/\\partial z^{2}', name: t('位的垂直二阶导', 'vertical second derivative of potential'), unit: '1/s²' },
    ],
    conditions: {
        applies: [t('任意引力位场，稳态', 'Any steady gravitational potential field')],
        assumes: [t('ρ 为当地质量密度', 'ρ is the local mass density')],
        breaks: [t('含时间变化或相对论效应时需修正', 'Needs correction with time variation or relativistic effects')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('引力场通量正比于内部质量', 'Gravitational flux proportional to enclosed mass'),
            latex: String.raw `\oint \mathbf{g}\cdot d\mathbf{S}=-4\pi G\,M_{\text{enc}}` },
        { n: 2, op: 'transform', title: t('散度定理换为体积分', 'Apply divergence theorem to a volume integral'),
            latex: String.raw `\int \nabla\cdot\mathbf{g}\,dV=-4\pi G\int \rho\,dV` },
        { n: 3, op: 'substitute', title: t('代入 g=−∇V', 'Substitute g=−∇V'),
            latex: String.raw `\nabla\cdot(-\nabla V)=\nabla^{2}V=4\pi G\,\rho` },
        { n: 4, op: 'result', title: t('无质量区退化为 Laplace 方程', 'Free-space region reduces to Laplace equation'),
            latex: String.raw `\rho=0\ \Rightarrow\ \nabla^{2}V=0` },
    ],
    links: {
        upstream: [{ id: 'gravity-field-from-potential' }],
        seealso: [{ id: 'divergence-theorem' }, { id: 'hydrostatic-equilibrium' }],
    },
    refs: [{ text: 'Blakely, Potential Theory, §3; Kellogg, Potential Theory' }],
};
export default gravityPotentialSecondDerivatives;
//# sourceMappingURL=gravity-potential-second-derivatives.js.map