import { t } from '../../core/types.js';
/** opt-thin-lens-equation */
const optThinLensEquation = {
    id: 'opt-thin-lens-equation',
    name: t('薄透镜成像公式', 'Thin Lens Equation'),
    aliases: { zh: ['透镜公式', '1/f = 1/u + 1/v'], en: ['lens formula', '1/f = 1/u + 1/v'] },
    node: 'S20.1',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.GEOM'],
        method: ['METH.PHYS', 'METH.INSTR'],
        quantity: ['Q.OPT', 'Q.GEOM'],
        keywords: t('薄透镜 焦距 物距 像距 实像 虚像 1/f=1/u+1/v', 'thin lens focal length object distance image distance real virtual image'),
    },
    audience: 'highschool',
    complete: 'L3',
    statement: {
        main: String.raw `\frac{1}{f}=\frac{1}{u}+\frac{1}{v}`,
        variants: [
            { name: t('会聚透镜 f>0，发散透镜 f<0', 'Converging lens f > 0, diverging lens f < 0'), latex: String.raw `f>0:\ \text{会聚；}\quad f<0:\ \text{发散}` },
            { name: t('横向放大率', 'Lateral magnification'), latex: String.raw `m=-\frac{v}{u}` },
        ],
    },
    meaning: t('薄透镜公式 1/f = 1/u + 1/v 把焦距 f、物距 u 与像距 v 三者联系起来：物体放在焦点之外（u>f）成实像（v>0，倒立），放在焦点之内（u<f）成放大正立虚像（v<0，即放大镜）。相机对焦、眼镜度数、显微镜与望远镜的光路设计都从这一条公式出发。', 'The thin-lens equation 1/f = 1/u + 1/v links focal length f, object distance u and image distance v: an object beyond the focal point (u > f) forms a real inverted image (v > 0); inside the focal point (u < f) it forms an upright magnified virtual image (v < 0) — a magnifying glass. Camera focusing, eyeglass power, microscope and telescope optics all start from this one equation.'),
    symbols: [
        { sym: 'f', name: t('焦距（会聚为正）', 'focal length, positive for converging lenses'), unit: 'm' },
        { sym: 'u', name: t('物距（实物为正）', 'object distance, positive for real objects'), unit: 'm' },
        { sym: 'v', name: t('像距（实像为正）', 'image distance, positive for real images'), unit: 'm' },
        { sym: 'm', name: t('横向放大率', 'lateral magnification'), unit: '1' },
    ],
    conditions: {
        applies: [t('薄透镜、近轴光线（角度很小）', 'Thin lens, paraxial rays (small angles)')],
        assumes: [t('透镜两侧均为空气，物像在同一介质中', 'Both sides are air; object and image share the same medium')],
        breaks: [t('大角度光线产生球差、色差，公式为近似', 'Wide-angle rays suffer spherical and chromatic aberration; the formula is approximate')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('过光心光线不偏折', 'A ray through the optical centre is undeviated'), latex: String.raw `\text{物高 }y,\ \text{像高 }y',\ \frac{y'}{y}=\frac{v}{u}` },
        { n: 2, op: 'geometry', title: t('平行于主轴的光线过焦点', 'A parallel ray passes through the focal point'), latex: String.raw `\frac{y'}{y}=\frac{f-v}{f}` },
        { n: 3, op: 'algebra', title: t('联立消去放大率', 'Equate and eliminate the magnification'), latex: String.raw `\frac{v}{u}=\frac{f-v}{f}\;\Rightarrow\;\frac{1}{f}=\frac{1}{u}+\frac{1}{v}` },
    ],
    viz: [
        {
            id: 'image-distance',
            level: 'V1',
            title: t('像距 v 随物距 u 的变化', 'Image distance v versus object distance u'),
            xlabel: t('物距 u (mm)', 'object distance u (mm)'),
            ylabel: t('像距 v (mm)', 'image distance v (mm)'),
            controls: [
                { id: 'f', label: t('焦距 f', 'focal length f'), min: 20, max: 300, step: 5, value: 100, unit: 'mm' },
            ],
            xRange: [20, 1000],
            note: t('u→f⁺ 时 v→∞（像成在无穷远）；u 很大时 v→f（远处物体成像在焦平面上）。这就是相机对焦时远处物体只需把像距调到 f 附近。', 'As u → f⁺, v → ∞ (image at infinity); as u grows large, v → f (distant objects focus near the focal plane). This is why a camera focuses distant objects at nearly v = f.'),
            compute: (p) => {
                const f = p['f'];
                const pts = [];
                const u0 = f + 1;
                for (let i = 0; i <= 300; i++) {
                    const u = u0 + (i / 300) * (1000 - u0);
                    const v = (u * f) / (u - f);
                    pts.push([u, v]);
                }
                return [{ label: t('v(u)', 'v(u)'), color: '#185FA5', points: pts }];
            },
        },
    ],
    links: {
        upstream: [{ id: 'opt-lensmaker-equation' }],
        downstream: [{ id: 'opt-lateral-magnification' }, { id: 'opt-optical-instruments-magnification' }],
    },
    refs: [{ text: 'Hecht, Optics, 5th ed., §5.2' }],
};
export default optThinLensEquation;
//# sourceMappingURL=opt-thin-lens-equation.js.map