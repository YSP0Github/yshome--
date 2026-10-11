import { t } from '../../core/types.js';
/** splitting-parameters-measurement */
const splittingParametersMeasurement = {
    id: 'splitting-parameters-measurement',
    name: t('剪切波分裂参数测量', 'Measuring Shear-wave Splitting Parameters'),
    aliases: { zh: ['分裂参数', 'φ 与 δt', '横波分裂'], en: ['splitting parameters', 'phi and delta t', 'shear-wave splitting'] },
    node: 'S7.5',
    tags: {
        math: ['MATH.LINALG', 'MATH.STAT'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TIME', 'Q.VEL'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `(\varphi,\ \delta t) = \arg\min_{\varphi,\,\delta t}\left\|\mathbf{u}_{f}(t+\delta t/2) - \mathbf{u}_{s}(t-\delta t/2)\right\|^{2}\ \text{旋转到 } (\varphi,\varphi+90^{\circ})`,
        variants: [
            { name: t('等效的协方差矩阵判据', 'Equivalent covariance-matrix criterion'), latex: String.raw `\lambda_{2}\left[\int \mathbf{u}(t)\mathbf{u}^{T}(t)\,dt\right] \to \min` },
            { name: t('旋转相关法', 'Rotation-correlation method'), latex: String.raw `\max_{\varphi,\delta t}\ \frac{\int u_f(t+\delta t/2)u_s(t-\delta t/2)\,dt}{\sqrt{\int u_f^{2}dt\int u_s^{2}dt}}` },
            { name: t('延迟时间与各向异性强度', 'Delay time and anisotropy strength'), latex: String.raw `\delta t = \frac{L\,\delta v}{v^{2}} \approx \frac{L\,\xi}{v}` },
        ],
    },
    meaning: t('各向异性介质把一束 S 波劈成快慢两束，两束偏振方向互相垂直、到时相差 δt。测量就是做一次二维搜索：把所有可能的快轴方位 φ 与延迟 δt 都试一遍，看哪一种能让快慢两束波形最像（相关最大）或让粒子运动最线性（协方差最小特征值最小）。', 'An anisotropic medium splits an S wave into fast and slow packets, polarized orthogonally and separated in time by δt. Measuring them is a two-dimensional search: try every fast-axis azimuth φ and delay δt, and pick the pair that makes the two waveforms most similar (maximum correlation) or the particle motion most linear (minimum eigenvalue of the covariance).'),
    symbols: [
        { sym: '\\varphi', name: t('快波偏振方位', 'fast polarization azimuth'), unit: '°', typical: '0 – 180' },
        { sym: '\\delta t', name: t('快慢波延迟时间', 'fast–slow delay time'), unit: 's', typical: '0.05 – 2' },
        { sym: '\\lambda_{2}', name: t('协方差矩阵的最小特征值', 'smallest eigenvalue of the covariance matrix'), unit: 'm²' },
        { sym: '\\xi', name: t('各向异性强度 (v_f−v_s)/v', 'anisotropy strength (v_f−v_s)/v'), unit: '无量纲', typical: '0.01 – 0.1' },
        { sym: 'L', name: t('各向异性层的厚度', 'thickness of the anisotropic layer'), unit: 'km' },
    ],
    conditions: {
        applies: [t('上地幔与地壳各向异性的观测约束', 'Observational constraints on upper-mantle and crustal anisotropy')],
        assumes: [
            t('单一均匀各向异性层', 'A single uniform anisotropic layer'),
            t('S 波入射角足够陡（避免 S–P 转换干扰）', 'S incidence is steep enough to avoid S–P conversion contamination'),
        ],
        breaks: [
            t('多层各向异性时 δt 随方位周期性变化，需分层反演', 'With multiple layers δt varies periodically with azimuth and layered inversion is needed'),
            t('δt 接近零（零分裂）时 φ 完全不可确定', 'When δt is near zero (null splitting) φ is entirely undetermined'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把水平两分量旋转到任意坐标系', 'Rotate the two horizontal components'),
            latex: String.raw `\begin{pmatrix}u_f\\ u_s\end{pmatrix} = \begin{pmatrix}\cos\varphi & \sin\varphi\\ -\sin\varphi & \cos\varphi\end{pmatrix}\begin{pmatrix}u_N\\ u_E\end{pmatrix}` },
        { n: 2, op: 'physics', title: t('各向异性使两束到时不同', 'Anisotropy makes the two packets arrive at different times'),
            latex: String.raw `u_f(t) = s(t),\qquad u_s(t) = s(t-\delta t)` },
        { n: 3, op: 'identity', title: t('消除延迟后再比较波形', 'Remove the delay and compare the waveforms'),
            latex: String.raw `u_f(t+\delta t/2)\ \text{与}\ u_s(t-\delta t/2)\ \text{应完全相同}` },
        { n: 4, op: 'algebra', title: t('两等价判据', 'Two equivalent criteria'),
            latex: String.raw `\text{相关最大} \Longleftrightarrow \text{协方差最小特征值最小}` },
        { n: 5, op: 'result', title: t('由 δt 反推各向异性强度', 'Infer anisotropy strength from δt'),
            latex: String.raw `\delta t \approx \frac{L\,\xi}{v}` },
    ],
    viz: [
        {
            id: 'splitting-search',
            level: 'V2',
            title: t('(φ, δt) 二维搜索的能量图', 'Energy map of the (φ, δt) search'),
            xlabel: t('快轴方位 φ (°)', 'fast azimuth φ (°)'),
            ylabel: t('延迟 δt (s)', 'delay δt (s)'),
            controls: [
                { id: 'phi0', label: t('真实快轴 φ₀ (°)', 'true fast azimuth φ₀ (°)'), min: 0, max: 180, step: 1, value: 40 },
                { id: 'dt0', label: t('真实延迟 δt₀ (s)', 'true delay δt₀ (s)'), min: 0.1, max: 2, step: 0.02, value: 0.8 },
            ],
            note: t('能量图上的单一极小对应唯一解；如果出现两个极小，通常说明存在多层各向异性。', 'A single minimum means a unique solution; two minima usually indicate multiple anisotropic layers.'),
            compute: (p) => {
                const phi0 = p['phi0'], dt0 = p['dt0'];
                const pts = [];
                for (let i = 0; i <= 180; i += 6) {
                    for (let j = 0; j <= 20; j++) {
                        const dt = 0.05 + (j / 20) * 1.95;
                        const dphi = Math.min(Math.abs(i - phi0), 180 - Math.abs(i - phi0));
                        const e = (dphi / 60) ** 2 + ((dt - dt0) / 0.5) ** 2;
                        if (e < 0.35)
                            pts.push([i, dt]);
                    }
                }
                return [{ label: t('可接受的 (φ, δt)', 'acceptable (φ, δt)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('1 s 延迟意味着什么', 'What does a 1 s delay mean'),
        input: t('L = 200 km，v = 4.5 km/s，δt = 1.0 s', 'L = 200 km, v = 4.5 km/s, δt = 1.0 s'),
        steps: [t('ξ = δt·v/L = 1.0×4.5/200 = 0.0225，即 2.25% 的各向异性', 'ξ = δt·v/L = 1.0×4.5/200 = 0.0225, i.e. 2.25% anisotropy')],
        output: t('2% 量级的各向异性在橄榄石富集的上地幔中很常见', 'Anisotropy of about 2% is common in olivine-rich upper mantle'),
    },
    links: {
        upstream: [{ id: 'shear-wave-splitting', note: t('分裂现象本身', 'The splitting phenomenon itself') }],
        seealso: [{ id: 'surface-wave-azimuthal-anisotropy', note: t('面波给出的同类约束', 'The same constraint from surface waves') }],
    },
    refs: [{ text: 'Silver, P. & Chan, W. (1991). Shear wave splitting and subcontinental mantle deformation. J. Geophys. Res., 96, 16429–16454' }],
};
export default splittingParametersMeasurement;
//# sourceMappingURL=splitting-parameters-measurement.js.map