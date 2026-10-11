import { t } from '../../core/types.js';
/** phys-adiabatic-process */
const physAdiabaticProcess = {
    id: 'phys-adiabatic-process',
    name: t('绝热过程', 'Adiabatic Process'),
    aliases: { zh: ['绝热方程 pV^γ=const'], en: ['adiabatic process', 'pV^γ = const'] },
    node: 'S18.6',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY'],
        keywords: t('绝热过程 pVγ 等温 压缩升温 柴油机 声速', 'adiabatic pV gamma isothermal compression heating diesel sound speed'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `pV^{\gamma}=\text{常量},\qquad T V^{\gamma-1}=\text{常量}`,
        variants: [
            { name: t('与等温线对比', 'compared with isothermal'), latex: String.raw `\text{等温: }pV=\text{const};\quad \text{绝热: }pV^{\gamma}=\text{const}` },
        ],
    },
    meaning: t('绝热过程中系统与外界无热量交换（Q=0），压缩时外界对气体做功、内能增加、温度升高；膨胀时反之。pV^γ=const 比等温线 pV=const 更陡——这就是柴油机不用火花塞、只靠压缩空气到高温就能喷油点火的原理。声速在空气中也由 γ 决定。', 'In an adiabatic process no heat is exchanged (Q = 0): compression does work on the gas, raising internal energy and temperature; expansion does the opposite. The adiabat pV^γ = const is steeper than the isotherm pV = const — which is why a diesel ignites fuel purely by compressing air to a high temperature, with no spark plug. The speed of sound in air also depends on γ.'),
    symbols: [
        { sym: 'p,V,T', name: t('压强、体积、温度', 'pressure, volume, temperature'), unit: 'Pa, m³, K' },
        { sym: '\\gamma', name: t('绝热指数 Cp/Cv', 'adiabatic index Cp/Cv'), unit: '—', typical: '1.4' },
    ],
    conditions: {
        applies: [t('快速过程（来不及换热）或绝热壁', 'Fast processes (no time to exchange heat) or insulated walls')],
        assumes: [t('准静态、理想气体', 'Quasi-static, ideal gas')],
        breaks: [t('过程缓慢时退化为等温', 'Slow processes reduce to isothermal')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('第一定律 Q=0', 'First law with Q = 0'), latex: String.raw `\mathrm{d}U=-p\,\mathrm{d}V` },
        { n: 2, op: 'substitute', title: t('dU=n C_v dT', 'dU = n C_v dT'), latex: String.raw `n C_v\,\mathrm{d}T=-p\,\mathrm{d}V` },
        { n: 3, op: 'algebra', title: t('用 pV=nRT 微分消去 dT', 'Differentiate pV=nRT to eliminate dT'), latex: String.raw `C_v(p\,\mathrm{d}V+V\,\mathrm{d}p)=-R p\,\mathrm{d}V` },
        { n: 4, op: 'result', title: t('整理得 pV^γ=const', 'Rearrange to pV^γ = const'), latex: String.raw `\dfrac{\mathrm{d}p}{p}+\gamma\dfrac{\mathrm{d}V}{V}=0\;\Rightarrow\; pV^{\gamma}=\text{const}` },
    ],
    viz: [
        {
            id: 'adiabat-vs-isotherm',
            level: 'V1',
            title: t('绝热线比等温线更陡', 'The adiabat is steeper than the isotherm'),
            xlabel: t('体积 V (m³)', 'volume V (m³)'),
            ylabel: t('压强 p (×10⁵ Pa)', 'pressure p (×10⁵ Pa)'),
            controls: [
                { id: 'g', label: t('绝热指数 γ', 'adiabatic index γ'), min: 1.1, max: 1.67, step: 0.01, value: 1.4 },
            ],
            xRange: [0.01, 0.5],
            note: t('同一初态出发：等温 pV=const（虚线），绝热 pV^γ=const（实线）——绝热膨胀压强掉得更快。', 'From the same state: isothermal pV=const (dashed), adiabatic pV^γ=const (solid) — adiabatic expansion drops pressure faster.'),
            compute: (p) => {
                const g = p['g'];
                const iso = [];
                const adi = [];
                for (let i = 1; i <= 200; i++) {
                    const v = 0.01 + (i / 200) * 0.49;
                    iso.push([v, 0.024 / v / 1e-5 / 10]);
                    adi.push([v, (0.024 * Math.pow(0.024, g - 1)) / Math.pow(v, g) / 1e-5 / 10]);
                }
                return [
                    { label: t('等温 pV=const', 'isothermal pV=const'), color: '#BA7517', dash: true, points: iso },
                    { label: t('绝热 pV^γ=const', 'adiabatic pV^γ=const'), color: '#185FA5', points: adi },
                ];
            },
        },
    ],
    links: {
        upstream: [{ id: 'phys-first-law-thermo' }, { id: 'phys-mayer-relation' }],
        downstream: [{ id: 'phys-carnot-efficiency' }],
    },
};
export default physAdiabaticProcess;
//# sourceMappingURL=phys-adiabatic-process.js.map