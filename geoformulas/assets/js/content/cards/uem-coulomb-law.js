import { t } from '../../core/types.js';
/** uem-coulomb-law */
const uemCoulombLaw = {
    id: 'uem-coulomb-law',
    name: t('Coulomb 定律', "Coulomb's Law"),
    aliases: { zh: ['库仑定律', '点电荷间作用力'], en: ["Coulomb's force", 'point-charge force'] },
    node: 'S19.1',
    tags: {
        math: ['MATH.VECTOR', 'MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('库仑定律 点电荷 静电力 平方反比 k ε0', 'Coulomb law point charge electrostatic inverse square k epsilon0'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\mathbf{F}=k\,\frac{q_{1}q_{2}}{r^{2}}\,\hat{\mathbf{r}}=\frac{1}{4\pi\varepsilon_{0}}\,\frac{q_{1}q_{2}}{r^{2}}\,\hat{\mathbf{r}}`,
        variants: [
            { name: t('大小', 'Magnitude'), latex: String.raw `F=k\dfrac{|q_{1}q_{2}|}{r^{2}}` },
        ],
    },
    meaning: t('两个静止点电荷之间的作用力沿连线方向，大小与电量乘积成正比、与距离平方成反比。同性相斥、异性相吸。它是整个静电学的基石，与万有引力同为平方反比律。', 'The force between two stationary point charges lies along the line joining them, proportional to the product of charges and inversely proportional to the square of the distance. Like charges repel, opposite charges attract. It is the foundation of electrostatics and shares the inverse-square form with gravity.'),
    symbols: [
        { sym: '\\mathbf{F}', name: t('库仑力', 'Coulomb force'), unit: 'N' },
        { sym: 'q_{1},q_{2}', name: t('两点电荷电量', 'point charges'), unit: 'C' },
        { sym: 'r', name: t('电荷间距', 'separation'), unit: 'm' },
        { sym: 'k', name: t('静电力常量', 'Coulomb constant'), unit: 'N·m²/C²', typical: '8.988×10⁹' },
        { sym: '\\varepsilon_{0}', name: t('真空介电常数', 'permittivity of free space'), unit: 'F/m', typical: '8.854×10⁻¹²' },
        { sym: '\\hat{\\mathbf{r}}', name: t('径向单位矢量', 'radial unit vector'), unit: '—' },
    ],
    conditions: {
        applies: [t('真空中两个可视为点电荷的静止带电体', 'Two stationary charges approximated as point charges in vacuum')],
        assumes: [t('电荷静止（静电情形）；忽略相对论速度效应', 'Charges at rest; relativistic velocity effects neglected')],
        breaks: [t('电荷高速运动或需考虑磁场时不成立', 'Fails for rapidly moving charges or when magnetism matters')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('设定两点电荷', 'Set up two point charges'),
            latex: String.raw `q_{1},\ q_{2}\ \text{相距}\ r,\ \hat{\mathbf{r}}\ \text{由 }q_{1}\text{ 指向 }q_{2}` },
        { n: 2, op: 'physics', title: t('平方反比与乘积关系', 'Inverse-square and product law'),
            latex: String.raw `F\propto \dfrac{|q_{1}q_{2}|}{r^{2}}` },
        { n: 3, op: 'algebra', title: t('引入比例常数 k', 'Introduce proportionality constant k'),
            latex: String.raw `F=k\,\dfrac{q_{1}q_{2}}{r^{2}},\qquad k=\dfrac{1}{4\pi\varepsilon_{0}}` },
        { n: 4, op: 'result', title: t('写成矢量式', 'Write in vector form'),
            latex: String.raw `\mathbf{F}=\dfrac{1}{4\pi\varepsilon_{0}}\dfrac{q_{1}q_{2}}{r^{2}}\hat{\mathbf{r}}` },
    ],
    links: {
        downstream: [{ id: 'uem-electric-field-point-charge', note: t('除以 q 即得电场', 'Divide by q to get E field') }],
        seealso: [{ id: 'uem-gauss-law', note: t('平方反比律的积分形式', 'Integral form of the inverse-square law') }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, Fundamentals of Physics, 10e, §21' }],
};
export default uemCoulombLaw;
//# sourceMappingURL=uem-coulomb-law.js.map