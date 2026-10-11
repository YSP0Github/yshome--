import { t } from '../../core/types.js';
/** spherical-earth-travel-time */
const sphericalEarthTravelTime = {
    id: 'spherical-earth-travel-time',
    name: t('球对称地球的走时积分', 'Travel-time Integral in a Spherical Earth'),
    aliases: { zh: ['地球走时积分', '射线积分'], en: ['travel-time integral', 'ray integral'] },
    node: 'S2.4',
    tags: {
        math: ['MATH.DIFF', 'MATH.GEOM'],
        method: ['METH.TELE', 'METH.STRUCT'],
        quantity: ['Q.TIME', 'Q.VEL', 'Q.GEOM'],
    },
    audience: 'phd',
    complete: 'L2',
    statement: {
        main: String.raw `T(p)=2\int_{r_t}^{R}\frac{r\,u(r)\,\mathrm{d}r}{\sqrt{r^{2}-p^{2}v^{2}(r)}}`,
        variants: [
            { name: t('对应的震中距积分', 'The companion distance integral'), latex: String.raw `\Delta(p)=2\int_{r_t}^{R}\frac{p\,v(r)\,\mathrm{d}r}{r\sqrt{r^{2}-p^{2}v^{2}(r)}}` },
            { name: t('转折点半径 r_t 的定义', 'Definition of the turning radius r_t'), latex: String.raw `\frac{r_t}{v(r_t)}=p` },
        ],
    },
    meaning: t('地球不是平的一半空间，而是球体。射线在球对称地球里走的是一条弯曲路径，其走时与震中距都由射线参数 p 唯一决定 —— 这两个积分是 IASP91、AK135、PREM 等一维模型计算理论走时的基础，也是 τ–p 反演与走时层析的出发点。', 'The Earth is not a flat half-space but a sphere. A ray in a spherically symmetric Earth follows a curved path whose travel time and epicentral distance are fixed uniquely by the ray parameter p. These two integrals underpin the theoretical travel times of IASP91, AK135 and PREM, and are the starting point of τ–p inversion and travel-time tomography.'),
    symbols: [
        { sym: 'T(p)', name: t('走时', 'travel time'), unit: 's', typical: '100 – 2000' },
        { sym: '\\Delta(p)', name: t('震中距（弧度）', 'epicentral distance (radians)'), unit: 'rad', typical: '0 – 3' },
        { sym: 'p', name: t('射线参数', 'ray parameter'), unit: 's/km', typical: '0 – 0.1' },
        { sym: 'r', name: t('地心半径', 'radius from Earth centre'), unit: 'km', typical: '3480 – 6371' },
        { sym: 'r_t', name: t('射线转折点半径', 'turning-point radius'), unit: 'km' },
        { sym: 'u(r)=1/v', name: t('慢度', 'slowness'), unit: 's/km' },
        { sym: 'R', name: t('地球半径', 'Earth radius'), unit: 'km', typical: '6371' },
    ],
    conditions: {
        applies: [t('球对称、径向变化的速度结构 v(r)', 'Spherically symmetric, radially varying velocity structure v(r)')],
        assumes: [
            t('速度只随半径变化，忽略横向非均匀与地球扁率', 'Velocity varies only with radius; lateral heterogeneity and ellipticity are ignored'),
            t('射线单调下折（一个转折点）', 'The ray turns once (a single turning point)'),
        ],
        breaks: [
            t('穿过地核的 PKP 等相需分段积分', 'Core phases such as PKP require piecewise integration'),
            t('在低速带内无转折点，积分发散', 'Inside a low-velocity zone there is no turning point and the integral diverges'),
        ],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('球对称下守恒的量是 p = r sin i / v', 'The conserved quantity is p = r sin i / v'),
            latex: String.raw `p=\frac{r\sin i}{v(r)}=\text{const}`,
            note: t('这是球坐标版的 Snell 定律：r sin i / v 而不是 sin θ / v。', 'This is Snell’s law in spherical coordinates: r sin i / v rather than sin θ / v.') },
        { n: 2, op: 'geometry', title: t('写出沿射线的弧长元', 'Write the arc-length element along the ray'),
            latex: String.raw `\mathrm{d}s=\frac{\mathrm{d}r}{\cos i}` },
        { n: 3, op: 'substitute', title: t('用 p 表示 cos i', 'Express cos i through p'),
            latex: String.raw `\sin i=\frac{p\,v(r)}{r}\;\Longrightarrow\;\cos i=\sqrt{1-\frac{p^{2}v^{2}(r)}{r^{2}}}=\frac{\sqrt{r^{2}-p^{2}v^{2}(r)}}{r}` },
        { n: 4, op: 'substitute', title: t('代入 dT = u ds', 'Substitute into dT = u ds'),
            latex: String.raw `\mathrm{d}T=u\,\mathrm{d}s=\frac{u(r)\,\mathrm{d}r}{\cos i}=\frac{r\,u(r)\,\mathrm{d}r}{\sqrt{r^{2}-p^{2}v^{2}(r)}}` },
        { n: 5, op: 'result', title: t('上下行对称，乘 2', 'Symmetry between downgoing and upgoing legs gives a factor of 2'),
            latex: String.raw `T(p)=2\int_{r_t}^{R}\frac{r\,u(r)\,\mathrm{d}r}{\sqrt{r^{2}-p^{2}v^{2}(r)}}`,
            note: t('同理对震中距元 dΔ = tan i · dr / r 积分得到 Δ(p)。', 'Integrating the distance element dΔ = tan i · dr / r likewise gives Δ(p).') },
    ],
    example: {
        title: t('均匀球体的特例', 'The special case of a uniform sphere'),
        input: t('v = 10 km/s 常数，R = 6371 km', 'v = 10 km/s constant, R = 6371 km'),
        steps: [
            t('常速下射线是直线，弦长 L = 2R sin(Δ/2)', 'At constant velocity the ray is straight, with chord L = 2R sin(Δ/2)'),
            t('T = L/v = 2R sin(Δ/2)/v', 'T = L/v = 2R sin(Δ/2)/v'),
            t('p = r_t/v = R cos(Δ/2)/v', 'p = r_t/v = R cos(Δ/2)/v'),
        ],
        output: t('Δ = 60° 时 T ≈ 637 s，这正是均匀地球走时曲线的基本形状', 'At Δ = 60° we get T ≈ 637 s — the basic shape of the travel-time curve for a uniform Earth'),
    },
    links: {
        upstream: [{ id: 'snell-ray-parameter', note: t('其球坐标推广', 'Its spherical-coordinate generalisation') }],
        downstream: [{ id: 'taup-transform', note: t('τ(p) 由它定义', 'τ(p) is defined from it') }],
    },
    refs: [{ text: 'Shearer, Introduction to Seismology, 2nd ed., §4.4' }, { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §9.2' }],
};
export default sphericalEarthTravelTime;
//# sourceMappingURL=spherical-earth-travel-time.js.map