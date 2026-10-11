import { t } from '../../core/types.js';
/** window-function-leakage */
const windowFunctionLeakage = {
    id: 'window-function-leakage',
    name: t('窗函数与频谱泄漏', 'Window Functions & Spectral Leakage'),
    aliases: { zh: ['窗函数', '频谱泄漏', '汉宁窗', '多窗谱'], en: ['window function', 'spectral leakage', 'Hann window', 'multitaper'] },
    node: 'S9.3',
    tags: {
        math: ['MATH.FOURIER', 'MATH.APPROX'],
        method: ['METH.PROC'],
        quantity: ['Q.FREQ', 'Q.AMP'],
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\hat{X}(f) = \int_{-\infty}^{\infty} X(f')\,W(f-f')\,\mathrm{d}f',\qquad
W(f) = \mathcal{F}\{w(t)\}`,
        variants: [
            { name: t('矩形窗的核是 sinc', 'The rectangular window kernel is a sinc'), latex: String.raw `W_{\text{rect}}(f) = T\,\frac{\sin(\pi f T)}{\pi f T}` },
            { name: t('Hann 窗', 'The Hann window'), latex: String.raw `w(t) = \frac{1}{2}\left(1-\cos\frac{2\pi t}{T}\right),\quad 0\le t\le T` },
            { name: t('主瓣宽度与旁瓣衰减的权衡', 'Trade-off between main-lobe width and side-lobe roll-off'), latex: String.raw `\text{矩形窗：主瓣}\ \frac{2}{T},\ \text{旁瓣}\ -13\ \text{dB};\qquad \text{Hann：主瓣}\ \frac{4}{T},\ \text{旁瓣}\ -32\ \text{dB}` },
            { name: t('多窗谱估计', 'Multitaper spectral estimation'), latex: String.raw `\hat{S}(f) = \frac{1}{K}\sum_{k=0}^{K-1}\left|\int x(t)\,v_k(t)\,e^{-2\pi ift}\,\mathrm{d}t\right|^{2}` },
        ],
    },
    meaning: t('对有限长度的一段记录做 Fourier 变换，等价于先把无限长信号乘以一个窗、再变换。这个乘法在频率域变成卷积：每个频率成分的谱都被窗的谱「抹开」。抹开的形状有主瓣（决定能否分辨两个靠近的频率）和旁瓣（决定强频率成分会不会污染旁边的弱成分）。矩形窗主瓣最窄但旁瓣很高；Hann 窗旁瓣低得多但主瓣宽一倍 —— 没有两全的选择，只有按需取舍。', 'Fourier transforming a finite record is equivalent to multiplying the infinite signal by a window and then transforming. That multiplication becomes a convolution in frequency: the spectrum of each frequency component is smeared by the spectrum of the window. The smearing has a main lobe (determining whether two nearby frequencies can be resolved) and side lobes (determining whether a strong component contaminates nearby weak ones). The rectangular window has the narrowest main lobe but high side lobes; the Hann window has much lower side lobes but twice the main-lobe width — there is no universally best choice, only a trade-off.'),
    symbols: [
        { sym: 'w(t)', name: t('时域窗函数', 'time-domain window function'), unit: '无量纲' },
        { sym: 'W(f)', name: t('窗的频谱（谱核）', 'spectrum of the window (spectral kernel)'), unit: 's' },
        { sym: 'T', name: t('窗长（记录长度）', 'window length (record length)'), unit: 's' },
        { sym: 'v_k(t)', name: t('第 k 个 Slepian 正交窗（DPSS）', 'the k-th Slepian orthogonal taper (DPSS)'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('频谱分析、谱比法测 Q、噪声功率谱估计、自由振荡谱峰测量', 'Spectral analysis, Q from spectral ratios, noise PSD estimation, free-oscillation peak measurement')],
        assumes: [t('信号在窗内近似平稳', 'The signal is approximately stationary within the window')],
        breaks: [t('瞬态信号（如初至）不能用长窗平滑处理', 'Transients (such as first arrivals) cannot be handled with long smoothing windows')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('加窗：x_w(t) = x(t)·w(t)', 'Apply the window: x_w(t) = x(t)·w(t)'), latex: String.raw `x_w(t) = x(t)\,w(t)` },
        { n: 2, op: 'transform', title: t('时域相乘变为频域卷积', 'Time-domain multiplication becomes frequency-domain convolution'), latex: String.raw `\hat{X}(f) = X(f) * W(f) = \int X(f')W(f-f')\,\mathrm{d}f'` },
        { n: 3, op: 'substitute', title: t('矩形窗的谱是 sinc 函数', 'The rectangular window spectrum is a sinc'), latex: String.raw `W_{\text{rect}}(f) = \int_0^{T}e^{-2\pi ift}\,\mathrm{d}t = T\,e^{-\pi ifT}\frac{\sin(\pi fT)}{\pi fT}` },
        { n: 4, op: 'identity', title: t('sinc 的零点间距 1/T，第一旁瓣 −13 dB', 'The sinc has zero spacing 1/T and a first side lobe at −13 dB'), latex: String.raw `\text{零点：}\ f = \frac{n}{T};\qquad \text{第一旁瓣：}\ -13.3\ \text{dB}` },
        { n: 5, op: 'result', title: t('Hann 窗是余弦加权，旁瓣相消到 −32 dB，代价是主瓣加宽到 4/T', 'The Hann window is a cosine taper; side lobes cancel to −32 dB at the cost of widening the main lobe to 4/T'), latex: String.raw `\text{Hann 主瓣宽度} = \frac{4}{T}` },
    ],
    viz: [
        {
            id: 'window-kernels',
            level: 'V2',
            title: t('三种窗的谱核对比', 'Spectral kernels of three windows'),
            xlabel: t('频率偏移 Δf · T', 'frequency offset Δf · T'),
            ylabel: t('|W| (dB)', '|W| (dB)'),
            controls: [{ id: 'type', label: t('0=矩形, 1=Hann, 2=Hamming', '0=rect, 1=Hann, 2=Hamming'), min: 0, max: 2, step: 1, value: 1 }],
            note: t('矩形窗的旁瓣只降到 −13 dB 就停住（会污染邻近弱信号），Hann 窗以 −18 dB/倍频程快速滚降但主瓣宽两倍。做谱比法测 Q 时通常要 Hann 窗，因为要同时看到强低频与弱高频。', 'The rectangular window\'s side lobes stall at −13 dB (contaminating nearby weak signals), while the Hann window rolls off rapidly at −18 dB/octave but has twice the main-lobe width. Q from spectral ratios usually uses a Hann window because strong low frequencies and weak high frequencies must be seen together.'),
            compute: (p) => {
                const type = Math.round(p['type']);
                const pts = [];
                const coef = type === 0 ? [1] : type === 1 ? [0.5, -0.5] : [0.54, -0.46];
                const W = (u) => {
                    if (Math.abs(u) < 1e-9)
                        return coef[0];
                    let re = 0, im = 0;
                    // W(u) = Σ a_k · sinc(u - k)  的连续延拓（用解析式）
                    for (let k = 0; k < coef.length; k++) {
                        const s = Math.sin(Math.PI * (u - k)) / (Math.PI * (u - k));
                        const c = (1 - Math.cos(Math.PI * (u - k))) / (Math.PI * (u - k));
                        re += coef[k] * s;
                        im += -coef[k] * c;
                    }
                    return Math.sqrt(re * re + im * im);
                };
                let mx = 0;
                for (let i = 0; i <= 800; i++) {
                    const u = -6 + (i / 800) * 12;
                    const v = W(u);
                    if (v > mx)
                        mx = v;
                    pts.push([u, v]);
                }
                const nm = type === 0 ? '矩形窗' : type === 1 ? 'Hann 窗' : 'Hamming 窗';
                return [{ label: t(nm, nm), color: '#185FA5', points: pts.map(([u, v]) => [u, 20 * Math.log10(Math.max(v, 1e-8) / mx)]) }];
            },
        },
        {
            id: 'leakage-demo',
            level: 'V2',
            title: t('泄漏：一个强谱线如何污染整条谱', 'Leakage: how one strong line contaminates the whole spectrum'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('谱振幅 (dB)', 'spectral amplitude (dB)'),
            controls: [
                { id: 'win', label: t('0=不加窗, 1=加 Hann 窗', '0 = no window, 1 = Hann'), min: 0, max: 1, step: 1, value: 0 },
                { id: 'T', label: t('记录长度 T (s)', 'record length T (s)'), min: 5, max: 200, step: 1, value: 40 },
            ],
            note: t('不加窗时，两条谱线的泄漏尾巴在中间相互叠加，形成一个抬高的「底」，弱信号很容易被埋掉。加上 Hann 窗后尾巴迅速衰减，底降下来，但每条谱线本身变宽 —— 这就是泄漏与分辨率的取舍。', 'Without a window the leakage tails of two lines add up in between, raising a "floor" that can easily bury weak signals. With a Hann window the tails decay quickly and the floor drops, but each line broadens — the leakage-versus-resolution trade-off.'),
            compute: (p) => {
                const win = Math.round(p['win']), T = p['T'];
                const f1 = 1.0, f2 = 3.0;
                const a1 = 1.0, a2 = 0.01;
                const pts = [];
                for (let i = 0; i <= 600; i++) {
                    const f = 0.2 + (i / 600) * 4.6;
                    let s = 0;
                    for (const [fk, ak] of [[f1, a1], [f2, a2]]) {
                        const u = (f - fk) * T;
                        if (win === 0) {
                            const v = Math.abs(Math.abs(u) < 1e-9 ? 1 : Math.sin(Math.PI * u) / (Math.PI * u));
                            s += ak * v;
                        }
                        else {
                            const sinc = (x) => (Math.abs(x) < 1e-9 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x));
                            const v = Math.abs(0.5 * sinc(u) + 0.25 * sinc(u - 1) + 0.25 * sinc(u + 1));
                            s += ak * v;
                        }
                    }
                    pts.push([f, 20 * Math.log10(Math.max(s, 1e-12))]);
                }
                return [{ label: t('谱', 'spectrum'), color: '#993C1D', points: pts }];
            },
        },
    ],
    example: {
        title: t('选窗的定量依据', 'A quantitative basis for choosing a window'),
        input: t('T = 40 s 的记录，需要分辨 1.0 Hz 与 1.15 Hz 两条谱线', 'A 40 s record; two lines at 1.0 and 1.15 Hz must be resolved'),
        steps: [
            t('矩形窗主瓣半宽 1/T = 0.025 Hz，勉强可分', 'Rectangular half main-lobe width 1/T = 0.025 Hz, marginally separable'),
            t('Hann 窗主瓣半宽 2/T = 0.05 Hz，两条线会并成一个峰', 'Hann half main-lobe width 2/T = 0.05 Hz, the two lines merge into one peak'),
        ],
        output: t('分辨两条靠得很近的谱线时应当用矩形窗；抑制泄漏时用 Hann 窗', 'Use a rectangular window to resolve two close lines; use Hann to suppress leakage'),
    },
    links: {
        upstream: [{ id: 'fourier-transform-pair', note: t('窗的作用发生在变换之前', 'Windowing happens before the transform') }],
        downstream: [{ id: 'multitaper-spectrum', note: t('多窗谱是泄漏控制的进阶方案', 'Multitaper is the advanced remedy for leakage') }],
        seealso: [{ id: 'discrete-fourier-transform', note: t('DFT 天然就是矩形窗', 'The DFT is inherently a rectangular window') }],
    },
    refs: [{ text: 'Percival & Walden, Spectral Analysis for Physical Applications, Ch. 6' }],
};
export default windowFunctionLeakage;
//# sourceMappingURL=window-function-leakage.js.map