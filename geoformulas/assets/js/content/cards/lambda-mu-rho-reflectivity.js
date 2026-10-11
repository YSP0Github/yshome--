import { t } from '../../core/types.js';
/** lambda-mu-rho-reflectivity */
const lambdaMuRhoReflectivity = {
    id: 'lambda-mu-rho-reflectivity',
    name: t('λ–μ–ρ 反射率', 'λ–μ–ρ Reflectivity'),
    aliases: { zh: ['拉梅常数反演', 'LMR', 'λρ-μρ'], en: ['LMR inversion', 'lambda-mu-rho', 'Goodway'] },
    node: 'S3.3',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.APPROX'],
        method: ['METH.EXPL', 'METH.INV'],
        quantity: ['Q.MAT', 'Q.AMP'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `2\frac{\Delta\alpha}{\alpha} = (1-2\gamma)\frac{\Delta\lambda}{\lambda} + 2\gamma\frac{\Delta\mu}{\mu} - \frac{\Delta\rho}{\rho},\qquad 2\frac{\Delta\beta}{\beta} = \frac{\Delta\mu}{\mu} - \frac{\Delta\rho}{\rho}`,
        variants: [
            { name: t('γ 与 λ、μ 的关系', 'Relation between γ and λ, μ'), latex: String.raw `\gamma = \frac{\beta^{2}}{\alpha^{2}} = \frac{\mu}{\lambda+2\mu}` },
            { name: t('代入 Aki–Richards', 'Substituting into Aki–Richards'), latex: String.raw `R(\theta) \approx \frac{1}{2\cos^{2}\theta}\frac{\Delta\alpha}{\alpha} - 4\gamma\sin^{2}\theta\frac{\Delta\beta}{\beta} + \frac{1}{2}(1-4\gamma\sin^{2}\theta)\frac{\Delta\rho}{\rho}` },
            { name: t('λ 对流体最敏感', 'λ is most sensitive to fluid'), latex: String.raw `\mu_{\text{干}} = \mu_{\text{饱和}}\ (\text{Gassmann}),\qquad \lambda\ \text{随流体显著变化}` },
        ],
    },
    meaning: t('α、β、ρ 这三个反差量里混着流体与骨架两种信息。换成 λ（不可压缩性）、μ（剪切模量）、ρ（密度）之后，流体效应几乎全部集中在 λ 上，而 μ 只反映骨架 —— 于是 λ 异常成为比 α 更干净的烃类指示。这就是「LMR 反演」的出发点。', 'The three contrasts α, β, ρ mix fluid and frame information. Switching to λ (incompressibility), μ (shear modulus) and ρ separates them: fluid effects concentrate almost entirely in λ, while μ reflects only the frame. A λ anomaly is therefore a cleaner hydrocarbon indicator than α. That is the starting point of LMR inversion.'),
    symbols: [
        { sym: '\\lambda', name: t('Lamé 第一参数（不可压缩性相关）', 'Lamé’s first parameter (incompressibility-related)'), unit: 'Pa', typical: '1 – 50 GPa' },
        { sym: '\\mu', name: t('剪切模量', 'shear modulus'), unit: 'Pa', typical: '1 – 40 GPa' },
        { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
        { sym: '\\gamma', name: t('速度比平方 μ/(λ+2μ)', 'squared velocity ratio μ/(λ+2μ)'), unit: '无量纲', typical: '0.25' },
    ],
    conditions: {
        applies: [t('叠前同时反演 λ、μ、ρ 以判别流体与岩性', 'Simultaneous pre-stack inversion for λ, μ, ρ to discriminate fluid and lithology')],
        assumes: [
            t('各向同性弹性介质、弱反差', 'Isotropic elastic media with weak contrast'),
            t('Gassmann 关系适用（μ 与流体无关）', 'Gassmann applies (μ is fluid independent)'),
        ],
        breaks: [
            t('裂缝、各向异性使 μ 也带上流体信息', 'Fractures and anisotropy make μ fluid-dependent too'),
            t('λ 反演对噪声极敏感，需要强正则化', 'λ inversion is very noise-sensitive and needs heavy regularisation'),
        ],
    },
    derivation: [
        { n: 1, op: 'identity', title: t('写出速度与模量的关系', 'Relate velocities to moduli'),
            latex: String.raw `\alpha^{2} = \frac{\lambda+2\mu}{\rho},\qquad \beta^{2} = \frac{\mu}{\rho}` },
        { n: 2, op: 'algebra', title: t('取对数微分', 'Take logarithmic differentials'),
            latex: String.raw `2\frac{\Delta\beta}{\beta} = \frac{\Delta\mu}{\mu} - \frac{\Delta\rho}{\rho}` },
        { n: 3, op: 'algebra', title: t('对 α 做同样处理', 'Do the same for α'),
            latex: String.raw `2\frac{\Delta\alpha}{\alpha} = \frac{\Delta(\lambda+2\mu)}{\lambda+2\mu} - \frac{\Delta\rho}{\rho}` },
        { n: 4, op: 'identity', title: t('把 λ+2μ 的扰动写成 λ、μ 的扰动', 'Express the perturbation of λ+2μ via λ and μ'),
            latex: String.raw `\frac{\Delta(\lambda+2\mu)}{\lambda+2\mu} = (1-2\gamma)\frac{\Delta\lambda}{\lambda} + 2\gamma\frac{\Delta\mu}{\mu},\qquad \gamma=\frac{\mu}{\lambda+2\mu}` },
        { n: 5, op: 'result', title: t('得到变换式', 'Obtain the transformation'),
            latex: String.raw `2\frac{\Delta\alpha}{\alpha} = (1-2\gamma)\frac{\Delta\lambda}{\lambda} + 2\gamma\frac{\Delta\mu}{\mu} - \frac{\Delta\rho}{\rho}` },
    ],
    viz: [
        {
            id: 'lmr-avo',
            level: 'V2',
            title: t('由 λ、μ、ρ 反差预测 AVO 曲线', 'AVO curve predicted from λ, μ, ρ contrasts'),
            xlabel: t('入射角 θ (°)', 'incidence angle θ (°)'),
            ylabel: t('反射系数 R', 'reflection coefficient R'),
            controls: [
                { id: 'dl', label: t('Δλ/λ', 'Δλ/λ'), min: -0.5, max: 0.5, step: 0.01, value: -0.25 },
                { id: 'dm', label: t('Δμ/μ', 'Δμ/μ'), min: -0.5, max: 0.5, step: 0.01, value: 0.05 },
                { id: 'dr', label: t('Δρ/ρ', 'Δρ/ρ'), min: -0.5, max: 0.5, step: 0.01, value: -0.05 },
                { id: 'gam', label: t('γ', 'γ'), min: 0.15, max: 0.35, step: 0.005, value: 0.25 },
            ],
            note: t('把 Δλ/λ 调成负值、Δμ/μ 保持接近零，就是典型的含气响应。', 'Set Δλ/λ negative while keeping Δμ/μ near zero: that is the classic gas response.'),
            compute: (p) => {
                const dl = p['dl'], dm = p['dm'], dr = p['dr'], gam = p['gam'];
                const da = 0.5 * ((1 - 2 * gam) * dl + 2 * gam * dm - dr);
                const db = 0.5 * (dm - dr);
                const pts = [];
                for (let i = 0; i <= 150; i++) {
                    const deg = (i / 150) * 45;
                    const rad = (deg * Math.PI) / 180;
                    const c2 = Math.cos(rad) ** 2;
                    const s2 = Math.sin(rad) ** 2;
                    const R = (1 / (2 * c2)) * da - 4 * gam * s2 * db + 0.5 * (1 - 4 * gam * s2) * dr;
                    pts.push([deg, R]);
                }
                return [{ label: t('R(θ)', 'R(θ)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('含气砂岩的 λ 异常', 'The λ anomaly of a gas sand'),
        input: t('Δλ/λ = −0.30，Δμ/μ = +0.05，Δρ/ρ = −0.05，γ = 0.25', 'Δλ/λ = −0.30, Δμ/μ = +0.05, Δρ/ρ = −0.05, γ = 0.25'),
        steps: [
            t('Δα/α = ½[0.5×(−0.30) + 0.5×0.05 + 0.05] = ½(−0.075) = −0.0375', 'Δα/α = ½[0.5×(−0.30) + 0.5×0.05 + 0.05] = ½(−0.075) = −0.0375'),
            t('Δβ/β = ½[0.05 + 0.05] = 0.05', 'Δβ/β = ½[0.05 + 0.05] = 0.05'),
        ],
        output: t('λ 大幅下降而 μ 几乎不变 —— 流体指示清楚', 'λ drops sharply while μ barely changes — a clean fluid indicator'),
    },
    links: {
        upstream: [
            { id: 'aki-richards-approximation', note: t('代入的目标公式', 'The formula it is substituted into') },
            { id: 'bulk-modulus-lame', note: t('λ 与 K 的关系', 'Relation between λ and K') },
        ],
        seealso: [{ id: 'gassmann-equation', note: t('μ 与流体无关的理论依据', 'Theoretical basis for μ being fluid independent') }],
    },
    refs: [{ text: 'Goodway, B., Chen, T. & Downton, J. (1997). Improved AVO fluid detection. 67th SEG Expanded Abstracts' }],
};
export default lambdaMuRhoReflectivity;
//# sourceMappingURL=lambda-mu-rho-reflectivity.js.map