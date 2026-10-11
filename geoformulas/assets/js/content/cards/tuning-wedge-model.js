import { t } from '../../core/types.js';
/** tuning-wedge-model */
const tuningWedgeModel = {
    id: 'tuning-wedge-model',
    name: t('楔形体模型与调谐振幅', 'Wedge Model & Tuning Amplitude'),
    aliases: { zh: ['楔形体', '调谐厚度', '振幅调谐'], en: ['wedge model', 'tuning thickness', 'amplitude tuning'] },
    node: 'S3.6',
    tags: {
        math: ['MATH.FOURIER', 'MATH.ALGEBRA'],
        method: ['METH.EXPL'],
        quantity: ['Q.AMP', 'Q.GEOM'],
    },
    audience: 'bachelor',
    complete: 'L4',
    statement: {
        main: String.raw `|A| = 2r\left|\sin\!\left(\pi f\,\Delta t\right)\right|,\qquad \Delta t = \frac{2\,\Delta z}{v}`,
        variants: [
            { name: t('调谐厚度（振幅极大）', 'Tuning thickness (amplitude maximum)'), latex: String.raw `\Delta t = \frac{1}{2f} \Longrightarrow \Delta z_{\text{tune}} = \frac{v}{4f} = \frac{\lambda}{4}` },
            { name: t('厚度趋于零时的线性区', 'Linear regime as thickness goes to zero'), latex: String.raw `\Delta z \ll \frac{\lambda}{8}:\ |A| \approx 2\pi r f\,\Delta t \propto \Delta z` },
            { name: t('厚层极限', 'Thick-bed limit'), latex: String.raw `\Delta z \gg \frac{\lambda}{2}:\ |A| \to 2r\ (\text{顶底完全分开})` },
        ],
    },
    meaning: t('楔形体是理解薄层的经典模型。地层从厚变薄时，顶底反射先分离、再靠近、最后叠加。在 λ/4 处叠加最强（调谐），再薄下去振幅反而线性减小。所以「亮点」不一定是厚储层，也可能是恰好调谐的薄层 —— 这是地震解释中最经典的陷阱之一。', 'The wedge model is the classic way to understand thin beds. As a bed thins, its top and base reflections first separate, then approach, then merge. At λ/4 the superposition is strongest (tuning); below that the amplitude decreases linearly. A bright spot therefore need not be a thick reservoir — it may simply be a thin bed at tuning, one of the classic traps in seismic interpretation.'),
    symbols: [
        { sym: 'A', name: t('复合反射振幅', 'composite reflection amplitude'), unit: '无量纲' },
        { sym: 'r', name: t('单个界面的反射系数', 'reflection coefficient of one interface'), unit: '无量纲' },
        { sym: '\\Delta t', name: t('顶底反射的双程时间差', 'two-way time separation of top and base'), unit: 's' },
        { sym: '\\Delta z', name: t('地层厚度', 'bed thickness'), unit: 'm' },
        { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz' },
    ],
    conditions: {
        applies: [t('薄储层厚度预测与调谐校正', 'Thin-reservoir thickness prediction and tuning correction')],
        assumes: [
            t('顶底反射系数等大反号（+r, −r）', 'Top and base reflectivities are equal and opposite (+r, −r)'),
            t('零相位子波、常速、无多次波', 'Zero-phase wavelet, constant velocity, no multiples'),
        ],
        breaks: [
            t('顶底反射系数同号时调谐条件完全不同', 'If the two reflectivities have the same sign the tuning condition differs entirely'),
            t('子波非零相位时峰值位置发生偏移', 'Non-zero-phase wavelets shift the peak position'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('顶底两个反射的合成', 'Superpose the top and base reflections'),
            latex: String.raw `A(\omega) = r - r\,e^{-i\omega\Delta t} = r\left(1-e^{-i\omega\Delta t}\right)` },
        { n: 2, op: 'identity', title: t('提取相位因子', 'Factor out the phase'),
            latex: String.raw `1-e^{-i\theta} = 2i\,e^{-i\theta/2}\sin\frac{\theta}{2}` },
        { n: 3, op: 'algebra', title: t('取模', 'Take the modulus'),
            latex: String.raw `|A| = 2r\left|\sin\frac{\omega\Delta t}{2}\right| = 2r\left|\sin(\pi f\Delta t)\right|` },
        { n: 4, op: 'algebra', title: t('求极大值位置', 'Locate the maximum'),
            latex: String.raw `\pi f\Delta t = \frac{\pi}{2} \Longrightarrow \Delta t = \frac{1}{2f} \Longrightarrow \Delta z = \frac{v}{4f}` },
        { n: 5, op: 'taylor', title: t('薄层极限的线性关系', 'Linear relation in the thin limit'),
            latex: String.raw `\Delta t\to 0:\ |A| \approx 2\pi r f\,\Delta t = \frac{4\pi r f}{v}\Delta z` },
    ],
    viz: [
        {
            id: 'wedge-tuning',
            level: 'V3',
            title: t('楔形体振幅—厚度曲线', 'Wedge amplitude–thickness curve'),
            xlabel: t('厚度 Δz (m)', 'thickness Δz (m)'),
            ylabel: t('复合振幅 |A| / r', 'composite amplitude |A| / r'),
            controls: [
                { id: 'f', label: t('频率 f (Hz)', 'frequency f (Hz)'), min: 10, max: 80, step: 1, value: 30 },
                { id: 'v', label: t('层速度 v (m/s)', 'interval velocity v (m/s)'), min: 1500, max: 5000, step: 50, value: 3000 },
            ],
            note: t('峰的位置就是调谐厚度。峰左侧振幅随厚度线性增长，右侧开始出现顶底分离。', 'The peak marks the tuning thickness. To its left the amplitude grows linearly with thickness; to its right the top and base begin to separate.'),
            compute: (p) => {
                const f = p['f'], v = p['v'];
                const pts = [];
                for (let i = 0; i <= 240; i++) {
                    const dz = (i / 240) * 120;
                    const dt = (2 * dz) / v;
                    pts.push([dz, 2 * Math.abs(Math.sin(Math.PI * f * dt))]);
                }
                return [{ label: t('|A(Δz)|', '|A(Δz)|'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('30 Hz 数据的调谐厚度', 'Tuning thickness for 30 Hz data'),
        input: t('f = 30 Hz，v = 3000 m/s', 'f = 30 Hz, v = 3000 m/s'),
        steps: [
            t('λ = 100 m，调谐厚度 = λ/4 = 25 m', 'λ = 100 m, tuning thickness = λ/4 = 25 m'),
            t('Δz = 40 m 时 Δt = 26.7 ms，sin(π×30×0.0267) = sin(2.51) = 0.59 → |A| = 1.18 r', 'At Δz = 40 m: Δt = 26.7 ms, sin(π×30×0.0267) = sin(2.51) = 0.59 → |A| = 1.18 r'),
        ],
        output: t('25 m 处振幅是单界面的 2 倍；再厚下去反而下降', 'At 25 m the amplitude is twice a single interface; beyond that it decreases'),
    },
    links: {
        upstream: [
            { id: 'thin-bed-tuning', note: t('调谐现象的一般描述', 'General description of tuning') },
            { id: 'wavelet-bandwidth-resolution', note: t('分辨率判据', 'The resolution criterion') },
        ],
        downstream: [{ id: 'vertical-resolution', note: t('厚度反演的极限', 'Limits of thickness inversion') }],
    },
    refs: [{ text: 'Widess, M. (1973). How thin is a thin bed? Geophysics, 38, 1176–1180' }],
};
export default tuningWedgeModel;
//# sourceMappingURL=tuning-wedge-model.js.map