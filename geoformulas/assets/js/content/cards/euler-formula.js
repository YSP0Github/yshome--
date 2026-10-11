import { t } from '../../core/types.js';
/** euler-formula */
const eulerFormula = {
    id: 'euler-formula',
    name: t('Euler 公式', 'Euler Formula'),
    aliases: { zh: ['欧拉公式', '复指数恒等式'], en: ['Euler identity', 'Euler relation'] },
    node: 'S0.4',
    tags: {
        math: ['MATH.COMPLEX', 'MATH.APPROX'],
        method: ['METH.PROC'],
        quantity: ['Q.FREQ'],
        keywords: t('欧拉公式 复指数 单位圆 相位 旋转 de Moivre', 'Euler formula complex exponential unit circle phase rotation de Moivre'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `e^{i\theta}=\cos\theta+i\sin\theta`,
        variants: [
            { name: t('共轭形式', 'Conjugate form'), latex: String.raw `e^{-i\theta}=\cos\theta-i\sin\theta` },
            { name: t('反解出三角函数', 'Trigonometric functions in terms of exponentials'), latex: String.raw `\cos\theta=\frac{e^{i\theta}+e^{-i\theta}}{2},\qquad \sin\theta=\frac{e^{i\theta}-e^{-i\theta}}{2i}` },
            { name: t('de Moivre 公式', 'de Moivre formula'), latex: String.raw `\left(\cos\theta+i\sin\theta\right)^{n}=\cos\!\left(n\theta\right)+i\sin\!\left(n\theta\right)` },
            { name: t('最著名的一个特例', 'The most famous special case'), latex: String.raw `e^{i\pi}+1=0` },
        ],
    },
    meaning: t('Euler 公式把「振动」和「旋转」统一成了同一件事：一个模长为 1 的复数 e^{iθ} 就是单位圆上转过 θ 弧度的那个点，它的实部是余弦、虚部是正弦。地震学里所有的相量运算、Fourier 变换、Hilbert 变换，本质上都是在反复使用这一条恒等式——把 cos 与 sin 的三角恒等式运算，换成 e^{iθ} 的乘除运算。', 'Euler formula unifies oscillation and rotation: the unit-modulus complex number e^{iθ} is the point on the unit circle at angle θ, with real part cosine and imaginary part sine. Every phasor manipulation, Fourier transform and Hilbert transform in seismology is, at bottom, a repeated application of this identity — trading trigonometric algebra in cos and sin for multiplication and division of e^{iθ}.'),
    symbols: [
        { sym: 'e', name: t('自然常数底', 'base of natural logarithms'), unit: '1', typical: '2.71828' },
        { sym: 'i', name: t('虚数单位', 'imaginary unit'), unit: '1', dimension: 'i² = −1' },
        { sym: '\\theta', name: t('相位角（辐角）', 'phase angle (argument)'), unit: 'rad' },
        { sym: '\\cos\\theta', name: t('邻边投影，即实部', 'projection on the real axis'), unit: '1' },
        { sym: '\\sin\\theta', name: t('对边投影，即虚部', 'projection on the imaginary axis'), unit: '1' },
        { sym: 'n', name: t('正整数幂次', 'positive integer power'), unit: '1' },
    ],
    conditions: {
        applies: [t('θ 为任意实数；若推广到复数 z = x + iy，则 e^{z} = e^{x}(\\cos y + i\\sin y)', 'θ any real number; for complex z = x + iy, e^{z} = e^{x}(cos y + i sin y)')],
        assumes: [
            t('指数函数与三角函数都按幂级数定义', 'Exponential and trigonometric functions defined by their power series'),
            t('θ 用弧度度量（用角度时公式不成立）', 'θ measured in radians (the formula fails in degrees)'),
        ],
        breaks: [
            t('e^{a+b} = e^{a}e^{b} 对复数仍成立，但 ln 是多值的，取对数时要小心分支', 'e^{a+b} = e^{a}e^{b} still holds, but the logarithm is multivalued, so branches must be handled'),
            t('数值计算中极大 |θ| 会因浮点舍入产生相位误差', 'Very large |θ| accumulates floating-point phase error in numerical work'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('写出三个函数的泰勒级数', 'Write the Taylor series of the three functions'),
            latex: String.raw `e^{z}=\sum_{n=0}^{\infty}\frac{z^{n}}{n!},\qquad \cos\theta=\sum_{n=0}^{\infty}\frac{(-1)^{n}\theta^{2n}}{(2n)!},\qquad \sin\theta=\sum_{n=0}^{\infty}\frac{(-1)^{n}\theta^{2n+1}}{(2n+1)!}`,
            note: t('这三条级数对实数与复数都收敛，是唯一可靠的出发点。', 'All three series converge for real and complex arguments alike; they are the only safe starting point.') },
        { n: 2, op: 'substitute', title: t('把 z = iθ 代入指数级数', 'Substitute z = iθ into the exponential series'),
            latex: String.raw `e^{i\theta}=\sum_{n=0}^{\infty}\frac{(i\theta)^{n}}{n!}=1+i\theta-\frac{\theta^{2}}{2!}-\frac{i\theta^{3}}{3!}+\frac{\theta^{4}}{4!}+\cdots`,
            note: t('关键在 i 的幂次循环：i⁰=1, i¹=i, i²=−1, i³=−i, i⁴=1。', 'The key is the cycle of powers of i: i⁰ = 1, i¹ = i, i² = −1, i³ = −i, i⁴ = 1.') },
        { n: 3, op: 'algebra', title: t('按实部与虚部分组', 'Group the real and imaginary terms'),
            latex: String.raw `e^{i\theta}=\left(1-\frac{\theta^{2}}{2!}+\frac{\theta^{4}}{4!}-\cdots\right)+i\left(\theta-\frac{\theta^{3}}{3!}+\frac{\theta^{5}}{5!}-\cdots\right)` },
        { n: 4, op: 'identity', title: t('两个括号恰好是 cos 与 sin 的级数', 'The two brackets are exactly the series of cos and sin'),
            latex: String.raw `e^{i\theta}=\cos\theta+i\sin\theta`,
            note: t('这就是全部证明：指数级数的偶次项给出 cos，奇次项给出 sin。', 'That is the whole proof: the even powers of the exponential series give cos, the odd powers give sin.') },
        { n: 5, op: 'identity', title: t('把两式相加减，反解三角函数', 'Add and subtract to invert the relation'),
            latex: String.raw `e^{i\theta}+e^{-i\theta}=2\cos\theta,\qquad e^{i\theta}-e^{-i\theta}=2i\sin\theta` },
        { n: 6, op: 'result', title: t('模长与辐角：复数即旋转', 'Modulus and argument: a complex number is a rotation'),
            latex: String.raw `\left|e^{i\theta}\right|=\sqrt{\cos^{2}\theta+\sin^{2}\theta}=1,\qquad \arg\!\left(e^{i\theta}\right)=\theta`,
            note: t('乘以 e^{iθ} 不改变长度、只把辐角加 θ —— 这就是「相移」二字的几何定义。', 'Multiplying by e^{iθ} leaves the length unchanged and adds θ to the argument. That is the geometric definition of a phase shift.') },
    ],
    viz: [
        {
            id: 'euler-unit-circle',
            level: 'V1',
            title: t('相量 e^{iθ} 在复平面上的轨迹', 'Locus of the phasor e^{iθ} in the complex plane'),
            xlabel: t('实部 Re', 'real part Re'),
            ylabel: t('虚部 Im', 'imaginary part Im'),
            controls: [
                { id: 'A', label: t('模长 A', 'modulus A'), min: 0.2, max: 2, step: 0.05, value: 1, unit: '1' },
            ],
            xRange: [-2.2, 2.2],
            yRange: [-2.2, 2.2],
            note: t('半径恒为 A 的圆：改变 θ 只是在圆上走动，长度从不改变。这正是「相位变化不影响振幅」的几何解释。', 'A circle of constant radius A: changing θ merely walks along it; the length never changes. This is the geometric meaning of a phase shift leaving amplitude untouched.'),
            compute: (p) => {
                const A = p['A'];
                const pts = [];
                for (let i = 0; i <= 360; i++) {
                    const th = (i / 360) * 2 * Math.PI;
                    pts.push([A * Math.cos(th), A * Math.sin(th)]);
                }
                return [{ label: t('A e^{iθ} 的轨迹', 'locus of A e^{iθ}'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'euler-taylor',
            level: 'V1',
            title: t('用级数的前 N 项逼近余弦', 'Approximating cosine with the first N series terms'),
            xlabel: t('相位 θ (rad)', 'phase θ (rad)'),
            ylabel: t('函数值', 'function value'),
            controls: [
                { id: 'N', label: t('保留项数 N', 'number of terms N'), min: 1, max: 8, step: 1, value: 2, unit: '项' },
            ],
            xRange: [-8, 8],
            yRange: [-1.6, 1.6],
            note: t('N 越大，多项式在越宽的 θ 范围内贴合 cos。这也是一切「小相位近似」（如 sin θ ≈ θ）误差估计的来源。', 'Larger N keeps the polynomial glued to cos over a wider range of θ. This is also where every small-phase approximation (sin θ ≈ θ) gets its error estimate.'),
            compute: (p) => {
                const N = Math.max(1, Math.round(p['N']));
                const exact = [];
                const approx = [];
                for (let i = 0; i <= 600; i++) {
                    const th = -8 + (i / 600) * 16;
                    let s = 0;
                    for (let n = 0; n < N; n++) {
                        s += (Math.pow(-1, n) * Math.pow(th, 2 * n)) / factorial(2 * n);
                    }
                    exact.push([th, Math.cos(th)]);
                    approx.push([th, s]);
                }
                return [
                    { label: t('cos θ（精确）', 'cos θ (exact)'), color: '#B4B2A9', dash: true, points: exact },
                    { label: t(`${N} 项截断`, `truncated at ${N} terms`), color: '#185FA5', points: approx },
                ];
            },
        },
    ],
    example: {
        title: t('把一个余弦波改写成指数形式', 'Rewriting a cosine wave in exponential form'),
        input: t('u(t) = 3 cos(2π·5 t)', 'u(t) = 3 cos(2π·5 t)'),
        steps: [
            t('ω = 2π·5 = 31.4 rad/s', 'ω = 2π·5 = 31.4 rad/s'),
            t('cos(ωt) = (e^{iωt} + e^{−iωt})/2', 'cos(ωt) = (e^{iωt} + e^{−iωt})/2'),
            t('u(t) = 1.5 e^{iωt} + 1.5 e^{−iωt}', 'u(t) = 1.5 e^{iωt} + 1.5 e^{−iωt}'),
        ],
        output: t('一个实余弦 = 两个反向旋转的复指数，各占一半振幅。Fourier 谱上它们就是 ±f 处的两条谱线。', 'One real cosine equals two counter-rotating complex exponentials, each carrying half the amplitude. In the Fourier spectrum they are exactly the two lines at ±f.'),
    },
    links: {
        downstream: [
            { id: 'complex-phasor-representation', note: t('用 e^{iωt} 携带振幅与相位', 'Uses e^{iωt} to carry amplitude and phase') },
            { id: 'residue-theorem', note: t('反演 Fourier 积分时的围道积分', 'Contour integration when inverting Fourier integrals') },
        ],
        seealso: [
            { id: 'harmonic-plane-wave', note: t('谐和波的复数写法', 'Complex notation for harmonic waves') },
            { id: 'fourier-transform', note: t('核函数就是 e^{−iωt}', 'Its kernel is precisely e^{−iωt}') },
        ],
    },
    refs: [
        { text: 'Ahlfors, Complex Analysis, 3rd ed., §2.1' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2' },
    ],
};
function factorial(n) {
    let r = 1;
    for (let k = 2; k <= n; k++)
        r *= k;
    return r;
}
export default eulerFormula;
//# sourceMappingURL=euler-formula.js.map