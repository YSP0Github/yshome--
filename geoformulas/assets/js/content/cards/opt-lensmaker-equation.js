import { t } from '../../core/types.js';
/** opt-lensmaker-equation */
const optLensmakerEquation = {
    id: 'opt-lensmaker-equation',
    name: t('透镜制造者公式', 'Lensmaker’s Equation'),
    aliases: { zh: ['透镜焦距公式', "1/f=(n-1)(1/R1-1/R2)"], en: ["lensmaker's formula", 'focal length from surface curvatures'] },
    node: 'S20.1',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.GEOM'],
        method: ['METH.PHYS', 'METH.INSTR'],
        quantity: ['Q.OPT'],
        keywords: t('透镜制造者 焦距 曲率半径 R1 R2 折射率 磨镜', "lensmaker focal length radius of curvature refractive index grinding"),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\frac{1}{f}=(n-1)\left(\frac{1}{R_1}-\frac{1}{R_2}\right)`,
        variants: [
            { name: t('平凸透镜 R₂→∞', 'Plano-convex lens, R2 → ∞'), latex: String.raw `\frac{1}{f}=(n-1)\frac{1}{R_1}` },
            { name: t('双凸透镜 R₁>0, R₂<0', 'Biconvex lens, R1 > 0, R2 < 0'), latex: String.raw `\frac{1}{f}=(n-1)\left(\frac{1}{R_1}+\frac{1}{|R_2|}\right)` },
        ],
    },
    meaning: t('透镜制造者公式把一块透镜的"脾气"（焦距 f）完全由两个表面的曲率半径 R₁、R₂ 和材料折射率 n 决定。磨透镜时正是靠选择两个球面的曲率来得到所需焦距：越凸的表面、越大的折射率，焦距越短。它是眼镜片、相机镜头设计的起点。', "The lensmaker's equation fixes a lens's behaviour (its focal length f) entirely from the curvatures of its two surfaces R1, R2 and the material index n. Lens grinding chooses the two spherical curvatures to obtain the desired focal length: more strongly curved surfaces and larger n give shorter f. It is the starting point for eyeglass and camera-lens design."),
    symbols: [
        { sym: 'f', name: t('透镜焦距', 'focal length'), unit: 'm' },
        { sym: 'n', name: t('透镜材料相对空气的折射率', 'refractive index of the lens material relative to air'), unit: '1' },
        { sym: 'R_1', name: t('第一表面曲率半径（符号规则：凸向入射光为正）', 'radius of surface 1, sign: convex toward incoming light is positive'), unit: 'm' },
        { sym: 'R_2', name: t('第二表面曲率半径（凸向出射光为负）', 'radius of surface 2, convex toward outgoing light is negative'), unit: 'm' },
    ],
    conditions: {
        applies: [t('薄透镜、近轴光线、透镜在空气中', 'Thin lens, paraxial rays, lens in air')],
        assumes: [t('两表面为球面，材料均匀', 'Both surfaces are spherical and the material is homogeneous')],
        breaks: [t('厚透镜需加入厚度项；非球面透镜不适用', 'Thick lenses need a thickness term; aspheric lenses do not fit')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('第一表面的折射', 'Refraction at the first surface'), latex: String.raw `\frac{n}{s_1'}-\frac{1}{s_1}=\frac{n-1}{R_1}` },
        { n: 2, op: 'physics', title: t('第二表面的折射', 'Refraction at the second surface'), latex: String.raw `\frac{1}{s_2'}-\frac{n}{s_2}=\frac{1-n}{R_2}` },
        { n: 3, op: 'algebra', title: t('薄透镜两式相加（s₂=-s₁′）', 'Add the two for a thin lens, s2 = -s1′'), latex: String.raw `\frac{1}{f}=\frac{1}{s_1}+\frac{1}{s_2'}=(n-1)\left(\frac{1}{R_1}-\frac{1}{R_2}\right)` },
    ],
    links: {
        upstream: [{ id: 'opt-refractive-index' }, { id: 'opt-snell-law' }],
        downstream: [{ id: 'opt-thin-lens-equation' }],
    },
    refs: [{ text: 'Hecht, Optics, 5th ed., §5.3' }],
};
export default optLensmakerEquation;
//# sourceMappingURL=opt-lensmaker-equation.js.map