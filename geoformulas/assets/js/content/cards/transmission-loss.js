import { t } from '../../core/types.js';
/** transmission-loss */
const transmissionLoss = {
    id: 'transmission-loss',
    name: t('透射损失', 'Transmission Loss'),
    aliases: { zh: ['层间透射衰减'], en: ['transmission loss', 'interbed multiple transmission'] },
    node: 'S3.7',
    tags: {
        math: ['MATH.ALGEBRA', 'MATH.APPROX'],
        method: ['METH.EXPL'],
        quantity: ['Q.AMP'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `A_{\text{到达第 }n\text{ 层}}=\prod_{i=1}^{n-1}\left(1-R_i^{2}\right)\;\approx\;\exp\!\left(-\sum_{i}R_i^{2}\right)`,
        variants: [
            { name: t('单界面的能量透射率', 'Energy transmissivity of one interface'), latex: String.raw `1-R^{2}` },
            { name: t('双程（下行 + 上行）的总损失', 'Total loss over the two-way path'), latex: String.raw `A=\prod_{i=1}^{n-1}\left(1-R_i^{2}\right)^{2}` },
        ],
    },
    meaning: t('波每穿过一个界面都会损失一部分能量，穿过 N 个界面后损失是乘积关系。单界面的损失很小（|R| = 0.1 时只有 1%），但如果剖面里有一串强反射界面，累积起来能让深层信号衰减到只剩百分之几 —— 这是深层成像困难的重要原因之一，也是真振幅处理必须补偿的项。', 'A wave loses energy at every interface it crosses, and after N interfaces the losses multiply. A single interface loses little (only 1% for |R| = 0.1), but a sequence of strong reflectors can reduce the deep signal to a few percent of its original amplitude. This is a major reason deep imaging is hard, and a term that true-amplitude processing must compensate.'),
    symbols: [
        { sym: 'R_i', name: t('第 i 个界面的反射系数', 'reflection coefficient of the i-th interface'), unit: '无量纲' },
        { sym: '1-R^{2}', name: t('单界面能量透射率', 'energy transmissivity of one interface'), unit: '无量纲' },
        { sym: 'n', name: t('目标层序号', 'index of the target layer'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('垂直入射、忽略多次波的一维层状介质', 'Normal incidence, one-dimensional layered media, ignoring multiples')],
        assumes: [t('反射系数较小，可用能量近似', 'Reflection coefficients are small so an energy approximation is valid')],
        breaks: [t('强反射界面（如海底、盐顶）时累积损失极大，近似失效', 'For strong interfaces such as the seafloor or salt top the cumulative loss is large and the approximation fails')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('能量守恒：反射 + 透射 = 1', 'Energy conservation: reflection + transmission = 1'),
            latex: String.raw `R^{2}+T_E=1\;\Longrightarrow\; T_E=1-R^{2}` },
        { n: 2, op: 'algebra', title: t('多个界面依次相乘', 'Multiply over successive interfaces'),
            latex: String.raw `A=\prod_{i=1}^{n-1}\left(1-R_i^{2}\right)` },
        { n: 3, op: 'taylor', title: t('小反射系数下取对数', 'Take logs for small reflection coefficients'),
            latex: String.raw `\ln A=\sum_i\ln\left(1-R_i^{2}\right)\approx-\sum_i R_i^{2}` },
        { n: 4, op: 'result', title: t('指数形式', 'Exponential form'),
            latex: String.raw `A\approx\exp\!\left(-\sum_{i=1}^{n-1}R_i^{2}\right)` },
    ],
    example: {
        title: t('一串中等强度界面的累积效应', 'Cumulative effect of a series of moderate interfaces'),
        input: t('20 个界面，每个 |R| = 0.15', '20 interfaces, each with |R| = 0.15'),
        steps: [
            t('单界面损失 1 − 0.0225 = 0.9775', 'Single-interface loss: 1 − 0.0225 = 0.9775'),
            t('0.9775²⁰ = 0.63（单程）', '0.9775²⁰ = 0.63 (one way)'),
            t('双程 0.63² = 0.40', 'Two way: 0.63² = 0.40'),
        ],
        output: t('深层反射只剩 40% —— 若不补偿，深处的 AVO 分析会系统性偏小', 'The deep reflection keeps only 40% — without compensation, deep AVO analysis is systematically biased low'),
    },
    links: {
        upstream: [{ id: 'acoustic-reflection-coefficient', note: t('R 的定义', 'Definition of R') }],
        seealso: [{ id: 'transmission-coefficient', note: t('透射系数的完整形式', 'Full form of the transmission coefficient') }],
    },
    refs: [{ text: 'Yilmaz, Seismic Data Analysis, §2' }],
};
export default transmissionLoss;
//# sourceMappingURL=transmission-loss.js.map