import { t } from '../../core/types.js';
/** counts-to-ground-motion */
const countsToGroundMotion = {
    id: 'counts-to-ground-motion',
    name: t('数字计数到地动物理量的换算', 'Converting Digital Counts to Ground Motion'),
    aliases: { zh: ['计数换算', '灵敏度', 'counts 转 m/s'], en: ['counts conversion', 'sensitivity', 'counts to m/s'] },
    node: 'S8.2',
    tags: {
        math: ['MATH.COMPLEX', 'MATH.FOURIER'],
        method: ['METH.INSTR', 'METH.PROC'],
        quantity: ['Q.AMP'],
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `U(\omega) = \frac{C(\omega)\cdot V_{\text{LSB}}}{G(\omega)},\qquad
G(\omega) = S_d\,\frac{\prod_k (i\omega - z_k)}{\prod_j (i\omega - p_j)}\,(i\omega)^{n_u}`,
        variants: [
            { name: t('灵敏度（每个物理单位的计数）', 'Sensitivity (counts per physical unit)'), latex: String.raw `S_d = \frac{\text{counts}}{\text{m/s}}\ \text{或}\ \frac{\text{counts}}{\text{m/s}^2}\ \text{或}\ \frac{\text{counts}}{\text{m}}` },
            { name: t('与位移/加速度的互换', 'Converting between displacement, velocity and acceleration'), latex: String.raw `A(\omega) = i\omega\,V(\omega) = -\omega^{2}\,U(\omega)` },
            { name: t('分贝表示', 'Decibel representation'), latex: String.raw `G_{\text{dB}} = 20\log_{10}|G(\omega)|` },
            { name: t('归一化到 1 Hz 的常数项', 'The constant term normalised to 1 Hz'), latex: String.raw `A_0 = \frac{S_d}{\left|\dfrac{\prod(i\omega-z_k)}{\prod(i\omega-p_j)}\right|_{\omega = 2\pi}}` },
        ],
    },
    meaning: t('数字地震计输出的只是一个整数序列（counts），要变成「地面动了多快/多远」，必须除以仪器的复频响应。这个响应在 SEED 标准里用「归一化常数 A₀ + 零极点列表」表示，除以它（并乘上计数的电压步长）就得到物理量。忘了这一步，所有振幅相关的分析 —— 震级、Q、谱比、地震动参数 —— 全部都是错的。', 'A digital seismometer outputs only a sequence of integers (counts). To obtain "how fast / how far the ground moved" the record must be divided by the instrument\'s complex frequency response. In the SEED standard that response is stored as a normalisation constant A₀ plus a pole–zero list; dividing by it (and multiplying by the count-to-voltage step) yields physical units. Skip this step and every amplitude-dependent analysis — magnitude, Q, spectral ratios, ground-motion parameters — is simply wrong.'),
    symbols: [
        { sym: 'C(\\omega)', name: t('记录的频谱（counts）', 'spectrum of the record (counts)'), unit: 'counts·s' },
        { sym: 'V_{\\text{LSB}}', name: t('一个计数对应的电压', 'voltage corresponding to one count'), unit: 'V/count' },
        { sym: 'G(\\omega)', name: t('仪器复频响应', 'instrument complex response'), unit: 'counts/(m/s)' },
        { sym: 'S_d', name: t('仪器灵敏度', 'instrument sensitivity'), unit: 'counts/(m/s)' },
        { sym: 'z_k, p_j', name: t('零点与极点', 'zeros and poles'), unit: 'rad/s' },
        { sym: 'n_u', name: t('输出量类型（0=位移, 1=速度, 2=加速度）', 'output-unit index (0 displacement, 1 velocity, 2 acceleration)'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('任何需要绝对振幅的处理：震级、Q、谱比、GMPE 校验', 'Any processing needing absolute amplitudes: magnitude, Q, spectral ratios, GMPE validation')],
        assumes: [t('响应文件（RESP / dataless SEED）正确且与该时段匹配', 'The response file (RESP / dataless SEED) is correct and matches the time window')],
        breaks: [t('仪器更换或参数漂移后旧响应文件失效', 'Old response files become invalid after instrument swaps or parameter drift')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('记录是地动与仪器响应的卷积', 'The record is the convolution of ground motion with the instrument response'), latex: String.raw `C(t) = S_d\,(g * h)(t)` },
        { n: 2, op: 'transform', title: t('变换到频率域变成乘积', 'Transform to the frequency domain, where it becomes a product'), latex: String.raw `C(\omega) = S_d\,H(\omega)\,U(\omega)` },
        { n: 3, op: 'identity', title: t('H(ω) 用零极点表示', 'Express H(ω) with poles and zeros'), latex: String.raw `H(\omega) = \frac{\prod_k (i\omega-z_k)}{\prod_j (i\omega-p_j)}` },
        { n: 4, op: 'algebra', title: t('解出地动', 'Solve for the ground motion'), latex: String.raw `U(\omega) = \frac{C(\omega)}{S_d\,H(\omega)}` },
        { n: 5, op: 'result', title: t('若要加速度，再乘 (iω)²', 'For acceleration, multiply by (iω)²'), latex: String.raw `A(\omega) = -\omega^{2}U(\omega)` },
    ],
    viz: [
        {
            id: 'resp-curve',
            level: 'V2',
            title: t('典型宽频带速度计的幅频响应', 'Amplitude response of a typical broadband velocity seismometer'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('|G| (dB, 相对峰值)', '|G| (dB relative to peak)'),
            controls: [
                { id: 'f0', label: t('低频拐角 f₀ (Hz)', 'low-frequency corner f₀ (Hz)'), min: 0.001, max: 0.1, step: 0.001, value: 0.008 },
                { id: 'n', label: t('高通阶数', 'high-pass order'), min: 1, max: 5, step: 1, value: 3 },
                { id: 'damp', label: t('阻尼 h', 'damping h'), min: 0.4, max: 1.4, step: 0.02, value: 0.707 },
            ],
            note: t('通带（两条拐角之间）响应平坦，这是唯一能直接读振幅的频段；低频端以 f^n 衰减、高频端以 f^−2 衰减。阻尼 h = 0.707 时通带最平坦，h 偏小会在高频拐角处出现一个鼓包。', 'The passband (between the two corners) is flat — the only band where amplitudes can be read directly; the response falls as f^n at low frequency and f^−2 at high frequency. Damping h = 0.707 gives the flattest passband; smaller h creates a bulge at the high-frequency corner.'),
            compute: (p) => {
                const f0 = p['f0'], n = Math.round(p['n']), h = p['damp'];
                const fh = 20; // 高频（低通）拐角
                const H = (f) => {
                    const w = 2 * Math.PI * f;
                    const w0 = 2 * Math.PI * f0;
                    const wh = 2 * Math.PI * fh;
                    // 高通部分
                    const hp = Math.pow(w / Math.sqrt(w * w + w0 * w0), n);
                    // 低通二阶
                    const den = Math.sqrt((1 - (w / wh) * (w / wh)) ** 2 + (2 * h * w / wh) ** 2);
                    const lp = den > 1e-12 ? 1 / den : 0;
                    return hp * lp;
                };
                let mx = 0;
                const pts = [];
                for (let i = 0; i <= 400; i++) {
                    const lf = -3 + (i / 400) * 5; // log10 f from -3 to 2
                    const f = Math.pow(10, lf);
                    const v = H(f);
                    if (Number.isFinite(v) && v > mx)
                        mx = v;
                    pts.push([f, v]);
                }
                return [{ label: t('|G(f)|', '|G(f)|'), color: '#185FA5', points: pts.map(([f, v]) => [f, 20 * Math.log10(Math.max(v, 1e-12) / mx)]) }];
            },
        },
    ],
    example: {
        title: t('把 1000 counts 换算成速度', 'Converting 1000 counts into velocity'),
        input: t('灵敏度 S_d = 1.5×10⁹ counts/(m/s)，V_LSB 已含在 S_d 中，位于通带内', 'Sensitivity S_d = 1.5×10⁹ counts/(m/s), V_LSB already folded in, in the passband'),
        steps: [
            t('在通带内 |G| = S_d，故 U = C / S_d', 'In the passband |G| = S_d, so U = C / S_d'),
            t('U = 1000 / (1.5×10⁹) = 6.7×10⁻⁷ m/s', 'U = 1000 / (1.5×10⁹) = 6.7×10⁻⁷ m/s'),
        ],
        output: t('地面运动速度约 0.67 µm/s', 'Ground velocity about 0.67 µm/s'),
    },
    links: {
        upstream: [
            { id: 'pole-zero-response', note: t('零极点是响应的标准表示', 'Poles and zeros are the standard representation') },
            { id: 'seismometer-equation', note: t('响应来自摆的运动方程', 'The response follows from the pendulum equation of motion') },
        ],
        downstream: [{ id: 'instrument-deconvolution', note: t('完整去卷积还要处理相位与水', 'Full deconvolution also handles phase and the water level') }],
        seealso: [{ id: 'fourier-transform-pair', note: t('换算在频率域完成', 'The conversion happens in the frequency domain') }],
    },
    refs: [{ text: 'SEED Reference Manual, SEED Format Version 2.4, Ch. 3 (response representation)' }],
};
export default countsToGroundMotion;
//# sourceMappingURL=counts-to-ground-motion.js.map