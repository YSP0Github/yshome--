import { t } from '../../core/types.js';
/** legendre-polynomials */
const legendrePolynomials = {
    id: 'legendre-polynomials',
    name: t('Legendre 多项式与缔合 Legendre 函数', 'Legendre Polynomials and Associated Legendre Functions'),
    aliases: { zh: ['勒让德多项式', '缔合勒让德函数', '球谐的经向部分'], en: ['Legendre polynomial', 'associated Legendre function', 'Rodrigues formula'] },
    node: 'S0.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.APPROX'],
        method: ['METH.STRUCT'],
        quantity: ['Q.GEOM'],
        keywords: t('勒让德多项式 缔合勒让德 Rodrigues 递推 正交性 球谐 分离变量', 'Legendre polynomial associated Legendre Rodrigues recurrence orthogonality spherical harmonics separation of variables'),
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `P_{l}(x)=\frac{1}{2^{l}\,l!}\,\frac{\mathrm{d}^{l}}{\mathrm{d}x^{l}}\left(x^{2}-1\right)^{l}`,
        variants: [
            { name: t('缔合 Legendre 函数（含 Condon–Shortley 相位）', 'Associated Legendre functions (with the Condon–Shortley phase)'), latex: String.raw `P_{l}^{m}(x)=(-1)^{m}\left(1-x^{2}\right)^{m/2}\frac{\mathrm{d}^{m}}{\mathrm{d}x^{m}}P_{l}(x)` },
            { name: t('三项递推关系', 'Three-term recurrence'), latex: String.raw `(l+1)P_{l+1}(x)=(2l+1)\,x\,P_{l}(x)-l\,P_{l-1}(x)` },
            { name: t('正交归一性', 'Orthogonality'), latex: String.raw `\int_{-1}^{1}P_{l}(x)\,P_{l'}(x)\,\mathrm{d}x=\frac{2}{2l+1}\,\delta_{ll'}` },
            { name: t('母函数', 'Generating function'), latex: String.raw `\frac{1}{\sqrt{1-2xt+t^{2}}}=\sum_{l=0}^{\infty}P_{l}(x)\,t^{l}` },
            { name: t('前几阶显式', 'The first few explicitly'), latex: String.raw `P_{0}=1,\quad P_{1}=x,\quad P_{2}=\frac{1}{2}\left(3x^{2}-1\right),\quad P_{3}=\frac{1}{2}\left(5x^{3}-3x\right)` },
            { name: t('缔合函数的正交性', 'Orthogonality of the associated functions'), latex: String.raw `\int_{-1}^{1}P_{l}^{m}(x)\,P_{l'}^{m}(x)\,\mathrm{d}x=\frac{2}{2l+1}\frac{(l+m)!}{(l-m)!}\,\delta_{ll'}` },
        ],
    },
    meaning: t('在球坐标中分离 Laplace 方程，经向（余纬）部分必然给出 Legendre 多项式；带上方位角依赖后就是缔合 Legendre 函数。它们构成了球面上的一组正交基，是球谐函数、地球自由振荡、全球地震层析成像中空间参数化的基石。地球的长波长重力场、地幔对流速度场，几乎一律用 P_l^m 展开。', 'Separating the Laplace equation in spherical coordinates inevitably yields Legendre polynomials for the colatitudinal part; with azimuthal dependence one obtains the associated Legendre functions. They form an orthogonal basis on the sphere and are the foundation of spherical harmonics, Earth free oscillations and the spatial parameterisation of global seismic tomography. Long-wavelength gravity fields and mantle-convection velocity fields are almost always expanded in P_l^m.'),
    symbols: [
        { sym: 'P_l(x)', name: t('l 阶 Legendre 多项式', 'Legendre polynomial of degree l'), unit: '1' },
        { sym: 'P_l^m(x)', name: t('l 阶 m 次缔合 Legendre 函数', 'associated Legendre function of degree l and order m'), unit: '1' },
        { sym: 'x', name: t('通常为 cos θ，θ 是余纬', 'usually cos θ with θ the colatitude'), unit: '1' },
        { sym: 'l', name: t('角向阶数（非负整数）', 'angular degree (non-negative integer)'), unit: '1' },
        { sym: 'm', name: t('方位角次数，0 ≤ m ≤ l', 'azimuthal order, 0 ≤ m ≤ l'), unit: '1' },
        { sym: '\\delta_{ll\'}', name: t('Kronecker δ', 'Kronecker delta'), unit: '1' },
    ],
    conditions: {
        applies: [
            t('球坐标下的分离变量问题，x = cos θ ∈ [−1, 1]', 'Separation of variables in spherical coordinates, x = cos θ in [−1, 1]'),
            t('l、m 为整数且 0 ≤ m ≤ l', 'l and m integers with 0 ≤ m ≤ l'),
        ],
        assumes: [
            t('介质性质只依赖半径（球对称），或扰动可展开为球谐级数', 'Properties depend only on radius (spherical symmetry), or the perturbation is expandable in spherical harmonics'),
            t('采用 Condon–Shortley 相位约定 (−1)^m', 'The Condon–Shortley phase convention (−1)^m is adopted'),
        ],
        breaks: [
            t('m > l 时 P_l^m ≡ 0，无定义', 'For m > l the function P_l^m is identically zero and undefined as a degree'),
            t('在 x = ±1（两极）处缔合函数趋于 0，数值递推时需注意 (1−x²)^{m/2} 的下溢', 'At x = ±1 (the poles) the associated functions vanish; numerical recurrences must watch for underflow of (1−x²)^{m/2}'),
            t('高度非球对称（如地形、板块边界）需要很高的截断阶数，收敛缓慢', 'Strongly non-spherical features (topography, plate boundaries) need very high truncation degrees and converge slowly'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('球坐标下的 Laplace 方程', 'Laplace equation in spherical coordinates'),
            latex: String.raw `\nabla^{2}u=\frac{1}{r^{2}}\frac{\partial}{\partial r}\!\left(r^{2}\frac{\partial u}{\partial r}\right)+\frac{1}{r^{2}\sin\theta}\frac{\partial}{\partial\theta}\!\left(\sin\theta\,\frac{\partial u}{\partial\theta}\right)+\frac{1}{r^{2}\sin^{2}\theta}\frac{\partial^{2}u}{\partial\varphi^{2}}=0` },
        { n: 2, op: 'transform', title: t('分离变量 u = R(r)Θ(θ)Φ(φ)', 'Separate variables u = R(r)Θ(θ)Φ(φ)'),
            latex: String.raw `\Phi''+m^{2}\Phi=0\;\Longrightarrow\;\Phi=e^{im\varphi},\qquad \frac{1}{\sin\theta}\frac{\mathrm{d}}{\mathrm{d}\theta}\!\left(\sin\theta\,\frac{\mathrm{d}\Theta}{\mathrm{d}\theta}\right)+\left[l(l+1)-\frac{m^{2}}{\sin^{2}\theta}\right]\Theta=0` },
        { n: 3, op: 'substitute', title: t('令 x = cos θ，化为缔合 Legendre 方程', 'Set x = cos θ to obtain the associated Legendre equation'),
            latex: String.raw `\frac{\mathrm{d}}{\mathrm{d}x}\!\left[\left(1-x^{2}\right)\frac{\mathrm{d}\Theta}{\mathrm{d}x}\right]+\left[l(l+1)-\frac{m^{2}}{1-x^{2}}\right]\Theta=0` },
        { n: 4, op: 'setup', title: t('m = 0 时即 Legendre 方程，要求 x = ±1 处有界', 'For m = 0 this is the Legendre equation; boundedness at x = ±1 is required'),
            latex: String.raw `\left(1-x^{2}\right)\Theta''-2x\,\Theta'+l(l+1)\Theta=0`,
            note: t('有界性把 l 限制为非负整数，否则解在两极发散。这就是量子化条件的经典版本。', 'Boundedness restricts l to non-negative integers; otherwise the solution diverges at the poles. This is the classical version of a quantisation condition.') },
        { n: 5, op: 'identity', title: t('Rodrigues 公式给出显式解', 'The Rodrigues formula gives the explicit solution'),
            latex: String.raw `P_{l}(x)=\frac{1}{2^{l}l!}\frac{\mathrm{d}^{l}}{\mathrm{d}x^{l}}\left(x^{2}-1\right)^{l}` },
        { n: 6, op: 'identity', title: t('对 P_l 求 m 阶导数得到缔合函数', 'Differentiate P_l m times to get the associated function'),
            latex: String.raw `P_{l}^{m}(x)=(-1)^{m}\left(1-x^{2}\right)^{m/2}\frac{\mathrm{d}^{m}}{\mathrm{d}x^{m}}P_{l}(x)` },
        { n: 7, op: 'result', title: t('正交性：不同阶的多项式互相正交', 'Orthogonality: polynomials of different degree are orthogonal'),
            latex: String.raw `\int_{-1}^{1}P_{l}P_{l'}\,\mathrm{d}x=\frac{2}{2l+1}\delta_{ll'}`,
            note: t('正交性是它们能作为展开基的根本原因：展开系数可以逐个独立求出。', 'Orthogonality is why they serve as an expansion basis: each coefficient can be obtained independently.') },
    ],
    viz: [
        {
            id: 'legendre-curves',
            level: 'V1',
            title: t('前几阶 Legendre 多项式', 'The first few Legendre polynomials'),
            xlabel: t('x = cos θ', 'x = cos θ'),
            ylabel: t('P_l(x)', 'P_l(x)'),
            controls: [
                { id: 'lmax', label: t('最高阶 l', 'maximum degree l'), min: 0, max: 6, step: 1, value: 4, unit: '1' },
            ],
            xRange: [-1, 1],
            yRange: [-1.1, 1.1],
            note: t('l 阶多项式在 (−1, 1) 内恰好有 l 个零点；所有曲线在 x = 1 处都等于 1。l 越大，振荡越密 —— 对应球面上越细的横向结构。', 'A degree-l polynomial has exactly l zeros in (−1, 1), and every curve equals 1 at x = 1. Larger l oscillates more finely, corresponding to finer lateral structure on the sphere.'),
            compute: (p) => {
                const lmax = Math.round(p['lmax']);
                const palette = ['#185FA5', '#BA7517', '#0F6E56', '#993C1D', '#7F77DD', '#B4B2A9', '#185FA5'];
                const out = [];
                for (let l = 0; l <= lmax; l++) {
                    const pts = [];
                    for (let i = 0; i <= 400; i++) {
                        const x = -1 + (i / 400) * 2;
                        pts.push([x, legendreP(l, x)]);
                    }
                    out.push({ label: t(`P_${l}`, `P_${l}`), color: palette[l % palette.length], points: pts });
                }
                return out;
            },
        },
        {
            id: 'associated-legendre',
            level: 'V1',
            title: t('缔合 Legendre 函数 P_l^m', 'Associated Legendre functions P_l^m'),
            xlabel: t('x = cos θ', 'x = cos θ'),
            ylabel: t('P_l^m(x)', 'P_l^m(x)'),
            controls: [
                { id: 'll', label: t('阶数 l', 'degree l'), min: 0, max: 6, step: 1, value: 3, unit: '1' },
                { id: 'mm', label: t('次数 m', 'order m'), min: 0, max: 6, step: 1, value: 2, unit: '1' },
            ],
            xRange: [-1, 1],
            note: t('m > 0 时两极处恒为 0（(1−x²)^{m/2} 因子），且 m 越大越向赤道集中。若把 m 调到大于 l，曲线直接塌成零 —— 这就是球谐中 |m| ≤ l 的硬性限制。', 'For m > 0 the function vanishes at both poles because of the (1−x²)^{m/2} factor, and larger m concentrates it toward the equator. Setting m larger than l collapses the curve to zero, the hard constraint |m| ≤ l in spherical harmonics.'),
            compute: (p) => {
                const l = Math.round(p['ll']);
                const m = Math.round(p['mm']);
                const pts = [];
                for (let i = 0; i <= 400; i++) {
                    const x = -1 + (i / 400) * 2;
                    pts.push([x, m > l ? 0 : assocLegendre(l, m, x)]);
                }
                return [{ label: t(`P_${l}^${m}`, `P_${l}^${m}`), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('把一个轴对称场展开到二阶', 'Expand an axisymmetric field to degree two'),
        input: t('f(θ) = cos²θ，求其 Legendre 展开系数', 'f(θ) = cos²θ, find its Legendre expansion coefficients'),
        steps: [
            t('令 x = cos θ，f = x²', 'Let x = cos θ, so f = x²'),
            t('由 P₂ = (3x²−1)/2 反解：x² = (2P₂ + 1)/3 = (1/3)P₀ + (2/3)P₂', 'From P₂ = (3x²−1)/2 invert: x² = (2P₂ + 1)/3 = (1/3)P₀ + (2/3)P₂'),
            t('系数：c₀ = 1/3，c₂ = 2/3，其余为零', 'Coefficients: c₀ = 1/3, c₂ = 2/3, all others zero'),
        ],
        output: t('一个二次多项式只需要 l = 0 与 l = 2 两项 —— 偶函数只含偶数阶，这是球谐展开里选择规则的雏形。', 'A quadratic polynomial needs only l = 0 and l = 2: an even function contains only even degrees, the prototype of a selection rule in spherical-harmonic expansions.'),
    },
    links: {
        downstream: [
            { id: 'spherical-harmonics', note: t('配上方位角因子即球谐函数', 'multiplying by the azimuthal factor gives spherical harmonics') },
        ],
    },
    refs: [
        { text: 'Abramowitz & Stegun, Handbook of Mathematical Functions, Ch. 8' },
        { text: 'Dahlen & Tromp, Theoretical Global Seismology, §B.2' },
    ],
};
function legendreP(l, x) {
    if (l === 0)
        return 1;
    if (l === 1)
        return x;
    let pm1 = 1;
    let p = x;
    for (let k = 1; k < l; k++) {
        const pn = ((2 * k + 1) * x * p - k * pm1) / (k + 1);
        pm1 = p;
        p = pn;
    }
    return p;
}
function assocLegendre(l, m, x) {
    if (m === 0)
        return legendreP(l, x);
    let dfact = 1;
    for (let k = 1; k <= 2 * m - 1; k += 2)
        dfact *= k;
    const s = Math.sqrt(Math.max(0, 1 - x * x));
    let pmm = dfact * Math.pow(s, m);
    if (m % 2 === 1)
        pmm = -pmm;
    if (l === m)
        return pmm;
    let pmmp1 = x * (2 * m + 1) * pmm;
    if (l === m + 1)
        return pmmp1;
    let plm = 0;
    let a = pmm;
    let b = pmmp1;
    for (let k = m + 2; k <= l; k++) {
        plm = ((2 * k - 1) * x * b - (k + m - 1) * a) / (k - m);
        a = b;
        b = plm;
    }
    return plm;
}
export default legendrePolynomials;
//# sourceMappingURL=legendre-polynomials.js.map