import { t } from '../../core/types.js';
/** etas-model */
const etasModel = {
    id: 'etas-model',
    name: t('ETAS 模型', 'The ETAS Model'),
    aliases: { zh: ['传染型余震序列'], en: ['ETAS model', 'epidemic-type aftershock sequence'] },
    node: 'S12.5',
    tags: {
        math: ['MATH.STAT', 'MATH.DIFF'],
        method: ['METH.STAT'],
        quantity: ['Q.TIME', 'Q.SOURCE'],
    },
    audience: 'phd',
    complete: 'L2',
    statement: {
        main: String.raw `\lambda(t)=\mu+\sum_{t_i<t}\frac{K\,e^{\alpha\left(M_i-M_0\right)}}{\left(t-t_i+c\right)^{p}}`,
        variants: [
            { name: t('背景项与触发项', 'Background and triggering terms'), latex: String.raw `\lambda(t)=\underbrace{\mu}_{\text{构造背景}}+\underbrace{\sum_i\nu_i(t)}_{\text{每个历史事件激发的余震}}` },
            { name: t('分支比 n', 'Branching ratio n'), latex: String.raw `n=\int_0^{\infty}\frac{K\,10^{\alpha(M-M_0)}}{\left(t+c\right)^{p}}\,\mathrm{d}t=\frac{K\,c^{1-p}}{p-1}\,10^{\alpha\langle M-M_0\rangle}` },
        ],
    },
    meaning: t('ETAS 把每一个地震都看作「既可能是背景构造加载的产物，也可能是此前某个地震触发的余震」，并允许余震再生余震。这个自激点过程模型统一了大森定律与 Gutenberg–Richter 定律，是当前地震可预测性研究、余震概率预报（如加州 STEP 系统）的标准框架。', 'ETAS treats every earthquake as either a product of background tectonic loading or an aftershock triggered by an earlier event, and lets aftershocks breed further aftershocks. This self-exciting point process unifies Omori’s law with the Gutenberg–Richter law and is the standard framework for predictability research and operational aftershock forecasting such as the California STEP system.'),
    symbols: [
        { sym: '\\lambda(t)', name: t('条件发生率（强度函数）', 'conditional intensity'), unit: '个/天' },
        { sym: '\\mu', name: t('背景发生率', 'background rate'), unit: '个/天' },
        { sym: 'K', name: t('触发生产力', 'triggering productivity'), unit: '个/天' },
        { sym: '\\alpha', name: t('触发能力的震级依赖', 'magnitude dependence of triggering'), unit: '无量纲', typical: '0.2 – 2.5' },
        { sym: 'p', name: t('大森衰减指数', 'Omori decay exponent'), unit: '无量纲', typical: '1.0 – 1.3' },
        { sym: 'n', name: t('分支比：n < 1 为亚临界（可衰减）', 'branching ratio: n < 1 is subcritical (decaying)'), unit: '无量纲', typical: '0.5 – 1.0' },
    ],
    conditions: {
        applies: [t('目录完备、已去除大量重复与爆破事件', 'Complete catalogues with duplicates and blasts removed')],
        assumes: [t('震级独立同分布、触发核为修正大森型', 'Magnitudes are i.i.d. and the triggering kernel is of modified-Omori form')],
        breaks: [t('目录不完备或含大量人工事件时参数估计严重偏倚', 'Incomplete catalogues or heavy anthropogenic contamination bias parameter estimates severely')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('把强度函数写成背景 + 触发', 'Write the intensity as background plus triggering'),
            latex: String.raw `\lambda(t)=\mu+\sum_{t_i<t}\nu_i(t)` },
        { n: 2, op: 'setup', title: t('设触发核为修正大森型', 'Take the triggering kernel of modified-Omori form'),
            latex: String.raw `\nu_i(t)=\frac{K\,e^{\alpha\left(M_i-M_0\right)}}{\left(t-t_i+c\right)^{p}}` },
        { n: 3, op: 'identity', title: t('分支比 = 单次事件激发的平均后代总数', 'Branching ratio = mean total progeny of one event'),
            latex: String.raw `n=\int_0^{\infty}\frac{K}{\left(t+c\right)^{p}}\,\mathrm{d}t=\frac{K\,c^{1-p}}{p-1}` },
        { n: 4, op: 'result', title: t('n < 1 时序列最终衰减，n ≥ 1 时爆发', 'For n < 1 the sequence dies out; for n ≥ 1 it explodes'),
            latex: String.raw `\text{期望后代数}=1+n+n^{2}+\cdots=\frac{1}{1-n}` },
    ],
    links: {
        upstream: [{ id: 'omori-law', note: t('触发核即修正大森定律', 'The triggering kernel is the modified Omori law') }],
        seealso: [{ id: 'poisson-earthquake-occurrence', note: t('μ 项即泊松背景', 'The μ term is the Poisson background') }],
    },
    refs: [{ text: 'Ogata (1988), J. Am. Stat. Assoc., 83' }],
};
export default etasModel;
//# sourceMappingURL=etas-model.js.map