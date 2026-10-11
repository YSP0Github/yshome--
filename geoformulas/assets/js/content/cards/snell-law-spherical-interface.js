import { t } from '../../core/types.js';
/** snell-law-spherical-interface */
const snellLawSphericalInterface = {
    id: 'snell-law-spherical-interface',
    name: t('球面界面上的 Snell 定律', "Snell's Law at Spherical Interfaces"),
    aliases: {
        zh: ['球面 Snell', '球对称射线参数', '平地球变换'],
        en: ['spherical Snell', 'ray parameter in a sphere', 'earth-flattening transformation'],
    },
    node: 'S2.2',
    tags: {
        math: ['MATH.GEOM', 'MATH.VECTOR'],
        method: ['METH.TELE', 'METH.STRUCT'],
        quantity: ['Q.VEL', 'Q.GEOM', 'Q.TIME'],
        keywords: t('球面 Snell 球对称 射线参数 平地球变换 转向半径', 'spherical Snell spherically symmetric ray parameter earth flattening turning radius'),
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `p=\frac{r\sin i\left(r\right)}{v\left(r\right)}=\text{const}`,
        variants: [
            {
                name: t('同心球壳界面上的形式', 'At a concentric spherical interface'),
                latex: String.raw `\frac{r\sin i_{1}}{v_{1}}=\frac{r\sin i_{2}}{v_{2}}`,
            },
            {
                name: t('转向（底点）半径', 'Turning radius'),
                latex: String.raw `r_{t}=p\,v\left(r_{t}\right)`,
            },
            {
                name: t('震中距与走时的积分', 'Integrals for distance and travel time'),
                latex: String.raw `\Delta\left(p\right)=2\int_{r_{t}}^{R}\frac{p\,v}{r\sqrt{r^{2}-p^{2}v^{2}}}\,\mathrm{d}r,\qquad T\left(p\right)=2\int_{r_{t}}^{R}\frac{r}{v\sqrt{r^{2}-p^{2}v^{2}}}\,\mathrm{d}r`,
            },
            {
                name: t('平地球变换', 'Earth-flattening transformation'),
                latex: String.raw `z=R\ln\frac{R}{r},\qquad v_{\mathrm{flat}}\left(z\right)=\frac{R}{r}\,v\left(r\right)`,
            },
        ],
    },
    meaning: t('地球是球，界面是同心球面。在每一个球面上，局部法线就是径向，所以平面形式的 Snell 定律仍然成立；但两侧半径相同这一点带来一个额外守恒量 r sin i / v —— 它就是球对称介质中的射线参数。有了它，射线不再需要逐层追踪：给定 p，转向半径、震中距、走时全部由两个积分给出，阴影区、三折、PKP 等现象都是这两条积分的直接后果。', 'The Earth is a sphere and its interfaces are concentric spherical surfaces. On each such surface the local normal is the radial direction, so the plane form of Snell\'s law still holds; but the fact that the radius is the same on both sides yields an extra conserved quantity, r sin i / v — the ray parameter in a spherically symmetric medium. With it a ray no longer has to be traced layer by layer: given p, the turning radius, epicentral distance and travel time all follow from two integrals, and shadow zones, triplications and PKP are direct consequences of those two integrals.'),
    symbols: [
        { sym: 'p', name: t('球对称介质中的射线参数', 'ray parameter in a spherically symmetric medium'), unit: 's', typical: '100 – 1000 s（即 2 – 18 s/deg）' },
        { sym: 'r', name: t('到地心的半径', 'radius from the Earth\'s centre'), unit: 'km', typical: '0 – 6371' },
        { sym: 'R', name: t('地球半径', 'Earth radius'), unit: 'km', typical: '6371' },
        { sym: 'i\\left(r\\right)', name: t('射线与径向（局部法线）的夹角', 'angle between the ray and the radial direction (local normal)'), unit: '°' },
        { sym: 'v\\left(r\\right)', name: t('随半径变化的速度', 'velocity as a function of radius'), unit: 'km/s', typical: '5 – 14' },
        { sym: 'r_{t}', name: t('转向半径（射线最深处）', 'turning radius (deepest point of the ray)'), unit: 'km' },
        { sym: '\\Delta', name: t('震中距（地心张角）', 'epicentral distance (geocentric angle)'), unit: '°' },
        { sym: 'T', name: t('走时', 'travel time'), unit: 's' },
        { sym: 'v_{\\mathrm{flat}}', name: t('平地球变换后的等效速度', 'equivalent velocity after the earth-flattening transform'), unit: 'km/s' },
    ],
    conditions: {
        applies: [
            t('球对称（径向分层）地球中的体波射线：IASP91、ak135、PREM 一类模型', 'Body-wave rays in a spherically symmetric Earth: models of the IASP91, ak135 and PREM class'),
            t('由 τ(p)、Δ(p) 反演径向速度结构（Gutenberg 反演、Herglotz–Wiechert）', 'Inverting radial velocity structure from τ(p) and Δ(p) (Gutenberg inversion, Herglotz–Wiechert)'),
        ],
        assumes: [
            t('速度只随半径变化，忽略扁率、横向非均匀与各向异性', 'Velocity varies with radius only; ellipticity, lateral heterogeneity and anisotropy are ignored'),
            t('射线位于一个大圆面内（球对称性保证这一点）', 'Rays stay in a great-circle plane, which spherical symmetry guarantees'),
        ],
        breaks: [
            t('扁率与横向非均匀（D″ 层、俯冲板片）使射线偏离大圆、Δ 与 p 不再单值对应', 'Ellipticity and lateral heterogeneity (D″, slabs) push rays off the great circle, so Δ and p are no longer in one-to-one correspondence'),
            t('速度间断处出现三折，p 相同却对应多条射线', 'At velocity discontinuities triplications appear: the same p corresponds to several rays'),
            t('波长接近速度梯度尺度时需用全波方法（如 Pdiff）', 'When the wavelength approaches the gradient scale, full-wave methods are needed (as for Pdiff)'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'setup',
            title: t('介质由同心球壳组成', 'The medium consists of concentric spherical shells'),
            latex: String.raw `v=v\left(r\right),\qquad \text{界面位于 } r=\text{const}`,
        },
        {
            n: 2,
            op: 'geometry',
            title: t('球面上局部法线就是径向', 'On a sphere the local normal is the radial direction'),
            latex: String.raw `\frac{\sin i_{1}}{v_{1}}=\frac{\sin i_{2}}{v_{2}}\qquad (\text{局部看成平面})`,
            note: t('只要界面尺度远大于波长，局部平面近似就成立。', 'As long as the interface scale is much larger than the wavelength, the local-plane approximation holds.'),
        },
        {
            n: 3,
            op: 'algebra',
            title: t('界面两侧半径相同，同乘 r', 'The radius is the same on both sides; multiply by r'),
            latex: String.raw `\frac{r\sin i_{1}}{v_{1}}=\frac{r\sin i_{2}}{v_{2}}\equiv p`,
            note: t('这多出来的因子 r，正是球面与平面的全部区别。', 'This extra factor r is the entire difference between a sphere and a half-space.'),
        },
        {
            n: 4,
            op: 'transform',
            title: t('连续极限', 'Continuum limit'),
            latex: String.raw `p=\frac{r\sin i\left(r\right)}{v\left(r\right)}=\text{const}`,
        },
        {
            n: 5,
            op: 'geometry',
            title: t('转向半径：sin i 达到 1', 'Turning radius: sin i reaches 1'),
            latex: String.raw `\sin i=\frac{p\,v\left(r\right)}{r}=1\;\Longrightarrow\; r_{t}=p\,v\left(r_{t}\right)`,
        },
        {
            n: 6,
            op: 'result',
            title: t('由几何关系得到 Δ 与 T 的积分', 'Geometry gives the integrals for Δ and T'),
            latex: String.raw `\frac{\mathrm{d}\theta}{\mathrm{d}r}=\frac{\tan i}{r}=\frac{p\,v}{r\sqrt{r^{2}-p^{2}v^{2}}},\qquad \frac{\mathrm{d}t}{\mathrm{d}r}=\frac{1}{v\cos i}=\frac{r}{v\sqrt{r^{2}-p^{2}v^{2}}}`,
            note: t('乘 2 是因为下行段与上行段对称。这两个积分就是全部远震走时表的生成器。', 'The factor 2 accounts for the symmetric downgoing and upgoing legs. These two integrals generate the entire teleseismic travel-time table.'),
        },
    ],
    links: {
        upstream: [
            { id: 'snell-ray-parameter', note: t('平面情形的原型', 'the prototype for the planar case') },
            { id: 'ray-parameter-conservation', note: t('守恒思想来自这里', 'the idea of conservation comes from here') },
        ],
        downstream: [{ id: 'core-shadow-zone', note: t('Δ(p) 的间断就是阴影区', 'the discontinuity of Δ(p) is the shadow zone') }],
        seealso: [{ id: 'adams-williamson', note: t('把速度剖面变成密度剖面', 'turns the velocity profile into a density profile') }],
    },
    refs: [
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §4.3' },
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §12.2' },
    ],
};
export default snellLawSphericalInterface;
//# sourceMappingURL=snell-law-spherical-interface.js.map