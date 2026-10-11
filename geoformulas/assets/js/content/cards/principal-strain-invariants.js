import { t } from '../../core/types.js';
/** principal-strain-invariants */
const principalStrainInvariants = {
    id: 'principal-strain-invariants',
    name: t('应变不变量与主应变', 'Strain Invariants and Principal Strains'),
    aliases: { zh: ['主应变', '应变主轴', '应变特征值'], en: ['principal strain', 'strain invariants', 'strain eigenvalues'] },
    node: 'S1.2',
    tags: {
        math: ['MATH.LINALG', 'MATH.ROOT'],
        method: ['METH.STRUCT'],
        quantity: ['Q.TENSOR'],
        keywords: t('主应变 应变不变量 特征值 主轴 最大剪应变 伸长方向', 'principal strain strain invariants eigenvalue principal axes maximum shear extension direction'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\det\!\left(\varepsilon_{ij}-e\,\delta_{ij}\right)=0`,
        variants: [
            { name: t('展开后的三次方程', 'The expanded cubic'), latex: String.raw `e^{3}-J_1 e^{2}+J_2 e-J_3=0` },
            { name: t('三个应变不变量', 'The three strain invariants'), latex: String.raw `J_1=\varepsilon_{kk}=\theta,\quad J_2=\frac{1}{2}\left(\varepsilon_{ii}\varepsilon_{jj}-\varepsilon_{ij}\varepsilon_{ji}\right),\quad J_3=\det\boldsymbol{\varepsilon}` },
            { name: t('用主应变写出', 'In terms of the principal strains'), latex: String.raw `J_1=e_1+e_2+e_3,\quad J_2=e_1e_2+e_2e_3+e_3e_1,\quad J_3=e_1e_2e_3` },
            { name: t('二维显式解', 'Explicit two-dimensional solution'), latex: String.raw `e_{1,2}=\frac{\varepsilon_{11}+\varepsilon_{22}}{2}\pm\sqrt{\left(\frac{\varepsilon_{11}-\varepsilon_{22}}{2}\right)^{2}+\varepsilon_{12}^{2}}` },
            { name: t('最大剪应变', 'Maximum shear strain'), latex: String.raw `\gamma_{\max}=e_1-e_3` },
            { name: t('主方向（二维转角）', 'Principal direction, rotation angle in 2D'), latex: String.raw `\tan 2\theta_p=\frac{2\varepsilon_{12}}{\varepsilon_{11}-\varepsilon_{22}}=\frac{\gamma_{12}}{\varepsilon_{11}-\varepsilon_{22}}` },
        ],
    },
    meaning: t('和应力完全平行的一套结构：应变张量也是对称的，所以也有三个互相垂直的主方向，在那三个方向上只有纯粹的伸长或缩短、没有角度改变。第一不变量就是体应变；最大的那个主应变告诉你岩石在哪个方向上被拉得最狠 —— 这正是张节理与矿脉的取向。', 'A structure completely parallel to that of stress. The strain tensor is likewise symmetric, so it too has three mutually orthogonal principal directions along which there is pure extension or shortening and no change of angle at all. The first invariant is just the volumetric strain, and the largest principal strain tells you which direction the rock is being pulled hardest, which is exactly the orientation taken by extension joints and mineral veins.'),
    symbols: [
        { sym: 'e_1,e_2,e_3', name: t('最大、中间、最小主应变（也常记作 ε₁、ε₂、ε₃）', 'maximum, intermediate and minimum principal strains (often written ε₁, ε₂, ε₃)'), unit: '', dimension: '无量纲', typical: '10⁻⁶ – 10⁻³' },
        { sym: 'e', name: t('特征值（此处为主应变，与 e 指数无关）', 'eigenvalue, here a principal strain (unrelated to the exponential)'), unit: '', dimension: '无量纲' },
        { sym: 'J_1,J_2,J_3', name: t('三个应变不变量（注意与偏应力 J₂ 区分）', 'the three strain invariants (not to be confused with the deviatoric J₂)'), unit: '无量纲' },
        { sym: '\\theta', name: t('体应变 = J₁（此处不是入射角）', 'volumetric strain = J₁ (not the incidence angle here)'), unit: '', dimension: '无量纲' },
        { sym: '\\gamma_{\\max}', name: t('最大工程剪应变', 'maximum engineering shear strain'), unit: '', dimension: '无量纲' },
        { sym: '\\theta_p', name: t('主方向与 x₁ 轴的夹角', 'angle between a principal direction and the x₁ axis'), unit: 'rad' },
    ],
    conditions: {
        applies: [
            t('任意小应变状态，二维或三维', 'Any small-strain state, in 2D or 3D'),
            t('寻找最大伸长方向、最大剪应变面时', 'Locating the direction of maximum extension or the plane of maximum shear'),
        ],
        assumes: [
            t('小应变、应变张量对称', 'Small strain with a symmetric strain tensor'),
            t('约定 e₁ ≥ e₂ ≥ e₃；拉为正', 'The ordering e₁ ≥ e₂ ≥ e₃ is assumed, with extension positive'),
        ],
        breaks: [
            t('有限变形时应改用 Green–Lagrange 应变的三个主值', 'For finite deformation one must use the principal values of the Green–Lagrange strain instead'),
            t('不连续位移场（断层）处应变无定义，也就无所谓主值', 'Where the displacement field is discontinuous the strain is undefined, so no principal values exist'),
        ],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('与应力逐字对应：应变张量也是对称的', 'Parallel to stress, word for word: the strain tensor is symmetric too'),
            latex: String.raw `\varepsilon_{ij}=\varepsilon_{ji}\;\Longrightarrow\;\text{exists an orthogonal frame with }\varepsilon_{ij}=0\ (i\neq j)`,
            note: t('实对称矩阵的谱定理在这里又用了一次，只不过这次的结论是「存在三个互相垂直的方向，其间的直角不发生改变」。', 'The spectral theorem is used a second time here, this time concluding that three mutually orthogonal directions exist whose right angles are preserved.') },
        { n: 2, op: 'setup', title: t('主方向的定义：只伸长，不剪切', 'A principal direction: pure extension, no shear'),
            latex: String.raw `\varepsilon_{ij}n_j=e\,n_i`,
            note: t('在这个方向上，沿 n 的线段只改变长度，与垂直方向的夹角保持 90°。', 'Along this direction a line segment changes length only, and the angle to a perpendicular segment stays at 90°.') },
        { n: 3, op: 'algebra', title: t('移项后要求非零解', 'Rearrange and demand a non-trivial solution'),
            latex: String.raw `\left(\varepsilon_{ij}-e\,\delta_{ij}\right)n_j=0\;\Longrightarrow\;\det\!\left(\varepsilon_{ij}-e\,\delta_{ij}\right)=0` },
        { n: 4, op: 'algebra', title: t('展开行列式', 'Expand the determinant'),
            latex: String.raw `e^{3}-J_1 e^{2}+J_2 e-J_3=0` },
        { n: 5, op: 'identity', title: t('系数就是三个不变量，且不随坐标改变', 'The coefficients are the three invariants, independent of the frame'),
            latex: String.raw `J_1=\varepsilon_{kk}=\theta,\qquad J_2=\frac{1}{2}\left[\left(\operatorname{tr}\boldsymbol{\varepsilon}\right)^{2}-\operatorname{tr}\!\left(\boldsymbol{\varepsilon}^{2}\right)\right],\qquad J_3=\det\boldsymbol{\varepsilon}`,
            note: t('J₁ = θ 这条最有用：体应变本身就是不变量，所以它既是主应变之和，也是任意坐标系下对角线之和。', 'The relation J₁ = θ is the most useful of all: the volumetric strain is itself an invariant, so it is both the sum of the principal strains and the sum of the diagonal entries in any frame.') },
        { n: 6, op: 'result', title: t('最大剪应变出现在与主轴成 45° 的方向上', 'The maximum shear strain occurs at 45° to the principal axes'),
            latex: String.raw `\gamma_{\max}=e_1-e_3,\qquad \theta=45^{\circ}`,
            note: t('与 Mohr 圆完全同构：应变圆的半径是 (e₁ − e₃)/2，工程剪应变则是它的两倍，正好等于 e₁ − e₃。', 'Exactly the same structure as the Mohr circle: the strain circle has radius (e₁ − e₃)/2 and the engineering shear strain is twice that, namely e₁ − e₃.') },
    ],
    links: {
        upstream: [{ id: 'infinitesimal-strain-tensor' }],
        seealso: [
            { id: 'principal-stress-eigenvalues', note: t('数学结构完全相同', 'the mathematics is identical') },
            { id: 'volumetric-strain', note: t('J₁ 就是体应变', 'J₁ is the volumetric strain') },
            { id: 'engineering-shear-strain' },
        ],
    },
    refs: [
        { text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §2.1' },
        { text: 'Jaeger, Cook & Zimmerman, Fundamentals of Rock Mechanics, 4th ed., §2.3' },
    ],
};
export default principalStrainInvariants;
//# sourceMappingURL=principal-strain-invariants.js.map