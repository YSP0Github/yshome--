import { t } from '../../core/types.js';
/** wl-sonic-travel-time */
const wlSonicTravelTime = {
    id: 'wl-sonic-travel-time',
    name: t('声波时差测井 Δt', 'Sonic Interval Transit Time Log Δt'),
    aliases: { zh: ['声波测井', '声速测井', 'DT'], en: ['sonic log', 'interval transit time', 'DT'] },
    node: 'S17.1',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.LOG'],
        quantity: ['Q.VEL', 'Q.POR'],
        keywords: t('声波时差 Δt 纵波速度 慢度 声波测井 Wyllie 孔隙度', 'sonic transit time interval velocity slowness Wyllie porosity'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\Delta t=\frac{1}{v}\quad [\mu s/\mathrm{ft}\ \text{或}\ \mu s/\mathrm{m}]`, variants: [
            { name: t('典型值', 'Typical values'), latex: String.raw `\Delta t_{\text{水}}\approx 189,\ \Delta t_{\text{石英}}\approx 55.5\ \mu s/\mathrm{ft}` },
        ],
    },
    meaning: t('声波测井测量纵波在单位井段内的旅行时间 Δt=1/v，即慢度。孔隙流体（水/气）比固体骨架慢，所以孔隙度越大 Δt 越大。它既是地震速度标定、合成记录的输入，又可经 Wyllie 方程换算孔隙度。含气时 Δt 会偏大甚至出现周波跳跃。', 'Sonic logging measures the P-wave travel time per unit interval, Δt=1/v, i.e. slowness. Pore fluids (water/gas) are slower than the solid frame, so larger porosity gives larger Δt. It calibrates seismic velocity and builds synthetic seismograms, and converts to porosity via Wyllie. Gas-bearing beds raise Δt and may cause cycle skipping.'),
    symbols: [
        { sym: '\\Delta t', name: t('声波时差（慢度）', 'interval transit time (slowness)'), unit: 'μs/ft', typical: '40 – 140' },
        { sym: 'v', name: t('纵波速度', 'P-wave velocity'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('胶结良好的砂岩/碳酸盐岩', 'Well-cemented sandstone/carbonate')],
        assumes: [t('井眼规则、无周波跳跃', 'Regular hole, no cycle skipping')],
        breaks: [t('未固结砂岩、含气层 Δt 偏大失真', 'Unconsolidated sands and gas beds bias Δt')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('慢度即速度倒数', 'Slowness is the inverse of velocity'),
            latex: String.raw `\Delta t=1/v` },
        { n: 2, op: 'substitute', title: t('与 Wyllie 时间平均衔接', 'Link to Wyllie'),
            latex: String.raw `\Delta t=\phi\,\Delta t_{f}+(1-\phi)\,\Delta t_{m}` },
        { n: 3, op: 'result', title: t('解出孔隙度', 'Solve for porosity'),
            latex: String.raw `\phi=\dfrac{\Delta t-\Delta t_{m}}{\Delta t_{f}-\Delta t_{m}}` },
    ],
    links: {
        downstream: [{ id: 'wl-porosity-from-sonic' }],
        seealso: [{ id: 'wyllie-time-average', note: t('岩石物理基础式', 'Rock-physics basis') }],
    },
    refs: [{ text: 'Wyllie et al. (1956); Ellis & Singer §8' }],
};
export default wlSonicTravelTime;
//# sourceMappingURL=wl-sonic-travel-time.js.map