import { t } from '../../core/types.js';
/** sampling-spectral-periodicity */
const samplingSpectralPeriodicity = {
    id: 'sampling-spectral-periodicity',
    name: t('采样引起的频谱周期化', 'Spectral Periodicity Induced by Sampling'),
    aliases: { zh: ['采样频谱周期化', '混叠', '频谱复制'], en: ['spectral periodicity', 'aliasing', 'spectral replicas', 'Nyquist'] },
    node: 'S0.2',
    tags: {
        math: ['MATH.FOURIER', 'MATH.COMPLEX'],
        method: ['METH.PROC', 'METH.INSTR'],
        quantity: ['Q.FREQ', 'Q.TIME'],
        keywords: t('采样 频谱周期化 混叠 奈奎斯特 采样率 抗混叠滤波 冲激串', 'sampling spectral periodicity aliasing Nyquist sampling rate anti-alias filter impulse train'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `X_s(\omega)=\frac{1}{\Delta t}\sum_{n=-\infty}^{\infty}X\!\left(\omega-\frac{2\pi n}{\Delta t}\right)`,
        variants: [
            { name: t('采样冲激串及其变换', 'The sampling impulse train and its transform'), latex: String.raw `s(t)=\sum_{m=-\infty}^{\infty}\delta(t-m\Delta t)\;\Longleftrightarrow\;S(\omega)=\frac{2\pi}{\Delta t}\sum_{n=-\infty}^{\infty}\delta\!\left(\omega-\frac{2\pi n}{\Delta t}\right)` },
            { name: t('时域乘积 = 频域褶积', 'Product in time is convolution in frequency'), latex: String.raw `x_s(t)=x(t)\,s(t)\;\Longrightarrow\;X_s=\frac{1}{2\pi}\,X*S` },
            { name: t('采样频率与 Nyquist 频率', 'Sampling frequency and the Nyquist frequency'), latex: String.raw `f_s=\frac{1}{\Delta t},\qquad f_{Nyq}=\frac{f_s}{2}=\frac{1}{2\Delta t}` },
            { name: t('混叠公式：高频被折叠到低频', 'The aliasing formula: high frequencies folded down'), latex: String.raw `f_{alias}=\bigl|\,f-m f_s\,\bigr|,\qquad m=\text{round}\!\left(\frac{f}{f_s}\right)` },
            { name: t('无混叠条件', 'The alias-free condition'), latex: String.raw `X(\omega)=0\quad\text{for}\quad |\omega|>\frac{\pi}{\Delta t}\;\Longrightarrow\;\text{无混叠}` },
        ],
    },
    meaning: t('按等间隔 Δt 采样，等价于在频率域把原谱以 2π/Δt 为周期复制无穷多份再加起来。只要原谱带宽不超过 Nyquist 频率，这些副本彼此不重叠，原信号可以被完美重建；一旦超出，副本相互侵入，高频就伪装成低频 —— 这就是混叠，而且一旦发生便无法事后消除。野外记录前必须过抗混叠滤波器，道理正在此。', 'Sampling at a constant interval Δt is equivalent, in the frequency domain, to replicating the original spectrum infinitely many times with period 2π/Δt and adding the copies together. As long as the bandwidth stays below the Nyquist frequency the replicas never overlap and the signal can be reconstructed perfectly; once it exceeds that bound the replicas invade one another and high frequencies masquerade as low ones. That is aliasing, and it cannot be undone after the fact — which is precisely why a record must pass an anti-alias filter before digitisation.'),
    symbols: [
        { sym: '\\Delta t', name: t('采样间隔', 'sampling interval'), unit: 's', typical: '10⁻³ – 10⁻¹ s' },
        { sym: 'f_s', name: t('采样频率 1/Δt', 'sampling frequency, 1/Δt'), unit: 'Hz' },
        { sym: 'f_{Nyq}', name: t('Nyquist 频率 f_s/2', 'Nyquist frequency, f_s/2'), unit: 'Hz' },
        { sym: 'x_s(t)', name: t('采样后的离散序列', 'the sampled discrete sequence'), unit: '同 x' },
        { sym: 'X_s(\\omega)', name: t('采样序列的谱（周期函数）', 'spectrum of the sampled sequence, a periodic function'), unit: '同 X · s' },
        { sym: 's(t)', name: t('采样冲激串（Dirac 梳）', 'sampling impulse train, a Dirac comb'), unit: 's⁻¹' },
        { sym: 'f_{alias}', name: t('混叠后出现的假频率', 'the apparent frequency produced by aliasing'), unit: 'Hz' },
    ],
    conditions: {
        applies: [
            t('理想等间隔采样（实际 ADC 有孔径时间与抖动，只是近似）', 'Ideal uniform sampling; a real ADC has aperture time and jitter, so this is only an approximation'),
            t('任何带宽有限的连续信号', 'Any band-limited continuous signal'),
        ],
        assumes: [
            t('采样是瞬时的（δ 采样）', 'Sampling is instantaneous, that is, δ-like'),
            t('记录无限长；有限长还会叠加窗函数的谱', 'The record is infinitely long; a finite one additionally convolves with the window spectrum'),
        ],
        breaks: [
            t('非等间隔采样时周期化不再严格成立，需专门的重建算法', 'With non-uniform sampling the periodicity no longer holds exactly and dedicated reconstruction is needed'),
            t('带通采样（欠采样）虽可刻意利用混叠，但要求严格的带限条件', 'Bandpass, or deliberate under-sampling, exploits aliasing but demands strict band-limiting'),
            t('量化噪声与抖动会叠加一层与采样率无关的底噪', 'Quantisation noise and jitter add a noise floor independent of the sampling rate'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('把采样写成乘以 Dirac 梳', 'Write sampling as multiplication by a Dirac comb'),
            latex: String.raw `x_s(t)=x(t)\sum_{m=-\infty}^{\infty}\delta(t-m\Delta t)=x(t)\,s(t)`,
        },
        {
            n: 2,
            op: 'identity',
            title: t('Dirac 梳的 Fourier 变换还是 Dirac 梳', 'The Fourier transform of a Dirac comb is another Dirac comb'),
            latex: String.raw `S(\omega)=\frac{2\pi}{\Delta t}\sum_{n=-\infty}^{\infty}\delta\!\left(\omega-n\omega_s\right),\qquad \omega_s=\frac{2\pi}{\Delta t}`,
            note: t('这是 Poisson 求和公式的一个特例，也是整个采样定理的枢纽。', 'A special case of the Poisson summation formula and the pivot of the whole sampling theorem.'),
        },
        {
            n: 3,
            op: 'transform',
            title: t('时域相乘 ⟹ 频域褶积', 'Multiplication in time implies convolution in frequency'),
            latex: String.raw `X_s(\omega)=\frac{1}{2\pi}\,(X*S)(\omega)=\frac{1}{2\pi}\int X(\nu)\,S(\omega-\nu)\,\dd\nu`,
        },
        {
            n: 4,
            op: 'substitute',
            title: t('代入 S，δ 函数完成筛选', 'Insert S; the deltas do the sifting'),
            latex: String.raw `X_s(\omega)=\frac{1}{\Delta t}\sum_{n=-\infty}^{\infty}X\!\left(\omega-n\omega_s\right)`,
        },
        {
            n: 5,
            op: 'result',
            title: t('结论：谱被按 ω_s 周期化', 'Conclusion: the spectrum is periodised with period ω_s'),
            latex: String.raw `X_s(\omega+\omega_s)=X_s(\omega)`,
            note: t('这就是为什么 DFT 的输出天然只给出一个周期（0 到 f_s），且 X_{N−n} = X_n*。', 'This is why the DFT naturally reports only one period, from 0 to f_s, and why X_{N−n} = X_n*.'),
        },
        {
            n: 6,
            op: 'result',
            title: t('混叠判据与重建条件', 'The aliasing criterion and the reconstruction condition'),
            latex: String.raw `B<\frac{f_s}{2}\ \text{则副本不重叠，可重建；否则}\ f_{alias}=|f-mf_s|`,
            note: t('注意「可以重建」只保证信息没丢，实际重建还需理想低通（sinc 插值）。', 'Note that "can be reconstructed" only guarantees no information was lost; actual reconstruction still needs an ideal low-pass, that is, sinc interpolation.'),
        },
    ],
    viz: [
        {
            id: 'spectral-replicas',
            level: 'V1',
            title: t('采样率的抉择：副本重叠就是混叠', 'Choosing a sampling rate: overlapping replicas are aliasing'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('振幅谱（归一化）', 'amplitude spectrum (normalised)'),
            controls: [
                { id: 'fs', label: t('采样频率 f_s', 'sampling frequency f_s'), min: 2, max: 60, step: 0.5, value: 20, unit: 'Hz' },
                { id: 'B', label: t('信号带宽 B', 'signal bandwidth B'), min: 1, max: 30, step: 0.5, value: 8, unit: 'Hz' },
            ],
            xRange: [-40, 40],
            note: t('三角谱每 f_s 重复一次。把 f_s 调到小于 2B，相邻副本立刻侵入对方，原本在 B 附近的高频成分被折叠成低频假信号 —— 混叠。野外布台的第一条纪律就是：采样率必须高于关心最高频率的两倍，并在 ADC 前加抗混叠滤波。', 'The triangular spectrum repeats every f_s. Push f_s below 2B and neighbouring replicas invade each other at once; content near B is folded into a spurious low-frequency signal, which is aliasing. The first rule of field deployment follows: sample at more than twice the highest frequency of interest, and filter before the ADC.'),
            compute: (p) => {
                const fs = p['fs'];
                const B = p['B'];
                const shape = (f) => {
                    const a = Math.abs(f);
                    return a <= B ? 1 - a / B : 0;
                };
                const pts = [];
                for (let i = 0; i <= 1200; i++) {
                    const f = -40 + (i / 1200) * 80;
                    let s = 0;
                    for (let n = -4; n <= 4; n++)
                        s += shape(f - n * fs);
                    pts.push([f, s]);
                }
                return [{ label: t('周期化后的谱 Σ X(f − n f_s)', 'periodised spectrum Σ X(f − n f_s)'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'alias-mapping',
            level: 'V1',
            title: t('混叠映射：真实频率 → 观测到的假频率', 'The aliasing map: true frequency to observed apparent frequency'),
            xlabel: t('真实频率 f (Hz)', 'true frequency f (Hz)'),
            ylabel: t('观测到的频率 f_alias (Hz)', 'observed frequency f_alias (Hz)'),
            controls: [
                { id: 'fs2', label: t('采样频率 f_s', 'sampling frequency f_s'), min: 2, max: 40, step: 0.5, value: 10, unit: 'Hz' },
            ],
            xRange: [0, 50],
            note: t('理想采样下这条曲线是一条锯齿：f < f_s/2 时如实记录，超过后立刻折返。12 Hz 的正弦在 10 Hz 采样下看起来就是 2 Hz —— 一个完全无法从数据本身察觉的假象。', 'Under ideal sampling this curve is a sawtooth: below f_s/2 the frequency is recorded faithfully, above it the value folds back at once. A 12 Hz sinusoid sampled at 10 Hz looks like 2 Hz — an artefact utterly undetectable from the data alone.'),
            compute: (p) => {
                const fs = p['fs2'];
                const pts = [];
                for (let i = 0; i <= 1000; i++) {
                    const f = (i / 1000) * 50;
                    const m = Math.round(f / fs);
                    pts.push([f, Math.abs(f - m * fs)]);
                }
                return [{ label: t('f_alias = |f − m f_s|', 'f_alias = |f − m f_s|'), color: '#993C1D', points: pts }];
            },
        },
    ],
    example: {
        title: t('布台时选采样率', 'Choosing a sampling rate for a deployment'),
        input: t('关心的最高频率 f_max = 25 Hz（地方震 S 波）', 'The highest frequency of interest is f_max = 25 Hz, local S waves'),
        steps: [
            t('按 Nyquist 判据：f_s > 2 f_max = 50 Hz', 'By the Nyquist criterion: f_s > 2 f_max = 50 Hz'),
            t('选标准档 100 Hz（Δt = 0.01 s），留出抗混叠滤波器的过渡带', 'Choose the standard 100 Hz rate, Δt = 0.01 s, leaving room for the anti-alias filter transition band'),
            t('若误用 40 Hz 采样，25 Hz 会被折叠成 |25 − 40| = 15 Hz', 'Sampling at 40 Hz by mistake would fold 25 Hz into |25 − 40| = 15 Hz'),
        ],
        output: t('100 Hz 采样 + 40 Hz 模拟低通，是地方震台网的常见配置', '100 Hz sampling with a 40 Hz analogue low-pass is a common configuration for local networks'),
    },
    links: {
        upstream: [
            { id: 'dirac-delta-sifting', note: t('冲激串的筛选性质', 'the sifting property of the impulse train') },
            { id: 'convolution-theorem', note: t('时域相乘对应频域褶积', 'product in time is convolution in frequency') },
        ],
        downstream: [
            { id: 'discrete-fourier-transform', note: t('DFT 的输出只是一个周期', 'the DFT reports just one period') },
            { id: 'nyquist-sampling', note: t('采样定理的完整表述', 'the full statement of the sampling theorem') },
        ],
    },
    refs: [
        { text: 'Oppenheim & Schafer, Discrete-Time Signal Processing, 3rd ed., §4.2' },
        { text: 'Bracewell, The Fourier Transform and Its Applications, 3rd ed., §10' },
    ],
};
export default samplingSpectralPeriodicity;
//# sourceMappingURL=sampling-spectral-periodicity.js.map