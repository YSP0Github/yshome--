import { t } from '../../core/types.js';
/** phys-maxwell-speed-distribution */
const physMaxwellSpeedDistribution = {
    id: 'phys-maxwell-speed-distribution',
    name: t('Maxwell 速率分布', 'Maxwell Speed Distribution'),
    aliases: { zh: ['麦克斯韦速率分布', '最概然速率'], en: ['Maxwell–Boltzmann speed distribution', 'most probable speed'] },
    node: 'S18.6',
    tags: {
        math: ['MATH.STAT', 'MATH.APPROX'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('麦克斯韦 速率分布 最概然速率 平均速率 方均根', 'Maxwell speed distribution most probable mean rms Boltzmann'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `f(v)=4\pi\left(\frac{m}{2\pi k_B T}\right)^{3/2}v^{2}e^{-mv^{2}/(2k_B T)}`,
        variants: [
            { name: t('最概然速率', 'most probable speed'), latex: String.raw `v_p=\sqrt{\dfrac{2 k_B T}{m}}` },
            { name: t('平均速率', 'mean speed'), latex: String.raw `\bar{v}=\sqrt{\dfrac{8 k_B T}{\pi m}}` },
            { name: t('方均根速率', 'rms speed'), latex: String.raw `v_{\mathrm{rms}}=\sqrt{\dfrac{3 k_B T}{m}}` },
        ],
    },
    meaning: t('平衡态下气体分子速率并非整齐划一，而是按 Maxwell 曲线分布：低速和极高速的分子都少，中间有个峰值。三个特征速率大小依次为 v_p < v̄ < v_rms。温度升高，曲线整体右移、变平——更多分子跑向高速端。这是气体动理论最漂亮的统计结果。', 'At equilibrium molecular speeds are not uniform but follow the Maxwell curve: few molecules are very slow or very fast, with a peak in between. The three characteristic speeds rank as v_p < v̄ < v_rms. Raising T shifts the curve right and flattens it — more molecules move at high speed. It is the most elegant statistical result of kinetic theory.'),
    symbols: [
        { sym: 'f(v)', name: t('速率分布密度', 'speed distribution density'), unit: 's/m' },
        { sym: 'm', name: t('分子质量', 'molecular mass'), unit: 'kg' },
        { sym: 'T', name: t('温度', 'temperature'), unit: 'K' },
        { sym: 'v_p,\\bar{v},v_{rms}', name: t('最概然/平均/方均根速率', 'most probable / mean / rms speed'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('理想气体平衡态', 'Ideal gas in equilibrium')],
        assumes: [t('分子间无相互作用', 'No intermolecular interactions')],
        breaks: [t('稠密气体或非平衡分布', 'Dense gases or non-equilibrium distributions')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('Boltzmann 因子 e^{-E/kT}', 'Boltzmann factor e^{−E/kT}'), latex: String.raw `P(v)\propto e^{-mv^{2}/(2k_B T)}` },
        { n: 2, op: 'geometry', title: t('三维速度空间球壳体积 4πv²dv', 'Spherical shell volume 4πv² dv'), latex: String.raw `f(v)\,\mathrm{d}v\propto v^{2}e^{-mv^{2}/(2k_B T)}\mathrm{d}v` },
        { n: 3, op: 'result', title: t('归一化即得分布', 'Normalize to get the distribution'), latex: String.raw `f(v)=4\pi\left(\dfrac{m}{2\pi k_B T}\right)^{3/2}v^{2}e^{-mv^{2}/(2k_B T)}` },
    ],
    viz: [
        {
            id: 'maxwell-curve',
            level: 'V1',
            title: t('不同温度下的 Maxwell 速率分布', 'Maxwell speed distribution at different temperatures'),
            xlabel: t('速率 v (m/s)', 'speed v (m/s)'),
            ylabel: t('分布密度 f(v)', 'distribution f(v)'),
            controls: [
                { id: 'T', label: t('温度 T', 'temperature T'), min: 100, max: 1000, step: 20, value: 300, unit: 'K' },
                { id: 'm', label: t('分子质量 m（×10⁻²⁶）', 'molecular mass m (×10⁻²⁶)'), min: 0.3, max: 8, step: 0.1, value: 5.3, unit: 'kg' },
            ],
            xRange: [0, 1500],
            note: t('升温峰值右移变矮；分子越重曲线越靠左。', 'Higher T moves the peak right and lowers it; heavier molecules shift the curve left.'),
            compute: (p) => {
                const T = p['T'];
                const m = p['m'] * 1e-26;
                const kb = 1.38e-23;
                const pts = [];
                for (let i = 1; i <= 300; i++) {
                    const v = (i / 300) * 1500;
                    const c = 4 * Math.PI * Math.pow(m / (2 * Math.PI * kb * T), 1.5);
                    const f = c * v * v * Math.exp((-m * v * v) / (2 * kb * T));
                    pts.push([v, f]);
                }
                return [{ label: t('f(v)', 'f(v)'), color: '#993C1D', points: pts }];
            },
        },
    ],
    links: { upstream: [{ id: 'phys-mean-translational-kinetic-energy' }] },
};
export default physMaxwellSpeedDistribution;
//# sourceMappingURL=phys-maxwell-speed-distribution.js.map