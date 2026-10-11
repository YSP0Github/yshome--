import { t } from '../../core/types.js';
/** dalembert-solution */
const dalembertSolution = {
    id: 'dalembert-solution',
    name: t('一维波动方程的 d\'Alembert 解', 'The d\'Alembert Solution of the 1D Wave Equation'),
    aliases: { zh: ['达朗贝尔解', '行波解', '一维波方程通解'], en: ['d Alembert solution', 'travelling wave solution', 'general solution of the 1D wave equation'] },
    node: 'S0.7',
    tags: {
        math: ['MATH.DIFF'],
        method: ['METH.EXPL'],
        quantity: ['Q.VEL', 'Q.TIME'],
        keywords: t('达朗贝尔解 行波 特征线 依赖区间 初值问题 一维波动方程', 'd Alembert travelling wave characteristics domain of dependence initial value problem 1D wave equation'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `u(x,t)=\frac{1}{2}\left[\phi(x-ct)+\phi(x+ct)\right]+\frac{1}{2c}\int_{x-ct}^{x+ct}\psi(\xi)\,\mathrm{d}\xi`,
        variants: [
            { name: t('通解：两个反向行进的任意波形', 'General solution: two arbitrary shapes travelling in opposite directions'), latex: String.raw `u(x,t)=f(x-ct)+g(x+ct)` },
            { name: t('初始条件', 'Initial conditions'), latex: String.raw `u(x,0)=\phi(x),\qquad \frac{\partial u}{\partial t}(x,0)=\psi(x)` },
            { name: t('零初速度时的简化式', 'Simplified form for zero initial velocity'), latex: String.raw `\psi=0\;\Longrightarrow\; u(x,t)=\frac{1}{2}\phi(x-ct)+\frac{1}{2}\phi(x+ct)` },
            { name: t('特征线与依赖区间', 'Characteristics and the domain of dependence'), latex: String.raw `(x_{0},t_{0})\ \text{的值只依赖}\ x\in[x_{0}-ct_{0},\,x_{0}+ct_{0}]` },
            { name: t('固定端反射（镜像法）', 'Reflection at a fixed end (method of images)'), latex: String.raw `u(0,t)=0\;\Longrightarrow\; \phi(-x)=-\phi(x),\quad \psi(-x)=-\psi(x)` },
        ],
    },
    meaning: t('d’Alembert 解是一维波动方程的完全通解，而且它极其直观：任意形状的扰动都一分为二，各自以速度 c 朝相反方向行进，途中形状丝毫不改。所谓「解」不过是把初始位移复制成两份、各走各的，再把初始速度在区间上积分后叠加。它同时给出了因果结构——某点某时刻的值只依赖一个有限区间内的初值，这个区间就是依赖区间。', 'The d’Alembert solution is the complete general solution of the one-dimensional wave equation, and it is remarkably transparent: a disturbance of arbitrary shape splits in two, each half travelling at speed c in opposite directions without any change of shape. Solving the equation amounts to copying the initial displacement into two halves that go their separate ways, then adding the integral of the initial velocity over the interval. It also exposes the causal structure: the value at a point and time depends only on initial data in a finite interval, the domain of dependence.'),
    symbols: [
        { sym: 'u(x,t)', name: t('位移场', 'displacement field'), unit: 'm' },
        { sym: 'c', name: t('波速', 'wave speed'), unit: 'm/s' },
        { sym: '\\phi(x)', name: t('初始位移', 'initial displacement'), unit: 'm' },
        { sym: '\\psi(x)', name: t('初始速度', 'initial velocity'), unit: 'm/s' },
        { sym: 'x', name: t('空间坐标', 'spatial coordinate'), unit: 'm' },
        { sym: 't', name: t('时间', 'time'), unit: 's' },
        { sym: '\\xi', name: t('积分变量（初始位置）', 'integration variable (initial position)'), unit: 'm' },
        { sym: 'f,g', name: t('向右与向左行进的任意波形的波剖面', 'profiles of the arbitrary right- and left-going waves'), unit: 'm' },
    ],
    conditions: {
        applies: [
            t('无界或半无界的一维均匀介质，无衰减无频散', 'Unbounded or semi-bounded one-dimensional homogeneous media, without attenuation or dispersion'),
            t('小振幅、线性本构关系', 'Small amplitudes and a linear constitutive relation'),
        ],
        assumes: [
            t('波速 c 为常数（与频率、振幅无关）', 'Wave speed c constant (independent of frequency and amplitude)'),
            t('φ 二次可微、ψ 一次可微（经典解；弱解要求可放宽）', 'φ twice differentiable and ψ once (classical solution; weak solutions allow less)'),
        ],
        breaks: [
            t('有频散或吸收时波形不再保持不变，行波解失效', 'With dispersion or absorption the shape no longer persists and travelling-wave solutions fail'),
            t('二维、三维不存在这样简单的形状保持解（会出现尾波，见球面波解）', 'No such simple shape-preserving solution exists in 2D or 3D (wavetrains appear, see the spherical wave solution)'),
            t('存在边界时需要镜像延拓，直接套用会出错', 'With boundaries an image extension is required; applying the formula directly gives wrong results'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('一维波动方程', 'The 1D wave equation'),
            latex: String.raw `\frac{\partial^{2}u}{\partial t^{2}}=c^{2}\frac{\partial^{2}u}{\partial x^{2}}` },
        { n: 2, op: 'transform', title: t('引入特征坐标', 'Introduce characteristic coordinates'),
            latex: String.raw `\xi=x-ct,\qquad \eta=x+ct`,
            note: t('这是整个解法的点睛之笔：在新坐标下，两个二阶导数算符可以完全分解。', 'This is the stroke of genius: in the new coordinates the second-order operator factorises completely.') },
        { n: 3, op: 'algebra', title: t('算符分解', 'Factorise the operator'),
            latex: String.raw `\frac{\partial^{2}}{\partial t^{2}}-c^{2}\frac{\partial^{2}}{\partial x^{2}}=-4c^{2}\frac{\partial^{2}}{\partial\xi\,\partial\eta}\;\Longrightarrow\;\frac{\partial^{2}u}{\partial\xi\,\partial\eta}=0` },
        { n: 4, op: 'identity', title: t('混合导数为零 ⟹ 可分离求和', 'Vanishing mixed derivative implies a sum of separated parts'),
            latex: String.raw `u=f(\xi)+g(\eta)=f(x-ct)+g(x+ct)`,
            note: t('f 的宗量 x − ct 恒定意味着图形以速度 c 向右平移；g 则向左。', 'Holding x − ct constant means the shape translates rightward at speed c; g translates leftward.') },
        { n: 5, op: 'substitute', title: t('代入初始位移与初始速度', 'Impose the initial displacement and velocity'),
            latex: String.raw `f(x)+g(x)=\phi(x),\qquad -c f'(x)+c g'(x)=\psi(x)` },
        { n: 6, op: 'algebra', title: t('第二式积分并解联立', 'Integrate the second equation and solve'),
            latex: String.raw `g(x)-f(x)=\frac{1}{c}\int_{x_{0}}^{x}\psi(\xi)\,\mathrm{d}\xi\;\Longrightarrow\; f=\frac{\phi}{2}-\frac{1}{2c}\int\psi,\quad g=\frac{\phi}{2}+\frac{1}{2c}\int\psi` },
        { n: 7, op: 'result', title: t('合并得到 d\'Alembert 公式', 'Combine to obtain the d\'Alembert formula'),
            latex: String.raw `u(x,t)=\frac{1}{2}\left[\phi(x-ct)+\phi(x+ct)\right]+\frac{1}{2c}\int_{x-ct}^{x+ct}\psi(\xi)\,\mathrm{d}\xi` },
    ],
    viz: [
        {
            id: 'dalembert-snapshot',
            level: 'V1',
            title: t('初位移一分为二：两个半幅脉冲反向行进', 'The initial displacement splits into two half-amplitude pulses'),
            xlabel: t('位置 x (km)', 'position x (km)'),
            ylabel: t('位移 u (mm)', 'displacement u (mm)'),
            controls: [
                { id: 'tp', label: t('时刻 t', 'time t'), min: 0, max: 6, step: 0.05, value: 1.5, unit: 's' },
                { id: 'cv', label: t('波速 c', 'wave speed c'), min: 1, max: 6, step: 0.1, value: 3, unit: 'km/s' },
                { id: 'sg', label: t('脉冲宽度 σ', 'pulse width σ'), min: 0.3, max: 3, step: 0.05, value: 1, unit: 'km' },
                { id: 'bb', label: t('初始速度幅度 B', 'initial-velocity amplitude B'), min: -2, max: 2, step: 0.05, value: 0, unit: 'mm' },
            ],
            xRange: [-20, 20],
            note: t('初位移一分为二、各走各的，幅度各为一半；加上初始速度项后两个脉冲会变得不对称。把 B 调成非零，可以看到「初速度」贡献出一个介于两波前之间的平台。', 'The initial displacement splits into two halves travelling apart, each carrying half the amplitude. With an initial velocity the two pulses become asymmetric: a non-zero B adds a plateau between the two wavefronts.'),
            compute: (p) => {
                const tp = p['tp'], c = p['cv'], sg = p['sg'], B = p['bb'];
                const pts = [];
                for (let i = 0; i <= 600; i++) {
                    const x = -20 + (i / 600) * 40;
                    const a = x - c * tp;
                    const b = x + c * tp;
                    const phi1 = Math.exp(-((a / sg) * (a / sg)));
                    const phi2 = Math.exp(-((b / sg) * (b / sg)));
                    const intv = 0.5 * sg * Math.sqrt(Math.PI) * (erf(b / sg) - erf(a / sg));
                    pts.push([x, 0.5 * (phi1 + phi2) + (B / (2 * c)) * intv]);
                }
                return [{ label: t('u(x, t)', 'u(x, t)'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'dalembert-record',
            level: 'V1',
            title: t('固定一个台站看记录', 'The record at one fixed station'),
            xlabel: t('时间 t (s)', 'time t (s)'),
            ylabel: t('位移 u (mm)', 'displacement u (mm)'),
            controls: [
                { id: 'x0', label: t('台站位置 x₀', 'station position x₀'), min: 1, max: 20, step: 0.5, value: 8, unit: 'km' },
                { id: 'c2', label: t('波速 c', 'wave speed c'), min: 1, max: 6, step: 0.1, value: 3, unit: 'km/s' },
                { id: 'sg2', label: t('脉冲宽度 σ', 'pulse width σ'), min: 0.3, max: 3, step: 0.05, value: 1, unit: 'km' },
            ],
            xRange: [0, 10],
            yRange: [-0.6, 1.1],
            note: t('台站先看到向右行的脉冲（到时 x₀/c），随后看到向左行的那一份（若介质两侧延伸则同样在 x₀/c 到达）。本图只显示向右行的一半，幅度恰为初始值的一半。', 'The station first sees the right-going pulse (arrival at x₀/c). The figure shows only that half, whose amplitude is exactly one half of the initial value.'),
            compute: (p) => {
                const x0 = p['x0'], c = p['c2'], sg = p['sg2'];
                const pts = [];
                for (let i = 0; i <= 600; i++) {
                    const tt = (i / 600) * 10;
                    const a = x0 - c * tt;
                    pts.push([tt, 0.5 * Math.exp(-((a / sg) * (a / sg)))]);
                }
                return [{ label: t('u(x₀, t)', 'u(x₀, t)'), color: '#0F6E56', points: pts }];
            },
        },
    ],
    example: {
        title: t('一根受敲击的均匀杆', 'A uniform rod struck at one point'),
        input: t('c = 3 km/s，初始位移为 x = 0 处宽 σ = 1 km 的高斯脉冲，初速度为零', 'c = 3 km/s, initial displacement a Gaussian of width σ = 1 km at x = 0, zero initial velocity'),
        steps: [
            t('ψ = 0 ⟹ u = (1/2)φ(x − 3t) + (1/2)φ(x + 3t)', 'ψ = 0 gives u = (1/2)φ(x − 3t) + (1/2)φ(x + 3t)'),
            t('t = 1 s 时两个脉冲中心分别在 x = ±3 km', 'At t = 1 s the two pulse centres are at x = ±3 km'),
            t('每个脉冲幅度为初始值的一半，宽度仍为 1 km', 'Each pulse has half the initial amplitude and still a width of 1 km'),
        ],
        output: t('能量被平分成两份向两侧传播，波形严格不变 —— 一维无频散介质中，波形可以传到任意远而不失真。', 'The energy is split evenly and travels both ways with the shape strictly preserved. In a non-dispersive 1D medium a waveform can travel arbitrarily far without distortion.'),
    },
    links: {
        downstream: [
            { id: 'spherical-wave-solution', note: t('三维情形多出 1/r 衰减', 'the 3D case acquires a 1/r decay') },
        ],
        seealso: [
            { id: 'harmonic-plane-wave', note: t('取 f、g 为谐和波即得平面波', 'taking f and g harmonic gives plane waves') },
            { id: 'green-function-definition', note: t('初速度问题就是脉冲源的叠加', 'the initial-velocity problem is a superposition of impulsive sources') },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §3.2' },
        { text: 'Courant & Hilbert, Methods of Mathematical Physics, Vol. II, Ch. VI' },
    ],
};
function erf(x) {
    const s = Math.sign(x);
    const ax = Math.abs(x);
    const tt = 1 / (1 + 0.3275911 * ax);
    const y = 1 - ((((1.061405429 * tt - 1.453152027) * tt + 1.421413741) * tt - 0.284496736) * tt + 0.254829592) * tt * Math.exp(-ax * ax);
    return s * y;
}
export default dalembertSolution;
//# sourceMappingURL=dalembert-solution.js.map