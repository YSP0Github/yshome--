import { t } from '../../core/types.js';
/** exploding-reflector-model */
const explodingReflectorModel = {
    id: 'exploding-reflector-model',
    name: t('爆炸反射面模型', 'The Exploding-reflector Model'),
    aliases: { zh: ['半速度模型'], en: ['exploding reflector model', 'half-velocity model'] },
    node: 'S3.5',
    tags: {
        math: ['MATH.GEOM', 'MATH.APPROX'],
        method: ['METH.EXPL'],
        quantity: ['Q.TIME', 'Q.VEL'],
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `v_{\text{偏移}}=\frac{v}{2},\qquad t_{\text{成像}}=\frac{t_{\text{记录}}}{2}`,
        variants: [
            { name: t('自激自收走时', 'Zero-offset travel time'), latex: String.raw `t=\frac{2z}{v}\;\Longrightarrow\; z=\frac{v\,t}{2}` },
            { name: t('把反射面看成同时起爆的源', 'Treating the reflector as a simultaneously exploding source'), latex: String.raw `u(\boldsymbol{x},t=0)=\text{反射系数},\qquad \text{向上传播用}\ v/2` },
        ],
    },
    meaning: t('这是一个非常聪明的概念简化：把反射界面想象成在 t = 0 时刻同时爆炸的震源，波以半速向上传播被地面接收。这样「炮点与检波点分离」的双程问题就变成了「只有接收」的单程问题，偏移的实现大幅简化。它对水平层完全正确，对陡倾角会有误差。', 'A very clever conceptual simplification: imagine the reflecting interface exploding simultaneously at t = 0, with waves travelling upward at half velocity and recorded at the surface. The two-way problem with separated sources and receivers becomes a one-way recording problem, greatly simplifying migration. It is exact for horizontal layers and approximate for steep dips.'),
    symbols: [
        { sym: 'v', name: t('真实介质速度', 'true medium velocity'), unit: 'm/s' },
        { sym: 'v/2', name: t('偏移用的等效速度', 'equivalent velocity used in migration'), unit: 'm/s' },
        { sym: 'z', name: t('反射面深度', 'reflector depth'), unit: 'm' },
        { sym: 't', name: t('自激自收双程走时', 'zero-offset two-way travel time'), unit: 's' },
    ],
    conditions: {
        applies: [t('自激自收剖面、近水平反射层', 'Zero-offset sections with near-horizontal reflectors')],
        assumes: [t('射线近垂直、下行与上行路径重合', 'Rays are near vertical and downgoing/upgoing paths coincide')],
        breaks: [t('陡倾角、强横向变速时半速度假设不成立，需做叠前偏移', 'For steep dips or strong lateral velocity variation the half-velocity assumption fails; pre-stack migration is required')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('自激自收是双程走时', 'Zero-offset recording is two-way'),
            latex: String.raw `t=\frac{z}{v}+\frac{z}{v}=\frac{2z}{v}` },
        { n: 2, op: 'setup', title: t('把反射面当作 t = 0 起爆的源', 'Treat the reflector as a source fired at t = 0'),
            latex: String.raw `\text{单程走时}=t/2` },
        { n: 3, op: 'algebra', title: t('单程走时 = 深度 / 等效速度', 'One-way time = depth / equivalent velocity'),
            latex: String.raw `\frac{t}{2}=\frac{z}{v_{\text{偏移}}}\;\Longrightarrow\; v_{\text{偏移}}=\frac{v}{2}\ \text{当}\ z=v\,t/2` },
        { n: 4, op: 'result', title: t('成像条件', 'Imaging condition'),
            latex: String.raw `\text{成像值}=u(\boldsymbol{x},t=0)\ \text{在用}\ v/2\ \text{外推后的波场中}` },
    ],
    links: {
        seealso: [{ id: 'kirchhoff-migration', note: t('实际实现之一', 'One practical implementation') }],
    },
    refs: [{ text: 'Claerbout, Imaging the Earth’s Interior' }],
};
export default explodingReflectorModel;
//# sourceMappingURL=exploding-reflector-model.js.map