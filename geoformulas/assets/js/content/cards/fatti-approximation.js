import { t } from '../../core/types.js';
/** fatti-approximation */
const fattiApproximation = {
    id: 'fatti-approximation',
    name: t('Fatti 近似式', 'The Fatti Approximation'),
    aliases: { zh: ['Fatti 公式', '阻抗形式 AVO'], en: ['Fatti approximation', 'impedance-form AVO'] },
    node: 'S3.3',
    tags: {
        math: ['MATH.APPROX', 'MATH.ALGEBRA'],
        method: ['METH.EXPL', 'METH.INV'],
        quantity: ['Q.AMP', 'Q.VEL'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `R(\theta) \approx c_{1}\frac{\Delta I_{P}}{I_{P}} + c_{2}\frac{\Delta I_{S}}{I_{S}} + c_{3}\frac{\Delta\rho}{\rho}`,
        variants: [
            { name: t('三个系数', 'The three coefficients'), latex: String.raw `c_{1} = \frac{1}{2}\left(1+\tan^{2}\theta\right),\quad c_{2} = -4\gamma\sin^{2}\theta,\quad c_{3} = \frac{1}{2}\left(4\gamma\sin^{2}\theta - \tan^{2}\theta\right)` },
            { name: t('阻抗反差展开', 'Impedance contrasts expanded'), latex: String.raw `\frac{\Delta I_{P}}{I_{P}} = \frac{\Delta\alpha}{\alpha} + \frac{\Delta\rho}{\rho},\qquad \frac{\Delta I_{S}}{I_{S}} = \frac{\Delta\beta}{\beta} + \frac{\Delta\rho}{\rho}` },
            { name: t('θ = 0 时的检验', 'Check at θ = 0'), latex: String.raw `R(0) = \frac{1}{2}\frac{\Delta I_{P}}{I_{P}} = \frac{1}{2}\left(\frac{\Delta\alpha}{\alpha}+\frac{\Delta\rho}{\rho}\right)` },
        ],
    },
    meaning: t('Fatti 近似把 Aki–Richards 重组成「P 阻抗、S 阻抗、密度」三个反差量的加权和。好处是反演出来的三个属性有明确的物理意义，可以直接与测井对比；代价是三个系数在远角度都带 tan²θ，数值上比 Shuey 更容易发散。', 'The Fatti approximation rewrites Aki–Richards as a weighted sum of P-impedance, S-impedance and density contrasts. The advantage is that the three inverted attributes have clear physical meaning and can be compared directly with well logs; the cost is that all three coefficients carry tan²θ at far angles, making it numerically more prone to blow-up than Shuey.'),
    symbols: [
        { sym: 'I_{P}', name: t('P 波阻抗 ρα', 'P impedance ρα'), unit: 'kg/(m²·s)' },
        { sym: 'I_{S}', name: t('S 波阻抗 ρβ', 'S impedance ρβ'), unit: 'kg/(m²·s)' },
        { sym: 'c_{1}, c_{2}, c_{3}', name: t('角度权重', 'angular weights'), unit: '无量纲' },
        { sym: '\\gamma', name: t('速度比平方 (β/α)²', 'squared velocity ratio (β/α)²'), unit: '无量纲' },
        { sym: '\\theta', name: t('入射角', 'incidence angle'), unit: '°' },
    ],
    conditions: {
        applies: [t('三项 AVO 反演，直接输出 ΔI_P/I_P、ΔI_S/I_S、Δρ/ρ', 'Three-term AVO inversion yielding ΔI_P/I_P, ΔI_S/I_S and Δρ/ρ directly')],
        assumes: [
            t('弱反差、各向同性', 'Weak contrast, isotropic'),
            t('角度一般不超过 40°', 'Angles generally below 40°'),
        ],
        breaks: [
            t('θ > 45° 时 tan²θ 项使反演不稳定', 'Beyond 45° the tan²θ terms destabilise the inversion'),
            t('三个属性高度相关，需正则化或贝叶斯约束', 'The three attributes are strongly correlated; regularisation or Bayesian priors are needed'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('从 Aki–Richards 出发', 'Start from Aki–Richards'),
            latex: String.raw `R \approx \frac{1}{2\cos^{2}\theta}\frac{\Delta\alpha}{\alpha} - 4\gamma\sin^{2}\theta\frac{\Delta\beta}{\beta} + \frac{1}{2}(1-4\gamma\sin^{2}\theta)\frac{\Delta\rho}{\rho}` },
        { n: 2, op: 'identity', title: t('把阻抗反差拆开', 'Split the impedance contrasts'),
            latex: String.raw `\frac{\Delta\alpha}{\alpha} = \frac{\Delta I_P}{I_P} - \frac{\Delta\rho}{\rho},\qquad \frac{\Delta\beta}{\beta} = \frac{\Delta I_S}{I_S} - \frac{\Delta\rho}{\rho}` },
        { n: 3, op: 'substitute', title: t('代入并重新归并', 'Substitute and regroup'),
            latex: String.raw `R = \frac{1}{2\cos^{2}\theta}\frac{\Delta I_P}{I_P} - 4\gamma\sin^{2}\theta\frac{\Delta I_S}{I_S} + \left[\frac{1}{2}(1-4\gamma\sin^{2}\theta) - \frac{1}{2\cos^{2}\theta} + 4\gamma\sin^{2}\theta\right]\frac{\Delta\rho}{\rho}` },
        { n: 4, op: 'identity', title: t('化简密度项的系数', 'Simplify the density coefficient'),
            latex: String.raw `\frac{1}{2} - 2\gamma\sin^{2}\theta - \frac{1}{2}(1+\tan^{2}\theta) + 4\gamma\sin^{2}\theta = \frac{1}{2}\left(4\gamma\sin^{2}\theta - \tan^{2}\theta\right)` },
        { n: 5, op: 'result', title: t('得到三个权重', 'Obtain the three weights'),
            latex: String.raw `c_1 = \frac{1}{2}(1+\tan^{2}\theta),\quad c_2 = -4\gamma\sin^{2}\theta,\quad c_3 = \frac{1}{2}(4\gamma\sin^{2}\theta - \tan^{2}\theta)` },
    ],
    viz: [
        {
            id: 'fatti-weights',
            level: 'V1',
            title: t('三个权重随角度的变化', 'The three weights versus angle'),
            xlabel: t('入射角 θ (°)', 'incidence angle θ (°)'),
            ylabel: t('权重', 'weight'),
            controls: [
                { id: 'gam', label: t('γ', 'γ'), min: 0.15, max: 0.35, step: 0.005, value: 0.25 },
            ],
            note: t('c₁ 与 c₃ 都在远角度发散（tan²θ），这正是 AVO 三项反演不能用到太大角度的原因。', 'Both c₁ and c₃ diverge at far angles (tan²θ) — the reason three-term AVO inversion cannot be pushed to large angles.'),
            compute: (p) => {
                const gam = p['gam'];
                const c1 = [];
                const c2 = [];
                const c3 = [];
                for (let i = 0; i <= 150; i++) {
                    const deg = (i / 150) * 45;
                    const rad = (deg * Math.PI) / 180;
                    const s2 = Math.sin(rad) ** 2;
                    const t2 = Math.tan(rad) ** 2;
                    c1.push([deg, 0.5 * (1 + t2)]);
                    c2.push([deg, -4 * gam * s2]);
                    c3.push([deg, 0.5 * (4 * gam * s2 - t2)]);
                }
                return [
                    { label: t('c₁ (ΔI_P)', 'c₁ (ΔI_P)'), color: '#185FA5', points: c1 },
                    { label: t('c₂ (ΔI_S)', 'c₂ (ΔI_S)'), color: '#0F6E56', points: c2 },
                    { label: t('c₃ (Δρ)', 'c₃ (Δρ)'), color: '#993C1D', points: c3, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('30° 处的三项权重', 'The three weights at 30°'),
        input: t('γ = 0.25，θ = 30°', 'γ = 0.25, θ = 30°'),
        steps: [
            t('tan²30° = 0.333，sin²30° = 0.25', 'tan²30° = 0.333, sin²30° = 0.25'),
            t('c₁ = 0.667，c₂ = −0.25，c₃ = ½(0.25 − 0.333) = −0.042', 'c₁ = 0.667, c₂ = −0.25, c₃ = ½(0.25 − 0.333) = −0.042'),
        ],
        output: t('密度项权重很小，这就是为什么密度反演最不可靠', 'The density weight is tiny, which is why density inversion is the least reliable'),
    },
    links: {
        upstream: [{ id: 'aki-richards-approximation', note: t('完全等价的另一种写法', 'An exactly equivalent alternative form') }],
        seealso: [
            { id: 'shuey-approximation', note: t('数值更稳定的参量化', 'A numerically more stable parameterisation') },
            { id: 'elastic-impedance', note: t('角度域阻抗的同类思路', 'The same idea in the angle-impedance domain') },
        ],
    },
    refs: [{ text: 'Fatti, J. et al. (1994). Detection of gas in sandstone reservoirs using AVO analysis. Geophysics, 59, 1362–1376' }],
};
export default fattiApproximation;
//# sourceMappingURL=fatti-approximation.js.map