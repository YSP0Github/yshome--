import { t } from '../../core/types.js';
/** rayleigh-velocity-approximation */
const rayleighVelocityApproximation = {
    id: 'rayleigh-velocity-approximation',
    name: t('Rayleigh 波速度近似式', 'Approximate Rayleigh-wave Velocity'),
    aliases: { zh: ['Viktorov 近似'], en: ['Viktorov approximation', 'Rayleigh velocity approximation'] },
    node: 'S5.2',
    tags: {
        math: ['MATH.APPROX'],
        method: ['METH.SURF'],
        quantity: ['Q.VEL', 'Q.MAT'],
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\frac{c_R}{\beta}\approx\frac{0.862+1.14\,\nu}{1+\nu}`,
        variants: [
            { name: t('工程上更粗糙的一刀切', 'A cruder rule of thumb'), latex: String.raw `c_R\approx0.92\,\beta` },
            { name: t('用速度比表示', 'In terms of the velocity ratio'), latex: String.raw `\frac{c_R}{\beta}\approx0.862\,\frac{1.5+\left(\beta/\alpha\right)^{2}}{1.2+\left(\beta/\alpha\right)^{2}}\ \text{（等价形式之一）}` },
        ],
    },
    meaning: t('解 Rayleigh 特征方程需要数值求根，现场作业里往往等不起。Viktorov 这个经验式只用泊松比就能给出 1% 以内的精度，是估算 Rayleigh 波速、判断面波干扰频率范围的首选工具。', 'Solving the Rayleigh characteristic equation requires numerical root finding, which is often too slow for field work. Viktorov’s empirical formula needs only Poisson’s ratio and is accurate to within about 1%, making it the tool of choice for estimating Rayleigh velocity and for judging the frequency band contaminated by surface waves.'),
    symbols: [
        { sym: 'c_R', name: t('Rayleigh 波相速度', 'Rayleigh-wave phase velocity'), unit: 'm/s' },
        { sym: '\\beta', name: t('S 波速度', 'S-wave velocity'), unit: 'm/s' },
        { sym: '\\nu', name: t('泊松比', 'Poisson’s ratio'), unit: '无量纲', typical: '0.2 – 0.35' },
    ],
    conditions: {
        applies: [t('均匀各向同性半空间的快速估算', 'Quick estimation for a uniform isotropic half-space')],
        assumes: [t('0 < ν < 0.5', '0 < ν < 0.5')],
        breaks: [t('层状介质中 Rayleigh 波频散，此式只给出极低频近似', 'In layered media Rayleigh waves disperse and this formula gives only the very-low-frequency limit')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('对精确解做系统扫描', 'Systematically scan the exact solution'),
            latex: String.raw `\text{对一系列 }\nu\text{ 解 }F(c)=0\text{，得到 }c_R/\beta\text{ 的取值表}` },
        { n: 2, op: 'taylor', title: t('用有理函数拟合', 'Fit with a rational function'),
            latex: String.raw `\frac{c_R}{\beta}\approx\frac{a+b\nu}{1+\nu}` },
        { n: 3, op: 'result', title: t('最小二乘定出系数', 'Least squares fixes the coefficients'),
            latex: String.raw `a=0.862,\quad b=1.14\;\Longrightarrow\; \frac{c_R}{\beta}\approx\frac{0.862+1.14\nu}{1+\nu}` },
    ],
    viz: [
        {
            id: 'rayleigh-approx-compare',
            level: 'V1',
            title: t('近似式与精确求根结果的对比', 'Approximation versus exact root finding'),
            xlabel: t('泊松比 ν', 'Poisson’s ratio ν'),
            ylabel: t('c_R / β', 'c_R / β'),
            controls: [],
            compute: () => {
                const approx = [];
                const exact = [];
                const exactF = (nu) => {
                    const r = (1 - 2 * nu) / (2 * (1 - nu));
                    const alpha = 1 / r;
                    const F = (c) => {
                        const qa = Math.sqrt(Math.max(0, 1 - (c * c) / (alpha * alpha)));
                        const qb = Math.sqrt(Math.max(0, 1 - c * c));
                        const v = 2 - c * c;
                        return v * v - 4 * qa * qb;
                    };
                    let lo = 0.5, hi = 0.9999;
                    if (F(lo) * F(hi) >= 0)
                        return NaN;
                    for (let k = 0; k < 60; k++) {
                        const mid = 0.5 * (lo + hi);
                        if (F(lo) * F(mid) <= 0)
                            hi = mid;
                        else
                            lo = mid;
                    }
                    return 0.5 * (lo + hi);
                };
                for (let i = 0; i <= 200; i++) {
                    const nu = 0.02 + (i / 200) * 0.46;
                    approx.push([nu, (0.862 + 1.14 * nu) / (1 + nu)]);
                    const e = exactF(nu);
                    if (Number.isFinite(e))
                        exact.push([nu, e]);
                }
                return [
                    { label: t('Viktorov 近似', 'Viktorov approximation'), color: '#185FA5', points: approx },
                    { label: t('精确求根', 'exact root'), color: '#993C1D', points: exact, dash: true },
                ];
            },
            note: t('两条曲线在整个 ν 区间几乎重合，最大偏差约 1%。', 'The two curves nearly coincide over the whole ν range, with maximum deviation about 1%.'),
        },
    ],
    links: {
        upstream: [{ id: 'rayleigh-wave-equation', note: t('它是该方程的拟合近似', 'It is a fitted approximation to that equation') }],
        seealso: [{ id: 'poissons-ratio-lame', note: t('ν 的定义', 'Definition of ν') }],
    },
    refs: [{ text: 'Viktorov (1967), Rayleigh and Lamb Waves' }],
};
export default rayleighVelocityApproximation;
//# sourceMappingURL=rayleigh-velocity-approximation.js.map