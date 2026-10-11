import { t } from '../../core/types.js';
/** static-stress-drop */
const staticStressDrop = {
    id: 'static-stress-drop',
    name: t('静态应力降', 'Static Stress Drop'),
    aliases: { zh: ['应力降'], en: ['static stress drop', 'stress parameter'] },
    node: 'S4.5',
    tags: {
        math: ['MATH.GEOM', 'MATH.ALGEBRA'],
        method: ['METH.TELE'],
        quantity: ['Q.SOURCE', 'Q.MAT'],
    },
    audience: 'master',
    complete: 'L3',
    statement: {
        main: String.raw `\Delta\sigma=\frac{7}{16}\frac{M_0}{a^{3}}\quad(\text{圆盘状断层})`,
        variants: [
            { name: t('一般形状：几何因子 C', 'General shape: geometric factor C'), latex: String.raw `\Delta\sigma=C\,\mu\,\frac{\bar{D}}{L}` },
            { name: t('常用数值', 'Commonly used values'), latex: String.raw `C=\frac{7\pi}{16}\approx1.37\ (\text{圆盘}),\qquad C\approx1\ (\text{长条断层})` },
        ],
    },
    meaning: t('应力降是地震前后断层面上剪应力的差值，它回答的是「这次地震把积累的应力释放掉了多少」。观测上它表现出令人不安的稳定性：从 Mw 2 到 Mw 9，应力降几乎都落在 0.1–10 MPa 之间，与地震大小无关 —— 这叫「应力降标度不变性」，是震源物理中最重要也最未解释的经验事实之一。', 'Stress drop is the difference in shear stress on the fault before and after an earthquake; it answers how much accumulated stress was released. Observationally it is disturbingly stable: from Mw 2 to Mw 9 stress drop stays within 0.1–10 MPa regardless of size. This "stress-drop scaling invariance" is one of the most important and least explained empirical facts in source physics.'),
    symbols: [
        { sym: '\\Delta\\sigma', name: t('静态应力降', 'static stress drop'), unit: 'Pa', typical: '10⁵ – 10⁷' },
        { sym: 'M_0', name: t('地震矩', 'seismic moment'), unit: 'N·m' },
        { sym: 'a', name: t('断层等效半径', 'equivalent fault radius'), unit: 'm' },
        { sym: '\\mu', name: t('剪切模量', 'shear modulus'), unit: 'Pa' },
        { sym: 'C', name: t('几何因子', 'geometric factor'), unit: '无量纲', typical: '0.8 – 1.5' },
    ],
    conditions: {
        applies: [t('由地震矩与震源尺度估计平均应力降', 'Estimating average stress drop from moment and source dimension')],
        assumes: [
            t('断层近似圆盘或椭圆，滑移分布均匀', 'The fault is roughly circular or elliptical with uniform slip'),
            t('均匀弹性半空间（忽略非均匀与自由表面）', 'Uniform elastic half-space (heterogeneity and the free surface are ignored)'),
        ],
        breaks: [t('滑移强烈非均匀时「平均应力降」与局部应力降可以差一个量级', 'With strongly heterogeneous slip the average and local stress drops can differ by an order of magnitude')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('圆盘裂纹的静力学解', 'Static solution for a circular crack'),
            latex: String.raw `\bar{D}=\frac{16\,\Delta\sigma\,a}{7\pi\mu}`,
            note: t('这是弹性力学中圆盘位错的经典结果（Eshelby）。', 'This is the classical elastic result for a circular dislocation (Eshelby).') },
        { n: 2, op: 'substitute', title: t('代入 M₀ = μ A D̄', 'Substitute into M₀ = μ A D̄'),
            latex: String.raw `M_0=\mu\,\pi a^{2}\,\bar{D}=\mu\,\pi a^{2}\cdot\frac{16\,\Delta\sigma\,a}{7\pi\mu}` },
        { n: 3, op: 'algebra', title: t('化简', 'Simplify'),
            latex: String.raw `M_0=\frac{16}{7}\,\Delta\sigma\,a^{3}` },
        { n: 4, op: 'result', title: t('解出应力降', 'Solve for the stress drop'),
            latex: String.raw `\boxed{\Delta\sigma=\frac{7}{16}\frac{M_0}{a^{3}}}` },
    ],
    viz: [
        {
            id: 'stress-drop-scaling',
            level: 'V1',
            title: t('应力降是否随地震大小变化', 'Does stress drop vary with earthquake size?'),
            xlabel: t('矩震级 Mw', 'moment magnitude Mw'),
            ylabel: t('应力降 Δσ (MPa)', 'stress drop Δσ (MPa)'),
            controls: [
                { id: 'ds', label: t('给定应力降 Δσ', 'assigned stress drop Δσ'), min: 0.1, max: 10, step: 0.1, value: 3, unit: 'MPa' },
                { id: 'vr', label: t('破裂速度比 v_r/β', 'rupture velocity ratio v_r/β'), min: 0.5, max: 0.95, step: 0.01, value: 0.8 },
            ],
            compute: (p) => {
                const dsigma = p['ds'] * 1e6;
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const mw = 2 + (i / 200) * 7;
                    const m0 = Math.pow(10, 1.5 * mw + 9.1);
                    const a = Math.pow((7 * m0) / (16 * dsigma), 1 / 3);
                    pts.push([mw, (7 * m0) / (16 * a ** 3) / 1e6]);
                }
                return [{ label: t('Δσ', 'Δσ'), color: '#185FA5', points: pts }];
            },
            note: t('按定义 Δσ 恒定，所以说「标度不变」其实是自洽条件而非观测结论 —— 真正的观测是把 a 独立测出来再检验。', 'By construction Δσ is constant here; "scale invariance" is really an observational claim that requires measuring a independently.'),
        },
    ],
    example: {
        title: t('一次 Mw 4 级地震', 'An Mw 4 earthquake'),
        input: t('M₀ = 4.0×10¹⁵ N·m，a = 500 m', 'M₀ = 4.0×10¹⁵ N·m, a = 500 m'),
        steps: [
            t('a³ = 1.25×10⁸ m³', 'a³ = 1.25×10⁸ m³'),
            t('Δσ = (7/16)(4.0×10¹⁵)/(1.25×10⁸) = 1.4×10⁷ Pa', 'Δσ = (7/16)(4.0×10¹⁵)/(1.25×10⁸) = 1.4×10⁷ Pa'),
        ],
        output: t('14 MPa —— 偏高但在观测范围内（多数事件为 1–10 MPa）', '14 MPa — high but within the observed range (most events fall in 1–10 MPa)'),
    },
    links: {
        upstream: [{ id: 'seismic-moment', note: t('M₀ 由它给出', 'M₀ comes from it') }],
        seealso: [
            { id: 'brune-source-spectrum', note: t('拐角频率也能给出震源尺度', 'Corner frequency also gives source dimension') },
            { id: 'apparent-stress', note: t('另一种应力度量', 'Another stress measure') },
        ],
    },
    refs: [{ text: 'Kanamori & Anderson (1975), Bull. Seismol. Soc. Am., 65' }, { text: 'Shearer, Introduction to Seismology, 2nd ed., §9.5' }],
};
export default staticStressDrop;
//# sourceMappingURL=static-stress-drop.js.map