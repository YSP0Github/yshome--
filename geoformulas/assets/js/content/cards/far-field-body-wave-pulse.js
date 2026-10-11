import { t } from '../../core/types.js';
/** far-field-body-wave-pulse */
const farFieldBodyWavePulse = {
    id: 'far-field-body-wave-pulse',
    name: t('远场体波位移脉冲', 'Far-field Body-wave Pulse'),
    aliases: { zh: ['远场项', '位移脉冲', '矩率'], en: ['far-field term', 'displacement pulse', 'moment rate'] },
    node: 'S4.1',
    tags: {
        math: ['MATH.DIFF', 'MATH.VECTOR'],
        method: ['METH.TELE'],
        quantity: ['Q.AMP', 'Q.SOURCE'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\mathbf{u}(\mathbf{x},t) = \frac{\mathcal{R}^{P}}{4\pi\rho\alpha^{3}r}\,\dot{M}\!\left(t-\frac{r}{\alpha}\right) + \frac{\mathcal{R}^{S}}{4\pi\rho\beta^{3}r}\,\dot{M}\!\left(t-\frac{r}{\beta}\right)`,
        variants: [
            { name: t('近场与中场项', 'Near- and intermediate-field terms'), latex: String.raw `u \propto \frac{M}{r^{3}} + \frac{\dot{M}}{r^{2}} + \frac{\ddot{M}}{r}` },
            { name: t('远场只保留 1/r 项', 'Only the 1/r term survives in the far field'), latex: String.raw `r \gg \lambda,\ r \gg L \Longrightarrow u \propto \frac{\dot{M}}{r}` },
            { name: t('脉冲宽度与震源持续时间', 'Pulse width and source duration'), latex: String.raw `\text{远场脉冲} = \dot{M}(t)\ \text{，宽度即上升时间}` },
        ],
    },
    meaning: t('远场记录到的位移波形，其实就是震源矩率函数 Ṁ(t) 的复制品 —— 只是被 1/r 几何扩散、辐射花样和介质速度三重整形。这条关系是整个震源反演的基石：从波形反卷积出 Ṁ(t)，积分就得到地震矩 M₀。', 'The displacement waveform recorded in the far field is essentially a copy of the source moment-rate function Ṁ(t), reshaped only by 1/r geometrical spreading, the radiation pattern and the medium velocity. This relation is the foundation of all source inversion: deconvolve Ṁ(t) from the waveform and integrate to obtain the seismic moment M₀.'),
    symbols: [
        { sym: '\\dot{M}(t)', name: t('矩率函数', 'moment-rate function'), unit: 'N·m/s' },
        { sym: '\\mathcal{R}^{P}, \\mathcal{R}^{S}', name: t('辐射花样因子', 'radiation-pattern factors'), unit: '无量纲' },
        { sym: 'r', name: t('震源距', 'hypocentral distance'), unit: 'm' },
        { sym: '\\rho', name: t('密度', 'density'), unit: 'kg/m³' },
        { sym: '\\alpha, \\beta', name: t('P、S 波速度', 'P and S velocities'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('区域与远震距离上的体波波形模拟与反演', 'Body-wave waveform modelling and inversion at regional and teleseismic distances')],
        assumes: [
            t('远场近似成立', 'The far-field approximation holds'),
            t('点源、均匀介质（或已做 Green 函数校正）', 'Point source in a uniform medium (or Green functions corrected)'),
        ],
        breaks: [
            t('近震（r 与震源尺度同量级）时必须保留全部项', 'At local distances the full expression with all terms is required'),
            t('有限断层破裂时点源近似不再成立', 'The point-source approximation fails for finite ruptures'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('写出位移的表示定理', 'Write the representation theorem'),
            latex: String.raw `u_i = M_{jk} * \frac{\partial G_{ij}}{\partial x_k}` },
        { n: 2, op: 'taylor', title: t('按 1/r 的幂次展开', 'Expand in powers of 1/r'),
            latex: String.raw `u \propto \frac{M(t-r/v)}{r^{3}} + \frac{\dot{M}(t-r/v)}{v r^{2}} + \frac{\ddot{M}(t-r/v)}{v^{2} r}` },
        { n: 3, op: 'taylor', title: t('远场只留 1/r', 'Keep only 1/r in the far field'),
            latex: String.raw `r\to\infty:\ u \propto \frac{\ddot{M}}{v^{2}r}` },
        { n: 4, op: 'identity', title: t('对时间积分一次写成矩率', 'Integrate once in time to write it as the moment rate'),
            latex: String.raw `u \propto \frac{\dot{M}}{4\pi\rho v^{3}r}` },
        { n: 5, op: 'result', title: t('加上辐射花样得到完整形式', 'Add the radiation pattern for the complete form'),
            latex: String.raw `u^{P} = \frac{\mathcal{R}^{P}\dot{M}(t-r/\alpha)}{4\pi\rho\alpha^{3}r}` },
    ],
    viz: [
        {
            id: 'far-field-pulse',
            level: 'V2',
            title: t('震源时间函数与远场脉冲', 'Source time function and the far-field pulse'),
            xlabel: t('时间 (s)', 'time (s)'),
            ylabel: t('归一化振幅', 'normalised amplitude'),
            controls: [
                { id: 'tau', label: t('上升时间 τ (s)', 'rise time τ (s)'), min: 0.2, max: 5, step: 0.05, value: 1.5 },
            ],
            note: t('远场波形是矩率函数，也就是震源时间函数的导数 —— 上升时间越短，脉冲越尖锐，高频越丰富。', 'The far-field waveform is the moment-rate function, i.e. the derivative of the source time function: the shorter the rise time, the sharper the pulse and the richer the high frequencies.'),
            compute: (p) => {
                const tau = p['tau'];
                const stf = [];
                const rate = [];
                for (let i = 0; i <= 300; i++) {
                    const tt = (i / 300) * 4 * tau;
                    const x = tt / tau;
                    // 震源时间函数：平滑上升至 1（Brune 型）
                    const s = 1 - (1 + x) * Math.exp(-x);
                    // 矩率 = ds/dt
                    const r = (x / tau) * Math.exp(-x);
                    stf.push([tt, s]);
                    rate.push([tt, r * tau * 2.718]);
                }
                return [
                    { label: t('震源时间函数 s(t)', 'source time function s(t)'), color: '#185FA5', points: stf },
                    { label: t('矩率 Ṁ(t) / 远场脉冲', 'moment rate Ṁ(t) / far-field pulse'), color: '#993C1D', points: rate, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('M_w 7 地震的远场脉冲', 'Far-field pulse of an M_w 7 earthquake'),
        input: t('M₀ = 4×10¹⁹ N·m，τ = 2 s，r = 100 km，α = 6000 m/s，ρ = 2700 kg/m³', 'M₀ = 4×10¹⁹ N·m, τ = 2 s, r = 100 km, α = 6000 m/s, ρ = 2700 kg/m³'),
        steps: [
            t('Ṁ 峰值 ≈ M₀/τ × 0.37 = 7.4×10¹⁸ N·m/s', 'Peak Ṁ ≈ M₀/τ × 0.37 = 7.4×10¹⁸ N·m/s'),
            t('u ≈ Ṁ/(4π ρ α³ r) = 7.4×10¹⁸/(4π×2700×2.16×10¹¹×10⁵) ≈ 1.0×10⁻² m', 'u ≈ Ṁ/(4π ρ α³ r) = 7.4×10¹⁸/(4π×2700×2.16×10¹¹×10⁵) ≈ 1.0×10⁻² m'),
        ],
        output: t('100 km 处约 1 cm 的远场位移 —— 量级与强震观测一致', 'About 1 cm of far-field displacement at 100 km — consistent with strong-motion observations'),
    },
    links: {
        upstream: [
            { id: 'moment-tensor-definition', note: t('矩张量给出 M(t)', 'The moment tensor gives M(t)') },
            { id: 'double-couple-radiation-pattern', note: t('辐射花样因子', 'The radiation-pattern factors') },
        ],
        downstream: [{ id: 'moment-rate-function', note: t('矩率函数本身', 'The moment-rate function itself') }],
        seealso: [{ id: 'brune-source-spectrum', note: t('频域的等价表述', 'The equivalent statement in the frequency domain') }],
    },
    refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.3' }],
};
export default farFieldBodyWavePulse;
//# sourceMappingURL=far-field-body-wave-pulse.js.map