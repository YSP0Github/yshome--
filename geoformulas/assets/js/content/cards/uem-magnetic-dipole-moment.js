import { t } from '../../core/types.js';
/** uem-magnetic-dipole-moment */
const uemMagneticDipoleMoment = {
    id: 'uem-magnetic-dipole-moment',
    name: t('磁矩', 'Magnetic Dipole Moment'),
    aliases: { zh: ['磁矩 m=IS', '载流线圈磁矩'], en: ['magnetic moment', 'dipole moment of a coil'] },
    node: 'S19.3',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.MAG'],
        keywords: t('磁矩 m=IS 线圈 磁矩力矩 τ=m×B 势能', 'magnetic dipole moment IS coil torque m cross B potential energy'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\mathbf{m}=I\,A\,\hat{\mathbf{n}},\qquad \boldsymbol{\tau}=\mathbf{m}\times\mathbf{B},\qquad U=-\mathbf{m}\cdot\mathbf{B}`,
        variants: [
            { name: t('N 匝线圈', 'N-turn coil'), latex: String.raw `\mathbf{m}=NIA\,\hat{\mathbf{n}}` },
        ],
    },
    meaning: t('载流线圈（或一个小电流环）相当于一个磁偶极子，磁矩 m=IS，方向垂直线圈平面。它在外磁场中受力矩 τ=m×B，使其转向与 B 平行；势能 U=−m·B。这是磁电式电表、电动机与磁矩物理的核心量。', 'A current loop acts like a magnetic dipole with moment m=IS normal to the loop. In an external field it experiences torque τ=m×B that turns it to align with B, with energy U=−m·B. It is the central quantity in moving-coil meters, motors and magnetism.'),
    symbols: [
        { sym: '\\mathbf{m}', name: t('磁矩（此处不用 μ，避免与 μ0 混淆）', 'magnetic dipole moment'), unit: 'A·m²' },
        { sym: 'I', name: t('电流', 'current'), unit: 'A' },
        { sym: 'A', name: t('线圈面积', 'loop area'), unit: 'm²' },
        { sym: '\\boldsymbol{\\tau}', name: t('磁力矩', 'magnetic torque'), unit: 'N·m' },
        { sym: '\\mathbf{B}', name: t('外磁场', 'external field'), unit: 'T' },
    ],
    conditions: {
        applies: [t('小线圈，外场在环尺度内近似均匀', 'Small loop in a field that is nearly uniform over it')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('线圈两边受反向力', 'Two sides feel opposite forces'),
            latex: String.raw `F=BIL\ \Rightarrow\ \tau=F\cdot w\sin\theta=BIA\sin\theta` },
        { n: 2, op: 'result', title: t('写成矢量叉乘', 'Write as vector cross product'),
            latex: String.raw `\mathbf{m}=IA\hat{\mathbf{n}},\quad \boldsymbol{\tau}=\mathbf{m}\times\mathbf{B}` },
        { n: 3, op: 'algebra', title: t('对应势能', 'Corresponding potential energy'),
            latex: String.raw `U=-\mathbf{m}\cdot\mathbf{B}` },
    ],
    links: {
        upstream: [{ id: 'uem-ampere-force-wire' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §28' }],
};
export default uemMagneticDipoleMoment;
//# sourceMappingURL=uem-magnetic-dipole-moment.js.map