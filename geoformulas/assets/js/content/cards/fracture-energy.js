import { t } from '../../core/types.js';
/** fracture-energy */
const fractureEnergy = {
    id: 'fracture-energy',
    name: t('断裂能与滑动弱化', 'Fracture Energy & Slip Weakening'),
    aliases: { zh: ['断裂能', '滑动弱化', '破裂功'], en: ['fracture energy', 'slip weakening', 'breakdown work'] },
    node: 'S4.5',
    tags: {
        math: ['MATH.GEOM', 'MATH.ALGEBRA'],
        method: ['METH.TELE'],
        quantity: ['Q.SOURCE', 'Q.AMP'],
    },
    audience: 'phd',
    complete: 'L3',
    statement: {
        main: String.raw `E_{G} = \frac{1}{2}\left(\sigma_{0}-\sigma_{f}\right)\bar{u}\,A = \frac{(\sigma_{0}-\sigma_{f})\,M_{0}}{2\mu}`,
        variants: [
            { name: t('线性滑动弱化本构', 'Linear slip-weakening law'), latex: String.raw `\sigma(u) = \sigma_0 - (\sigma_0-\sigma_f)\frac{u}{D_c}\quad (u<D_c),\qquad \sigma = \sigma_f\ (u\ge D_c)` },
            { name: t('单位面积的断裂能', 'Fracture energy per unit area'), latex: String.raw `G_c = \frac{1}{2}(\sigma_0-\sigma_f)D_c` },
            { name: t('与动态应力降的关系', 'Relation to dynamic stress drop'), latex: String.raw `\Delta\sigma_d = \sigma_0 - \sigma_f` },
        ],
    },
    meaning: t('地震释放的应变能并不会全部变成地震波，其中相当一部分消耗在破裂尖端那个很小的「弱化区」里：把岩石磨碎、加热、甚至熔化。这部分能量叫断裂能。它决定了破裂能不能自己维持下去，也是解释「为什么有些大地震（如海啸地震）辐射效率异常低」的关键。', 'The strain energy released by an earthquake does not all become seismic waves; a substantial part is consumed in the small weakening zone at the rupture tip, crushing, heating and even melting the rock. That is the fracture energy. It controls whether the rupture can sustain itself, and is the key to explaining why some large events (tsunami earthquakes, for instance) radiate anomalously little energy.'),
    symbols: [
        { sym: 'E_{G}', name: t('断裂能（总破裂功）', 'fracture energy (total breakdown work)'), unit: 'J' },
        { sym: 'G_{c}', name: t('单位面积断裂能', 'fracture energy per unit area'), unit: 'J/m²', typical: '10⁵ – 10⁷' },
        { sym: '\\sigma_{0}', name: t('初始（屈服）应力', 'initial (yield) stress'), unit: 'Pa' },
        { sym: '\\sigma_{f}', name: t('最终（动摩擦）应力', 'final (dynamic friction) stress'), unit: 'Pa' },
        { sym: 'D_{c}', name: t('临界滑动弱化距离', 'critical slip-weakening distance'), unit: 'm', typical: '0.01 – 1' },
        { sym: '\\Delta\\sigma_{d}', name: t('动态应力降', 'dynamic stress drop'), unit: 'Pa' },
    ],
    conditions: {
        applies: [t('破裂动力学模拟、辐射效率与能量收支分析', 'Rupture dynamics modelling; radiation efficiency and energy budget analysis')],
        assumes: [
            t('线性滑动弱化本构（简化）', 'A linear slip-weakening law (simplified)'),
            t('均匀应力降与滑动', 'Uniform stress drop and slip'),
        ],
        breaks: [
            t('真实断层有速率—状态摩擦，弱化过程复杂得多', 'Real faults obey rate-and-state friction with far more complex weakening'),
            t('D_c 只能间接估计，误差可达一个数量级', 'D_c can only be estimated indirectly, with errors up to an order of magnitude'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把破裂功写成应力—滑动曲线下的面积', 'Write the breakdown work as the area under the stress–slip curve'),
            latex: String.raw `G_c = \int_0^{D_c}\left[\sigma(u)-\sigma_f\right]du` },
        { n: 2, op: 'substitute', title: t('代入线性弱化律', 'Insert the linear weakening law'),
            latex: String.raw `\sigma(u)-\sigma_f = (\sigma_0-\sigma_f)\left(1-\frac{u}{D_c}\right)` },
        { n: 3, op: 'algebra', title: t('积分', 'Integrate'),
            latex: String.raw `G_c = (\sigma_0-\sigma_f)\int_0^{D_c}\left(1-\frac{u}{D_c}\right)du = \frac{1}{2}(\sigma_0-\sigma_f)D_c` },
        { n: 4, op: 'identity', title: t('总能量等于单位面积能量乘面积', 'Total energy is the per-area value times area'),
            latex: String.raw `E_G = G_c\,A = \frac{1}{2}(\sigma_0-\sigma_f)\bar{u}A` },
        { n: 5, op: 'result', title: t('用地震矩消去 ūA', 'Eliminate ūA using the seismic moment'),
            latex: String.raw `E_G = \frac{(\sigma_0-\sigma_f)M_0}{2\mu}` },
    ],
    viz: [
        {
            id: 'slip-weakening',
            level: 'V2',
            title: t('滑动弱化曲线与断裂能', 'The slip-weakening curve and fracture energy'),
            xlabel: t('滑动量 u (m)', 'slip u (m)'),
            ylabel: t('剪应力 σ (MPa)', 'shear stress σ (MPa)'),
            controls: [
                { id: 's0', label: t('初始应力 σ₀ (MPa)', 'initial stress σ₀ (MPa)'), min: 1, max: 40, step: 0.5, value: 10 },
                { id: 'sf', label: t('动摩擦应力 σ_f (MPa)', 'dynamic friction σ_f (MPa)'), min: 0.5, max: 30, step: 0.5, value: 6 },
                { id: 'dc', label: t('临界弱化距离 D_c (m)', 'critical weakening distance D_c (m)'), min: 0.01, max: 2, step: 0.01, value: 0.5 },
            ],
            note: t('曲线与动摩擦水平线之间的三角形面积就是单位面积断裂能 G_c。', 'The triangular area between the curve and the dynamic-friction line is the fracture energy per unit area, G_c.'),
            compute: (p) => {
                const s0 = p['s0'], sf = p['sf'], dc = p['dc'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const u = (i / 200) * dc * 2;
                    const s = u < dc ? s0 - (s0 - sf) * (u / dc) : sf;
                    pts.push([u, s]);
                }
                return [{ label: t('σ(u)', 'σ(u)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('典型断裂能估算', 'A typical fracture-energy estimate'),
        input: t('σ₀ = 10 MPa，σ_f = 6 MPa，D_c = 0.5 m', 'σ₀ = 10 MPa, σ_f = 6 MPa, D_c = 0.5 m'),
        steps: [
            t('G_c = ½ × 4 MPa × 0.5 m = 1×10⁶ J/m²', 'G_c = ½ × 4 MPa × 0.5 m = 1×10⁶ J/m²'),
            t('若 M₀ = 1×10²⁰ N·m，μ = 30 GPa，则 E_G = 4×10⁶×10²⁰/(2×3×10¹⁰) = 6.7×10¹⁵ J', 'For M₀ = 1×10²⁰ N·m and μ = 30 GPa, E_G = 4×10⁶×10²⁰/(2×3×10¹⁰) = 6.7×10¹⁵ J'),
        ],
        output: t('与同震级辐射能量同量级 —— 大约一半的能量被消耗在破裂尖端', 'Comparable to the radiated energy of the same event — roughly half the energy is consumed at the rupture tip'),
    },
    links: {
        upstream: [{ id: 'static-stress-drop', note: t('应力降的定义', 'Definition of stress drop') }],
        downstream: [{ id: 'radiation-efficiency', note: t('断裂能决定辐射效率', 'Fracture energy sets the radiation efficiency') }],
        seealso: [{ id: 'radiated-seismic-energy', note: t('辐射能量的独立度量', 'An independent measure of radiated energy') }],
    },
    refs: [{ text: 'Kanamori, H. & Rivera, L. (2006). Energy partitioning during an earthquake. AGU Monograph 170, 3–13' }],
};
export default fractureEnergy;
//# sourceMappingURL=fracture-energy.js.map