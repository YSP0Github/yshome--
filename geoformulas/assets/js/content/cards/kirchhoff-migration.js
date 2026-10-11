import { t } from '../../core/types.js';
/** kirchhoff-migration */
const kirchhoffMigration = {
    id: 'kirchhoff-migration',
    name: t('Kirchhoff 偏移（绕射叠加）', 'Kirchhoff Migration (Diffraction Summation)'),
    aliases: { zh: ['基尔霍夫偏移', '绕射收敛'], en: ['Kirchhoff migration', 'diffraction summation'] },
    node: 'S3.5',
    tags: {
        math: ['MATH.DIFF', 'MATH.GEOM', 'MATH.FOURIER'],
        method: ['METH.EXPL', 'METH.INV'],
        quantity: ['Q.TIME', 'Q.GEOM'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `I(\boldsymbol{x})=\sum_{s}\sum_{r}W(\boldsymbol{x},s,r)\;d\!\left(s,r,\;t_s(\boldsymbol{x})+t_r(\boldsymbol{x})\right)`,
        variants: [
            { name: t('爆炸反射面模型（半速度）', 'Exploding-reflector model (half velocity)'), latex: String.raw `I(\boldsymbol{x})=\sum_{s}d\!\left(s,\;2\,t(\boldsymbol{x})/1\right)\ \text{等价地用}\ v/2` },
            { name: t('权函数（含几何扩散与倾角因子）', 'Weight function (spreading and obliquity)'), latex: String.raw `W=\frac{\cos\theta_s\cos\theta_r}{v\,\left(r_s r_r\right)^{1/2}}` },
        ],
    },
    meaning: t('偏移的本质是「把每个绕射双曲线的能量收回它的顶点」。Kirchhoff 偏移按绕射双曲线在道集上采样并加权求和：如果地下某点真的有散射体，所有道上的能量会同相叠加成一个亮点；否则互相抵消。它的优点是可以针对目标点做局部成像，缺点是只处理单次散射。', 'Migration means collapsing each diffraction hyperbola back onto its apex. Kirchhoff migration samples the data along the diffraction hyperbola in the gather and sums with weights: if there really is a scatterer at the trial point, energy from all traces adds in phase into a bright spot; otherwise it cancels. Its strength is that it can image a local target; its weakness is that it handles only single scattering.'),
    symbols: [
        { sym: 'I(\\boldsymbol{x})', name: t('地下 x 处的成像值', 'image value at subsurface point x'), unit: '与振幅同' },
        { sym: 't_s,t_r', name: t('从炮点/检波点到 x 的走时', 'travel times from source/receiver to x'), unit: 's' },
        { sym: 'W', name: t('包含几何扩散与倾角的权系数', 'weight including geometrical spreading and obliquity'), unit: '无量纲' },
        { sym: '\\theta_s,\\theta_r', name: t('射线与法向的夹角', 'angle between the ray and the normal'), unit: '°' },
    ],
    conditions: {
        applies: [t('叠前或叠后时间/深度偏移', 'Pre-stack or post-stack time/depth migration')],
        assumes: [
            t('速度模型已知且足够准确', 'The velocity model is known and accurate enough'),
            t('单次散射主导', 'Single scattering dominates'),
        ],
        breaks: [t('速度模型误差大时绕射不收敛，图像模糊甚至错位', 'With large velocity error diffractions do not collapse and the image blurs or mispositions')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('点散射体的时距是双曲线', 'The time–distance curve of a point scatterer is a hyperbola'),
            latex: String.raw `T(x)=\frac{1}{v}\left(\sqrt{z^{2}+(x-x_0)^{2}}+\sqrt{z^{2}+(x-x_0)^{2}}\right)\ \text{（自激自收）}` },
        { n: 2, op: 'setup', title: t('沿这条曲线把振幅加起来', 'Sum the amplitudes along that curve'),
            latex: String.raw `I(\boldsymbol{x}_0)=\sum_x d\left(x,T(x)\right)` },
        { n: 3, op: 'physics', title: t('加上几何扩散与倾角校正', 'Add spreading and obliquity corrections'),
            latex: String.raw `W=\frac{\cos\theta}{v\sqrt{r}}\ \text{（二维情形）}` },
        { n: 4, op: 'result', title: t('推广到炮集—检波点双求和', 'Generalise to a double sum over sources and receivers'),
            latex: String.raw `I(\boldsymbol{x})=\sum_s\sum_r W\,d\!\left(s,r,t_s+t_r\right)` },
    ],
    example: {
        title: t('为什么需要速度模型', 'Why a velocity model is needed'),
        input: t('真实速度 3000 m/s，偏移用速度 2500 m/s', 'True velocity 3000 m/s, migration velocity 2500 m/s'),
        steps: [
            t('绕射双曲线曲率按 2500 计算，与真实曲率不匹配', 'Hyperbola curvature computed with 2500 does not match the true curvature'),
            t('求和时能量不同相，绕射尾巴残留', 'Summation is out of phase and the diffraction tails remain'),
        ],
        output: t('图像上出现"微笑"状的残留绕射 —— 这是判断速度模型是否正确的经典标志', 'Residual "smile" diffractions appear in the image — the classic signature of an incorrect velocity model'),
    },
    links: {
        upstream: [{ id: 'reflection-hyperbola', note: t('双曲线时距是它的输入', 'The hyperbolic moveout is its input') }],
        seealso: [{ id: 'exploding-reflector-model', note: t('简化成像条件的思路', 'The idea behind simplified imaging conditions') }],
    },
    refs: [{ text: 'Yilmaz, Seismic Data Analysis, §4' }, { text: 'Schneider (1978), Geophysics, 43' }],
};
export default kirchhoffMigration;
//# sourceMappingURL=kirchhoff-migration.js.map