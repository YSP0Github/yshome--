import { t } from '../../core/types.js';
/** fourier-transform */
const fourierTransform = {
    id: 'fourier-transform',
    name: t('连续 Fourier 变换对', 'The Continuous Fourier Transform Pair'),
    aliases: { zh: ['傅里叶变换', '频谱'], en: ['Fourier transform', 'spectrum'] },
    node: 'S0.2',
    tags: {
        math: ['MATH.FOURIER', 'MATH.COMPLEX'],
        method: ['METH.PROC'],
        quantity: ['Q.FREQ', 'Q.AMP'],
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `F(\omega)=\int_{-\infty}^{\infty} f(t)\,e^{-i\omega t}\,\dd t`,
        variants: [
            { name: t('反变换', 'Inverse transform'), latex: String.raw `f(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty} F(\omega)\,e^{i\omega t}\,\dd\omega` },
            { name: t('用普通频率 f', 'In ordinary frequency f'), latex: String.raw `F(f)=\int_{-\infty}^{\infty} f(t)\,e^{-2\pi i f t}\,\dd t` },
        ],
    },
    meaning: t('把一条随时间起伏的地震图，翻译成「每个频率上有多少能量」。地震学里绝大多数体力活——滤波、反褶积、频散分析、震源谱——都在频率域完成。', 'Translates a wiggling seismogram into "how much energy sits at each frequency". Most of the heavy lifting in seismology — filtering, deconvolution, dispersion analysis, source spectra — is done in the frequency domain.'),
    symbols: [
        { sym: 'F(\\omega)', name: t('频率域谱（一般为复数）', 'frequency-domain spectrum (generally complex)'), unit: '取决于 f 的单位' },
        { sym: 'f(t)', name: t('时间域信号', 'time-domain signal'), unit: '同原物理量' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
        { sym: '\\dd t', name: t('积分微元', 'integration element'), unit: 's' },
    ],
    conditions: {
        applies: [t('绝对可积信号 ∫|f(t)|dt < ∞', 'Absolutely integrable signals')],
        assumes: [t('线性、时不变系统', 'Linear, time-invariant systems')],
        breaks: [t('无限长不衰减信号需引入 δ 函数（广义函数）意义下的变换', 'Signals that never decay require distributions (delta functions)')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('目标：把 f(t) 拆成谐和波之和', 'Goal: decompose f(t) into harmonic waves'),
            latex: String.raw `f(t)=\frac{1}{2\pi}\int_{-\infty}^{\infty} F(\omega)\,e^{i\omega t}\,\dd\omega`,
            note: t('先写下反变换作为「假设成立」：如果 f 能这样表示，那么 F 是什么？', 'Postulate the inverse first: if f can be written this way, what must F be?') },
        { n: 2, op: 'transform', title: t('两边同乘 e^{−iω′t} 并对 t 积分', 'Multiply both sides by e^{−iω′t} and integrate'),
            latex: String.raw `\int_{-\infty}^{\infty} f(t)\,e^{-i\omega' t}\,\dd t = \frac{1}{2\pi}\int F(\omega)\left[\int e^{i(\omega-\omega')t}\,\dd t\right]\dd\omega` },
        { n: 3, op: 'identity', title: t('使用 δ 函数的积分表示', 'Use the delta-function representation'),
            latex: String.raw `\int_{-\infty}^{\infty} e^{i(\omega-\omega')t}\,\dd t = 2\pi\,\delta(\omega-\omega')` },
        { n: 4, op: 'identity', title: t('δ 函数的挑选性质', 'The sifting property'),
            latex: String.raw `\frac{1}{2\pi}\int F(\omega)\,2\pi\delta(\omega-\omega')\,\dd\omega=F(\omega')` },
        { n: 5, op: 'result', title: t('得到正变换', 'The forward transform'),
            latex: String.raw `F(\omega)=\int_{-\infty}^{\infty} f(t)\,e^{-i\omega t}\,\dd t` },
    ],
    links: {
        upstream: [{ id: 'harmonic-plane-wave' }],
        downstream: [
            { id: 'brune-source-spectrum', note: t('震源谱就是 |F(ω)| 的形状', 'The source spectrum is the shape of |F(ω)|') },
            { id: 'nyquist-sampling' },
        ],
    },
    refs: [{ text: 'Bracewell, The Fourier Transform and Its Applications' }],
};
export default fourierTransform;
//# sourceMappingURL=fourier-transform.js.map