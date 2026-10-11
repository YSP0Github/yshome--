import { t } from '../../core/types.js';
/** phys-conservation-mechanical-energy */
const physConservationMechanicalEnergy = {
    id: 'phys-conservation-mechanical-energy',
    name: t('机械能守恒定律', 'Conservation of Mechanical Energy'),
    aliases: { zh: ['机械能守恒', '动能势能相互转化'], en: ['conservation of mechanical energy'] },
    node: 'S18.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('机械能守恒 动能 势能 总和不变 只有保守力做功', 'mechanical energy conservation kinetic potential sum conserved'),
    },
    audience: 'highschool',
    complete: 'L3',
    statement: {
        main: String.raw `K_1+U_1=K_2+U_2=\text{常量}`,
        variants: [
            { name: t('含摩擦时的能量损耗', 'with friction, energy dissipated'), latex: String.raw `K_1+U_1=K_2+U_2+W_{\text{diss}}` },
        ],
    },
    meaning: t('当只有重力、弹簧力等保守力做功时，动能与势能可以互相转化，但二者之和（机械能）保持不变。过山车从山顶滑下：高度下降（势能减少）换来速度增大（动能增加），总数一分不少。有摩擦时一部分机械能变成热，就不再守恒。', 'When only conservative forces (gravity, springs) do work, kinetic and potential energy trade back and forth, but their sum — the mechanical energy — stays fixed. A roller coaster descending trades height (lost potential) for speed (gained kinetic), dollar for dollar. With friction, some energy turns into heat and conservation no longer holds.'),
    symbols: [
        { sym: 'K', name: t('动能', 'kinetic energy'), unit: 'J' },
        { sym: 'U', name: t('势能（重力+弹性）', 'potential energy (gravity + elastic)'), unit: 'J' },
        { sym: 'W_{diss}', name: t('耗散的能量', 'dissipated energy'), unit: 'J' },
    ],
    conditions: {
        applies: [t('只有保守力做功的孤立系统', 'Isolated system with only conservative forces')],
        assumes: [t('无摩擦、无外力做功', 'No friction, no external work')],
        breaks: [t('有摩擦、阻力或外力做功时机械能不守恒', 'Breaks with friction, drag or external work')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('动能定理：合外力功=ΔK', 'Work–energy theorem: net work = ΔK'), latex: String.raw `W_{\text{net}}=\Delta K` },
        { n: 2, op: 'substitute', title: t('合力功=保守力功，保守力功=−ΔU', 'Net work = conservative work = −ΔU'), latex: String.raw `W_{\text{cons}}=-\Delta U` },
        { n: 3, op: 'algebra', title: t('联立移项得守恒', 'Combine and rearrange for conservation'), latex: String.raw `-\Delta U=\Delta K\;\Rightarrow\; K_1+U_1=K_2+U_2` },
    ],
    viz: [
        {
            id: 'energy-bars',
            level: 'V1',
            title: t('滑下斜面：动能与势能的此消彼长', 'Sliding down: kinetic and potential trade off'),
            xlabel: t('下落高度 h (m)', 'drop height h (m)'),
            ylabel: t('能量 (J)', 'energy (J)'),
            controls: [
                { id: 'm', label: t('质量 m', 'mass m'), min: 1, max: 20, step: 1, value: 5, unit: 'kg' },
                { id: 'H', label: t('初始高度 H', 'initial height H'), min: 2, max: 30, step: 1, value: 10, unit: 'm' },
            ],
            xRange: [0, 30],
            note: t('总能量是水平直线；下落越多，势能转成动能越多，二者之和不变。', 'The total is a horizontal line; the more it drops, the more potential turns into kinetic, while their sum stays constant.'),
            compute: (p) => {
                const m = p['m'];
                const H = p['H'];
                const g = 9.8;
                const U = [];
                const K = [];
                const E = [];
                for (let i = 0; i <= 100; i++) {
                    const h = (i / 100) * H;
                    const u = m * g * (H - h);
                    const k = m * g * h;
                    U.push([h, u]);
                    K.push([h, k]);
                    E.push([h, u + k]);
                }
                return [
                    { label: t('势能 U', 'potential U'), color: '#0F6E56', points: U },
                    { label: t('动能 K', 'kinetic K'), color: '#BA7517', points: K },
                    { label: t('总机械能 E', 'total E'), color: '#185FA5', dash: true, points: E },
                ];
            },
        },
    ],
    links: {
        upstream: [{ id: 'phys-work-energy-theorem' }, { id: 'phys-gravitational-potential-energy' }, { id: 'phys-elastic-potential-energy' }],
        seealso: [{ id: 'phys-conservation-momentum' }],
    },
};
export default physConservationMechanicalEnergy;
//# sourceMappingURL=phys-conservation-mechanical-energy.js.map