import { t } from '../../core/types.js';
/** phys-moment-of-inertia */
const physMomentOfInertia = {
    id: 'phys-moment-of-inertia',
    name: t('转动惯量', 'Moment of Inertia'),
    aliases: { zh: ['转动惯量 I=Σmr²', '质量的转动分布'], en: ['moment of inertia', 'I = Σ m r²'] },
    node: 'S18.4',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.GEOM'],
        method: ['METH.PHYS'],
        quantity: ['Q.ENERGY', 'Q.GEOM'],
        keywords: t('转动惯量 mr² 质量分布 刚体 细杆 圆盘 圆环', 'moment of inertia mass distribution rod disk hoop sphere'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `I=\sum_i m_i r_i^{2}=\int r^{2}\,\mathrm{d}m`,
        variants: [
            { name: t('细杆绕中心', 'thin rod about centre'), latex: String.raw `I=\tfrac{1}{12}M L^{2}` },
            { name: t('细杆绕一端', 'thin rod about end'), latex: String.raw `I=\tfrac{1}{3}M L^{2}` },
            { name: t('圆盘绕中心轴', 'disk about central axis'), latex: String.raw `I=\tfrac{1}{2}M R^{2}` },
            { name: t('圆环绕中心轴', 'hoop about central axis'), latex: String.raw `I=M R^{2}` },
            { name: t('实心球绕直径', 'solid sphere about diameter'), latex: String.raw `I=\tfrac{2}{5}M R^{2}` },
        ],
    },
    meaning: t('转动惯量是刚体转动时惯性大小的量度，相当于转动版的质量。但它不仅取决于总质量，更取决于质量相对于转轴的分布：质量离轴越远，I 越大，越难转动。花样滑冰运动员收拢手臂转得更快，就是因为 I 变小了。', 'The moment of inertia measures a body’s rotational inertia, the rotational analogue of mass. But it depends not just on total mass but on how far the mass sits from the axis: mass farther out gives a larger I and makes the body harder to turn. A figure skater pulls the arms in to spin faster precisely because I shrinks.'),
    symbols: [
        { sym: 'I', name: t('转动惯量', 'moment of inertia'), unit: 'kg·m²' },
        { sym: 'm_i', name: t('质元质量', 'mass elements'), unit: 'kg' },
        { sym: 'r_i', name: t('质元到转轴距离', 'distance of element from the axis'), unit: 'm' },
        { sym: 'M,R,L', name: t('总质量、半径、长度', 'total mass, radius, length'), unit: 'kg, m, m' },
    ],
    conditions: {
        applies: [t('绕指定轴的刚体', 'A rigid body about a specified axis')],
        assumes: [t('刚体形状规则、质量连续', 'Regular rigid body, continuous mass')],
        breaks: [t('轴变了 I 一般就变', 'I generally changes when the axis changes')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把刚体分成许多质元', 'Slice the body into mass elements'), latex: String.raw `I=\sum m_i r_i^{2}` },
        { n: 2, op: 'physics', title: t('每个质元的「转动惯性」按 r² 加权', 'Each element’s rotational inertia weighted by r²'), latex: String.raw `\mathrm{d}I=r^{2}\,\mathrm{d}m` },
        { n: 3, op: 'transform', title: t('连续极限写成积分', 'Continuous limit as an integral'), latex: String.raw `I=\int r^{2}\,\mathrm{d}m` },
    ],
    links: {
        downstream: [{ id: 'phys-parallel-axis-theorem' }, { id: 'phys-rotational-dynamics-law' }],
    },
};
export default physMomentOfInertia;
//# sourceMappingURL=phys-moment-of-inertia.js.map