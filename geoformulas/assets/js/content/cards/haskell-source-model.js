import { t } from '../../core/types.js';
/** haskell-source-model */
const haskellSourceModel = {
    id: 'haskell-source-model',
    name: t('Haskell 矩形位错模型', 'The Haskell Rectangular Dislocation Model'),
    aliases: { zh: ['Haskell 模型', '有限断层谱', '方向性因子'], en: ['Haskell model', 'finite-fault spectrum', 'directivity factor'] },
    node: 'S4.6',
    tags: {
        math: ['MATH.FOURIER', 'MATH.GEOM'],
        method: ['METH.TELE'],
        quantity: ['Q.SOURCE', 'Q.FREQ'],
    },
    audience: 'phd',
    complete: 'L4',
    statement: {
        main: String.raw `|\dot{M}(\omega)| = M_{0}\left|\frac{\sin(\omega\tau_{r}/2)}{\omega\tau_{r}/2}\right|\left|\frac{\sin X}{X}\right|,\qquad X = \frac{\omega L}{2v_{r}}\left(1-\frac{v_{r}}{\alpha}\cos\theta\right)`,
        variants: [
            { name: t('方向性因子', 'Directivity factor'), latex: String.raw `C_{d} = \left|\frac{\sin X}{X}\right|` },
            { name: t('破裂朝向台站时 X 最小、振幅最大', 'X is minimised (amplitude maximised) when rupture heads toward the station'), latex: String.raw `\theta=0:\ X=\frac{\omega L}{2v_r}\left(1-\frac{v_r}{\alpha}\right)\ \text{最小},\ C_d\ \text{最大}` },
            { name: t('多普勒式解释', 'Doppler-like interpretation'), latex: String.raw `T_{\text{obs}} = T_d\left(1-\frac{v_r}{\alpha}\cos\theta\right)` },
        ],
    },
    meaning: t('Haskell 模型是第一个把「有限尺寸的破裂」写进震源谱的模型。它预言了一个至今仍被大量验证的现象：破裂朝着你跑过来时，地震波持续时间被压缩、振幅被放大（多普勒效应）；背离你跑时则相反。这就是 1994 北岭、1995 阪神等地震中某一侧破坏特别严重的物理原因。', 'The Haskell model was the first to put a finite rupture dimension into the source spectrum. It predicted a phenomenon still confirmed again and again: when rupture runs toward you, the ground motion is compressed in time and amplified (a Doppler effect); when it runs away, the opposite. That is the physical reason damage was so one-sided in events such as 1994 Northridge and 1995 Kobe.'),
    symbols: [
        { sym: 'L', name: t('破裂长度', 'rupture length'), unit: 'km' },
        { sym: 'v_{r}', name: t('破裂速度', 'rupture velocity'), unit: 'km/s' },
        { sym: '\\tau_{r}', name: t('上升时间', 'rise time'), unit: 's' },
        { sym: '\\theta', name: t('台站方位与破裂方向的夹角', 'angle between station azimuth and rupture direction'), unit: '°' },
        { sym: 'C_{d}', name: t('方向性因子', 'directivity factor'), unit: '无量纲' },
        { sym: '\\alpha', name: t('P 波速度', 'P velocity'), unit: 'km/s' },
    ],
    conditions: {
        applies: [t('方向性效应分析、强地面运动的方向性修正', 'Directivity analysis; directivity corrections to strong motion')],
        assumes: [
            t('单向破裂、恒定破裂速度、均匀滑动', 'Unilateral rupture, constant rupture velocity, uniform slip'),
            t('远场、均匀介质', 'Far field, uniform medium'),
        ],
        breaks: [
            t('双侧或多子事件破裂时谱形复杂得多', 'Bilateral or multi-subevent ruptures give far more complex spectra'),
            t('近断层（距离与 L 同量级）时远场近似不成立', 'At near-fault distances the far-field approximation fails'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把断层看成沿长度方向传播的一串点源', 'Treat the fault as a line of point sources propagating along it'),
            latex: String.raw `\dot{M}(t) = \int_0^{L}\dot{m}\!\left(t - \frac{\xi}{v_r}\right)d\xi` },
        { n: 2, op: 'transform', title: t('做 Fourier 变换', 'Fourier transform'),
            latex: String.raw `\dot{M}(\omega) = \dot{m}(\omega)\int_0^{L}e^{i\omega\xi/v_r}\,d\xi \cdot e^{i\omega r_0/\alpha}` },
        { n: 3, op: 'identity', title: t('把台站方向带来的时间延迟写成相位', 'Write the station-direction delay as a phase'),
            latex: String.raw `\text{到时差} \to e^{-i\omega\xi\cos\theta/\alpha}` },
        { n: 4, op: 'algebra', title: t('积分得到 sinc 函数', 'The integral gives a sinc function'),
            latex: String.raw `\int_0^{L}e^{i\omega\xi(1/v_r - \cos\theta/\alpha)}d\xi = L\,e^{iX}\frac{\sin X}{X},\quad X = \frac{\omega L}{2v_r}\left(1-\frac{v_r}{\alpha}\cos\theta\right)` },
        { n: 5, op: 'result', title: t('再乘上升时间的 sinc', 'Multiply by the rise-time sinc'),
            latex: String.raw `|\dot{M}| = M_0\left|\frac{\sin(\omega\tau_r/2)}{\omega\tau_r/2}\right|\left|\frac{\sin X}{X}\right|` },
    ],
    viz: [
        {
            id: 'haskell-spectrum',
            level: 'V3',
            title: t('破裂前后方的震源谱差异', 'Source spectrum: forward versus backward direction'),
            xlabel: t('频率 f (Hz)', 'frequency f (Hz)'),
            ylabel: t('log₁₀ |Ṁ(f)|', 'log₁₀ |Ṁ(f)|'),
            xScale: 'log',
            controls: [
                { id: 'L', label: t('破裂长度 L (km)', 'rupture length L (km)'), min: 5, max: 200, step: 1, value: 50 },
                { id: 'vr', label: t('破裂速度 v_r (km/s)', 'rupture velocity v_r (km/s)'), min: 1.5, max: 5, step: 0.05, value: 2.8 },
                { id: 'alpha', label: t('P 波速度 α (km/s)', 'P velocity α (km/s)'), min: 4, max: 8, step: 0.05, value: 6.0 },
            ],
            note: t('前方（红线）谱在高频明显抬升 —— 这正是破裂朝向的城市破坏更重的原因。', 'The forward spectrum (red) is strongly elevated at high frequency — exactly why cities the rupture runs toward suffer more damage.'),
            compute: (p) => {
                const L = p['L'], vr = p['vr'], alpha = p['alpha'];
                const tau = 2;
                const sinc = (x) => (Math.abs(x) < 1e-9 ? 1 : Math.sin(x) / x);
                const spec = (f, cs) => {
                    const w = 2 * Math.PI * f;
                    const X = ((w * L) / (2 * vr)) * (1 - (vr / alpha) * cs);
                    const s1 = Math.abs(sinc((w * tau) / 2));
                    const s2 = Math.abs(sinc(X));
                    return Math.max(s1 * s2, 1e-8);
                };
                const fwd = [];
                const bwd = [];
                for (let i = 0; i <= 240; i++) {
                    const f = Math.pow(10, -2 + (i / 240) * 3);
                    fwd.push([f, 2 * Math.log10(spec(f, 1))]);
                    bwd.push([f, 2 * Math.log10(spec(f, -1))]);
                }
                return [
                    { label: t('破裂朝向台站', 'rupture toward station'), color: '#993C1D', points: fwd },
                    { label: t('破裂背离台站', 'rupture away from station'), color: '#185FA5', points: bwd, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('50 km 破裂的多普勒效应', 'Doppler effect for a 50 km rupture'),
        input: t('L = 50 km，v_r = 2.8 km/s，α = 6 km/s', 'L = 50 km, v_r = 2.8 km/s, α = 6 km/s'),
        steps: [
            t('正向：1 − v_r/α = 0.533 → X 缩小一半', 'Forward: 1 − v_r/α = 0.533 → X is nearly halved'),
            t('反向：1 + v_r/α = 1.467 → X 增大', 'Backward: 1 + v_r/α = 1.467 → X grows'),
        ],
        output: t('正向的高频谱平台可高出反向若干倍', 'The forward high-frequency plateau can exceed the backward one by several times'),
    },
    links: {
        upstream: [{ id: 'source-rise-time', note: t('上升时间与破裂持续时间', 'Rise time and rupture duration') }],
        downstream: [{ id: 'rupture-directivity', note: t('方向性的观测表现', 'Observational expression of directivity') }],
        seealso: [{ id: 'omega-square-model', note: t('点源极限', 'The point-source limit') }],
    },
    refs: [{ text: 'Haskell, N. A. (1964). Total energy and energy spectral density of elastic wave radiation. Bull. Seismol. Soc. Am., 54, 1811–1841' }],
};
export default haskellSourceModel;
//# sourceMappingURL=haskell-source-model.js.map