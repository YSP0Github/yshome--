import { t } from '../../core/types.js';
/** uem-continuous-charge-field */
const uemContinuousChargeField = {
    id: 'uem-continuous-charge-field',
    name: t('连续带电体的电场', 'Field of a Continuous Charge Distribution'),
    aliases: { zh: ['连续电荷分布', '线/面/体电荷'], en: ['continuous charge', 'line/surface/volume charge'] },
    node: 'S19.1',
    tags: {
        math: ['MATH.VECTOR', 'MATH.DIFF'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('连续电荷 微元 积分 线电荷λ 面电荷σ 轴线上圆环', 'continuous charge element integral line lambda surface sigma ring axis'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\mathbf{E}=\frac{1}{4\pi\varepsilon_{0}}\int\frac{dq}{r^{2}}\,\hat{\mathbf{r}}`,
        variants: [
            { name: t('带电圆环轴线上', 'On axis of a ring'), latex: String.raw `E=\dfrac{1}{4\pi\varepsilon_{0}}\dfrac{Q\,z}{(z^{2}+R^{2})^{3/2}}` },
            { name: t('无限长均匀直线', 'Infinite line charge'), latex: String.raw `E=\dfrac{\lambda}{2\pi\varepsilon_{0}\,r}` },
        ],
    },
    meaning: t('把连续带电体切成无数电荷微元 dq，每个微元看作点电荷，其场再积分叠加。按几何可将电荷分成线密度 λ、面密度 σ、体密度 ρ_q。常见结果（圆环轴线、无限长线、无限大平板）都由此法得到，对称情形用 Gauss 定律更快。', 'Slice a continuous body into charge elements dq, treat each as a point charge, and integrate the fields. By geometry we use line density λ, surface density σ, or volume density ρ_q. Standard results (ring axis, infinite line, infinite sheet) come from this; symmetric cases are faster via Gauss\'s law.'),
    symbols: [
        { sym: 'dq', name: t('电荷微元', 'charge element'), unit: 'C' },
        { sym: '\\lambda', name: t('线电荷密度', 'linear charge density'), unit: 'C/m' },
        { sym: '\\sigma', name: t('面电荷密度', 'surface charge density'), unit: 'C/m²' },
        { sym: '\\rho_{q}', name: t('体电荷密度', 'volume charge density'), unit: 'C/m³' },
        { sym: 'r', name: t('微元到场点距离', 'distance to field point'), unit: 'm' },
    ],
    conditions: {
        applies: [t('已知几何与电荷密度分布；静电情形', 'Known geometry and charge density; electrostatic')],
        assumes: [t('积分时利用对称性抵消垂直分量', 'Symmetry cancels transverse components during integration')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('切出微元 dq', 'Slice out an element dq'),
            latex: String.raw `dq=\lambda\,dl\ (\text{或}\ \sigma\,dA,\ \rho_{q}\,dV)` },
        { n: 2, op: 'physics', title: t('微元当作点电荷', 'Treat element as a point charge'),
            latex: String.raw `d\mathbf{E}=\dfrac{1}{4\pi\varepsilon_{0}}\dfrac{dq}{r^{2}}\hat{\mathbf{r}}` },
        { n: 3, op: 'transform', title: t('对全体微元积分', 'Integrate over all elements'),
            latex: String.raw `\mathbf{E}=\int d\mathbf{E}=\dfrac{1}{4\pi\varepsilon_{0}}\int\dfrac{dq}{r^{2}}\hat{\mathbf{r}}` },
        { n: 4, op: 'result', title: t('圆环轴线结果', 'Ring-on-axis result'),
            latex: String.raw `E=\dfrac{1}{4\pi\varepsilon_{0}}\dfrac{Qz}{(z^{2}+R^{2})^{3/2}}` },
    ],
    links: {
        upstream: [{ id: 'uem-discrete-charge-superposition' }],
        seealso: [{ id: 'uem-gauss-law', note: t('对称情形更省事', 'Faster for symmetric cases') }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §23' }],
};
export default uemContinuousChargeField;
//# sourceMappingURL=uem-continuous-charge-field.js.map