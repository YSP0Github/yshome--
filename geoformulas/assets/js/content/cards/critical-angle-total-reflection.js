import { t } from '../../core/types.js';
/** critical-angle-total-reflection */
const criticalAngleTotalReflection = {
    id: 'critical-angle-total-reflection',
    name: t('临界角与全反射', 'Critical Angle and Total Reflection'),
    aliases: {
        zh: ['临界角', '全反射', '倏逝波', '非均匀波'],
        en: ['critical angle', 'total reflection', 'evanescent wave', 'inhomogeneous wave'],
    },
    node: 'S2.2',
    tags: {
        math: ['MATH.GEOM', 'MATH.COMPLEX'],
        method: ['METH.EXPL', 'METH.ROCK'],
        quantity: ['Q.VEL', 'Q.GEOM', 'Q.AMP'],
        keywords: t('临界角 全反射 倏逝波 隐失波 非均匀波 垂直慢度 广角', 'critical angle total reflection evanescent wave inhomogeneous wave vertical slowness wide angle'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\sin\theta_{c}=\frac{v_{1}}{v_{2}}\quad\Longleftrightarrow\quad \theta_{c}=\arcsin\!\left(\frac{v_{1}}{v_{2}}\right)\qquad (v_{2}>v_{1})`,
        variants: [
            {
                name: t('全反射条件', 'Condition for total reflection'),
                latex: String.raw `\theta_{1}>\theta_{c}\;\Longleftrightarrow\; p>\frac{1}{v_{2}}\;\Longleftrightarrow\; \sin\theta_{2}>1`,
            },
            {
                name: t('垂直慢度变为虚数', 'The vertical slowness becomes imaginary'),
                latex: String.raw `\eta_{2}=\sqrt{\frac{1}{v_{2}^{2}}-p^{2}}\;\longrightarrow\; i\sqrt{p^{2}-\frac{1}{v_{2}^{2}}}`,
            },
            {
                name: t('倏逝波（隐失波）', 'Evanescent wave'),
                latex: String.raw `\exp\!\left[-\omega z\sqrt{p^{2}-\frac{1}{v_{2}^{2}}}\right]=\exp\!\left[-\frac{\omega z}{v_{2}}\sqrt{\left(pv_{2}\right)^{2}-1}\right]`,
            },
            {
                name: t('用速度比表示', 'In terms of the velocity ratio'),
                latex: String.raw `\theta_{c}=\arcsin\!\left(\frac{1}{k}\right),\qquad k=\frac{v_{2}}{v_{1}}>1`,
            },
        ],
    },
    meaning: t('当波从慢介质射向快介质时，透射角比入射角大；入射角大到某一值时透射角先达到 90°，这个值就是临界角。超过它，透射波不再是一个能带走能量的传播波，界面下方只剩一个沿界面传播、垂向指数衰减的倏逝波，入射能量被全部反射回来。临界角既决定了首波何时出现，也决定了广角反射记录上振幅的突变位置。', 'When a wave passes from a slower into a faster medium the transmission angle exceeds the incidence angle, and at some incidence the transmission angle reaches 90° first: the critical angle. Beyond it the transmitted wave is no longer a propagating wave carrying energy away; below the interface only an evanescent field remains, travelling along the interface and decaying exponentially with depth, and all incident energy is reflected. The critical angle sets both when head waves appear and where amplitudes change abruptly on wide-angle records.'),
    symbols: [
        { sym: '\\theta_{c}', name: t('临界角（自界面法线量起）', 'critical angle (measured from the interface normal)'), unit: '°', typical: '25 – 75' },
        { sym: '\\theta_{1},\\ \\theta_{2}', name: t('入射角与透射角', 'incidence and transmission angles'), unit: '°' },
        { sym: 'v_{1},\\ v_{2}', name: t('界面上方（慢）、下方（快）的速度', 'velocities above (slower) and below (faster) the interface'), unit: 'm/s', typical: '1500 – 7000' },
        { sym: 'k=v_{2}/v_{1}', name: t('速度比（必须大于 1 才有临界角）', 'velocity ratio (must exceed 1 for a critical angle to exist)'), unit: '—', typical: '1.2 – 3.0' },
        { sym: 'p', name: t('射线参数（水平慢度）', 'ray parameter (horizontal slowness)'), unit: 's/m' },
        { sym: '\\eta_{2}', name: t('垂直慢度', 'vertical slowness'), unit: 's/m' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
        { sym: 'z', name: t('界面以下的深度', 'depth below the interface'), unit: 'm' },
    ],
    conditions: {
        applies: [
            t('波由低速层射向高速层（v₂ > v₁）的界面', 'Interfaces where the wave goes from a slower into a faster layer (v₂ > v₁)'),
            t('广角反射与折射勘探、全波波形反演中的临界后现象', 'Wide-angle reflection and refraction surveys, and post-critical phenomena in full-waveform inversion'),
        ],
        assumes: [
            t('界面平整、尺度远大于波长；介质各向同性、无耗散', 'A planar interface, smooth on the wavelength scale; isotropic, non-dissipative media'),
            t('入射波为平面波或可在局部视为平面波', 'The incident wave is a plane wave, or locally plane'),
        ],
        breaks: [
            t('v₂ ≤ v₁ 时根本不存在临界角，任何入射角都有传播型透射波', 'For v₂ ≤ v₁ no critical angle exists and every incidence angle gives a propagating transmitted wave'),
            t('耗散介质中「全反射」并不全反射，倏逝波会吸收一部分能量', 'In dissipative media total reflection is not total: the evanescent field absorbs part of the energy'),
            t('粗糙界面或薄层会把倏逝波重新散射成传播波（隧道效应）', 'Rough interfaces or thin layers rescatter the evanescent field into propagating waves (tunnelling)'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'physics',
            title: t('从 Snell 定律出发', 'Start from Snell\'s law'),
            latex: String.raw `p=\frac{\sin\theta_{1}}{v_{1}}=\frac{\sin\theta_{2}}{v_{2}}`,
        },
        {
            n: 2,
            op: 'algebra',
            title: t('解出透射角', 'Solve for the transmission angle'),
            latex: String.raw `\sin\theta_{2}=\frac{v_{2}}{v_{1}}\sin\theta_{1}=k\sin\theta_{1}`,
            note: t('k > 1 时，θ₂ 总是大于 θ₁，所以 θ₂ 会先撞到 90°。', 'For k > 1, θ₂ always exceeds θ₁, so θ₂ reaches 90° first.'),
        },
        {
            n: 3,
            op: 'setup',
            title: t('令 θ₂ = 90° 定义临界角', 'Define the critical angle by θ₂ = 90°'),
            latex: String.raw `\sin\theta_{2}=1\;\Longrightarrow\; \sin\theta_{c}=\frac{v_{1}}{v_{2}}=\frac{1}{k}`,
        },
        {
            n: 4,
            op: 'result',
            title: t('超过临界角：方程无实数解', 'Beyond the critical angle: no real solution'),
            latex: String.raw `\theta_{1}>\theta_{c}\;\Longrightarrow\; \sin\theta_{2}>1\;\Longrightarrow\; \text{无传播型透射波}\;\Longrightarrow\; \text{全反射}`,
        },
        {
            n: 5,
            op: 'transform',
            title: t('把无解翻译成倏逝波：垂直慢度变虚', 'Translate "no solution" into an evanescent wave'),
            latex: String.raw `\eta_{2}=\sqrt{\frac{1}{v_{2}^{2}}-p^{2}}=i\sqrt{p^{2}-\frac{1}{v_{2}^{2}}}\equiv i\,\gamma`,
        },
        {
            n: 6,
            op: 'substitute',
            title: t('垂向因子由振荡变为指数衰减', 'The vertical factor turns from oscillatory into exponentially decaying'),
            latex: String.raw `e^{i\omega\eta_{2}z}=e^{-\omega\gamma z}=\exp\!\left[-\frac{\omega z}{v_{2}}\sqrt{\left(pv_{2}\right)^{2}-1}\right]`,
            note: t('穿透深度约为 1/(ωγ)：频率越高，倏逝波贴得越薄，这也是高频广角数据对界面更敏感的原因。', 'The penetration depth is about 1/(ωγ): the higher the frequency, the thinner the evanescent skin, which is why high-frequency wide-angle data are more sensitive to the interface itself.'),
        },
    ],
    viz: [
        {
            id: 'crit-angle',
            level: 'V1',
            title: t('临界角随下伏层速度的变化', 'Critical angle versus the velocity of the underlying layer'),
            xlabel: t('下伏层速度 v₂ (m/s)', 'velocity of the underlying layer v₂ (m/s)'),
            ylabel: t('临界角 θ_c (°)', 'critical angle θ_c (deg)'),
            controls: [
                { id: 'cv1', label: t('上覆层速度 v₁', 'overlying velocity v₁'), min: 1000, max: 5000, step: 50, value: 2000, unit: 'm/s' },
            ],
            xRange: [1500, 9000],
            yRange: [0, 90],
            note: t('曲线从 90°（v₂ = v₁，几乎没有反差）单调下降到 30° 以下（强反差）。反差越强，临界角越小，首波在越近的偏移距就能出现——广角观测对强反差界面最敏感。', 'The curve falls monotonically from 90° (v₂ = v₁, almost no contrast) to below 30° (strong contrast). The stronger the contrast, the smaller the critical angle and the sooner the head wave appears — wide-angle observation is most sensitive to strongly contrasting interfaces.'),
            compute: (p) => {
                const v1 = p['cv1'];
                const pts = [];
                for (let i = 0; i <= 300; i++) {
                    const v2 = 1500 + (i / 300) * 7500;
                    if (v2 <= v1)
                        continue;
                    const tc = (Math.asin(v1 / v2) * 180) / Math.PI;
                    pts.push([v2, tc]);
                }
                return [{ label: t('θ_c = arcsin(v₁/v₂)', 'θ_c = arcsin(v₁/v₂)'), color: '#185FA5', points: pts }];
            },
        },
        {
            id: 'evanescent',
            level: 'V1',
            title: t('全反射时界面以下的倏逝波衰减', 'Evanescent decay below the interface under total reflection'),
            xlabel: t('界面以下深度 z (m)', 'depth below the interface z (m)'),
            ylabel: t('振幅衰减因子', 'amplitude decay factor'),
            controls: [
                { id: 'ef', label: t('频率 f', 'frequency f'), min: 5, max: 100, step: 1, value: 25, unit: 'Hz' },
                { id: 'ev2', label: t('下伏层速度 v₂', 'velocity of the underlying layer v₂'), min: 1500, max: 6000, step: 50, value: 3000, unit: 'm/s' },
                { id: 'es2', label: t('超临界程度 p·v₂', 'super-critical factor p·v₂'), min: 1.0, max: 3.0, step: 0.02, value: 1.3, unit: '—' },
            ],
            xRange: [0, 200],
            yRange: [0, 1.05],
            note: t('p·v₂ 越大（越超临界）、频率越高，衰减越快，能量就越贴着界面。把 p·v₂ 拉回 1.0，曲线变成一条水平线——正好是临界状态，穿透深度无穷大。', 'The larger p·v₂ (the more super-critical) and the higher the frequency, the faster the decay and the more tightly the energy hugs the interface. Pull p·v₂ back to 1.0 and the curve flattens into a horizontal line — exactly the critical state, with infinite penetration depth.'),
            compute: (p) => {
                const f = p['ef'];
                const v2 = p['ev2'];
                const s2 = p['es2'];
                const om = 2 * Math.PI * f;
                const gam = Math.sqrt(Math.max(0, s2 * s2 - 1)) / v2;
                const pts = [];
                for (let i = 0; i <= 300; i++) {
                    const z = (i / 300) * 200;
                    pts.push([z, Math.exp(-om * gam * z)]);
                }
                return [{ label: t('exp(−ωγz)', 'exp(−ωγz)'), color: '#0F6E56', points: pts }];
            },
        },
    ],
    example: {
        title: t('浅层高速界面的临界角', 'Critical angle at a shallow high-velocity interface'),
        input: t('v₁ = 1800 m/s（风化层），v₂ = 4500 m/s（基岩）', 'v₁ = 1800 m/s (weathering), v₂ = 4500 m/s (bedrock)'),
        steps: [
            t('sin θ_c = 1800/4500 = 0.40', 'sin θ_c = 1800/4500 = 0.40'),
            t('θ_c = 23.6°（自法线量起，即离水平还有 66.4°）', 'θ_c = 23.6° from the normal, i.e. still 66.4° from the horizontal'),
            t('临界距离 x_c = 2h tan θ_c ≈ 0.874 h', 'critical distance x_c = 2h tan θ_c ≈ 0.874 h'),
        ],
        output: t('在约 0.87 倍深度的偏移距之后，透射 P 消失，能量转为沿界面滑行并以首波形式返回地表', 'Beyond an offset of about 0.87 times the depth the transmitted P vanishes and the energy creeps along the interface, returning to the surface as a head wave'),
    },
    links: {
        upstream: [{ id: 'snell-ray-parameter', note: t('临界角是 Snell 定律的直接推论', 'the critical angle follows directly from Snell\'s law') }],
        downstream: [
            { id: 'head-wave-critical-angle', note: t('超临界入射产生首波', 'super-critical incidence generates the head wave') },
            { id: 'acoustic-reflection-coefficient', note: t('临界后反射系数变为复数，模为 1', 'beyond critical the reflection coefficient becomes complex with unit modulus') },
        ],
        seealso: [{ id: 'snell-law-converted-waves' }],
    },
    refs: [
        { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §3.2' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2' },
    ],
};
export default criticalAngleTotalReflection;
//# sourceMappingURL=critical-angle-total-reflection.js.map