import { t } from '../../core/types.js';
/** direct-wave-travel-time */
const directWaveTravelTime = {
    id: 'direct-wave-travel-time',
    name: t('单层均匀介质中的直达波走时', 'Direct-Wave Travel Time in a Uniform Medium'),
    aliases: {
        zh: ['直达波', '直达波走时', '均匀介质走时'],
        en: ['direct wave', 'direct arrival', 'travel time in a homogeneous medium'],
    },
    node: 'S2.1',
    tags: {
        math: ['MATH.GEOM'],
        method: ['METH.TELE', 'METH.EXPL'],
        quantity: ['Q.TIME', 'Q.VEL', 'Q.GEOM'],
        keywords: t('直达波 走时 均匀介质 震源距 速度 初至', 'direct wave travel time homogeneous medium hypocentral distance velocity first arrival'),
    },
    audience: 'highschool',
    complete: 'L2',
    statement: {
        main: String.raw `t=\frac{r}{v}`,
        variants: [
            { name: t('P 波与 S 波', 'For P and S'), latex: String.raw `t_{P}=\frac{r}{\alpha},\qquad t_{S}=\frac{r}{\beta}` },
            {
                name: t('以震中距与深度表示', 'In terms of epicentral distance and depth'),
                latex: String.raw `t=\frac{\sqrt{x^{2}+h^{2}}}{v}`,
            },
            {
                name: t('分层介质的路径积分', 'Path integral for a layered medium'),
                latex: String.raw `t=\int_{\mathrm{ray}}\frac{\mathrm{d}s}{v\left(\mathbf{x}\right)}=\sum_{i}\frac{\ell_{i}}{v_{i}}`,
            },
            {
                name: t('用慢度表示', 'In terms of slowness'),
                latex: String.raw `t=\int_{\mathrm{ray}}u\,\mathrm{d}s,\qquad u=\frac{1}{v}`,
            },
        ],
    },
    meaning: t('最简单的走时公式，也是所有复杂走时的基石：速度恒定时射线是直线，走时就是路程除以速度。它给出的是「如果没有任何界面和梯度，波会什么时候到」，因而是判断是否存在更早走时路径（首波、折射波）的基准线，也是均匀假设下定深、定位的直接依据。', 'The simplest travel-time formula and the foundation of every more elaborate one: with constant velocity the ray is straight and the travel time is distance divided by speed. It gives the arrival time that would occur if there were no interfaces and no gradient, so it is the reference against which faster paths (head waves, refracted arrivals) are judged, and the direct basis of depth and location estimates under the homogeneity assumption.'),
    symbols: [
        { sym: 't', name: t('走时', 'travel time'), unit: 's', typical: '0.5 – 1200' },
        { sym: 'r', name: t('震源距（沿射线的路程）', 'hypocentral distance (path length along the ray)'), unit: 'm', typical: '10² – 10⁷' },
        { sym: 'v', name: t('介质速度（P 波取 α，S 波取 β）', 'medium velocity (α for P, β for S)'), unit: 'm/s', typical: '1500 – 13700' },
        { sym: '\\alpha,\\ \\beta', name: t('P 波、S 波速度', 'P- and S-wave velocities'), unit: 'm/s' },
        { sym: 'x', name: t('震中距（水平距离）', 'epicentral distance (horizontal offset)'), unit: 'm' },
        { sym: 'h', name: t('震源深度', 'source depth'), unit: 'm' },
        { sym: 'u', name: t('慢度 1/v', 'slowness 1/v'), unit: 's/m' },
    ],
    conditions: {
        applies: [
            t('介质速度恒定、无界面的直达 P 或直达 S', 'Direct P or direct S in a medium of constant velocity with no interfaces'),
            t('作为检验是否存在更早路径的基准走时', 'As the reference time against which faster paths are tested'),
        ],
        assumes: [
            t('各向同性、均匀、无衰减；射线为直线', 'Isotropic, homogeneous, non-attenuating; rays are straight'),
            t('速度不随频率变化（无色散）', 'Velocity independent of frequency (no dispersion)'),
        ],
        breaks: [
            t('存在速度梯度或界面时射线弯曲，必须改用路径积分或射线追踪', 'With velocity gradients or interfaces rays bend and one must use a path integral or ray tracing'),
            t('当下伏高速层存在时，首波会比直达波先到，直达波不再是初至', 'When a faster layer underlies the source, the head wave arrives first and the direct wave is no longer the first arrival'),
            t('各向异性介质中射线方向一般不等于波矢方向', 'In anisotropic media the ray direction generally differs from the wave-vector direction'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('设定：速度 v 处处相同', 'Setup: the velocity v is the same everywhere'),
            latex: String.raw `v\left(\mathbf{x}\right)=v=\text{const}`,
        },
        {
            n: 2,
            op: 'geometry',
            title: t('均匀介质中射线是连接震源与台站的直线', 'In a uniform medium the ray is the straight segment joining source and station'),
            latex: String.raw `\ell=r=|\mathbf{x}_{\mathrm{st}}-\mathbf{x}_{\mathrm{src}}|`,
            note: t('由 Fermat 最小走时原理：两点间直线使 ∫ds/v 取极小。', 'From Fermat\'s principle of least time: the straight segment minimises ∫ds/v between two points.'),
        },
        {
            n: 3,
            op: 'physics',
            title: t('路程除以速度', 'Path length divided by speed'),
            latex: String.raw `t=\int_{0}^{r}\frac{\mathrm{d}s}{v}=\frac{r}{v}`,
        },
        {
            n: 4,
            op: 'substitute',
            title: t('把 r 换成可观测的震中距与深度', 'Replace r by the observable epicentral distance and depth'),
            latex: String.raw `r=\sqrt{x^{2}+h^{2}}\;\Longrightarrow\; t\left(x\right)=\frac{\sqrt{x^{2}+h^{2}}}{v}`,
            note: t('这是一条以 x 为横轴的双曲线分支：直达波在 (x, t) 平面上就是它。', 'This is a branch of a hyperbola in the (x, t) plane: that is exactly what a direct arrival looks like on a record section.'),
        },
        {
            n: 5,
            op: 'result',
            title: t('分层时逐段求和', 'For layering, sum segment by segment'),
            latex: String.raw `t=\sum_{i}\frac{\ell_{i}}{v_{i}}=\sum_{i}u_{i}\ell_{i}`,
        },
    ],
    links: {
        upstream: [{ id: 'hypocentral-distance-geometry', note: t('给出 r 与 Δ、h 的换算', 'gives r from Δ and h') }],
        downstream: [
            { id: 'head-wave-critical-angle', note: t('高速层存在时首波会取代直达波成为初至', 'a faster layer makes the head wave the first arrival') },
            { id: 'sp-time-difference-distance' },
        ],
        seealso: [{ id: 'ps-wave-velocities', note: t('给出 α、β 的数值', 'supplies numerical α and β') }],
    },
    refs: [
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §3.1' },
        { text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §4.2' },
    ],
};
export default directWaveTravelTime;
//# sourceMappingURL=direct-wave-travel-time.js.map