import { t } from '../../core/types.js';
/** short-time-fourier */
const shortTimeFourier = {
    id: 'short-time-fourier',
    name: t('短时 Fourier 变换与时频分析', 'Short-time Fourier Transform & Time–Frequency Analysis'),
    aliases: { zh: ['STFT', '时频图', '小波变换'], en: ['STFT', 'spectrogram', 'wavelet transform'] },
    node: 'S9.4',
    tags: {
        math: ['MATH.FOURIER', 'MATH.STAT'],
        method: ['METH.PROC'],
        quantity: ['Q.FREQ', 'Q.TIME'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `S(\tau,f)=\left|\int x(t)\,w(t-\tau)\,e^{-i2\pi ft}\,\mathrm{d}t\right|^{2}`,
        variants: [
            { name: t('小波变换（尺度可变）', 'Wavelet transform (variable scale)'), latex: String.raw `W(a,b)=\frac{1}{\sqrt{a}}\int x(t)\,\psi^{*}\!\left(\frac{t-b}{a}\right)\mathrm{d}t` },
            { name: t('时频不确定性关系', 'Time–frequency uncertainty relation'), latex: String.raw `\Delta t\cdot\Delta f\ge\frac{1}{4\pi}` },
            { name: t('Gabor（高斯）窗达到下界', 'The Gabor (Gaussian) window attains the bound'), latex: String.raw `w(t)=e^{-t^{2}/(2\sigma^{2})}\;\Longrightarrow\; \Delta t\,\Delta f=\frac{1}{4\pi}` },
        ],
    },
    meaning: t('地震信号本质上非平稳：面波频散、尾波衰减、破裂过程的频率都在随时间变。STFT 用滑动窗把信号切成小段分别做谱，得到能量在时频平面上的分布。它的根本限制是时频不确定性 —— 窗越短时间分辨率越好但频率分辨率越差；小波变换用可变窗长缓解了这个矛盾，高频看时间、低频看频率。', 'Seismic signals are intrinsically non-stationary: dispersion, coda decay and rupture processes all change frequency content with time. The STFT slices the signal with a sliding window and computes spectra segment by segment, giving energy distribution in the time–frequency plane. Its fundamental limit is the uncertainty relation: a shorter window improves time resolution but degrades frequency resolution. Wavelet transforms relax this with variable window length, resolving time at high frequency and frequency at low frequency.'),
    symbols: [
        { sym: 'S(\\tau,f)', name: t('时频谱（谱图）', 'spectrogram'), unit: '信号平方/Hz' },
        { sym: 'w(t-\\tau)', name: t('中心在 τ 的窗函数', 'window centred at τ'), unit: '无量纲' },
        { sym: '\\Delta t,\\Delta f', name: t('时间与频率分辨率', 'time and frequency resolution'), unit: 's, Hz' },
        { sym: 'a,b', name: t('小波的尺度与平移', 'scale and translation of the wavelet'), unit: 's' },
    ],
    conditions: {
        applies: [t('非平稳信号的时变频谱分析', 'Time-varying spectral analysis of non-stationary signals')],
        assumes: [t('信号在窗内近似平稳', 'The signal is approximately stationary within the window')],
        breaks: [t('窗长固定，无法同时兼顾快慢变化的成分', 'A fixed window cannot simultaneously handle fast and slowly varying components')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('用窗截取局部信号', 'Extract the local signal with a window'),
            latex: String.raw `x_\tau(t)=x(t)\,w(t-\tau)` },
        { n: 2, op: 'transform', title: t('对局部信号做 Fourier 变换', 'Fourier transform the local signal'),
            latex: String.raw `\tilde{x}_\tau(f)=\int x(t)w(t-\tau)e^{-i2\pi ft}\mathrm{d}t` },
        { n: 3, op: 'result', title: t('取模平方得到谱图', 'Take the squared modulus to get the spectrogram'),
            latex: String.raw `S(\tau,f)=\left|\tilde{x}_\tau(f)\right|^{2}` },
        { n: 4, op: 'identity', title: t('分辨率由窗长决定', 'Resolution is set by the window length'),
            latex: String.raw `\Delta t\approx T_w,\qquad \Delta f\approx\frac{1}{T_w}\;\Longrightarrow\; \Delta t\,\Delta f\ge\frac{1}{4\pi}` },
    ],
    links: {
        upstream: [{ id: 'fourier-transform-pair', note: t('每一帧的谱来自它', 'The spectrum of each frame comes from it') }],
        seealso: [{ id: 'multitaper-spectrum', note: t('更稳健的谱估计', 'A more robust spectral estimator') }],
    },
    refs: [{ text: 'Cohen, Time-Frequency Analysis' }],
};
export default shortTimeFourier;
//# sourceMappingURL=short-time-fourier.js.map