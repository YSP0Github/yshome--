import { t } from '../../core/types.js';
/** instrument-deconvolution */
const instrumentDeconvolution = {
    id: 'instrument-deconvolution',
    name: t('去仪器响应', 'Instrument Deconvolution'),
    aliases: { zh: ['反卷积', '响应去除'], en: ['deconvolution', 'response removal'] },
    node: 'S8.2',
    tags: {
        math: ['MATH.FOURIER', 'MATH.COMPLEX', 'MATH.STAT'],
        method: ['METH.INSTR', 'METH.PROC'],
        quantity: ['Q.AMP', 'Q.FREQ'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `\tilde{u}(f)=\frac{\tilde{d}(f)}{T(f)}\,W(f)`,
        variants: [
            { name: t('加水稳（water level）的正则化', 'Water-level regularisation'), latex: String.raw `\tilde{u}(f)=\frac{\tilde{d}(f)\,T^{*}(f)}{|T(f)|^{2}+\varepsilon^{2}\max|T|^{2}}` },
            { name: t('时域等价形式', 'Equivalent time-domain statement'), latex: String.raw `d(t)=u(t)*h(t)\;\Longrightarrow\; u(t)=d(t)*h^{-1}(t)` },
        ],
    },
    meaning: t('记录 = 地面运动 与 仪器冲激响应 的褶积。去卷积就是在频域除以传递函数。麻烦在于 T(f) 在通带外趋于零，直接除会放大噪声到荒谬的程度 —— 所以工程上必须加水稳、预滤波或正则化，把带外噪声压住。这一步做得好不好，直接决定后续震级、谱、矩张量反演的可靠性。', 'Recording = ground motion convolved with the instrument impulse response; deconvolution means dividing by the transfer function in the frequency domain. The trouble is that T(f) tends to zero outside the passband, so naive division amplifies noise absurdly. Hence water levelling, pre-filtering or regularisation is mandatory to suppress out-of-band noise. How well this is done directly determines the reliability of all later magnitude, spectral and moment-tensor work.'),
    symbols: [
        { sym: '\\tilde{d}(f)', name: t('记录到的数字信号（counts）', 'recorded digital signal (counts)'), unit: 'counts' },
        { sym: '\\tilde{u}(f)', name: t('真实地面运动', 'true ground motion'), unit: 'm/s 或 m' },
        { sym: 'T(f)', name: t('仪器传递函数', 'instrument transfer function'), unit: 'counts/(m/s)' },
        { sym: 'W(f)', name: t('预滤波窗', 'pre-filter window'), unit: '无量纲' },
        { sym: '\\varepsilon', name: t('水稳参数', 'water-level parameter'), unit: '无量纲', typical: '10⁻⁵ – 10⁻³' },
    ],
    conditions: {
        applies: [t('已知仪器零极点响应的任何记录', 'Any record whose pole–zero response is known')],
        assumes: [t('仪器线性、时不变，且响应参数准确', 'The instrument is linear, time-invariant and its response is accurate')],
        breaks: [t('响应元数据错误（常见于台站改造后未更新）会导致系统性偏差', 'Wrong response metadata — common after station upgrades — introduces systematic bias')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('记录是褶积的结果', 'The record is a convolution'),
            latex: String.raw `d(t)=\int h(\tau)\,u(t-\tau)\,\mathrm{d}\tau` },
        { n: 2, op: 'transform', title: t('傅里叶变换后变乘法', 'Fourier transform turns it into multiplication'),
            latex: String.raw `\tilde{d}(f)=H(f)\,\tilde{u}(f)` },
        { n: 3, op: 'algebra', title: t('直接解出 u', 'Solve for u directly'),
            latex: String.raw `\tilde{u}(f)=\tilde{d}(f)/H(f)` },
        { n: 4, op: 'taylor', title: t('加正则化抑制带外噪声', 'Add regularisation to suppress out-of-band noise'),
            latex: String.raw `\tilde{u}(f)=\frac{\tilde{d}(f)H^{*}(f)}{|H(f)|^{2}+\varepsilon^{2}\max|H|^{2}}`,
            note: t('这是 Tikhonov / Wiener 型正则化：|H| 小时分母被 ε 兜住，不会爆炸。', 'This is Tikhonov/Wiener-type regularisation: where |H| is small the ε term catches the denominator and prevents blow-up.') },
        { n: 5, op: 'result', title: t('反变换回时域', 'Transform back to the time domain'),
            latex: String.raw `u(t)=\mathcal{F}^{-1}\!\left\{\tilde{u}(f)\right\}` },
    ],
    links: {
        upstream: [
            { id: 'pole-zero-response', note: t('提供 T(f)', 'Supplies T(f)') },
            { id: 'convolution-theorem', note: t('褶积变乘法的依据', 'Why convolution becomes multiplication') },
        ],
    },
    refs: [{ text: 'Havskov & Alguacil, Instrumentation in Earthquake Seismology, §5' }],
};
export default instrumentDeconvolution;
//# sourceMappingURL=instrument-deconvolution.js.map