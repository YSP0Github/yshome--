import { t } from '../../core/types.js';
/** phys-carnot-efficiency */
const physCarnotEfficiency = {
    id: 'phys-carnot-efficiency',
    name: t('Carnot 热机效率', 'Carnot Heat-Engine Efficiency'),
    aliases: { zh: ['卡诺效率', 'η=1−Tc/Th'], en: ['Carnot efficiency', 'η = 1 − Tc/Th'] },
    node: 'S18.6',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('卡诺热机 效率 高温热源 低温热源 热力学极限', 'Carnot engine efficiency hot cold reservoir thermodynamic limit'),
    },
    audience: 'bachelor',
    complete: 'L4',
    statement: {
        main: String.raw `\eta=1-\frac{T_c}{T_h}`,
        variants: [
            { name: t('热机做功与热量', 'work and heat flows'), latex: String.raw `W=Q_h-Q_c,\quad \eta=\dfrac{W}{Q_h}=1-\dfrac{Q_c}{Q_h}=1-\dfrac{T_c}{T_h}` },
        ],
    },
    meaning: t('Carnot 证明：在温度 Th 和 Tc 两个热源之间工作的任何热机，效率都不可能超过 η=1−Tc/Th（温度用开尔文）。这给出了热机效率的理论天花板——不论工质多完美。想提高效率，要么提高燃烧温度 Th，要么降低冷凝温度 Tc。这也是为什么电厂要建在河边。', 'Carnot proved that no engine operating between reservoirs at Th and Tc can beat η = 1 − Tc/Th (Kelvin). This is the theoretical ceiling on heat-engine efficiency, regardless of working fluid. To improve it, either raise the hot temperature Th or lower the cold sink Tc — which is why power plants are built by rivers.'),
    symbols: [
        { sym: '\\eta', name: t('效率', 'efficiency'), unit: '—' },
        { sym: 'T_h', name: t('高温热源温度', 'hot-reservoir temperature'), unit: 'K' },
        { sym: 'T_c', name: t('低温热源温度', 'cold-reservoir temperature'), unit: 'K' },
        { sym: 'Q_h,Q_c,W', name: t('吸热、放热、做功', 'heat in, heat out, work'), unit: 'J' },
    ],
    conditions: {
        applies: [t('可逆 Carnot 循环（理论上限）', 'Reversible Carnot cycle (theoretical upper bound)')],
        assumes: [t('理想可逆、无摩擦无漏热', 'Ideal reversible, no friction or leakage')],
        breaks: [t('真实发动机效率远低于此', 'Real engines are far below this bound')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('Carnot 循环两条等温线+两条绝热线', 'Carnot cycle: two isotherms + two adiabats'), latex: String.raw `\dfrac{Q_c}{Q_h}=\dfrac{T_c}{T_h}` },
        { n: 2, op: 'algebra', title: t('效率=做功/吸热', 'Efficiency = work / heat input'), latex: String.raw `\eta=\dfrac{W}{Q_h}=\dfrac{Q_h-Q_c}{Q_h}=1-\dfrac{Q_c}{Q_h}` },
        { n: 3, op: 'result', title: t('代入温度比', 'Substitute the temperature ratio'), latex: String.raw `\eta=1-\dfrac{T_c}{T_h}` },
    ],
    viz: [
        {
            id: 'carnot-eta',
            level: 'V1',
            title: t('Carnot 效率随冷热温差的变化', 'Carnot efficiency vs hot/cold temperatures'),
            xlabel: t('高温热源温度 Th (K)', 'hot temperature Th (K)'),
            ylabel: t('效率 η', 'efficiency η'),
            controls: [
                { id: 'Tc', label: t('低温热源 Tc', 'cold temperature Tc'), min: 250, max: 350, step: 5, value: 300, unit: 'K' },
            ],
            xRange: [300, 1200],
            note: t('Th 再高也到不了 100%——只要 Tc>0，总有部分热量排给冷源。', 'Even huge Th never reaches 100%: as long as Tc > 0 some heat must be dumped to the cold sink.'),
            compute: (p) => {
                const Tc = p['Tc'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const Th = 300 + (i / 200) * 900;
                    pts.push([Th, 1 - Tc / Th]);
                }
                return [{ label: t('η(Th)', 'η(Th)'), color: '#993C1D', points: pts }];
            },
        },
    ],
    example: {
        title: t('热电厂效率上限', 'Power-plant ceiling'),
        input: t('Th=800 K，Tc=300 K', 'Th = 800 K, Tc = 300 K'),
        steps: [t('η = 1 − 300/800 = 0.625', 'η = 1 − 300/800 = 0.625')],
        output: t('理论上限约 62.5%，真实机组多在 40–50%', 'Theoretical ceiling ≈ 62.5%; real plants run at 40–50%'),
    },
    links: {
        upstream: [{ id: 'phys-adiabatic-process' }, { id: 'phys-first-law-thermo' }],
        downstream: [{ id: 'phys-refrigerator-cop' }, { id: 'phys-entropy-second-law' }],
    },
};
export default physCarnotEfficiency;
//# sourceMappingURL=phys-carnot-efficiency.js.map