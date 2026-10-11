import { t } from '../../core/types.js';
/** zoeppritz-boundary-conditions */
const zoeppritzBoundaryConditions = {
    id: 'zoeppritz-boundary-conditions',
    name: t('Zoeppritz 边界条件（弹性界面）', 'Zoeppritz Boundary Conditions (Elastic Interface)'),
    aliases: { zh: ['Zoeppritz 方程组', '弹性界面边界条件'], en: ['Zoeppritz equations', 'elastic interface conditions'] },
    node: 'S3.2',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.GEOM', 'MATH.LINALG'],
        method: ['METH.EXPL'],
        quantity: ['Q.AMP', 'Q.VEL'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `\begin{aligned} u_x^{(1)}&=u_x^{(2)}\\ u_z^{(1)}&=u_z^{(2)}\\ \sigma_{zz}^{(1)}&=\sigma_{zz}^{(2)}\\ \sigma_{xz}^{(1)}&=\sigma_{xz}^{(2)} \end{aligned}`,
        variants: [
            { name: t('未知量：四个散射系数', 'Unknowns: four scattering coefficients'), latex: String.raw `\dot{P}\!P,\ \dot{P}\!S,\ \dot{P}\!\grave{P},\ \dot{P}\!\grave{S}` },
            { name: t('Snell 定律给出各角度', "Snell's law fixes all angles"), latex: String.raw `p=\frac{\sin\theta_1}{\alpha_1}=\frac{\sin\varphi_1}{\beta_1}=\frac{\sin\theta_2}{\alpha_2}=\frac{\sin\varphi_2}{\beta_2}` },
        ],
    },
    meaning: t('Zoeppritz 方程组不是某个人拍脑袋写下的公式，它就是「界面上位移连续 + 牵引力连续」这四条物理要求在弹性介质下的具体展开。入射 P 波遇到界面会分成反射 P、反射 S、透射 P、透射 S 四支，四个未知系数正好由四个方程定解。把这四个方程写成矩阵并求解，就得到 Zoeppritz 方程组的精确解。', 'The Zoeppritz equations are not an invented formula: they are exactly the four physical requirements of displacement and traction continuity, written out for elastic media. An incident P wave splits into reflected P, reflected S, transmitted P and transmitted S; four unknown coefficients are determined by four equations. Writing them in matrix form and solving gives the exact Zoeppritz solution.'),
    symbols: [
        { sym: 'u_x,u_z', name: t('界面上的切向与法向位移', 'tangential and normal displacement at the interface'), unit: 'm' },
        { sym: '\\sigma_{zz},\\sigma_{xz}', name: t('法向与切向牵引力（应力分量）', 'normal and tangential traction (stress components)'), unit: 'Pa' },
        { sym: '\\dot{P}\\!P', name: t('P→P 反射系数', 'P-to-P reflection coefficient'), unit: '无量纲' },
        { sym: '\\dot{P}\\!S', name: t('P→S 反射系数', 'P-to-S reflection coefficient'), unit: '无量纲' },
        { sym: '\\theta', name: t('P 波传播角', 'P-wave propagation angle'), unit: '°', typical: '0 – 60' },
        { sym: '\\varphi', name: t('S 波传播角', 'S-wave propagation angle'), unit: '°' },
        { sym: 'p', name: t('射线参数（水平慢度）', 'ray parameter (horizontal slowness)'), unit: 's/m' },
        { sym: '\\alpha,\\beta', name: t('P 波与 S 波速度', 'P- and S-wave velocity'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('两个均匀弹性半空间之间的平界面', 'A planar interface between two uniform elastic half-spaces')],
        assumes: [
            t('界面完全焊接（无滑动、无开裂）', 'The interface is welded: no slip, no opening'),
            t('入射为平面谐和波', 'The incident wave is a plane harmonic wave'),
            t('线性弹性、小变形', 'Linear elasticity, small deformation'),
        ],
        breaks: [
            t('超过临界角后透射波变为非均匀波，系数变复数', 'Beyond the critical angle transmitted waves become inhomogeneous and coefficients turn complex'),
            t('薄层、粗糙界面、孔隙流体流动需要更精细的模型', 'Thin beds, rough interfaces and poroelastic flow require more refined models'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('列出四支波', 'List the four waves'),
            latex: String.raw `\text{入射 P} \;\to\; \dot{P}\!P,\ \dot{P}\!S,\ \dot{P}\!\grave{P},\ \dot{P}\!\grave{S}`,
            note: t('左上加点表示入射波型，右上加重音符表示透射。这是地震学传统的记号。', 'The dot above denotes the incident wave type and the grave accent the transmitted one — traditional seismological notation.') },
        { n: 2, op: 'geometry', title: t('用 Snell 定律定出四个角', "Snell's law fixes the four angles"),
            latex: String.raw `p=\frac{\sin\theta_1}{\alpha_1}=\frac{\sin\varphi_1}{\beta_1}=\frac{\sin\theta_2}{\alpha_2}=\frac{\sin\varphi_2}{\beta_2}`,
            note: t('射线参数沿界面守恒，所以只要给定入射角，其余三个角全部确定。', 'The ray parameter is conserved along the interface, so a single incidence angle determines all the others.') },
        { n: 3, op: 'physics', title: t('位移连续（两个分量）', 'Displacement continuity (two components)'),
            latex: String.raw `\left(u_x^{\text{入}}+u_x^{\text{反}}\right)=u_x^{\text{透}},\qquad \left(u_z^{\text{入}}+u_z^{\text{反}}\right)=u_z^{\text{透}}`,
            note: t('介质不能裂开也不能互相穿透。', 'The media can neither separate nor interpenetrate.') },
        { n: 4, op: 'physics', title: t('牵引力连续（两个分量）', 'Traction continuity (two components)'),
            latex: String.raw `\sigma_{zz}^{(1)}=\sigma_{zz}^{(2)},\qquad \sigma_{xz}^{(1)}=\sigma_{xz}^{(2)}`,
            note: t('界面上不存在面力源，所以两侧应力必须相等。这是牛顿第三定律的直接后果。', 'There is no surface force source at the interface, so the stresses must match. This is a direct consequence of Newton’s third law.') },
        { n: 5, op: 'substitute', title: t('把位移写成势函数导数', 'Express displacements through potentials'),
            latex: String.raw `u_x=\frac{\partial\phi}{\partial x}-\frac{\partial\psi}{\partial z},\qquad u_z=\frac{\partial\phi}{\partial z}+\frac{\partial\psi}{\partial x}`,
            note: t('P 波用标量势 φ，SV 波用矢量势 ψ 的单个分量。', 'The P wave uses the scalar potential φ; the SV wave uses one component of the vector potential ψ.') },
        { n: 6, op: 'result', title: t('得到 4×4 线性系统', 'A 4×4 linear system results'),
            latex: String.raw `\mathbf{M}\left(\theta_1,\varphi_1,\theta_2,\varphi_2,\rho,\alpha,\beta\right)\,\begin{bmatrix}\dot{P}\!P\\ \dot{P}\!S\\ \dot{P}\!\grave{P}\\ \dot{P}\!\grave{S}\end{bmatrix}=\boldsymbol{b}`,
            note: t('这就是 Zoeppritz 方程组。显式的闭式解极其冗长，实践中通常用 Aki–Richards 或 Shuey 近似代替。', 'These are the Zoeppritz equations. The explicit closed-form solution is extremely cumbersome, so Aki–Richards or Shuey approximations are used in practice.') },
    ],
    links: {
        upstream: [
            { id: 'snell-ray-parameter', note: t('角度关系由它给出', 'Supplies the angular relations') },
            { id: 'acoustic-reflection-coefficient', note: t('声学退化情形', 'The acoustic degenerate case') },
        ],
        downstream: [
            { id: 'shuey-approximation', note: t('工程上常用的简化', 'The simplification used in practice') },
        ],
    },
    refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §5.2' }, { text: 'Zoeppritz (1919), Erdbebenwellen VIII B' }],
};
export default zoeppritzBoundaryConditions;
//# sourceMappingURL=zoeppritz-boundary-conditions.js.map