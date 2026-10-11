import { t } from '../../core/types.js';
/** ricker-wavelet */
const rickerWavelet = {
    id: 'ricker-wavelet',
    name: t('Ricker 子波', 'The Ricker Wavelet'),
    aliases: { zh: ['雷克子波', '墨西哥帽', '零相位子波'], en: ['Ricker wavelet', 'Mexican hat', 'zero-phase wavelet'] },
    node: 'S3.6',
    tags: {
        math: ['MATH.FOURIER', 'MATH.ALGEBRA'],
        method: ['METH.EXPL', 'METH.PROC'],
        quantity: ['Q.FREQ', 'Q.AMP'],
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `w(t) = \left(1 - 2\pi^{2}f_{m}^{2}t^{2}\right)\exp\!\left(-\pi^{2}f_{m}^{2}t^{2}\right)`,
        variants: [
            { name: t('振幅谱', 'Amplitude spectrum'), latex: String.raw `|W(f)| \propto f^{2}\exp\!\left(-\frac{f^{2}}{f_{m}^{2}}\right)` },
            { name: t('谱峰位置', 'Position of the spectral peak'), latex: String.raw `f_{\text{peak}} = f_{m}` },
            { name: t('它是高斯函数的二阶导数', 'It is the second derivative of a Gaussian'), latex: String.raw `w(t) \propto \frac{d^{2}}{dt^{2}}e^{-\pi^{2}f_m^{2}t^{2}}` },
        ],
    },
    meaning: t('Ricker 子波是地震中最常用的理论子波：零相位、形状简单、只有一个参数（主频）。它其实不是一个物理上可实现的传播子波（因果性要求最小相位），但在合成记录、反演测试与分辨率讨论里它是最方便的标尺。', 'The Ricker wavelet is the most used theoretical wavelet in seismology: zero phase, simple shape, a single parameter (dominant frequency). Strictly it is not physically realisable as a propagating wavelet (causality demands minimum phase), but it is the most convenient yardstick for synthetics, inversion tests and resolution discussions.'),
    symbols: [
        { sym: 'w(t)', name: t('子波振幅', 'wavelet amplitude'), unit: '无量纲' },
        { sym: 'f_{m}', name: t('主频（谱峰频率）', 'dominant (peak-spectrum) frequency'), unit: 'Hz', typical: '10 – 60' },
        { sym: 'W(f)', name: t('子波频谱', 'wavelet spectrum'), unit: '无量纲' },
        { sym: 't', name: t('时间', 'time'), unit: 's' },
    ],
    conditions: {
        applies: [t('合成地震记录、反演测试、分辨率估算', 'Synthetic seismograms, inversion tests, resolution estimates')],
        assumes: [
            t('零相位（已做过相位校正）', 'Zero phase (after phase correction)'),
            t('子波不随时间变化', 'The wavelet is time invariant'),
        ],
        breaks: [
            t('实际传播子波是最小相位并随传播变宽', 'Real propagating wavelets are minimum phase and broaden with propagation'),
            t('强衰减介质中谱形明显偏离 f² 高斯', 'In strongly attenuating media the spectrum departs noticeably from the f²-Gaussian'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('从高斯函数出发', 'Start from a Gaussian'),
            latex: String.raw `g(t) = e^{-\pi^{2}f_m^{2}t^{2}}` },
        { n: 2, op: 'algebra', title: t('取二阶导数', 'Take the second derivative'),
            latex: String.raw `g''(t) = \left(4\pi^{4}f_m^{4}t^{2} - 2\pi^{2}f_m^{2}\right)e^{-\pi^{2}f_m^{2}t^{2}}` },
        { n: 3, op: 'algebra', title: t('归一化使 t = 0 处为 1', 'Normalise so that the value at t = 0 is 1'),
            latex: String.raw `w(t) = -\frac{g''}{2\pi^{2}f_m^{2}} = \left(1-2\pi^{2}f_m^{2}t^{2}\right)e^{-\pi^{2}f_m^{2}t^{2}}` },
        { n: 4, op: 'transform', title: t('求 Fourier 变换', 'Fourier transform it'),
            latex: String.raw `W(f) \propto (2\pi f)^{2}\,e^{-\pi^{2}f^{2}/(\pi^{2}f_m^{2})} \propto f^{2}e^{-f^{2}/f_m^{2}}` },
        { n: 5, op: 'result', title: t('谱峰求导得 f = f_m', 'Maximising the spectrum gives f = f_m'),
            latex: String.raw `\frac{d}{df}\left(f^{2}e^{-f^{2}/f_m^{2}}\right) = 0 \Longrightarrow f = f_m` },
    ],
    viz: [
        {
            id: 'ricker-shape',
            level: 'V1',
            title: t('Ricker 子波及其频谱', 'The Ricker wavelet and its spectrum'),
            xlabel: t('时间 (s) / 频率 (Hz)', 'time (s) / frequency (Hz)'),
            ylabel: t('振幅（归一化）', 'amplitude (normalised)'),
            controls: [
                { id: 'fm', label: t('主频 f_m (Hz)', 'dominant frequency f_m (Hz)'), min: 5, max: 80, step: 1, value: 30 },
            ],
            note: t('主频提高一倍，子波在时间上压窄一半，频谱向右推开一倍 —— 分辨率与穿透深度的永恒矛盾。', 'Doubling the dominant frequency halves the wavelet in time and pushes the spectrum an octave up — the eternal trade-off between resolution and penetration.'),
            compute: (p) => {
                const fm = p['fm'];
                const wav = [];
                const spc = [];
                for (let i = 0; i <= 240; i++) {
                    const tt = -0.08 + (i / 240) * 0.16;
                    const a = Math.PI * fm * tt;
                    wav.push([tt, (1 - 2 * a * a) * Math.exp(-a * a)]);
                }
                let mx = 0;
                const raw = [];
                for (let i = 0; i <= 240; i++) {
                    const f = (i / 240) * 3 * fm;
                    const val = f * f * Math.exp(-(f * f) / (fm * fm));
                    raw.push([f, val]);
                    if (val > mx)
                        mx = val;
                }
                for (const [f, v] of raw)
                    spc.push([f, v / mx]);
                return [
                    { label: t('子波 w(t)', 'wavelet w(t)'), color: '#185FA5', points: wav },
                    { label: t('频谱 |W(f)|', 'spectrum |W(f)|'), color: '#993C1D', points: spc, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('30 Hz Ricker 的视周期', 'Apparent period of a 30 Hz Ricker'),
        input: t('f_m = 30 Hz', 'f_m = 30 Hz'),
        steps: [
            t('主瓣半宽（过零点）t = ±1/(π f_m √2) = ±7.5 ms', 'Zero crossings at t = ±1/(π f_m √2) = ±7.5 ms'),
            t('可分辨厚度按 λ/4 计，v = 3000 m/s 时为 25 m', 'Resolvable thickness by λ/4 is 25 m at v = 3000 m/s'),
        ],
        output: t('主瓣宽度约 15 ms，对应 25 m 的可分辨厚度', 'The main lobe is about 15 ms wide, corresponding to 25 m of resolvable thickness'),
    },
    links: {
        upstream: [{ id: 'convolution-integral', note: t('子波在褶积模型中的角色', 'The role of the wavelet in the convolutional model') }],
        downstream: [{ id: 'synthetic-seismogram', note: t('最常用的用途', 'Its most common use') }],
        seealso: [{ id: 'wavelet-bandwidth-resolution', note: t('分辨率与频带的关系', 'Resolution versus bandwidth') }],
    },
    refs: [{ text: 'Ricker, N. (1953). The form and laws of propagation of seismic wavelets. Geophysics, 18, 10–40' }],
};
export default rickerWavelet;
//# sourceMappingURL=ricker-wavelet.js.map