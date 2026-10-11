import { t } from '../../core/types.js';
/** source-rise-time */
const sourceRiseTime = {
    id: 'source-rise-time',
    name: t('上升时间与破裂持续时间', 'Rise Time & Rupture Duration'),
    aliases: { zh: ['上升时间', '破裂持续时间', '破裂速度'], en: ['rise time', 'rupture duration', 'rupture velocity'] },
    node: 'S4.6',
    tags: {
        math: ['MATH.GEOM', 'MATH.ALGEBRA'],
        method: ['METH.TELE'],
        quantity: ['Q.SOURCE', 'Q.TIME'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `T_{d} = \frac{L}{v_{r}} + \tau_{r},\qquad \tau_{r} \approx 0.1\text{–}0.5\,T_{d}`,
        variants: [
            { name: t('自相似标度', 'Self-similar scaling'), latex: String.raw `L \propto M_0^{1/3} \Longrightarrow T_d \propto M_0^{1/3}` },
            { name: t('破裂速度的典型取值', 'Typical rupture velocities'), latex: String.raw `v_r \approx 0.7\text{–}0.9\,\beta` },
            { name: t('与拐角频率的关系', 'Relation to the corner frequency'), latex: String.raw `\tau_r \approx \frac{1}{2f_c}` },
        ],
    },
    meaning: t('一次地震的「持续时间」由两件事组成：破裂前缘扫过整个断层所需的时间 L/v_r，以及断层上任一点从开始滑动到滑动停止的上升时间 τ_r。前者决定方向性效应的强弱，后者决定高频辐射的拐角频率。两者常常被混为一谈，但物理来源完全不同。', 'The duration of an earthquake has two parts: the time the rupture front needs to sweep the fault, L/v_r, and the rise time τ_r over which any given point slips from start to finish. The first governs directivity, the second sets the corner frequency of high-frequency radiation. The two are often conflated, but their physical origins are entirely different.'),
    symbols: [
        { sym: 'T_{d}', name: t('总破裂持续时间', 'total rupture duration'), unit: 's' },
        { sym: 'L', name: t('破裂长度', 'rupture length'), unit: 'km' },
        { sym: 'v_{r}', name: t('破裂速度', 'rupture velocity'), unit: 'km/s', typical: '2 – 3.5' },
        { sym: '\\tau_{r}', name: t('上升时间', 'rise time'), unit: 's', typical: '0.5 – 20' },
        { sym: '\\beta', name: t('S 波速度', 'S velocity'), unit: 'km/s' },
    ],
    conditions: {
        applies: [t('强地面运动模拟、震源时间函数参数化', 'Strong-motion simulation; parameterising the source time function')],
        assumes: [
            t('单向破裂、恒定破裂速度', 'Unilateral rupture at constant rupture velocity'),
            t('自相似尺度关系', 'Self-similar scaling'),
        ],
        breaks: [
            t('超剪切破裂（v_r > β）时方向性行为完全不同', 'Supershear rupture (v_r > β) behaves quite differently'),
            t('双侧破裂时有效长度减半', 'For bilateral rupture the effective length is halved'),
        ],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('破裂前缘走过长度 L', 'The rupture front travels a length L'),
            latex: String.raw `t_{\text{prop}} = \frac{L}{v_r}` },
        { n: 2, op: 'physics', title: t('最后破裂的点还需完成自己的滑动', 'The last point still has to finish slipping'),
            latex: String.raw `T_d = \frac{L}{v_r} + \tau_r` },
        { n: 3, op: 'identity', title: t('自相似尺度关系', 'Self-similar scaling'),
            latex: String.raw `L = \left(\frac{7M_0}{8\Delta\sigma}\right)^{1/3}\propto M_0^{1/3}` },
        { n: 4, op: 'substitute', title: t('代入得到 T_d 的标度', 'Substitute to get the scaling of T_d'),
            latex: String.raw `T_d \propto M_0^{1/3}` },
        { n: 5, op: 'result', title: t('与拐角频率对应', 'Correspondence with the corner frequency'),
            latex: String.raw `\tau_r \approx \frac{1}{2f_c}` },
    ],
    viz: [
        {
            id: 'duration-vs-mw',
            level: 'V1',
            title: t('破裂持续时间随震级与破裂速度的变化', 'Rupture duration versus magnitude and rupture velocity'),
            xlabel: t('M_w', 'M_w'),
            ylabel: t('持续时间 T_d (s)', 'duration T_d (s)'),
            controls: [
                { id: 'vr', label: t('破裂速度 v_r / β', 'rupture velocity v_r / β'), min: 0.5, max: 1.0, step: 0.01, value: 0.8 },
                { id: 'beta', label: t('S 波速度 β (km/s)', 'S velocity β (km/s)'), min: 2.5, max: 4.6, step: 0.05, value: 3.5 },
            ],
            note: t('M_w 9 的破裂可以持续 200 s 以上 —— 这就是为什么长周期地震动在特大地震中如此重要。', 'An M_w 9 rupture can last over 200 s — which is why long-period ground motion matters so much in great earthquakes.'),
            compute: (p) => {
                const vr = p['vr'] * p['beta'], ds = 3e6;
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const mw = 4 + (i / 200) * 5.5;
                    const m0 = Math.pow(10, 1.5 * mw + 9.1);
                    const a = Math.pow((7 * m0) / (16 * ds), 1 / 3);
                    const L = 2 * a / 1000;
                    const td = (L / vr) * 1.3;
                    pts.push([mw, td]);
                }
                return [{ label: t('T_d(M_w)', 'T_d(M_w)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('M_w 8 的破裂持续多久', 'How long does an M_w 8 rupture last'),
        input: t('M₀ = 1×10²¹ N·m，Δσ = 3 MPa，v_r = 0.8β，β = 3.5 km/s', 'M₀ = 1×10²¹ N·m, Δσ = 3 MPa, v_r = 0.8β, β = 3.5 km/s'),
        steps: [
            t('a = (7×10²¹/(16×3×10⁶))^{1/3} = (1.458×10¹⁴)^{1/3} = 52.6 km', 'a = (7×10²¹/(16×3×10⁶))^{1/3} = (1.458×10¹⁴)^{1/3} = 52.6 km'),
            t('L ≈ 105 km，L/v_r = 105/2.8 = 37.5 s', 'L ≈ 105 km, L/v_r = 105/2.8 = 37.5 s'),
        ],
        output: t('总持续时间约 40–50 s，与观测的大地震震源时间函数长度一致', 'A total duration of about 40–50 s, consistent with observed source time functions of great earthquakes'),
    },
    links: {
        upstream: [{ id: 'source-spectral-scaling', note: t('破裂尺度由标度关系给出', 'Rupture dimension from the scaling relation') }],
        downstream: [{ id: 'rupture-directivity', note: t('持续时间决定方向性强弱', 'Duration controls directivity strength') }],
        seealso: [{ id: 'moment-rate-function', note: t('矩率函数的宽度', 'Width of the moment-rate function') }],
    },
    refs: [{ text: 'Kanamori, H. & Brodsky, E. (2004). The physics of earthquakes. Rep. Prog. Phys., 67, 1429–1496' }],
};
export default sourceRiseTime;
//# sourceMappingURL=source-rise-time.js.map