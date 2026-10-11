import { t } from '../../core/types.js';
/** raymer-hunt-gardner */
const raymerHuntGardner = {
    id: 'raymer-hunt-gardner',
    name: t('Raymer–Hunt–Gardner 时间平均关系的修正', 'The Raymer–Hunt–Gardner Relation'),
    aliases: { zh: ['Raymer 关系', '时间平均方程', '孔隙度—速度'], en: ['Raymer relation', 'time-average equation', 'porosity–velocity'] },
    node: 'S13.1',
    tags: {
        math: ['MATH.APPROX'],
        method: ['METH.ROCK'],
        quantity: ['Q.VEL', 'Q.MAT'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `\frac{1}{V} = \frac{\phi}{V_f} + \frac{1-\phi}{V_m}
\quad\xrightarrow{\ \text{Raymer 修正}\ }\quad
V = (1-\phi)^{2}V_m + \phi V_f`,
        variants: [
            { name: t('Wyllie 时间平均方程', 'The Wyllie time-average equation'), latex: String.raw `\Delta t = \phi\,\Delta t_f + (1-\phi)\Delta t_m` },
            { name: t('Raymer 分段形式（φ < 0.37 与 φ > 0.47）', 'Raymer piecewise form (φ < 0.37 and φ > 0.47)'), latex: String.raw `\phi < 0.37:\ V = (1-\phi)^{2}V_m + \phi V_f;\qquad \phi \gtrsim 0.47:\ \frac{1}{V}=\frac{\phi}{V_f}+\frac{1-\phi}{V_m}` },
            { name: t('Raymer 简化式', 'Simplified Raymer form'), latex: String.raw `V = V_m(1-\phi)^{2}\ \ (\text{忽略流体项})` },
            { name: t('压实趋势（Athy 定律）', 'Compaction trend (Athy\'s law)'), latex: String.raw `\phi(z) = \phi_0\,e^{-cz}` },
        ],
    },
    meaning: t('Wyllie 时间平均方程（走时按体积分数加权平均）在低孔隙度砂岩里很好用，但在中高孔隙度时会严重高估速度。Raymer、Hunt 与 Gardner 在 1980 年给出的经验修正把「加权平均」换成「速度平方形式的混合」，与实测数据吻合得多。这个修正对储层预测至关重要：孔隙度 25% 时，两个公式给出的速度差可达 15%，足以影响 AVO 解释与孔隙度反演的结论。', 'The Wyllie time-average equation (travel time weighted by volume fraction) works well in low-porosity sandstones but badly overestimates velocity at moderate to high porosity. The empirical correction by Raymer, Hunt and Gardner (1980) replaces the weighted average with a squared-velocity mixture that matches measured data far better. This matters greatly for reservoir prediction: at 25% porosity the two formulas differ by up to 15% in velocity, enough to change the conclusions of AVO interpretation and porosity inversion.'),
    symbols: [
        { sym: '\\phi', name: t('孔隙度', 'porosity'), unit: '无量纲' },
        { sym: 'V', name: t('岩石速度', 'rock velocity'), unit: 'm/s' },
        { sym: 'V_m', name: t('基质（矿物）速度', 'matrix (mineral) velocity'), unit: 'm/s' },
        { sym: 'V_f', name: t('孔隙流体速度', 'pore-fluid velocity'), unit: 'm/s' },
        { sym: '\\Delta t', name: t('慢度（时差）', 'slowness (transit time)'), unit: 'µs/m' },
    ],
    conditions: {
        applies: [t('声波测井孔隙度解释、储层表征、岩石物理模板建立', 'Sonic-log porosity interpretation, reservoir characterisation, building rock-physics templates')],
        assumes: [t('充分固结、孔隙为粒间型', 'Well consolidated, intergranular porosity')],
        breaks: [t('未固结砂岩、裂缝性或溶洞型孔隙不适用', 'Does not apply to unconsolidated sands, fractured or vuggy porosity'), t('含粘土时需引入粘土校正项', 'A clay correction term is needed when clay is present')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('Wyllie 假设走时可加', 'Wyllie assumes slowness is additive'), latex: String.raw `\Delta t = \phi\Delta t_f + (1-\phi)\Delta t_m` },
        { n: 2, op: 'physics', title: t('但实测表明中高孔隙度时偏离严重', 'Measurements show serious deviation at moderate-to-high porosity'), latex: String.raw `\phi \gtrsim 0.30\ \text{时 Wyllie 高估}\ V` },
        { n: 3, op: 'substitute', title: t('Raymer 提出对速度（而非慢度）做平方混合', 'Raymer proposed a squared mixture on velocity rather than slowness'), latex: String.raw `V = (1-\phi)^{2}V_m + \phi V_f` },
        { n: 4, op: 'identity', title: t('忽略流体项得常用简化式', 'Dropping the fluid term gives the common simplified form'), latex: String.raw `V \approx V_m(1-\phi)^{2}` },
        { n: 5, op: 'result', title: t('两式在 φ < 0.1 时几乎一致，之后逐渐分开', 'The two agree for φ < 0.1 and diverge progressively after'), latex: String.raw `\phi = 0.25,\ V_m = 5500:\ \text{Wyllie}\ V \approx 3810,\ \text{Raymer}\ V \approx 3090` },
    ],
    viz: [
        {
            id: 'raymer-cmp',
            level: 'V2',
            title: t('Wyllie 与 Raymer 的速度—孔隙度曲线对比', 'Wyllie versus Raymer velocity–porosity curves'),
            xlabel: t('孔隙度 φ', 'porosity φ'),
            ylabel: t('速度 V (m/s)', 'velocity V (m/s)'),
            controls: [
                { id: 'vm', label: t('基质速度 V_m (m/s)', 'matrix velocity V_m (m/s)'), min: 3000, max: 7000, step: 50, value: 5500 },
                { id: 'vf', label: t('流体速度 V_f (m/s)', 'fluid velocity V_f (m/s)'), min: 1000, max: 1800, step: 20, value: 1500 },
            ],
            note: t('两条曲线在低孔隙度处重合，随孔隙度增大迅速分开 —— Wyllie 给出的速度明显偏高，因为它隐含假设了「流体与矿物串联传波」，而实际岩石在中等孔隙度下更接近悬浮体的行为。', 'The two curves coincide at low porosity and separate quickly as porosity grows — Wyllie gives a clearly higher velocity because it implicitly assumes fluid and mineral transmit waves in series, whereas real rock at moderate porosity behaves more like a suspension.'),
            compute: (p) => {
                const vm = p['vm'], vf = p['vf'];
                const wy = [];
                const ra = [];
                for (let i = 0; i <= 200; i++) {
                    const ph = (i / 200) * 0.6;
                    wy.push([ph, 1 / (ph / vf + (1 - ph) / vm)]);
                    ra.push([ph, (1 - ph) * (1 - ph) * vm + ph * vf]);
                }
                return [
                    { label: t('Wyllie 时间平均', 'Wyllie time-average'), color: '#993C1D', points: wy },
                    { label: t('Raymer–Hunt–Gardner', 'Raymer–Hunt–Gardner'), color: '#185FA5', points: ra },
                ];
            },
        },
        {
            id: 'raymer-sens',
            level: 'V1',
            title: t('速度误差对孔隙度反演的影响', 'How velocity error affects porosity inversion'),
            xlabel: t('速度测量误差 (%)', 'velocity measurement error (%)'),
            ylabel: t('反演孔隙度误差 (绝对)', 'inverted porosity error (absolute)'),
            controls: [{ id: 'ph', label: t('真实孔隙度 φ', 'true porosity φ'), min: 0.05, max: 0.45, step: 0.01, value: 0.25 }],
            note: t('由 dV/dφ 决定：孔隙度越大曲线越平缓，同样的速度误差反演出的孔隙度误差越大。这就是为什么高孔隙储层的孔隙度预测不确定性总比致密层大。', 'Set by dV/dφ: the larger the porosity the flatter the curve, so the same velocity error produces a larger porosity error. That is why porosity prediction in high-porosity reservoirs is always more uncertain than in tight formations.'),
            compute: (p) => {
                const ph = p['ph'];
                const vm = 5500;
                const V = (x) => (1 - x) * (1 - x) * vm;
                const dVdphi = -2 * (1 - ph) * vm;
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const e = (i / 200) * 10;
                    const dV = (e / 100) * V(ph);
                    pts.push([e, Math.abs(dV / dVdphi)]);
                }
                return [{ label: t('孔隙度误差', 'porosity error'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('中孔隙度砂岩', 'A medium-porosity sandstone'),
        input: t('φ = 0.25，V_m = 5500 m/s（石英），V_f = 1500 m/s（水）', 'φ = 0.25, V_m = 5500 m/s (quartz), V_f = 1500 m/s (water)'),
        steps: [
            t('Wyllie：1/V = 0.25/1500 + 0.75/5500 ⇒ V = 3810 m/s', 'Wyllie: 1/V = 0.25/1500 + 0.75/5500 gives V = 3810 m/s'),
            t('Raymer：V = 0.75²×5500 + 0.25×1500 = 3094 + 375 = 3469 m/s', 'Raymer: V = 0.75²×5500 + 0.25×1500 = 3094 + 375 = 3469 m/s'),
        ],
        output: t('两者相差约 340 m/s（约 9%），Raymer 更接近实测', 'The two differ by about 340 m/s (about 9%); Raymer is closer to measurements'),
    },
    links: {
        upstream: [{ id: 'wyllie-time-average', note: t('Wyllie 方程是出发点', 'The Wyllie equation is the starting point') }],
        downstream: [{ id: 'gassmann-equation', note: t('流体替换需要基质模量', 'Fluid substitution needs the matrix modulus') }],
        seealso: [{ id: 'gardner-relation', note: t('Gardner 关系给出密度', 'The Gardner relation gives density') }],
    },
    refs: [{ text: 'Raymer, Hunt & Gardner (1980), An improved sonic transit time-to-porosity transform, SPWLA 21st Annual Logging Symposium' }],
};
export default raymerHuntGardner;
//# sourceMappingURL=raymer-hunt-gardner.js.map