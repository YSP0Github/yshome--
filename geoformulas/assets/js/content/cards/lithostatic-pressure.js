import { t } from '../../core/types.js';
/** lithostatic-pressure */
const lithostaticPressure = {
    id: 'lithostatic-pressure',
    name: t('岩石静压力（垂向应力）', 'Lithostatic Pressure (Vertical Stress)'),
    aliases: { zh: ['静岩压力', '上覆岩层压力', '围压', '地静应力'], en: ['lithostatic pressure', 'overburden pressure', 'confining pressure', 'vertical stress'] },
    node: 'S1.1',
    tags: {
        math: ['MATH.DIFF'],
        method: ['METH.STRUCT', 'METH.ROCK'],
        quantity: ['Q.MAT', 'Q.GEOM'],
        keywords: t('静岩压力 上覆岩层 围压 有效应力 孔隙压力 深度 密度 梯度', 'lithostatic overburden confining pressure effective stress pore pressure depth density gradient'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\sigma_{v}=\rho\,g\,z`,
        variants: [
            { name: t('密度随深度变化时', 'When density varies with depth'), latex: String.raw `\sigma_{v}(z)=\int_{0}^{z}\rho(z')\,g\,\mathrm{d}z' = g\sum_k \rho_k\,\Delta z_k` },
            { name: t('静水（孔隙）压力', 'Hydrostatic pore pressure'), latex: String.raw `p_p=\rho_w\,g\,z\approx 9.8\ \text{MPa/km}` },
            { name: t('有效垂向应力（Terzaghi / Biot）', 'Effective vertical stress (Terzaghi / Biot)'), latex: String.raw `\sigma'_v=\sigma_v-\alpha\,p_p\approx\left(\rho-\rho_w\right)g\,z` },
            { name: t('无侧向应变时的水平应力', 'Horizontal stress under uniaxial strain'), latex: String.raw `\sigma_h=\frac{\nu}{1-\nu}\,\sigma_v` },
            { name: t('常用数值梯度', 'Handy numerical gradients'), latex: String.raw `\rho=2700\ \text{kg/m}^3:\ \frac{\mathrm{d}\sigma_v}{\mathrm{d}z}\approx 26.5\ \text{MPa/km}` },
        ],
    },
    meaning: t('地壳里最深、最可靠的那一条应力：你脚下每一米岩石都在扛着它上面所有岩石的重量。它给出所有深部过程的背景压力 —— 波速随深度上升、破裂强度随深度上升、孔隙压力逼近它时岩石就会「浮起来」而易于滑动。这条公式也是把实验室岩石力学结果外推到地壳深部的唯一桥梁。', 'The most reliable stress in the crust: every metre of rock carries the weight of everything above it. It sets the background pressure for all deep processes — seismic velocity rising with depth, strength rising with depth, and rock that effectively floats and slips easily once pore pressure approaches the overburden. It is also the only bridge for extrapolating laboratory rock mechanics into the deep crust.'),
    symbols: [
        { sym: '\\sigma_v', name: t('垂向（上覆岩层）应力，压为正', 'vertical (overburden) stress, compression positive'), unit: 'Pa', typical: '0 – 10⁹ Pa' },
        { sym: '\\rho', name: t('上覆岩石的平均密度', 'mean density of the overlying rock'), unit: 'kg/m³', typical: '2000 – 3300' },
        { sym: '\\rho_w', name: t('孔隙水密度', 'pore-water density'), unit: 'kg/m³', typical: '1000 – 1200' },
        { sym: 'g', name: t('重力加速度', 'gravitational acceleration'), unit: 'm/s²', typical: '9.81' },
        { sym: 'z', name: t('深度（自地表向下）', 'depth measured downward from the surface'), unit: 'm' },
        { sym: 'p_p', name: t('孔隙流体压力', 'pore-fluid pressure'), unit: 'Pa' },
        { sym: '\\sigma\'_v', name: t('有效垂向应力', 'effective vertical stress'), unit: 'Pa' },
        { sym: '\\alpha', name: t('Biot 系数（此处不是衰减系数）', 'Biot coefficient (not the attenuation coefficient here)'), unit: '', dimension: '无量纲', typical: '0.6 – 1.0' },
        { sym: '\\sigma_h', name: t('水平应力', 'horizontal stress'), unit: 'Pa' },
        { sym: '\\nu', name: t('泊松比', "Poisson's ratio"), unit: '', dimension: '无量纲', typical: '0.25' },
    ],
    conditions: {
        applies: [
            t('地壳与上地幔浅部，构造应力不大的地区', 'The crust and uppermost mantle where tectonic stresses are modest'),
            t('估算围压、孔隙压力与有效应力的背景值', 'Estimating background confining pressure, pore pressure and effective stress'),
        ],
        assumes: [
            t('垂向平衡，无垂向加速度；侧向边界不承受垂向剪力', 'Vertical equilibrium with no vertical acceleration and no vertical shear on the lateral boundaries'),
            t('深度是「垂直深度」而非沿井轨迹的长度', 'Depth is true vertical depth, not length along a deviated well'),
            t('g 近似为常数（地壳尺度误差 < 1%）', 'g is treated as constant, an error well below 1% at crustal scale'),
        ],
        breaks: [
            t('造山带、俯冲带等构造应力可达静岩量的数倍', 'In orogens and subduction zones tectonic stresses can reach several times the lithostatic value'),
            t('超压盆地（孔隙压力接近甚至超过 σ_v）必须用有效应力', 'Overpressured basins, where pore pressure approaches or exceeds σ_v, must be treated with effective stress'),
            t('盐丘、塑性流动层中垂向应力可以偏离上覆重量', 'In salt domes and ductile flowing layers the vertical stress can depart from the overburden weight'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('取深度 z 处一个单位水平截面', 'Take a unit horizontal area at depth z'),
            latex: String.raw `\sigma_v=\frac{F_v}{A}=\frac{W}{A}`,
            note: t('上方岩柱的重量全部压在这个截面上，因为没有别的东西能托住它。', 'The entire weight of the column above bears on this section; nothing else can hold it up.') },
        { n: 2, op: 'physics', title: t('对厚度为 dz 的薄片做垂向力平衡', 'Vertical force balance on a slice of thickness dz'),
            latex: String.raw `\left[\sigma_v(z+\mathrm{d}z)-\sigma_v(z)\right]A=\rho\,g\,A\,\mathrm{d}z`,
            note: t('这就是一维的应力平衡方程 ∂σ_v/∂z = ρg，形式与流体静力学完全相同。', 'This is the one-dimensional stress equilibrium ∂σ_v/∂z = ρg, formally identical to hydrostatic balance in a fluid.') },
        { n: 3, op: 'algebra', title: t('写成微分方程', 'Write it as a differential equation'),
            latex: String.raw `\frac{\mathrm{d}\sigma_v}{\mathrm{d}z}=\rho(z)\,g` },
        { n: 4, op: 'transform', title: t('从地表（σ_v = 0）积分到深度 z', 'Integrate from the surface, where σ_v = 0, down to z'),
            latex: String.raw `\sigma_v(z)=\int_0^z \rho(z')\,g\,\mathrm{d}z'`,
            note: t('野外的做法是分层求和：每层用各自的密度，测井密度曲线就是为此而测的。', 'In practice this is done layer by layer with each layer’s own density — which is exactly why density logs are acquired.') },
        { n: 5, op: 'substitute', title: t('密度取常数即得常用形式', 'Constant density gives the familiar form'),
            latex: String.raw `\sigma_v=\rho g z\;\xrightarrow{\rho=2700}\;\sigma_v\approx 26.5\,z\ \text{[MPa, z in km]}` },
        { n: 6, op: 'result', title: t('扣除孔隙压力得到有效应力', 'Subtract pore pressure to get the effective stress'),
            latex: String.raw `\sigma'_v=\sigma_v-\alpha p_p=\left(\rho-\alpha\rho_w\right)gz`,
            note: t('控制岩石强度与断层滑动的是 σ′_v 而不是 σ_v：注水压裂、废液回注诱发地震的全部机理都在这个减法里。', 'Rock strength and fault slip are governed by σ′_v, not σ_v: the entire mechanism behind hydraulic fracturing and injection-induced seismicity lives in this subtraction.') },
    ],
    viz: [
        {
            id: 'pressure-vs-depth',
            level: 'V1',
            title: t('静岩压力、孔隙压力与有效应力随深度的变化', 'Lithostatic, pore and effective stress versus depth'),
            xlabel: t('应力 / 压力 (MPa)', 'stress / pressure (MPa)'),
            ylabel: t('深度 z (km)', 'depth z (km)'),
            controls: [
                { id: 'rho', label: t('岩石密度 ρ', 'rock density ρ'), min: 1800, max: 3300, step: 10, value: 2700, unit: 'kg/m³' },
                { id: 'lam', label: t('孔隙压力 / 静岩压力 之比', 'pore pressure / lithostatic ratio'), min: 0, max: 1.1, step: 0.01, value: 0.37, unit: '' },
            ],
            xRange: [0, 900],
            yRange: [0, 40],
            note: t('把孔隙压力比滑到 0.7 以上，有效应力（绿线）会被压得几乎贴住纵轴 —— 岩石几乎失去摩擦强度，这正是某些盆地深层易于滑动、注液容易诱发地震的原因。密度从 2700 降到 2200（厚沉积层），同样深度的围压会下降近 20%。', 'Slide the pore-pressure ratio above 0.7 and the effective stress (green) collapses towards the vertical axis: the rock loses nearly all its frictional strength, which is why deep parts of some basins slip so readily and why fluid injection can trigger earthquakes. Dropping the density from 2700 to 2200, as in a thick sedimentary section, lowers the confining pressure at the same depth by nearly 20%.'),
            compute: (p) => {
                const rho = p['rho'];
                const lam = p['lam'];
                const g = 9.81;
                const lith = [];
                const pore = [];
                const eff = [];
                const N = 200;
                for (let i = 0; i <= N; i++) {
                    const zkm = (i / N) * 40;
                    const zm = zkm * 1000;
                    const sv = (rho * g * zm) / 1e6;
                    const pp = lam * sv;
                    lith.push([sv, zkm]);
                    pore.push([pp, zkm]);
                    eff.push([sv - pp, zkm]);
                }
                return [
                    { label: t('静岩压力 σv', 'lithostatic stress σv'), color: '#185FA5', points: lith },
                    { label: t('孔隙压力 pp', 'pore pressure pp'), color: '#BA7517', points: pore },
                    { label: t('有效应力 σ′v', 'effective stress σ′v'), color: '#0F6E56', dash: true, points: eff },
                ];
            },
        },
    ],
    example: {
        title: t('10 km 深处的围压与有效应力', 'Confining and effective stress at 10 km depth'),
        input: t('ρ = 2700 kg/m³，g = 9.81 m/s²，z = 10 km，孔隙压力为静水的 0.4 倍。', 'ρ = 2700 kg/m³, g = 9.81 m/s², z = 10 km, pore pressure 0.4 times hydrostatic.'),
        steps: [
            t('σv = 2700 × 9.81 × 10000 = 2.65 × 10⁸ Pa = 265 MPa', 'σv = 2700 × 9.81 × 10000 = 2.65 × 10⁸ Pa = 265 MPa'),
            t('静水压力 = 1000 × 9.81 × 10000 = 98.1 MPa，取 0.4 倍得 pp ≈ 39 MPa', 'hydrostatic = 1000 × 9.81 × 10000 = 98.1 MPa, so 0.4 × that gives pp ≈ 39 MPa'),
            t('σ′v = 265 − 39 = 226 MPa', 'σ′v = 265 − 39 = 226 MPa'),
        ],
        output: t('10 km 深处围压约 265 MPa，有效应力约 226 MPa；而典型地壳岩石的破裂强度约 100–500 MPa —— 数量级上的一致，正是深源地震可以发生的原因。', 'At 10 km depth the confining pressure is about 265 MPa and the effective stress about 226 MPa, while typical crustal rocks fail at 100–500 MPa. The agreement in order of magnitude is why deep earthquakes can happen at all.'),
    },
    links: {
        upstream: [{ id: 'traction-cauchy-stress', note: t('σ_v 就是水平面上的正应力', 'σ_v is just the normal stress on a horizontal plane') }],
        seealso: [
            { id: 'mohr-circle-max-shear', note: t('围压把 Mohr 圆整体推向高应力区', 'confining pressure pushes the whole Mohr circle to higher stress') },
            { id: 'adams-williamson', note: t('密度随深度的积分正是这里的 ρ(z)', 'the depth integral of density is the ρ(z) used here') },
        ],
    },
    refs: [
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §9.1' },
        { text: 'Zoback, Reservoir Geomechanics, §1.2' },
    ],
};
export default lithostaticPressure;
//# sourceMappingURL=lithostatic-pressure.js.map