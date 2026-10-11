import { t } from '../../core/types.js';
/** reduced-wave-equation */
const reducedWaveEquation = {
    id: 'reduced-wave-equation',
    name: t('频域 Helmholtz 方程（约化波动方程）', 'The Frequency-Domain Helmholtz Equation (Reduced Wave Equation)'),
    aliases: {
        zh: ['约化波动方程', '亥姆霍兹方程', '频域波动方程'],
        en: ['reduced wave equation', 'Helmholtz equation', 'frequency-domain wave equation'],
    },
    node: 'S1.4',
    tags: {
        math: ['MATH.DIFF', 'MATH.FOURIER'],
        method: ['METH.PROC', 'METH.STRUCT'],
        quantity: ['Q.FREQ', 'Q.VEL'],
        keywords: t('Helmholtz 方程 约化波动方程 频域 波数 傅里叶变换 分离变量 格林函数 频散关系', 'Helmholtz equation reduced wave equation frequency domain wavenumber Fourier transform Green function dispersion relation'),
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\nabla^{2}\tilde{u}+k^{2}\tilde{u}=0,\qquad k=\frac{\omega}{c}`,
        variants: [
            { name: t('弹性波：两个势各写一个', 'Elastic waves: one equation per potential'), latex: String.raw `\nabla^{2}\tilde{\phi}+k_{\alpha}^{2}\tilde{\phi}=0,\quad k_{\alpha}=\frac{\omega}{\alpha};\qquad \nabla^{2}\tilde{\boldsymbol{\psi}}+k_{\beta}^{2}\tilde{\boldsymbol{\psi}}=0,\quad k_{\beta}=\frac{\omega}{\beta}` },
            { name: t('含点源的 Helmholtz 方程（Green 函数）', 'With a point source: the Green function equation'), latex: String.raw `\nabla^{2}G+k^{2}G=-\delta\left(\boldsymbol{x}-\boldsymbol{\xi}\right),\qquad G=\frac{e^{ik\left|\boldsymbol{x}-\boldsymbol{\xi}\right|}}{4\pi\left|\boldsymbol{x}-\boldsymbol{\xi}\right|}` },
            { name: t('一维解：两个反向行波', 'One-dimensional solution: two counter-propagating waves'), latex: String.raw `\tilde{u}=A\,e^{ikx}+B\,e^{-ikx}` },
            { name: t('时域 ↔ 频域的替换规则', 'The time ↔ frequency substitution rule'), latex: String.raw `u\left(\boldsymbol{x},t\right)=\frac{1}{2\pi}\int \tilde{u}\left(\boldsymbol{x},\omega\right)e^{-i\omega t}\,\mathrm{d}\omega,\qquad \frac{\partial}{\partial t}\to -i\omega` },
        ],
    },
    meaning: t('对时间做一次 Fourier 变换，波动方程里的 ∂²/∂t² 变成 −ω²，时间变量彻底消失，只剩一个纯空间的 Helmholtz 方程。这是所有频率域方法（反射率法、频率域全波形反演、Kirchhoff 偏移）的起点：把一个"初值问题"换成一个"边值问题"，每个频率可以独立、并行地求解。代价是要对每个频率都解一遍。', 'One Fourier transform over time turns ∂²/∂t² into −ω², the time variable disappears entirely, and only a purely spatial Helmholtz equation remains. This is the starting point of every frequency-domain method — reflectivity, frequency-domain full waveform inversion, Kirchhoff migration. It trades an initial-value problem for a boundary-value problem, so each frequency can be solved independently and in parallel; the price is solving once per frequency.'),
    symbols: [
        { sym: '\\tilde{u}', name: t('位移的频域（Fourier）分量', 'frequency-domain (Fourier) component of displacement'), unit: 'm·s' },
        { sym: 'k', name: t('波数 k = ω/c = 2π/λ', 'wavenumber k = ω/c = 2π/λ'), unit: 'rad/m', typical: '10⁻³ – 10⁰（地震勘探）' },
        { sym: '\\omega', name: t('角频率 ω = 2πf', 'angular frequency ω = 2πf'), unit: 'rad/s', typical: '地震波 6 – 600' },
        { sym: 'c', name: t('波速（对弹性波取 α 或 β）', 'wave speed (α or β for elastic waves)'), unit: 'm/s' },
        { sym: '\\lambda', name: t('波长（此处为波长，不是 Lamé 常数）', 'wavelength (here wavelength, not the Lamé constant)'), unit: 'm', typical: '30 – 3000（勘探地震）' },
        { sym: 'G', name: t('Helmholtz 方程的 Green 函数', 'Green function of the Helmholtz equation'), unit: 'm⁻¹' },
        { sym: '\\boldsymbol{\\xi}', name: t('源点位置', 'source position'), unit: 'm' },
    ],
    conditions: {
        applies: [
            t('线性、时不变介质；单一频率的稳态波场', 'Linear, time-invariant media and a steady-state wavefield at one frequency'),
            t('无源区域（源以边界条件或右端项给出）', 'Source-free region, with the source imposed as a boundary condition or a right-hand term'),
        ],
        assumes: [
            t('采用 e^{−iωt} 的时间约定；若用 e^{+iωt} 则 ∂_t → +iω，出射波取 e^{−ikr}', 'The e^{−iωt} convention is used; with e^{+iωt} the substitution is ∂_t → +iω and outgoing waves are e^{−ikr}'),
            t('介质无频散时 k 与 ω 成正比；有衰减时 k 变复数', 'In non-dispersive media k is proportional to ω; attenuation makes k complex'),
        ],
        breaks: [
            t('强衰减介质中 k 为复数，方程需改为复数 Helmholtz 方程', 'Strongly attenuating media need a complex k and a complex Helmholtz equation'),
            t('非线性或时变介质无法做时间 Fourier 分离', 'Non-linear or time-varying media cannot be separated by a time Fourier transform'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('从时域标量波动方程出发', 'Start from the time-domain scalar wave equation'),
            latex: String.raw `\nabla^{2}u=\frac{1}{c^{2}}\frac{\partial^{2}u}{\partial t^{2}}` },
        { n: 2, op: 'transform', title: t('对时间做 Fourier 变换', 'Fourier transform in time'),
            latex: String.raw `u\left(\boldsymbol{x},t\right)=\frac{1}{2\pi}\int_{-\infty}^{\infty}\tilde{u}\left(\boldsymbol{x},\omega\right)e^{-i\omega t}\,\mathrm{d}\omega`,
            note: t('空间部分原封不动，时间部分被换成了积分。', 'The spatial part is untouched; the time dependence becomes an integral.') },
        { n: 3, op: 'identity', title: t('时间导数落到指数上', 'The time derivative acts on the exponential'),
            latex: String.raw `\frac{\partial^{2}u}{\partial t^{2}}=\frac{1}{2\pi}\int \left(-i\omega\right)^{2}\tilde{u}\,e^{-i\omega t}\,\mathrm{d}\omega=-\frac{1}{2\pi}\int \omega^{2}\tilde{u}\,e^{-i\omega t}\,\mathrm{d}\omega` },
        { n: 4, op: 'substitute', title: t('代回波动方程并逐频比较', 'Substitute back and compare frequency by frequency'),
            latex: String.raw `\nabla^{2}\tilde{u}=-\frac{\omega^{2}}{c^{2}}\,\tilde{u}`,
            note: t('不同频率的指数函数线性无关，所以每个 ω 必须各自成立。', 'Exponentials of different frequency are linearly independent, so the equation must hold for each ω separately.') },
        { n: 5, op: 'algebra', title: t('移项并定义波数', 'Rearrange and define the wavenumber'),
            latex: String.raw `\nabla^{2}\tilde{u}+k^{2}\tilde{u}=0,\qquad k^{2}\equiv\frac{\omega^{2}}{c^{2}},\qquad k=\frac{\omega}{c}=\frac{2\pi}{\lambda}` },
        { n: 6, op: 'result', title: t('出射波的解与物理含义', 'The outgoing-wave solution and what it means'),
            latex: String.raw `\tilde{u}=\frac{A}{r}\,e^{ikr}\ \ \text{(出射球面波)},\qquad k\ \text{实}\Rightarrow\ \text{无衰减、无频散}`,
            note: t('k 与 ω 成正比意味着相速度 c = ω/k 与频率无关，这就是"非频散"的定义。', 'k proportional to ω means the phase velocity c = ω/k is frequency independent — the definition of non-dispersive.') },
    ],
    viz: [
        {
            id: 'k-vs-freq',
            level: 'V1',
            title: t('波数随频率线性增长：非频散的指纹', 'Wavenumber grows linearly with frequency: the fingerprint of no dispersion'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('波数 k (rad/m)', 'wavenumber k (rad/m)'),
            controls: [
                { id: 'c', label: t('波速 c', 'wave speed c'), min: 1000, max: 8000, step: 100, value: 3000, unit: 'm/s' },
            ],
            xRange: [1, 100],
            note: t('直线过原点 = 相速度不随频率变化 = 非频散。低速介质（虚线 1500 m/s）在同样频率下波数更大、波长更短，因此分辨率更高——这就是为什么浅层低速带的地震剖面看起来"更细"。', 'A straight line through the origin means phase velocity independent of frequency, i.e. no dispersion. A slow medium (dashed, 1500 m/s) has a larger wavenumber and shorter wavelength at the same frequency, hence finer resolution — which is why shallow low-velocity sections look more detailed.'),
            compute: (p) => {
                const c = p['c'];
                const kPts = [];
                const kRef = [];
                for (let i = 0; i <= 200; i++) {
                    const f = 1 + (i / 200) * 99;
                    kPts.push([f, (2 * Math.PI * f) / c]);
                    kRef.push([f, (2 * Math.PI * f) / 1500]);
                }
                return [
                    { label: t('k = 2πf/c（当前波速）', 'k = 2πf/c (current speed)'), color: '#185FA5', points: kPts },
                    { label: t('k（参考：c = 1500 m/s）', 'k (reference: c = 1500 m/s)'), color: '#B4B2A9', dash: true, points: kRef },
                ];
            },
        },
    ],
    links: {
        upstream: [
            { id: 'fourier-transform', note: t('时间 Fourier 变换是本式的工具', 'the time Fourier transform is the tool here') },
            { id: 'harmonic-plane-wave' },
            { id: 'ps-potential-decoupling', note: t('两个势各得到一个 Helmholtz 方程', 'each potential yields one Helmholtz equation') },
        ],
        downstream: [
            { id: 'ps-wave-velocities', note: t('c 换成 α 或 β', 'c becomes α or β') },
        ],
        seealso: [
            { id: 'love-wave-dispersion', note: t('面波中 k 与 ω 不再成正比，那就是频散', 'for surface waves k is no longer proportional to ω — that is dispersion') },
            { id: 'quality-factor-q', note: t('衰减让 k 变成复数', 'attenuation turns k complex') },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.2' },
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §2.3' },
    ],
};
export default reducedWaveEquation;
//# sourceMappingURL=reduced-wave-equation.js.map