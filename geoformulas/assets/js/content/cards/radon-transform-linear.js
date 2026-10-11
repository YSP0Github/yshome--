import { t } from '../../core/types.js';
/** radon-transform-linear */
const radonTransformLinear = {
    id: 'radon-transform-linear',
    name: t('线性 Radon 变换', 'The Linear Radon Transform'),
    aliases: { zh: ['拉冬变换', 'τ-p 变换', '速度滤波'], en: ['radon transform', 'tau-p transform', 'velocity filter'] },
    node: 'S2.6',
    tags: {
        math: ['MATH.TRANSFORM', 'MATH.LINALG'],
        method: ['METH.PROC'],
        quantity: ['Q.TIME', 'Q.VEL'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `m(p,\tau) = \sum_{x} d\!\left(x,\ \tau + p x\right),\qquad d(x,t) \approx \sum_{p} m\!\left(p,\ t - p x\right)`,
        variants: [
            { name: t('频率域的矩阵形式', 'Matrix form in the frequency domain'), latex: String.raw `\mathbf{M}(\omega) = \mathbf{L}^{\dagger}\mathbf{D}(\omega),\qquad L_{xp} = e^{i\omega p x}` },
            { name: t('最小二乘反演形式', 'Least-squares inverse'), latex: String.raw `\mathbf{M} = \left(\mathbf{L}^{\dagger}\mathbf{L} + \mu\mathbf{I}\right)^{-1}\mathbf{L}^{\dagger}\mathbf{D}` },
            { name: t('分辨率极限', 'Resolution limit'), latex: String.raw `\Delta p \approx \frac{1}{\omega X_{\max}},\qquad \Delta\tau \approx \frac{1}{f_{\max}}` },
        ],
    },
    meaning: t('线性 Radon 变换就是 τ–p 变换在离散数据上的具体实现。正向变换把每个 (x, t) 样点投到所有可能的 (p, τ) 直线上；高分辨率版本不直接求和，而是解一个带阻尼的最小二乘问题，从而得到聚焦得多的能量团。', 'The linear Radon transform is the concrete implementation of the τ–p transform on discrete data. The forward operator projects every (x, t) sample onto all possible (p, τ) lines; the high-resolution version does not simply sum but solves a damped least-squares problem, giving far better-focused energy.'),
    symbols: [
        { sym: 'm(p,\\tau)', name: t('Radon 域模型', 'Radon-domain model'), unit: '振幅' },
        { sym: 'd(x,t)', name: t('原始道集', 'original gather'), unit: '振幅' },
        { sym: '\\mathbf{L}', name: t('Radon 算子矩阵', 'Radon operator matrix'), unit: '无量纲' },
        { sym: '\\mu', name: t('阻尼因子', 'damping factor'), unit: '无量纲', typical: '0.01 – 0.1' },
        { sym: 'X_{\\max}', name: t('最大偏移距', 'maximum offset'), unit: 'km' },
    ],
    conditions: {
        applies: [t('压制多次波、插值缺失道、分离不同视速度的波', 'Multiple suppression, trace interpolation, separation by apparent velocity')],
        assumes: [
            t('同相轴在道集内近似线性', 'Events are approximately linear within the gather'),
            t('采样足够密以避免假频', 'Sampling is dense enough to avoid aliasing'),
        ],
        breaks: [
            t('弯曲（双曲）同相轴需要抛物 Radon 变换', 'Curved (hyperbolic) events need the parabolic Radon transform'),
            t('强振幅差时最小二乘需加权', 'Strong amplitude contrasts require weighted least squares'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把道集写成沿直线的求和', 'Write the gather as a sum along lines'),
            latex: String.raw `m(p,\tau) = \sum_x d(x,\ \tau + px)` },
        { n: 2, op: 'transform', title: t('对 t 做 Fourier 变换', 'Fourier transform over t'),
            latex: String.raw `M(p,\omega) = \sum_x D(x,\omega)\,e^{-i\omega p x}` },
        { n: 3, op: 'identity', title: t('写成矩阵—矢量形式', 'Write in matrix–vector form'),
            latex: String.raw `\mathbf{M} = \mathbf{L}^{\dagger}\mathbf{D},\qquad L_{xp} = e^{i\omega px}` },
        { n: 4, op: 'algebra', title: t('因为 L 不正交，反变换需解正规方程', 'L is not orthogonal, so the inverse needs the normal equations'),
            latex: String.raw `\mathbf{L}^{\dagger}\mathbf{L}\mathbf{M} = \mathbf{L}^{\dagger}\mathbf{D}` },
        { n: 5, op: 'result', title: t('加阻尼保证稳定', 'Add damping for stability'),
            latex: String.raw `\mathbf{M} = (\mathbf{L}^{\dagger}\mathbf{L} + \mu\mathbf{I})^{-1}\mathbf{L}^{\dagger}\mathbf{D}` },
    ],
    viz: [
        {
            id: 'radon-resolution',
            level: 'V1',
            title: t('Radon 域斜率分辨率随孔径的变化', 'Radon slope resolution versus aperture'),
            xlabel: t('最大偏移距 X_max (km)', 'maximum offset X_max (km)'),
            ylabel: t('Δp (s/km)', 'Δp (s/km)'),
            controls: [
                { id: 'f', label: t('主频 f (Hz)', 'dominant frequency f (Hz)'), min: 5, max: 80, step: 1, value: 30 },
            ],
            note: t('Δp 与孔径和频率都成反比：长排列 + 高频数据才能把靠得很近的同相轴分开。', 'Δp scales inversely with both aperture and frequency: long offsets plus high frequencies are needed to split closely spaced events.'),
            compute: (p) => {
                const f = p['f'];
                const c30 = [];
                for (let i = 0; i <= 200; i++) {
                    const X = 0.5 + (i / 200) * 5.5;
                    c30.push([X, 1 / (2 * Math.PI * f * X)]);
                }
                return [{ label: t('Δp(X_max)', 'Δp(X_max)'), color: '#185FA5', points: c30 }];
            },
        },
    ],
    example: {
        title: t('30 Hz、3 km 孔径的分辨率', 'Resolution at 30 Hz with a 3 km aperture'),
        input: t('f = 30 Hz，X_max = 3 km', 'f = 30 Hz, X_max = 3 km'),
        steps: [t('Δp = 1/(2π×30×3) = 1.77×10⁻³ s/km', 'Δp = 1/(2π×30×3) = 1.77×10⁻³ s/km')],
        output: t('在视速度 2 km/s 附近，可分辨约 0.007 km/s 的视速度差', 'Near an apparent velocity of 2 km/s this resolves differences of about 0.007 km/s'),
    },
    links: {
        upstream: [{ id: 'slant-stack-discrete', note: t('朴素求和版本', 'The plain summation version') }],
        seealso: [{ id: 'velocity-analysis', note: t('速度谱的同类叠加思想', 'The same stacking idea behind velocity spectra') }],
    },
    refs: [{ text: 'Trad, Ulrych & Sacchi. Latest views of the sparse Radon transform. Geophysics, 68, 386–399' }],
};
export default radonTransformLinear;
//# sourceMappingURL=radon-transform-linear.js.map