import { t } from '../../core/types.js';
/** reflectivity-log-conversion */
const reflectivityLogConversion = {
    id: 'reflectivity-log-conversion',
    name: t('反射系数与测井的深度—时间换算', 'Reflectivity from Logs & Depth–Time Conversion'),
    aliases: { zh: ['井震标定', '时深转换', '反射系数计算'], en: ['well tie', 'depth to time conversion', 'reflectivity from logs'] },
    node: 'S3.1',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.GEOM'],
        method: ['METH.EXPL'],
        quantity: ['Q.VEL', 'Q.GEOM', 'Q.TIME'],
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `r_{i} = \frac{\rho_{i+1}v_{i+1} - \rho_{i}v_{i}}{\rho_{i+1}v_{i+1} + \rho_{i}v_{i}},\qquad t = 2\int_{0}^{z}\frac{dz'}{v(z')}`,
        variants: [
            { name: t('等厚采样的离散形式', 'Discrete form for uniform sampling'), latex: String.raw `\Delta t_{i} = \frac{2\,\Delta z}{v_{i}},\qquad t_{i} = \sum_{k<i}\Delta t_{k}` },
            { name: t('线性速度梯度下的闭式解', 'Closed form for a linear velocity gradient'), latex: String.raw `v(z)=v_0+kz \Longrightarrow t(z) = \frac{2}{k}\ln\frac{v_0+kz}{v_0}` },
            { name: t('平均速度定义', 'Definition of average velocity'), latex: String.raw `\bar{v}(z) = \frac{2z}{t(z)}` },
        ],
    },
    meaning: t('测井给的是「深度域」的速度与密度，地震给的是「时间域」的反射。要把两者对接，必须沿深度积分慢度得到双程旅行时。这一步做得不对，井震标定就会整体错开，后面所有解释都跟着偏。', 'Well logs give velocity and density in depth; seismic gives reflections in time. Bridging them requires integrating slowness over depth to obtain two-way travel time. Get this wrong and the whole well tie shifts, dragging every downstream interpretation with it.'),
    symbols: [
        { sym: 'r_{i}', name: t('第 i 个界面的反射系数', 'reflection coefficient at interface i'), unit: '无量纲' },
        { sym: '\\rho', name: t('体积密度', 'bulk density'), unit: 'kg/m³', typical: '2000 – 2700' },
        { sym: 'v', name: t('层速度', 'interval velocity'), unit: 'm/s' },
        { sym: 't', name: t('双程旅行时', 'two-way travel time'), unit: 's' },
        { sym: '\\Delta z', name: t('测井采样间隔', 'log sampling interval'), unit: 'm', typical: '0.125 – 0.5' },
        { sym: '\\bar{v}', name: t('平均速度', 'average velocity'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('声波与密度测井合成地震记录、时深标定', 'Synthetic seismograms from sonic and density logs; time–depth ties')],
        assumes: [
            t('垂直入射、一维层状介质', 'Normal incidence, 1D layered medium'),
            t('测井速度已做侵入带与井眼校正', 'Log velocities are corrected for invasion and borehole effects'),
        ],
        breaks: [
            t('井旁速度各向异性（页岩）时测井与地震速度不一致', 'Near-well anisotropy (shales) makes log and seismic velocities disagree'),
            t('速度随频率变化（频散）时两者也不能直接比较', 'Velocity dispersion also prevents direct comparison'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('反射系数由阻抗给出', 'Reflectivity follows from impedance'),
            latex: String.raw `r_i = \frac{Z_{i+1}-Z_i}{Z_{i+1}+Z_i},\qquad Z = \rho v` },
        { n: 2, op: 'geometry', title: t('单程走时是慢度的积分', 'One-way time is the integral of slowness'),
            latex: String.raw `t_{\text{one-way}} = \int_0^z \frac{dz'}{v(z')}` },
        { n: 3, op: 'substitute', title: t('双程时加倍', 'Double it for two-way time'),
            latex: String.raw `t(z) = 2\int_0^z \frac{dz'}{v(z')}` },
        { n: 4, op: 'algebra', title: t('线性梯度时积出对数', 'For a linear gradient the integral is a logarithm'),
            latex: String.raw `t(z) = \frac{2}{k}\ln\frac{v_0+kz}{v_0}` },
        { n: 5, op: 'result', title: t('离散求和的实现', 'Discrete implementation'),
            latex: String.raw `\Delta t_i = \frac{2\Delta z}{v_i}` },
    ],
    viz: [
        {
            id: 'depth-time',
            level: 'V1',
            title: t('深度—双程时间关系：常速与线性梯度', 'Depth–time relation: constant velocity versus linear gradient'),
            xlabel: t('深度 z (km)', 'depth z (km)'),
            ylabel: t('双程时间 t (s)', 'two-way time t (s)'),
            controls: [
                { id: 'v0', label: t('地表速度 v₀ (km/s)', 'surface velocity v₀ (km/s)'), min: 1.5, max: 5, step: 0.05, value: 2.0 },
                { id: 'k', label: t('梯度 k (s⁻¹)', 'gradient k (s⁻¹)'), min: 0.1, max: 1.5, step: 0.01, value: 0.6 },
            ],
            note: t('梯度越大曲线越弯；用常速做时深转换会在深部产生显著误差。', 'The larger the gradient the more curved the relation; constant-velocity conversion produces significant error at depth.'),
            compute: (p) => {
                const v0 = p['v0'], k = p['k'];
                const lin = [];
                const grad = [];
                for (let i = 0; i <= 200; i++) {
                    const z = (i / 200) * 5;
                    lin.push([z, (2 * z) / v0]);
                    grad.push([z, (2 / k) * Math.log((v0 + k * z) / v0)]);
                }
                return [
                    { label: t('常速 2z/v₀', 'constant 2z/v₀'), color: '#888780', points: lin, dash: true },
                    { label: t('线性梯度', 'linear gradient'), color: '#185FA5', points: grad },
                ];
            },
        },
    ],
    example: {
        title: t('5 km 深处的时深误差', 'Time–depth error at 5 km'),
        input: t('v₀ = 2.0 km/s，k = 0.6 s⁻¹，z = 5 km', 'v₀ = 2.0 km/s, k = 0.6 s⁻¹, z = 5 km'),
        steps: [
            t('常速：t = 2×5/2.0 = 5.00 s', 'Constant velocity: t = 2×5/2.0 = 5.00 s'),
            t('梯度：t = (2/0.6) ln((2.0+3.0)/2.0) = 3.333 × ln 2.5 = 3.054 s', 'Gradient: t = (2/0.6) ln((2.0+3.0)/2.0) = 3.333 × ln 2.5 = 3.054 s'),
        ],
        output: t('忽略压实梯度会让 5 km 处的双程时间多算近 2 秒', 'Ignoring the compaction gradient overestimates the two-way time at 5 km by nearly 2 s'),
    },
    links: {
        upstream: [
            { id: 'acoustic-impedance', note: t('阻抗的定义', 'Definition of impedance') },
            { id: 'acoustic-reflection-coefficient', note: t('反射系数的公式', 'The reflectivity formula') },
        ],
        downstream: [{ id: 'synthetic-seismogram', note: t('换算结果用于合成记录', 'The result feeds synthetic seismograms') }],
        seealso: [{ id: 'average-velocity-conversion', note: t('平均速度的换算', 'Average-velocity conversion') }],
    },
    refs: [{ text: 'White & Simm. Well-to-seismic calibration. In: 52nd EAEG Meeting, 1990' }],
};
export default reflectivityLogConversion;
//# sourceMappingURL=reflectivity-log-conversion.js.map