import { t } from '../../core/types.js';
/** hypocentral-distance-geometry */
const hypocentralDistanceGeometry = {
    id: 'hypocentral-distance-geometry',
    name: t('震中距、震源深度与震源距的几何关系', 'Geometry of Epicentral Distance, Depth and Hypocentral Distance'),
    aliases: {
        zh: ['震源距', '震中距几何', '球面余弦定理'],
        en: ['hypocentral distance', 'epicentral distance geometry', 'spherical law of cosines'],
    },
    node: 'S2.1',
    tags: {
        math: ['MATH.GEOM'],
        method: ['METH.TELE', 'METH.STRUCT'],
        quantity: ['Q.GEOM', 'Q.SOURCE'],
        keywords: t('震源距 震中距 震源深度 地球半径 余弦定理 平面近似', 'hypocentral distance epicentral distance focal depth earth radius law of cosines flat-earth approximation'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `r^{2}=\Delta^{2}+h^{2}\qquad(\text{平面近似},\ \Delta\ \text{取弧长})`,
        variants: [
            {
                name: t('球面精确解（余弦定理）', 'Exact spherical form (law of cosines)'),
                latex: String.raw `r^{2}=R^{2}+\left(R-h\right)^{2}-2R\left(R-h\right)\cos\Delta`,
            },
            {
                name: t('反解震中距', 'Inverted for epicentral distance'),
                latex: String.raw `\cos\Delta=\frac{R^{2}+\left(R-h\right)^{2}-r^{2}}{2R\left(R-h\right)}`,
            },
            {
                name: t('台站处的入射角', 'Incidence angle at the station'),
                latex: String.raw `\sin i_{0}=\frac{\left(R-h\right)\sin\Delta}{r}`,
            },
            {
                name: t('平面近似的泰勒展开来源', 'Taylor origin of the flat approximation'),
                latex: String.raw `r^{2}=h^{2}+R\left(R-h\right)\Delta^{2}+O\left(\Delta^{4}\right)\qquad(\Delta\ \text{以弧度计})`,
            },
        ],
    },
    meaning: t('三个量 Δ（震中距）、h（震源深度）、r（震源距）并不是独立的：知道任意两个就能算出第三个。走时公式里出现的是 r，而地震目录里给出的是 Δ 和 h，所以这条几何关系是定位、走时反演、震相识别之间最基本的换算桥梁。在球面上它是一个余弦定理，只有在震中距很小（约 10° 以内）时才能退化成勾股定理。', 'The three quantities Δ (epicentral distance), h (depth) and r (hypocentral distance) are not independent: any two determine the third. Travel-time formulas are written in terms of r, whereas catalogues report Δ and h, so this geometric relation is the basic conversion between location, travel-time inversion and phase identification. On a sphere it is a law of cosines, and it degenerates to Pythagoras only at small epicentral distances (roughly within 10°).'),
    symbols: [
        { sym: 'r', name: t('震源距（震源到台站的直线距离）', 'hypocentral distance (straight-line source–station distance)'), unit: 'km', typical: '10 – 13000' },
        { sym: '\\Delta', name: t('震中距，地心张角；平面近似中取弧长 R\\Delta', 'epicentral distance, geocentric angle; the arc length R·Δ in the flat approximation'), unit: '° 或 km', typical: '0 – 180°' },
        { sym: 'h', name: t('震源深度', 'focal depth'), unit: 'km', typical: '0 – 700' },
        { sym: 'R', name: t('地球半径', 'Earth radius'), unit: 'km', typical: '6371' },
        { sym: 'i_{0}', name: t('台站处射线与铅垂线的夹角', 'angle between the ray and the vertical at the station'), unit: '°', typical: '0 – 90' },
    ],
    conditions: {
        applies: [
            t('任何需要把震中距、深度换算成震源距的场合（走时计算、震相识别、定位残差）', 'Whenever epicentral distance and depth must be converted to hypocentral distance (travel times, phase identification, location residuals)'),
        ],
        assumes: [
            t('地球为半径 R = 6371 km 的球，忽略扁率与地形', 'The Earth is a sphere of radius R = 6371 km; ellipticity and topography are ignored'),
            t('震源与台站都视为几何点', 'Source and station are treated as geometric points'),
        ],
        breaks: [
            t('平面近似在 Δ ≳ 10° 后误差迅速增大，180° 处相对误差可达 57%', 'The flat approximation degrades quickly beyond Δ ≳ 10°, reaching about 57% error at 180°'),
            t('需要考虑地球扁率（ellipticity）的精密走时表时，应使用椭球大地线而非球面公式', 'Precision travel-time tables that include ellipticity require ellipsoidal geodesics rather than spherical formulas'),
        ],
    },
    derivation: [
        {
            n: 1,
            op: 'geometry',
            title: t('构造三角形：地心 O、震源 S、台站 T', 'Build the triangle: centre O, source S, station T'),
            latex: String.raw `OS=R-h,\qquad OT=R,\qquad \angle SOT=\Delta`,
            note: t('这是唯一需要的物理输入，其余全是三角学。', 'This is the only physical input; everything else is trigonometry.'),
        },
        {
            n: 2,
            op: 'identity',
            title: t('对边 ST = r 用余弦定理', 'Apply the law of cosines to side ST = r'),
            latex: String.raw `r^{2}=\left(R-h\right)^{2}+R^{2}-2R\left(R-h\right)\cos\Delta`,
        },
        {
            n: 3,
            op: 'taylor',
            title: t('小角展开：cos Δ ≈ 1 − Δ²/2', 'Small-angle expansion: cos Δ ≈ 1 − Δ²/2'),
            latex: String.raw `r^{2}\simeq h^{2}+R\left(R-h\right)\Delta^{2}\simeq h^{2}+\left(R\Delta\right)^{2}`,
            note: t('Δ 以弧度计；第二步再用了 h ≪ R，于是 R(R−h) ≈ R²。', 'Δ is in radians; the second step also uses h ≪ R, so that R(R−h) ≈ R².'),
        },
        {
            n: 4,
            op: 'result',
            title: t('弧长 Δ_km = RΔ，得到勾股定理形式', 'With arc length Δ_km = RΔ this is Pythagoras'),
            latex: String.raw `r=\sqrt{\Delta_{\mathrm{km}}^{2}+h^{2}}`,
        },
        {
            n: 5,
            op: 'identity',
            title: t('（附）由正弦定理得到台站入射角', '(Appendix) the sine rule gives the incidence angle'),
            latex: String.raw `\frac{\sin i_{0}}{R-h}=\frac{\sin\Delta}{r}\;\Longrightarrow\;\sin i_{0}=\frac{\left(R-h\right)\sin\Delta}{r}`,
            note: t('i₀ 决定台站上的质点运动方向与自由表面效应校正，是振幅类方法必须的量。', 'i₀ sets the particle-motion direction and the free-surface correction at the station — essential for amplitude-based methods.'),
        },
    ],
    viz: [
        {
            id: 'hdg-curve',
            level: 'V1',
            title: t('震源距随震中距的变化：球面解 vs 平面近似', 'Hypocentral distance versus epicentral distance: spherical versus flat'),
            xlabel: t('震中距 Δ (°)', 'epicentral distance Δ (deg)'),
            ylabel: t('震源距 r (km)', 'hypocentral distance r (km)'),
            controls: [
                { id: 'dep', label: t('震源深度 h', 'focal depth h'), min: 0, max: 700, step: 10, value: 100, unit: 'km' },
            ],
            xRange: [0, 180],
            yRange: [0, 21000],
            note: t('两条曲线只在 Δ ≲ 10° 内重合。球面上 r 最大只能到 2R − h（对趾点），而平面近似会一路线性增长到 πR —— 这就是为什么远震必须用球面公式。', 'The two curves coincide only within Δ ≲ 10°. On a sphere r cannot exceed 2R − h (the antipode), whereas the flat approximation keeps growing linearly to πR — which is why teleseismic work must use the spherical form.'),
            compute: (p) => {
                const R = 6371;
                const h = p['dep'];
                const sph = [];
                const flat = [];
                for (let i = 0; i <= 360; i++) {
                    const deg = (i / 360) * 180;
                    const rad = (deg * Math.PI) / 180;
                    const rs = Math.sqrt(R * R + (R - h) * (R - h) - 2 * R * (R - h) * Math.cos(rad));
                    const arc = R * rad;
                    sph.push([deg, rs]);
                    flat.push([deg, Math.sqrt(arc * arc + h * h)]);
                }
                return [
                    { label: t('球面精确解', 'exact spherical'), color: '#185FA5', points: sph },
                    { label: t('平面近似 √(Δ²+h²)', 'flat √(Δ²+h²)'), color: '#BA7517', dash: true, points: flat },
                ];
            },
        },
    ],
    example: {
        title: t('一次深源地震', 'A deep-focus earthquake'),
        input: t('Δ = 40°，h = 600 km，R = 6371 km', 'Δ = 40°, h = 600 km, R = 6371 km'),
        steps: [
            t('R − h = 5771 km，cos 40° = 0.7660', 'R − h = 5771 km, cos 40° = 0.7660'),
            t('r² = 6371² + 5771² − 2·6371·5771·0.7660 ≈ 1.756×10⁷ km²', 'r² = 6371² + 5771² − 2·6371·5771·0.7660 ≈ 1.756×10⁷ km²'),
            t('r ≈ 4191 km；平面近似给出 √(4447² + 600²) ≈ 4488 km', 'r ≈ 4191 km; the flat approximation gives √(4447² + 600²) ≈ 4488 km'),
        ],
        output: t('平面近似高估约 300 km（7%），远震走时中这是不可接受的误差', 'The flat approximation overestimates by about 300 km (7%), an unacceptable error in teleseismic travel times'),
    },
    links: {
        upstream: [{ id: 'seismic-phase-nomenclature', note: t('震相走时表中以 Δ 为自变量', 'travel-time tables are parameterised by Δ') }],
        downstream: [
            { id: 'direct-wave-travel-time', note: t('r 是直达波走时的路径长度', 'r is the path length in the direct-wave travel time') },
            { id: 'sp-time-difference-distance' },
        ],
        seealso: [{ id: 'adams-williamson', note: t('同一球面坐标系下的地球内部模型', 'the Earth model in the same spherical frame') }],
    },
    refs: [
        { text: 'Shearer, Introduction to Seismology, 2nd ed., §3.2' },
        { text: 'Kennett (ed.), IASPEI 1991 Seismological Tables, §2.1' },
    ],
};
export default hypocentralDistanceGeometry;
//# sourceMappingURL=hypocentral-distance-geometry.js.map