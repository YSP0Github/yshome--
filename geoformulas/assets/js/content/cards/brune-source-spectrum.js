import { t } from '../../core/types.js';
/** brune-source-spectrum */
const bruneSourceSpectrum = {
    id: 'brune-source-spectrum',
    name: t('Brune ω² 震源谱模型', "The Brune ω² Source Spectrum"),
    aliases: { zh: ['震源谱', '拐角频率', 'Brune'], en: ['source spectrum', 'corner frequency', 'Brune', 'omega-squared'] },
    node: 'S4.3',
    tags: {
        math: ['MATH.FOURIER'],
        method: ['METH.TELE'],
        quantity: ['Q.FREQ', 'Q.AMP'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\Omega(f)=\frac{\Omega_{0}}{1+\left(f/f_{c}\right)^{2}}`,
        variants: [
            { name: t('低频平台（正比于地震矩）', 'Low-frequency plateau (∝ seismic moment)'), latex: String.raw `\Omega_{0}=\frac{M_{0}}{4\pi\rho\beta^{3}}\cdot\frac{R_{\theta\varphi}}{R}` },
            { name: t('拐角频率与震源尺度', 'Corner frequency and source size'), latex: String.raw `f_{c}=0.49\,\beta\left(\frac{\Delta\sigma}{M_{0}}\right)^{1/3}` },
            { name: t('圆裂纹模型的等效半径', 'Equivalent radius of the circular crack'), latex: String.raw `r=\left(\frac{7M_{0}}{16\Delta\sigma}\right)^{1/3}` },
        ],
    },
    meaning: t('为什么叫 ω²：低频段是平的一段（高度 ∝ M₀，这就是用频谱测地震矩的原理），超过拐角频率 f_c 之后以 f⁻² 衰减。f_c 与震源尺寸成反比 —— 小地震「脆」，大地震「闷」。', "Why ω²: the spectrum is flat at low frequency with a level proportional to M₀ — that is how we measure moment from spectra — and rolls off as f⁻² beyond the corner frequency. Since f_c scales inversely with source size, small quakes sound crisp and large ones sound muffled."),
    symbols: [
        { sym: '\\Omega(f)', name: t('远场位移振幅谱', 'far-field displacement amplitude spectrum'), unit: 'm·s' },
        { sym: '\\Omega_0', name: t('低频平台高度', 'low-frequency plateau level'), unit: 'm·s' },
        { sym: 'f_c', name: t('拐角频率', 'corner frequency'), unit: 'Hz', typical: '0.1 – 30 Hz' },
        { sym: '\\Delta\\sigma', name: t('应力降', 'stress drop'), unit: 'Pa', typical: '0.1 – 10 MPa' },
        { sym: 'M_0', name: t('地震矩', 'seismic moment'), unit: 'N·m' },
        { sym: '\\beta', name: t('S 波速度', 'S-wave velocity'), unit: 'm/s' },
        { sym: 'r', name: t('等效圆形破裂半径', 'equivalent circular rupture radius'), unit: 'm' },
    ],
    conditions: {
        applies: [t('远场位移 / 加速度谱的形状分析', 'Shape analysis of far-field displacement / acceleration spectra')],
        assumes: [
            t('圆形裂纹突然破裂，应力降瞬时完成', 'Instantaneous rupture of a circular crack'),
            t('忽略传播路径 Q 衰减与场地效应（或先校正掉）', 'Path attenuation and site effects are negligible or already corrected'),
        ],
        breaks: [
            t('大地震的破裂方向与持续时间会引入方向性效应，单一 f_c 不够', 'Large ruptures show directivity and finite duration; a single f_c is insufficient'),
            t('近场强震记录需另行考虑破裂方向与有限断层效应', 'Near-field strong-motion records need separate treatment for directivity and finite-fault effects'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('远场位移正比于矩率', 'Far-field displacement is proportional to moment rate'),
            latex: String.raw `u^{FF}(t)\propto\frac{1}{4\pi\rho\beta^{3}R}\,\dot{M}_{0}(t-\tfrac{R}{\beta})\;\Longrightarrow\;\Omega(f)\propto\frac{\dot{M}_{0}(f)}{4\pi\rho\beta^{3}}` },
        { n: 2, op: 'setup', title: t('设震源时间函数为一阶衰减', 'Assume a first-order decaying source time function'),
            latex: String.raw `\dot{M}_{0}(t)=M_{0}\,\frac{1}{\tau}e^{-t/\tau}H(t)` },
        { n: 3, op: 'transform', title: t('做 Fourier 变换', 'Take the Fourier transform'),
            latex: String.raw `\dot{M}_{0}(f)=\frac{M_{0}}{1+i2\pi f\tau}` },
        { n: 4, op: 'algebra', title: t('取模', 'Take the modulus'),
            latex: String.raw `|\Omega(f)|=\frac{M_{0}}{4\pi\rho\beta^{3}}\cdot\frac{1}{\sqrt{1+(2\pi f\tau)^{2}}}` },
        { n: 5, op: 'result', title: t('令 f_c = 1/(2πτ) 得到标准形式', 'With f_c = 1/(2πτ) we get the standard form'),
            latex: String.raw `\Omega(f)=\frac{\Omega_{0}}{1+\left(f/f_{c}\right)^{2}}\quad\text{（严格来说开方形式更精确，两者在 } f\gg f_c \text{ 时同阶）}` },
        { n: 6, op: 'identity', title: t('用 Brune 的常数把 f_c 写成 Δσ 与 M₀', "Brune's constant ties f_c to Δσ and M₀"),
            latex: String.raw `r=\left(\frac{7M_{0}}{16\Delta\sigma}\right)^{1/3},\qquad f_{c}=\frac{2.34}{2\pi}\frac{\beta}{r}=0.49\,\beta\left(\frac{\Delta\sigma}{M_{0}}\right)^{1/3}`,
            note: t('注意量纲自洽要求：β 用 m/s，M₀ 用 N·m，Δσ 用 Pa。（若 β 写成 km/s，公式常数要改成 4.9×10⁶。）', 'Mind the units: β in m/s, M₀ in N·m, Δσ in Pa gives 0.49. Using km/s demands the constant 4.9×10⁶.') },
    ],
    viz: [
        {
            id: 'brune-spectra',
            level: 'V1',
            title: t('应力降如何左右谱的形状（双对数）', 'How stress drop shapes the spectrum (log–log)'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('归一化位移谱 Ω(f)/Ω₀', 'normalised spectrum Ω(f)/Ω₀'),
            xScale: 'log',
            yScale: 'log',
            controls: [
                { id: 'mw', label: t('矩震级 Mw', 'moment magnitude Mw'), min: 1, max: 7, step: 0.1, value: 4.0 },
                { id: 'dsigma', label: t('应力降 Δσ', 'stress drop Δσ'), min: 0.01, max: 10, step: 0.01, value: 1.0, unit: 'MPa' },
                { id: 'beta2', label: t('S 波速度 β', 'S-wave velocity β'), min: 2000, max: 4500, step: 50, value: 3500, unit: 'm/s' },
            ],
            xRange: [0.01, 1000],
            note: t('固定 Δσ 增大 Mw：拐角频率向左移（震源变大声音变闷）。固定 Mw 增大 Δσ：拐角频率向右移。野外反演做的是后者的逆运算。', 'Increasing Mw at fixed Δσ moves f_c left (bigger source, duller sound). Increasing Δσ at fixed Mw moves it right. Field inversion runs this backwards.'),
            compute: (p) => {
                const mw = p['mw'], dsMPa = p['dsigma'], beta = p['beta2'];
                const M0 = Math.pow(10, 1.5 * mw + 9.1);
                const ds = dsMPa * 1e6;
                const fc = 0.49 * beta * Math.cbrt(ds / M0);
                const pts = [];
                for (let i = 0; i <= 400; i++) {
                    const f = Math.pow(10, -2 + (i / 400) * 5);
                    pts.push([f, 1 / (1 + Math.pow(f / fc, 2))]);
                }
                const r = Math.cbrt((7 * M0) / (16 * ds));
                const label = t(`f_c = ${fc.toExponential(2)} Hz，r = ${(r / 1000).toFixed(2)} km`, `f_c = ${fc.toExponential(2)} Hz, r = ${(r / 1000).toFixed(2)} km`);
                return [{ label, color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('一个 Mw 4 的地方性地震', 'A local Mw 4 earthquake'),
        input: t('Mw = 4.0，Δσ = 1 MPa，β = 3500 m/s', 'Mw = 4.0, Δσ = 1 MPa, β = 3500 m/s'),
        steps: [
            t('M₀ = 10^(6+9.1) = 1.26×10¹⁵ N·m', 'M₀ = 10^(6+9.1) = 1.26×10¹⁵ N·m'),
            t('f_c = 0.49 × 3500 × (10⁶/1.26×10¹⁵)^{1/3} = 1.58 Hz', 'f_c = 0.49 × 3500 × (10⁶/1.26×10¹⁵)^{1/3} = 1.58 Hz'),
            t('r = (7×1.26×10¹⁵/(16×10⁶))^{1/3} ≈ 820 m', 'r = (7×1.26×10¹⁵/(16×10⁶))^{1/3} ≈ 820 m'),
        ],
        output: t('几百米的破裂尺度，对应几 Hz 的地震图谱峰值', 'A rupture of several hundred metres, matching observed spectral peaks of a few Hz'),
    },
    links: {
        upstream: [
            { id: 'mw-moment-magnitude', note: t('M₀ 确定低频平台高度', 'M₀ fixes the low-frequency level') },
            { id: 'fourier-transform' },
        ],
    },
    refs: [
        { text: 'Brune (1970), JGR 75, 4997–5009' },
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §9.4' },
    ],
};
export default bruneSourceSpectrum;
//# sourceMappingURL=brune-source-spectrum.js.map