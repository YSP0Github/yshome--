import { t } from '../../core/types.js';
/** elastic-impedance */
const elasticImpedance = {
    id: 'elastic-impedance',
    name: t('弹性阻抗', 'Elastic Impedance'),
    aliases: { zh: ['EI', 'Connolly 弹性阻抗', '角度阻抗'], en: ['elastic impedance', 'EI', 'angle-dependent impedance'] },
    node: 'S3.2',
    tags: {
        math: ['MATH.APPROX', 'MATH.ALGEBRA'],
        method: ['METH.EXPL'],
        quantity: ['Q.AMP', 'Q.VEL'],
        keywords: { zh: 'AVO 反演、弹性反演', en: 'AVO inversion, elastic inversion' },
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `EI(\theta) = \alpha^{\,1+\sin^{2}\theta}\;\beta^{\,-8K\sin^{2}\theta}\;\rho^{\,1-4K\sin^{2}\theta},\qquad K = \frac{\beta^{2}}{\alpha^{2}}`,
        variants: [
            { name: t('用弹性阻抗写反射系数', 'Writing reflectivity with elastic impedance'), latex: String.raw `R(\theta) \approx \frac{EI_{2}(\theta)-EI_{1}(\theta)}{EI_{2}(\theta)+EI_{1}(\theta)}` },
            { name: t('θ = 0 时退化为声阻抗', 'Degenerates to acoustic impedance at θ = 0'), latex: String.raw `EI(0) = \alpha\rho = I_P` },
            { name: t('对数线性化', 'Log linearisation'), latex: String.raw `\frac{\Delta EI}{EI} = (1+\sin^{2}\theta)\frac{\Delta\alpha}{\alpha} - 8K\sin^{2}\theta\frac{\Delta\beta}{\beta} + (1-4K\sin^{2}\theta)\frac{\Delta\rho}{\rho}` },
        ],
    },
    meaning: t('弹性阻抗把「随角度变化的反射系数」重新包装成「某个角度上的阻抗」。于是每个角度道集都能像常规声阻抗那样被反演、被解释、被做剖面显示 —— 这是 AVO 从分析工具走向工业级反演的关键一步。', 'Elastic impedance repackages the angle-dependent reflection coefficient as an impedance evaluated at a fixed angle. Every angle gather can then be inverted, interpreted and displayed like an ordinary acoustic impedance — the key step that turned AVO from an analysis tool into production-scale inversion.'),
    symbols: [
        { sym: 'EI(\\theta)', name: t('角度 θ 处的弹性阻抗', 'elastic impedance at angle θ'), unit: 'kg/(m²·s)' },
        { sym: '\\alpha', name: t('P 波速度', 'P velocity'), unit: 'm/s' },
        { sym: '\\beta', name: t('S 波速度', 'S velocity'), unit: 'm/s' },
        { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
        { sym: 'K', name: t('速度比平方 (β/α)²', 'squared velocity ratio (β/α)²'), unit: '无量纲', typical: '0.2 – 0.35' },
        { sym: '\\theta', name: t('入射角', 'incidence angle'), unit: '°' },
    ],
    conditions: {
        applies: [t('叠前角度道集的 AVO 反演与岩性判别', 'AVO inversion and lithology discrimination on pre-stack angle gathers')],
        assumes: [
            t('弱反差、各向同性弹性介质', 'Weak contrast, isotropic elastic media'),
            t('角度道集已做过真振幅恢复', 'Angle gathers are true-amplitude processed'),
        ],
        breaks: [
            t('角度超过 45° 时近似误差快速增大', 'Approximation error grows rapidly beyond 45°'),
            t('EI 的量纲随角度变化，不同角度的 EI 不能直接相减', 'EI has angle-dependent units; EIs at different angles cannot be differenced directly'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('从 Aki–Richards 出发', 'Start from Aki–Richards'),
            latex: String.raw `R(\theta) \approx \frac{1}{2\cos^{2}\theta}\frac{\Delta\alpha}{\alpha} - 4K\sin^{2}\theta\frac{\Delta\beta}{\beta} + \frac{1}{2}(1-4K\sin^{2}\theta)\frac{\Delta\rho}{\rho}` },
        { n: 2, op: 'identity', title: t('把 1/cos²θ 写成 1 + tan²θ 再近似', 'Write 1/cos²θ as 1 + tan²θ and approximate'),
            latex: String.raw `\frac{1}{2\cos^{2}\theta} = \frac{1}{2}(1+\tan^{2}\theta) \approx \frac{1}{2}(1+\sin^{2}\theta)` },
        { n: 3, op: 'taylor', title: t('把小量差写成对数微分', 'Write fractional differences as log differentials'),
            latex: String.raw `\frac{\Delta\alpha}{\alpha} \approx \Delta\ln\alpha,\quad R(\theta)\approx \frac{1}{2}\Delta\ln EI(\theta)` },
        { n: 4, op: 'algebra', title: t('逐项匹配指数', 'Match exponents term by term'),
            latex: String.raw `\ln EI = (1+\sin^{2}\theta)\ln\alpha - 8K\sin^{2}\theta\ln\beta + (1-4K\sin^{2}\theta)\ln\rho` },
        { n: 5, op: 'result', title: t('取指数得到定义式', 'Exponentiate to obtain the definition'),
            latex: String.raw `EI(\theta) = \alpha^{1+\sin^{2}\theta}\beta^{-8K\sin^{2}\theta}\rho^{1-4K\sin^{2}\theta}` },
    ],
    viz: [
        {
            id: 'ei-vs-angle',
            level: 'V1',
            title: t('弹性阻抗随入射角的变化', 'Elastic impedance versus incidence angle'),
            xlabel: t('入射角 θ (°)', 'incidence angle θ (°)'),
            ylabel: t('EI(θ) / EI(0°)', 'EI(θ) / EI(0°)'),
            controls: [
                { id: 'vp', label: t('P 波速度 α (m/s)', 'P velocity α (m/s)'), min: 1800, max: 5000, step: 20, value: 3000 },
                { id: 'vs', label: t('S 波速度 β (m/s)', 'S velocity β (m/s)'), min: 600, max: 2800, step: 20, value: 1500 },
                { id: 'rho', label: t('密度 ρ (kg/m³)', 'density ρ (kg/m³)'), min: 1900, max: 2700, step: 10, value: 2350 },
            ],
            note: t('含气砂岩的 β 会比含水时略升、α 明显下降，两条曲线因此在远角度处张开。', 'In a gas sand β rises slightly while α drops markedly, so the two curves separate at far angles.'),
            compute: (p) => {
                const vp = p['vp'], vs = p['vs'], rho = p['rho'];
                const ei = (a, b, d, th) => {
                    const K = (b * b) / (a * a);
                    const s2 = Math.sin(th) ** 2;
                    return Math.pow(a, 1 + s2) * Math.pow(b, -8 * K * s2) * Math.pow(d, 1 - 4 * K * s2);
                };
                const ref = ei(vp, vs, rho, 0);
                const wet = [];
                const gas = [];
                for (let i = 0; i <= 180; i++) {
                    const deg = (i / 180) * 45;
                    const th = (deg * Math.PI) / 180;
                    wet.push([deg, ei(vp, vs, rho, th) / ref]);
                    gas.push([deg, ei(vp * 0.88, vs * 1.05, rho * 0.97, th) / ref]);
                }
                return [
                    { label: t('原始参数', 'original parameters'), color: '#185FA5', points: wet },
                    { label: t('含气（α↓ β↑ ρ↓）', 'gas (α↓ β↑ ρ↓)'), color: '#993C1D', points: gas, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('30° 处的弹性阻抗', 'Elastic impedance at 30°'),
        input: t('α = 3000 m/s，β = 1500 m/s，ρ = 2350 kg/m³，θ = 30°', 'α = 3000 m/s, β = 1500 m/s, ρ = 2350 kg/m³, θ = 30°'),
        steps: [
            t('K = (1500/3000)² = 0.25，sin²30° = 0.25', 'K = (1500/3000)² = 0.25, sin²30° = 0.25'),
            t('指数：α 为 1.25，β 为 −0.5，ρ 为 0.75', 'Exponents: 1.25 for α, −0.5 for β, 0.75 for ρ'),
            t('EI(30°) = 3000^1.25 × 1500^(−0.5) × 2350^0.75', 'EI(30°) = 3000^1.25 × 1500^(−0.5) × 2350^0.75'),
        ],
        output: t('EI(30°) 与声阻抗数值不同、量纲也不同，只能在同一角度内比较', 'EI(30°) differs from acoustic impedance in both value and units, so it may only be compared within one angle'),
    },
    links: {
        upstream: [{ id: 'aki-richards-approximation', note: t('它的线性化基础', 'Its linearisation basis') }],
        seealso: [
            { id: 'shuey-approximation', note: t('另一种参量化', 'An alternative parameterisation') },
            { id: 'fluid-factor-avo', note: t('流体因子的同类思路', 'The same idea behind the fluid factor') },
        ],
    },
    refs: [{ text: 'Connolly, P. (1999). Elastic impedance. The Leading Edge, 18, 438–452' }],
};
export default elasticImpedance;
//# sourceMappingURL=elastic-impedance.js.map