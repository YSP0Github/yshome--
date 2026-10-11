import { t } from '../../core/types.js';
/** fresnel-zone-radius */
const fresnelZoneRadius = {
    id: 'fresnel-zone-radius',
    name: t('菲涅尔带半径', 'Fresnel-zone Radius'),
    aliases: { zh: ['菲涅尔带', '横向分辨率', '第一菲涅尔带'], en: ['Fresnel zone', 'lateral resolution', 'first Fresnel zone'] },
    node: 'S3.6',
    tags: {
        math: ['MATH.GEOM', 'MATH.APPROX'],
        method: ['METH.EXPL'],
        quantity: ['Q.GEOM', 'Q.FREQ'],
        keywords: { zh: '横向分辨率', en: 'lateral resolution' },
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `R_{F} = \sqrt{\frac{\lambda z}{2}} = \sqrt{\frac{v\,z}{2f}}`,
        variants: [
            { name: t('判据：路径差不超过半个波长', 'Criterion: path difference below half a wavelength'), latex: String.raw `2\sqrt{z^{2}+R_F^{2}} - 2z \approx \frac{R_F^{2}}{z} = \frac{\lambda}{2}` },
            { name: t('用双程时间表示', 'In terms of two-way time'), latex: String.raw `R_F = \frac{1}{2}\sqrt{\frac{v^{2}t_0}{f}}` },
            { name: t('三维时是圆盘半径', 'In 3D it is the radius of a disc'), latex: String.raw `\text{面积} = \pi R_F^{2}` },
        ],
    },
    meaning: t('一个反射点的「贡献」并不来自一个几何点，而是一整片圆盘 —— 第一菲涅尔带。凡是落在这个圆盘里的反射能量，到达接收点时的路径差不超过半个波长，因而相干加强；圆盘之外的能量互相抵消。这个圆盘的直径就是未偏移剖面的横向分辨率极限。', 'The response of a reflecting point comes not from a geometric point but from a whole disc — the first Fresnel zone. Reflected energy inside the disc arrives with a path difference below half a wavelength and interferes constructively; outside it cancels. The disc diameter is the lateral resolution limit of an unmigrated section.'),
    symbols: [
        { sym: 'R_{F}', name: t('第一菲涅尔带半径', 'first Fresnel-zone radius'), unit: 'm', typical: '100 – 1500' },
        { sym: '\\lambda', name: t('波长 v/f', 'wavelength v/f'), unit: 'm' },
        { sym: 'z', name: t('反射面深度', 'reflector depth'), unit: 'm' },
        { sym: 'f', name: t('频率', 'frequency'), unit: 'Hz' },
        { sym: 'v', name: t('速度', 'velocity'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('估算未偏移剖面的横向分辨率与解释可靠范围', 'Estimating lateral resolution and the reliable interpretation range on unmigrated sections')],
        assumes: [
            t('常速、水平反射面', 'Constant velocity, horizontal reflector'),
            t('自激自收（零偏移距）', 'Coincident source and receiver (zero offset)'),
        ],
        breaks: [
            t('偏移之后横向分辨率由孔径决定，不再由菲涅尔带决定', 'After migration lateral resolution is set by aperture, not the Fresnel zone'),
            t('倾斜界面与变速情况下圆盘变为椭圆且中心偏移', 'For dipping interfaces and variable velocity the disc becomes an ellipse with a shifted centre'),
        ],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('从中心点与边缘点的路径写起', 'Write the paths from centre and edge'),
            latex: String.raw `L_0 = 2z,\qquad L(r) = 2\sqrt{z^{2}+r^{2}}` },
        { n: 2, op: 'taylor', title: t('r ≪ z 时展开路径差', 'Expand the path difference for r ≪ z'),
            latex: String.raw `\Delta L = 2\sqrt{z^{2}+r^{2}} - 2z \approx \frac{r^{2}}{z}` },
        { n: 3, op: 'physics', title: t('相干加强的条件是路径差 ≤ λ/2', 'Constructive interference requires ΔL ≤ λ/2'),
            latex: String.raw `\frac{r^{2}}{z} \le \frac{\lambda}{2}` },
        { n: 4, op: 'algebra', title: t('解出半径', 'Solve for the radius'),
            latex: String.raw `R_F = \sqrt{\frac{\lambda z}{2}}` },
        { n: 5, op: 'result', title: t('代入 λ = v/f', 'Substitute λ = v/f'),
            latex: String.raw `R_F = \sqrt{\frac{v z}{2f}}` },
    ],
    viz: [
        {
            id: 'fresnel-radius',
            level: 'V1',
            title: t('菲涅尔带半径随深度与频率的变化', 'Fresnel-zone radius versus depth and frequency'),
            xlabel: t('深度 z (km)', 'depth z (km)'),
            ylabel: t('R_F (m)', 'R_F (m)'),
            controls: [
                { id: 'v', label: t('速度 v (m/s)', 'velocity v (m/s)'), min: 1500, max: 6000, step: 50, value: 3000 },
                { id: 'f', label: t('频率 f (Hz)', 'frequency f (Hz)'), min: 5, max: 80, step: 1, value: 30 },
            ],
            note: t('深部反射的菲涅尔带可达上千米 —— 未偏移剖面上深层的「宽同相轴」很多不是地质体，而就是这个圆盘。', 'Deep reflections have Fresnel zones of a kilometre or more — many “wide” deep events on unmigrated sections are this disc, not a geological body.'),
            compute: (p) => {
                const v = p['v'], f = p['f'];
                const pts = [];
                for (let i = 0; i <= 200; i++) {
                    const z = 0.1 + (i / 200) * 6;
                    pts.push([z, Math.sqrt((v * z * 1000) / (2 * f))]);
                }
                return [{ label: t('R_F(z)', 'R_F(z)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    example: {
        title: t('3 km 深处的菲涅尔带', 'Fresnel zone at 3 km depth'),
        input: t('v = 3000 m/s，z = 3000 m，f = 30 Hz', 'v = 3000 m/s, z = 3000 m, f = 30 Hz'),
        steps: [
            t('λ = 3000/30 = 100 m', 'λ = 3000/30 = 100 m'),
            t('R_F = √(100 × 3000/2) = √150000 = 387 m', 'R_F = √(100 × 3000/2) = √150000 = 387 m'),
        ],
        output: t('直径约 774 m —— 比这个尺度更小的地质体在未偏移剖面上无法分辨', 'A diameter of about 774 m — geological bodies smaller than this cannot be resolved on an unmigrated section'),
    },
    links: {
        upstream: [{ id: 'wavenumber-wavelength', note: t('波长的定义', 'Definition of wavelength') }],
        downstream: [{ id: 'migration-impulse-response', note: t('偏移把菲涅尔带收敛为点', 'Migration collapses the Fresnel zone to a point') }],
        seealso: [{ id: 'vertical-resolution', note: t('垂向分辨率的对应判据', 'The corresponding vertical resolution criterion') }],
    },
    refs: [{ text: 'Sheriff & Geldart, Exploration Seismology, 2nd ed., §6.4' }],
};
export default fresnelZoneRadius;
//# sourceMappingURL=fresnel-zone-radius.js.map