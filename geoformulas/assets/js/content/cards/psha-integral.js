import { t } from '../../core/types.js';
/** psha-integral */
const pshaIntegral = {
    id: 'psha-integral',
    name: t('概率地震危险性分析积分', 'The PSHA Integral'),
    aliases: { zh: ['PSHA', '超越概率'], en: ['PSHA', 'probabilistic seismic hazard analysis', 'exceedance probability'] },
    node: 'S11.5',
    tags: {
        math: ['MATH.STAT', 'MATH.DIFF'],
        method: ['METH.HAZARD'],
        quantity: ['Q.HAZARD'],
    },
    audience: 'master',
    complete: 'L2',
    statement: {
        main: String.raw `\lambda(Y>y)=\sum_{i=1}^{N_s}\nu_i\iint P(Y>y\mid m,r)\,f_M(m)\,f_R(r)\,\mathrm{d}m\,\mathrm{d}r`,
        variants: [
            { name: t('泊松假设下的超越概率', 'Exceedance probability under the Poisson assumption'), latex: String.raw `P(Y>y\ \text{in}\ T)=1-e^{-\lambda(y)\,T}` },
            { name: t('重现期', 'Return period'), latex: String.raw `T_R=\frac{1}{\lambda(y)}` },
            { name: t('考虑 GMPE 不确定性（对 ε 积分）', 'Including GMPE uncertainty (integrating over ε)'), latex: String.raw `P(Y>y\mid m,r)=\int P(Y>y\mid m,r,\varepsilon)\,f(\varepsilon)\,\mathrm{d}\varepsilon` },
        ],
    },
    meaning: t('PSHA 把「震源在哪、多久发生一次」和「发生了会有多强」乘在一起积分，得出「未来 T 年内地震动超过某个阈值的概率」。这是现代抗震规范与地震保险的数学基础。它最重要的产出不是一张危险性图，而是那条把每个不确定性来源都显式保留下来的积分式。', 'PSHA multiplies where sources are and how often they occur by how strong shaking would be if they did, and integrates to give the probability that ground motion exceeds a threshold within T years. It is the mathematical basis of modern building codes and earthquake insurance. Its most important output is not a hazard map but the integral itself, in which every source of uncertainty is retained explicitly.'),
    symbols: [
        { sym: '\\lambda(Y>y)', name: t('年超越概率率', 'annual rate of exceedance'), unit: '1/a' },
        { sym: '\\nu_i', name: t('第 i 个震源区的年发生率', 'annual occurrence rate of the i-th source'), unit: '1/a' },
        { sym: 'P(Y>y\\mid m,r)', name: t('GMPE 给出的超越概率', 'exceedance probability from a GMPE'), unit: '无量纲' },
        { sym: 'f_M,f_R', name: t('震级与距离的概率密度', 'probability densities of magnitude and distance'), unit: '—' },
        { sym: 'T_R', name: t('重现期', 'return period'), unit: 'a', typical: '475, 2475' },
    ],
    conditions: {
        applies: [t('给定场地、给定期限的地震动超越概率计算', 'Computing exceedance probability of ground motion at a site over a given period')],
        assumes: [
            t('地震发生服从泊松过程（无记忆）', 'Earthquake occurrence follows a Poisson (memoryless) process'),
            t('震源模型、GMPE 及其不确定性已知', 'The source model, GMPEs and their uncertainties are known'),
        ],
        breaks: [t('存在明显丛集（余震序列、触发）时泊松假设偏于保守或危险，需用时变模型', 'With pronounced clustering (aftershock sequences, triggering) the Poisson assumption is biased and time-dependent models are needed')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('按全概率公式对震级与距离积分', 'Integrate over magnitude and distance by total probability'),
            latex: String.raw `\lambda(y)=\nu\iint P(Y>y\mid m,r)f(m,r)\,\mathrm{d}m\,\mathrm{d}r` },
        { n: 2, op: 'setup', title: t('多震源区求和', 'Sum over multiple source zones'),
            latex: String.raw `\lambda(y)=\sum_i\nu_i\iint P(Y>y\mid m,r)f_{M,i}(m)f_{R,i}(r)\,\mathrm{d}m\,\mathrm{d}r` },
        { n: 3, op: 'physics', title: t('泊松过程下的零次发生概率', 'Probability of zero occurrences under a Poisson process'),
            latex: String.raw `P_0(T)=e^{-\lambda T}` },
        { n: 4, op: 'result', title: t('至少发生一次', 'At least one occurrence'),
            latex: String.raw `P(Y>y\ \text{in}\ T)=1-e^{-\lambda(y)T}` },
    ],
    example: {
        title: t('475 年重现期的含义', 'What a 475-year return period means'),
        input: t('λ = 1/475 a⁻¹，设计使用期 T = 50 a', 'λ = 1/475 a⁻¹, design life T = 50 a'),
        steps: [t('P = 1 − e^{−50/475} = 0.0996', 'P = 1 − e^{−50/475} = 0.0996')],
        output: t('50 年内超越概率约 10% —— 这就是规范里「50 年 10%」的来历', 'About 10% exceedance probability in 50 years — the origin of the familiar "10% in 50 years" design level'),
    },
    links: {
        upstream: [
            { id: 'gmpe-functional-form', note: t('提供 P(Y>y|m,r)', 'Supplies P(Y>y|m,r)') },
            { id: 'gutenberg-richter-law', note: t('提供 f_M(m)', 'Supplies f_M(m)') },
        ],
    },
    refs: [{ text: 'Cornell (1968), Bull. Seismol. Soc. Am., 58' }, { text: 'McGuire (2004), Seismic Hazard and Risk Analysis' }],
};
export default pshaIntegral;
//# sourceMappingURL=psha-integral.js.map