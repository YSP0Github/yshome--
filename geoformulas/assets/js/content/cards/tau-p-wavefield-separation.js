import { t } from '../../core/types.js';
/** tau-p-wavefield-separation */
const tauPWavefieldSeparation = {
    id: 'tau-p-wavefield-separation',
    name: t('τ–p 域波场分离与倏逝波判据', 'τ–p Wavefield Separation & the Evanescent Criterion'),
    aliases: { zh: ['波场分离', '倏逝波', '视速度'], en: ['wavefield separation', 'evanescent wave', 'apparent velocity'] },
    node: 'S2.6',
    tags: {
        math: ['MATH.FOURIER', 'MATH.COMPLEX'],
        method: ['METH.PROC', 'METH.INSTR'],
        quantity: ['Q.VEL', 'Q.FREQ'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `u(x,t) = \frac{1}{2\pi}\iint \tilde{U}(p,\omega)\,e^{i\omega(px-t)}\,d\omega\,dp`,
        variants: [
            { name: t('倏逝波判据', 'Evanescent criterion'), latex: String.raw `k_{z}^{2} = \frac{\omega^{2}}{v^{2}} - \omega^{2}p^{2} \ge 0 \ \Longleftrightarrow\ |p| \le \frac{1}{v}` },
            { name: t('正负 p 对应两个传播方向', 'Positive and negative p mean opposite directions'), latex: String.raw `p > 0:\ +x\ \text{方向传播},\qquad p < 0:\ -x\ \text{方向传播}` },
            { name: t('视速度', 'Apparent velocity'), latex: String.raw `v_{\text{app}} = \frac{1}{p}` },
        ],
    },
    meaning: t('把记录变换到 (p, ω) 域之后，「不同方向传播的波」变成了「p 的正负号不同」，「近垂直传播的波」变成 p ≈ 0。于是一次掩膜运算就能把上行波、下行波、面波、多次波分离开来 —— 这是 τ–p 域比 f–k 域更直观的地方。', 'After transforming a record into the (p, ω) domain, waves travelling in different directions differ in the sign of p, and steeply propagating waves sit at p ≈ 0. A single mask then separates upgoing, downgoing, surface and multiply-reflected energy — this is where the τ–p domain is more intuitive than the f–k domain.'),
    symbols: [
        { sym: '\\tilde{U}(p,\\omega)', name: t('τ–p 域谱', 'τ–p spectrum'), unit: '振幅·s' },
        { sym: 'p', name: t('水平慢度', 'horizontal slowness'), unit: 's/km' },
        { sym: 'k_{z}', name: t('垂直波数', 'vertical wavenumber'), unit: '1/km' },
        { sym: 'v_{\\text{app}}', name: t('视速度 1/p', 'apparent velocity 1/p'), unit: 'km/s' },
        { sym: '\\omega', name: t('角频率', 'angular frequency'), unit: 'rad/s' },
    ],
    conditions: {
        applies: [t('台阵或炮集记录的方向性滤波', 'Directional filtering of array or shot-gather records')],
        assumes: [
            t('局部可视为水平分层介质', 'The medium can be treated as locally horizontally layered'),
            t('均匀采样、无空间假频', 'Uniform sampling without spatial aliasing'),
        ],
        breaks: [
            t('|p| > 1/v 的倏逝波不携带传播能量，强行反变换会产生假象', 'Evanescent energy with |p| > 1/v carries no propagating energy; inverse-transforming it creates artefacts'),
            t('介质横向变化时 p 不再守恒', 'p is no longer conserved in laterally varying media'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把波场写成平面波叠加', 'Expand the wavefield into plane waves'),
            latex: String.raw `u(x,z,t) = \iint A(p,\omega)\,e^{i\omega(px + k_z z - t)}\,d\omega\,dp` },
        { n: 2, op: 'substitute', title: t('代入波动方程得到色散关系', 'Substitute into the wave equation to get the dispersion relation'),
            latex: String.raw `\omega^{2}(p^{2}+k_z^{2}) = \frac{\omega^{2}}{v^{2}}\ \Longrightarrow\ k_z = \pm\sqrt{\frac{1}{v^{2}}-p^{2}}\ \omega` },
        { n: 3, op: 'identity', title: t('实根与虚根的判别', 'Distinguish real and imaginary roots'),
            latex: String.raw `|p| < \frac{1}{v}: k_z\in\mathbb{R}\ (\text{传播}),\qquad |p| > \frac{1}{v}: k_z = i\kappa\ (\text{倏逝})` },
        { n: 4, op: 'result', title: t('分离准则', 'Separation rule'),
            latex: String.raw `\tilde{U}_{\text{out}}(p,\omega) = \tilde{U}(p,\omega)\,\mathbb{1}\!\left[|p|\le 1/v\right]\,\mathbb{1}\!\left[\pm p>0\right]` },
    ],
    viz: [
        {
            id: 'apparent-velocity',
            level: 'V1',
            title: t('视速度与倏逝波边界', 'Apparent velocity and the evanescent boundary'),
            xlabel: t('射线参数 p (s/km)', 'ray parameter p (s/km)'),
            ylabel: t('视速度 1/p (km/s)', 'apparent velocity 1/p (km/s)'),
            controls: [
                { id: 'v', label: t('介质速度 v (km/s)', 'medium velocity v (km/s)'), min: 1, max: 8, step: 0.05, value: 3.0 },
            ],
            note: t('在 1/p < v 的区域（水平线以下）波是倏逝的；观测中几乎不会在这里看到能量。', 'Where 1/p < v (below the horizontal line) the wave is evanescent; real data show almost no energy there.'),
            compute: (p) => {
                const v = p['v'];
                const app = [];
                const bound = [];
                for (let i = 0; i <= 300; i++) {
                    const pp = 0.02 + (i / 300) * 0.98;
                    app.push([pp, 1 / pp]);
                    bound.push([pp, v]);
                }
                return [
                    { label: t('视速度 1/p', 'apparent velocity 1/p'), color: '#185FA5', points: app },
                    { label: t('倏逝边界 v', 'evanescent boundary v'), color: '#993C1D', points: bound, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('面波与体波的分离', 'Separating surface waves from body waves'),
        input: t('体波视速度 6 km/s，面波视速度 1.5 km/s', 'Body-wave apparent velocity 6 km/s, surface-wave 1.5 km/s'),
        steps: [
            t('体波 p = 1/6 = 0.167 s/km', 'Body wave: p = 1/6 = 0.167 s/km'),
            t('面波 p = 1/1.5 = 0.667 s/km', 'Surface wave: p = 1/1.5 = 0.667 s/km'),
        ],
        output: t('在 p 轴上两者相距很远，用一个带通掩膜即可干净分离', 'They are far apart on the p axis, so a band-pass mask separates them cleanly'),
    },
    links: {
        upstream: [{ id: 'taup-transform', note: t('τ–p 变换的定义', 'Definition of the τ–p transform') }],
        seealso: [
            { id: 'fk-analysis', note: t('f–k 域的同类分析', 'The same analysis in the f–k domain') },
            { id: 'array-beamforming', note: t('台阵慢度估计的另一种做法', 'Another route to array slowness estimation') },
        ],
    },
    refs: [{ text: 'Yilmaz, Seismic Data Analysis, ch. 6 (τ–p transforms)' }],
};
export default tauPWavefieldSeparation;
//# sourceMappingURL=tau-p-wavefield-separation.js.map