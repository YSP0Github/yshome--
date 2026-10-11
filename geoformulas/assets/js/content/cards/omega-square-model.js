import { t } from '../../core/types.js';
/** omega-square-model */
const omegaSquareModel = {
    id: 'omega-square-model',
    name: t('ω² 震源谱模型', 'The ω² Source Spectral Model'),
    aliases: { zh: ['ω平方模型', 'Brune 谱', '拐角频率'], en: ['omega-squared model', 'Brune spectrum', 'corner frequency'] },
    node: 'S4.3',
    tags: {
        math: ['MATH.FOURIER', 'MATH.APPROX'],
        method: ['METH.TELE'],
        quantity: ['Q.SOURCE', 'Q.FREQ'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `|\dot{M}(\omega)| = \frac{M_{0}}{1 + \left(\omega/\omega_{c}\right)^{2}}`,
        variants: [
            { name: t('高频渐近：ω⁻² 衰减', 'High-frequency asymptote: ω⁻² decay'), latex: String.raw `|\dot{M}| \to M_0\left(\frac{\omega_c}{\omega}\right)^{2},\qquad \omega \gg \omega_c` },
            { name: t('低频极限等于地震矩', 'Low-frequency limit equals the seismic moment'), latex: String.raw `\lim_{\omega\to 0}|\dot{M}(\omega)| = M_0` },
            { name: t('Boatwright 型（拐角更尖锐）', 'Boatwright type (sharper corner)'), latex: String.raw `|\dot{M}(\omega)| = \frac{M_0}{\left[1+\left(\omega/\omega_c\right)^{4}\right]^{1/2}}` },
        ],
    },
    meaning: t('绝大多数地震的震源谱都有同一个形状：低频一段平台（高度就是地震矩），过了拐角频率之后按 ω⁻² 衰减。「ω²」这个名字就来自这段高频斜率。它是几乎所有震源谱反演、应力降估计与强地面运动模拟的默认假设。', 'Almost all earthquake source spectra share the same shape: a low-frequency plateau whose height is the seismic moment, then an ω⁻² decay above the corner frequency. The name ω² comes from that high-frequency slope. It is the default assumption in nearly all source spectral inversion, stress-drop estimation and strong-motion simulation.'),
    symbols: [
        { sym: '\\dot{M}(\\omega)', name: t('矩率谱', 'moment-rate spectrum'), unit: 'N·m' },
        { sym: 'M_{0}', name: t('地震矩（谱平台高度）', 'seismic moment (plateau level)'), unit: 'N·m' },
        { sym: '\\omega_{c}', name: t('拐角角频率 2π f_c', 'corner angular frequency 2π f_c'), unit: 'rad/s' },
        { sym: 'f_{c}', name: t('拐角频率', 'corner frequency'), unit: 'Hz', typical: '0.05 – 10' },
    ],
    conditions: {
        applies: [t('震源谱反演、应力降估计、强地面运动模拟', 'Source spectral inversion, stress-drop estimation, strong-motion simulation')],
        assumes: [
            t('点源、单一拐角频率', 'Point source with a single corner frequency'),
            t('传播效应（Q、几何扩散、场地）已校正', 'Propagation effects (Q, geometrical spreading, site) are corrected'),
        ],
        breaks: [
            t('大地震常出现第二个拐角频率，单一 ω² 不够', 'Large earthquakes often show a second corner frequency; a single ω² is insufficient'),
            t('高频段常被衰减与场地效应污染，斜率测不准', 'The high-frequency slope is often contaminated by attenuation and site effects'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('要求谱满足两个极限', 'Require the spectrum to satisfy two limits'),
            latex: String.raw `\omega\to 0:\ |\dot{M}| \to M_0,\qquad \omega\to\infty:\ |\dot{M}| \propto \omega^{-2}` },
        { n: 2, op: 'algebra', title: t('构造最简单的有理函数', 'Construct the simplest rational function'),
            latex: String.raw `|\dot{M}(\omega)| = \frac{M_0}{1+(\omega/\omega_c)^{2}}` },
        { n: 3, op: 'identity', title: t('验证高频行为', 'Verify the high-frequency behaviour'),
            latex: String.raw `\omega\gg\omega_c:\ |\dot{M}| \approx M_0\frac{\omega_c^{2}}{\omega^{2}}` },
        { n: 4, op: 'identity', title: t('双对数坐标上两条渐近线的交点', 'The two asymptotes meet on a log-log plot'),
            latex: String.raw `\omega = \omega_c\ \text{处}\ |\dot{M}| = \frac{M_0}{2}\ (\text{下降 6 dB})` },
        { n: 5, op: 'result', title: t('更尖锐的拐角用更高阶模型', 'A sharper corner needs a higher-order model'),
            latex: String.raw `|\dot{M}| = \frac{M_0}{[1+(\omega/\omega_c)^{4}]^{1/2}}\ \text{(Boatwright)}` },
    ],
    viz: [
        {
            id: 'source-spectrum',
            level: 'V2',
            title: t('Brune 谱与 Boatwright 谱', 'Brune and Boatwright spectra'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('log₁₀ |Ṁ(f)| (N·m)', 'log₁₀ |Ṁ(f)| (N·m)'),
            xScale: 'log',
            controls: [
                { id: 'lm0', label: t('log₁₀ M₀ (N·m)', 'log₁₀ M₀ (N·m)'), min: 12, max: 22, step: 0.1, value: 18 },
                { id: 'fc', label: t('拐角频率 f_c (Hz)', 'corner frequency f_c (Hz)'), min: 0.05, max: 5, step: 0.01, value: 0.5 },
            ],
            note: t('两条曲线在低频完全重合，只在拐角附近分道扬镳 —— 高频数据的质量决定了能否区分它们。', 'The two curves coincide at low frequency and part only near the corner — the quality of high-frequency data determines whether they can be told apart.'),
            compute: (p) => {
                const lm0 = p['lm0'], fc = p['fc'];
                const br = [];
                const bo = [];
                for (let i = 0; i <= 240; i++) {
                    const f = Math.pow(10, -2 + (i / 240) * 4);
                    const r = f / fc;
                    br.push([f, lm0 - Math.log10(1 + r * r)]);
                    bo.push([f, lm0 - 0.5 * Math.log10(1 + r ** 4)]);
                }
                return [
                    { label: t('Brune（ω²）', 'Brune (ω²)'), color: '#185FA5', points: br },
                    { label: t('Boatwright', 'Boatwright'), color: '#993C1D', points: bo, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('M_w 6 地震的拐角频率', 'Corner frequency of an M_w 6 earthquake'),
        input: t('M₀ = 1×10¹⁸ N·m，Δσ = 3 MPa，β = 3.5 km/s', 'M₀ = 1×10¹⁸ N·m, Δσ = 3 MPa, β = 3.5 km/s'),
        steps: [
            t('f_c = 0.49 × 3500 × (3×10⁶/10¹⁸)^{1/3} = 0.49×3500×1.44×10⁻⁴ = 0.247 Hz', 'f_c = 0.49 × 3500 × (3×10⁶/10¹⁸)^{1/3} = 0.49×3500×1.44×10⁻⁴ = 0.247 Hz'),
            t('谱平台 |Ṁ| = 10¹⁸ N·m，f > 0.25 Hz 后按 f⁻² 衰减', 'Plateau |Ṁ| = 10¹⁸ N·m, decaying as f⁻² above 0.25 Hz'),
        ],
        output: t('拐角频率约 0.25 Hz，对应约 4 s 的震源持续时间', 'A corner frequency near 0.25 Hz, corresponding to about 4 s of source duration'),
    },
    links: {
        upstream: [{ id: 'moment-rate-function', note: t('时间域的对应量', 'Its time-domain counterpart') }],
        downstream: [{ id: 'corner-frequency-source-dimension', note: t('拐角频率与震源尺度', 'Corner frequency and source dimension') }],
        seealso: [{ id: 'brune-source-spectrum', note: t('Brune 模型的具体形式', 'The specific Brune form') }],
    },
    refs: [{ text: 'Brune, J. N. (1970). Tectonic stress and the spectra of seismic shear waves. J. Geophys. Res., 75, 4997–5009' }],
};
export default omegaSquareModel;
//# sourceMappingURL=omega-square-model.js.map