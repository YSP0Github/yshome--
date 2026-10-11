import { t } from '../../core/types.js';
/** phase-shift-migration */
const phaseShiftMigration = {
    id: 'phase-shift-migration',
    name: t('相移偏移（Gazdag）', 'Phase-shift Migration (Gazdag)'),
    aliases: { zh: ['相移法', 'Gazdag 偏移', 'f-k 偏移'], en: ['phase-shift migration', 'Gazdag migration', 'f-k migration'] },
    node: 'S3.5',
    tags: {
        math: ['MATH.FOURIER', 'MATH.COMPLEX'],
        method: ['METH.EXPL', 'METH.INV'],
        quantity: ['Q.VEL', 'Q.FREQ'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\tilde P(z+\Delta z,\ k_x,\ \omega) = \tilde P(z,\ k_x,\ \omega)\,\exp\!\left(-i\,\frac{\omega}{v}\sqrt{1-\frac{v^{2}k_x^{2}}{\omega^{2}}}\,\Delta z\right)`,
        variants: [
            { name: t('倏逝波处理', 'Evanescent-wave handling'), latex: String.raw `\left|\frac{v k_x}{\omega}\right| > 1 \Longrightarrow \text{置零或指数衰减}` },
            { name: t('成像条件', 'Imaging condition'), latex: String.raw `I(x,z) = \sum_{\omega}\tilde P(z,k_x,\omega)\Big|_{t=0} = P(x,z,t=0)` },
            { name: t('变速扩展：相移加插值（PSPI）', 'Variable velocity: PSPI'), latex: String.raw `P(z+\Delta z) = \sum_{n} w_n(v_n)\,\mathcal{F}^{-1}\!\left[\tilde P\,e^{-ik_z(v_n)\Delta z}\right]` },
        ],
    },
    meaning: t('在频率—波数域里，向下延拓就是给每个 (k_x, ω) 分量乘一个纯相位因子。不需要任何旁轴近似，所有倾角都精确 —— 前提是速度不随深度或横向变化。相移偏移是这个理想情形下的「标准答案」。', 'In the frequency–wavenumber domain, downward continuation is just multiplication of every (k_x, ω) component by a pure phase factor. No paraxial approximation is needed and all dips are exact — provided the velocity does not vary with depth or laterally. Phase-shift migration is the textbook answer for that ideal case.'),
    symbols: [
        { sym: '\\tilde{P}', name: t('(k_x, ω) 域波场', 'wavefield in the (k_x, ω) domain'), unit: '振幅' },
        { sym: '\\Delta z', name: t('延拓步长', 'continuation step'), unit: 'km' },
        { sym: 'k_{z}', name: t('垂直波数', 'vertical wavenumber'), unit: '1/km' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
        { sym: 'v', name: t('层速度', 'interval velocity'), unit: 'km/s' },
    ],
    conditions: {
        applies: [t('速度横向恒定（或弱变化）的高质量偏移', 'High-quality migration where velocity is laterally constant or weakly varying')],
        assumes: [
            t('速度不随横向变化', 'Velocity does not vary laterally'),
            t('均匀采样、无假频', 'Uniform sampling without aliasing'),
        ],
        breaks: [
            t('横向变速时必须用 PSPI 或有限差分', 'Lateral velocity variation requires PSPI or finite differences'),
            t('Δz 过大时相移算子出现卷绕假象', 'Too large a Δz causes phase wrapping artefacts'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('对波动方程做 x 和 t 的双重 Fourier 变换', 'Double Fourier transform the wave equation in x and t'),
            latex: String.raw `\frac{\partial^{2}\tilde P}{\partial z^{2}} + k_z^{2}\tilde P = 0,\qquad k_z^{2} = \frac{\omega^{2}}{v^{2}} - k_x^{2}` },
        { n: 2, op: 'identity', title: t('常微分方程的解就是相移', 'The ODE solution is a phase shift'),
            latex: String.raw `\tilde P(z+\Delta z) = \tilde P(z)e^{-ik_z\Delta z}` },
        { n: 3, op: 'substitute', title: t('代入 k_z 的显式', 'Insert the explicit k_z'),
            latex: String.raw `k_z = \frac{\omega}{v}\sqrt{1-\frac{v^{2}k_x^{2}}{\omega^{2}}}` },
        { n: 4, op: 'identity', title: t('倏逝波（根号内为负）置零', 'Zero the evanescent part (negative radicand)'),
            latex: String.raw `\left|\frac{vk_x}{\omega}\right| > 1 \Longrightarrow k_z = i\kappa \Longrightarrow e^{-\kappa\Delta z} \to 0` },
        { n: 5, op: 'result', title: t('延拓到 t = 0 成像', 'Continue to t = 0 to image'),
            latex: String.raw `I(x,z) = P(x,z,0) = \sum_{\omega}\tilde P(z,k_x,\omega)` },
    ],
    viz: [
        {
            id: 'phase-shift-operator',
            level: 'V1',
            title: t('相移因子随水平波数的变化', 'Phase-shift factor versus horizontal wavenumber'),
            xlabel: t('sin θ = v k_x / ω', 'sin θ = v k_x / ω'),
            ylabel: t('k_z Δz (rad)', 'k_z Δz (rad)'),
            controls: [
                { id: 'wz', label: t('ω Δz / v (rad)', 'ω Δz / v (rad)'), min: 0.1, max: 6, step: 0.05, value: 2.0 },
            ],
            note: t('在 sin θ → 1 处导数无穷大，正是这里最容易出数值问题；超过 1 之后进入倏逝区，波场应被压制。', 'The derivative blows up as sin θ → 1, exactly where numerical trouble starts; beyond 1 the evanescent region begins and the field should be damped.'),
            compute: (p) => {
                const wz = p['wz'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const s = (i / 200) * 1.0;
                    const root = Math.sqrt(Math.max(0, 1 - s * s));
                    pts.push([s, wz * root]);
                }
                return [{ label: t('k_z Δz', 'k_z Δz'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('一个延拓步的相移', 'Phase shift for one continuation step'),
        input: t('v = 2.5 km/s，Δz = 20 m，f = 30 Hz，θ = 20°', 'v = 2.5 km/s, Δz = 20 m, f = 30 Hz, θ = 20°'),
        steps: [
            t('ω Δz / v = 2π×30×0.02/2.5 = 1.508 rad', 'ω Δz / v = 2π×30×0.02/2.5 = 1.508 rad'),
            t('乘 cos 20° = 0.940 → k_z Δz = 1.417 rad', 'Multiply by cos 20° = 0.940 → k_z Δz = 1.417 rad'),
        ],
        output: t('该分量相位滞后 1.417 rad（约 81°）', 'This component lags by 1.417 rad (about 81°)'),
    },
    links: {
        upstream: [
            { id: 'exploding-reflector-model', note: t('向下延拓的物理依据', 'Physical basis of downward continuation') },
            { id: 'fourier-shift-theorem', note: t('相移定理', 'The shift theorem') },
        ],
        seealso: [
            { id: 'finite-difference-migration', note: t('空间域的近似实现', 'The approximate space-domain implementation') },
            { id: 'reverse-time-migration', note: t('不做单程近似的做法', 'Avoiding the one-way approximation') },
        ],
    },
    refs: [{ text: 'Gazdag, J. (1978). Wave equation migration with the phase-shift method. Geophysics, 43, 1342–1351' }],
};
export default phaseShiftMigration;
//# sourceMappingURL=phase-shift-migration.js.map