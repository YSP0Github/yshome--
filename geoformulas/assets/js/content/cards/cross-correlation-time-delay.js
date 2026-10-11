import { t } from '../../core/types.js';
/** cross-correlation-time-delay */
const crossCorrelationTimeDelay = {
    id: 'cross-correlation-time-delay',
    name: t('互相关时延估计与亚采样精度', 'Cross-correlation Time-delay Estimation & Sub-sample Precision'),
    aliases: { zh: ['时延估计', '互相关', '亚采样', '抛物线插值'], en: ['time-delay estimation', 'cross correlation', 'sub-sample', 'parabolic interpolation'] },
    node: 'S9.2',
    tags: {
        math: ['MATH.FOURIER', 'MATH.APPROX'],
        method: ['METH.PROC', 'METH.TELE'],
        quantity: ['Q.TIME', 'Q.VEL'],
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\Delta t = \arg\max_{\tau} R_{xy}(\tau),\qquad
R_{xy}(\tau) = \int x(t)\,y(t+\tau)\,\mathrm{d}t`,
        variants: [
            { name: t('抛物线插值求亚采样峰位', 'Parabolic interpolation for the sub-sample peak'), latex: String.raw `\delta = \frac{1}{2}\frac{R_{-1}-R_{+1}}{R_{-1}-2R_0+R_{+1}}\ \Delta t` },
            { name: t('频率域实现（更高效）', 'Frequency-domain implementation (more efficient)'), latex: String.raw `R_{xy}(\tau) = \mathcal{F}^{-1}\left\{X(\omega)\,Y^{*}(\omega)\right\}` },
            { name: t('时延精度受限于信号带宽', 'Delay precision is limited by the signal bandwidth'), latex: String.raw `\sigma_{\Delta t} \approx \frac{1}{2\pi f_{\text{rms}}\sqrt{2\,B\,T\,\mathrm{SNR}}}` },
            { name: t('由两个台站的时延求视速度', 'Apparent velocity from the delay between two stations'), latex: String.raw `v_{\text{app}} = \frac{\Delta x}{\Delta t}` },
        ],
    },
    meaning: t('两个台站记录到同一个震相，它们的到时差携带着波传播方向与速度的信息。估计这个到时差的标准做法是互相关：把两条波形相对滑动，找到最相似的滑动量。相关峰通常落在采样点之间，用抛物线插值可以把精度提高到采样间隔的十分之一甚至更好 —— 这意味着 0.01 s 采样的记录可以给出毫秒级的到时差，足以支撑精细的层析与定位。', 'Two stations recording the same phase: their arrival-time difference carries information about propagation direction and speed. The standard way to estimate it is cross-correlation — slide one waveform against the other and find the shift that makes them most similar. The correlation peak usually falls between samples; parabolic interpolation refines the estimate to a tenth of the sampling interval or better. That means 0.01 s sampling can yield millisecond differential times, sufficient for fine-scale tomography and relocation.'),
    symbols: [
        { sym: 'R_{xy}(\\tau)', name: t('互相关函数', 'cross-correlation function'), unit: '—' },
        { sym: '\\Delta t', name: t('估计出的到时差', 'estimated arrival-time difference'), unit: 's' },
        { sym: '\\delta', name: t('亚采样修正量', 'sub-sample correction'), unit: 's' },
        { sym: 'f_{\\text{rms}}', name: t('信号的均方根频率', 'root-mean-square frequency of the signal'), unit: 'Hz' },
        { sym: 'B', name: t('带宽', 'bandwidth'), unit: 'Hz' },
    ],
    conditions: {
        applies: [t('双差定位、面波频散测量、噪声互相关的到时标定', 'Double-difference relocation, surface-wave dispersion measurement, timing calibration of noise cross-correlations')],
        assumes: [t('两个波形形状相近（同源、传播路径相近）', 'The two waveforms have similar shape (same source, similar path)')],
        breaks: [t('波形差异过大（周期跳跃）时会出现半个周期的偏差', 'Large waveform differences cause cycle skips of half a period'), t('噪声互相关时到时差受噪声源分布影响', 'For noise cross-correlations the delay is affected by the noise-source distribution')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('设 y(t) = x(t − Δt)', 'Let y(t) = x(t − Δt)'), latex: String.raw `y(t) = x(t-\Delta t)` },
        { n: 2, op: 'identity', title: t('互相关在 τ = Δt 处取最大', 'The cross-correlation is maximal at τ = Δt'), latex: String.raw `R_{xy}(\tau) = \int x(t)y(t+\tau)\,\mathrm{d}t = R_{xx}(\tau-\Delta t)` },
        { n: 3, op: 'transform', title: t('自相关在零延迟处最大，故峰位即 Δt', 'Autocorrelation peaks at zero lag, so the peak position is Δt'), latex: String.raw `\arg\max R_{xx}(\tau-\Delta t) = \Delta t` },
        { n: 4, op: 'taylor', title: t('峰附近用三点抛物线拟合', 'Fit a three-point parabola near the peak'), latex: String.raw `R(\tau) \approx R_0 + b\tau + c\tau^{2}` },
        { n: 5, op: 'result', title: t('极值位置给出亚采样修正', 'The extremum position gives the sub-sample correction'), latex: String.raw `\delta = \frac{1}{2}\frac{R_{-1}-R_{+1}}{R_{-1}-2R_0+R_{+1}}\Delta t` },
    ],
    viz: [
        {
            id: 'cc-peak',
            level: 'V2',
            title: t('互相关峰与抛物线插值', 'Cross-correlation peak and parabolic interpolation'),
            xlabel: t('延迟 τ (s)', 'lag τ (s)'),
            ylabel: t('R_xy', 'R_xy'),
            controls: [
                { id: 'dt0', label: t('真实到时差 (s)', 'true delay (s)'), min: -1, max: 1, step: 0.01, value: 0.37 },
                { id: 'dts', label: t('采样间隔 Δt (s)', 'sampling interval Δt (s)'), min: 0.005, max: 0.2, step: 0.005, value: 0.05 },
                { id: 'fw', label: t('子波主频 (Hz)', 'wavelet dominant frequency (Hz)'), min: 0.5, max: 10, step: 0.1, value: 3 },
                { id: 'snr', label: t('信噪比', 'signal-to-noise ratio'), min: 0.5, max: 50, step: 0.5, value: 12 },
            ],
            note: t('红色竖线是真实到时差，蓝色是采样点上的相关值，虚线是抛物线插值得到的峰位。注意插值结果几乎总比最近的采样点更接近真值 —— 这就是亚采样精度的来源。降低信噪比会让峰位抖动。', 'The red line is the true delay, blue dots are correlation values at sample lags, and the dashed line is the parabolic interpolated peak. Note the interpolated result is almost always closer to the true value than the nearest sample — the source of sub-sample precision. Lowering the SNR makes the peak jitter.'),
            compute: (p) => {
                const dt0 = p['dt0'], dts = p['dts'], fw = p['fw'], snr = p['snr'];
                let seed = 999;
                const rnd = () => {
                    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
                    return (seed / 0x7fffffff) * 2 - 1;
                };
                const gauss = (tt) => Math.exp(-((tt * tt * fw * fw) / 0.18)) * Math.cos(2 * Math.PI * fw * tt);
                const R = (tau) => {
                    let s = 0;
                    for (let k = -200; k <= 200; k++) {
                        const tt = k * dts * 0.1;
                        s += gauss(tt) * gauss(tt - (tau - dt0)) * dts * 0.1;
                    }
                    return s + (rnd() * 0.004) / snr;
                };
                const pts = [];
                for (let i = -60; i <= 60; i++) {
                    const tau = i * dts;
                    pts.push([tau, R(tau)]);
                }
                // 找峰并插值
                let bi = 0;
                for (let i = 1; i < pts.length; i++)
                    if (pts[i][1] > pts[bi][1])
                        bi = i;
                const Rm = pts[bi - 1]?.[1] ?? 0, R0 = pts[bi][1], Rp = pts[bi + 1]?.[1] ?? 0;
                const den = Rm - 2 * R0 + Rp;
                const delta = Math.abs(den) > 1e-15 ? 0.5 * ((Rm - Rp) / den) * dts : 0;
                const est = pts[bi][0] + delta;
                return [
                    { label: t('互相关（采样点）', 'cross-correlation (samples)'), color: '#185FA5', points: pts },
                    { label: t('插值峰位 ' + est.toFixed(4) + ' s', 'interpolated peak ' + est.toFixed(4) + ' s'), color: '#993C1D', points: [[est, -0.05 * R0], [est, 1.1 * R0]] },
                    { label: t('真值 ' + dt0.toFixed(4) + ' s', 'truth ' + dt0.toFixed(4) + ' s'), color: '#0F6E56', points: [[dt0, -0.05 * R0], [dt0, 1.1 * R0]] },
                ];
            },
        },
    ],
    example: {
        title: t('亚采样插值收益', 'Gain from sub-sample interpolation'),
        input: t('Δt = 0.05 s，真实到时差 0.37 s', 'Δt = 0.05 s, true delay 0.37 s'),
        steps: [
            t('最近采样点在 0.35 s，误差 0.02 s', 'The nearest sample is at 0.35 s, an error of 0.02 s'),
            t('抛物线插值给出 0.368 s，误差 0.002 s', 'Parabolic interpolation gives 0.368 s, an error of 0.002 s'),
        ],
        output: t('精度提高约一个数量级', 'Precision improves by about one order of magnitude'),
    },
    links: {
        upstream: [{ id: 'cross-correlation', note: t('互相关的定义与性质', 'Definition and properties of cross-correlation') }],
        downstream: [
            { id: 'matched-filter-detection', note: t('模板检测用同一运算', 'Template detection uses the same operation') },
            { id: 'array-beamforming', note: t('到时差是聚束的输入', 'Delays are the input to beamforming') },
        ],
        seealso: [{ id: 'error-propagation', note: t('到时误差如何传到速度模型', 'How timing errors propagate into the velocity model') }],
    },
    refs: [{ text: 'Cespedes et al. (1995), Time-delay estimation using cross-correlation, J. Acoust. Soc. Am. 97, 1885' }],
};
export default crossCorrelationTimeDelay;
//# sourceMappingURL=cross-correlation-time-delay.js.map