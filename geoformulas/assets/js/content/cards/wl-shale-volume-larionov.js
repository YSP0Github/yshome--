import { t } from '../../core/types.js';
/** wl-shale-volume-larionov */
const wlShaleVolumeLarionov = {
    id: 'wl-shale-volume-larionov',
    name: t('由 GR 估算泥质含量 Vsh（Larionov）', 'Shale Volume from GR (Larionov)'),
    aliases: { zh: ['泥质含量', 'Vsh 指数法', 'Larionov 公式'], en: ['shale volume', 'Vsh', 'Larionov'] },
    node: 'S17.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.LOG'],
        quantity: ['Q.POR'],
        keywords: t('泥质含量 Vsh 自然伽马 Larionov 指数法 年轻地层 古老地层', 'shale volume Vsh gamma ray Larionov young old formations'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `I_{GR}=\frac{GR-GR_{clean}}{GR_{shale}-GR_{clean}}`, variants: [
            { name: t('Larionov 年轻地层', 'Larionov young'), latex: String.raw `V_{sh}=0.083\big(2^{2I_{GR}}-1\big)` },
            { name: t('Larionov 古老地层', 'Larionov old'), latex: String.raw `V_{sh}=0.33\big(2^{I_{GR}}-1\big)` },
        ],
    },
    meaning: t('先把 GR 归一化成泥质指数 IGR（0=纯砂岩，1=纯泥岩），再用经验关系换算成泥质体积分数 Vsh。Larionov 对年轻（第三纪）和古老地层用不同经验式。Vsh 用于从总孔隙度扣除泥质孔隙、做 Archie 的泥质校正——泥质本身也导电，会使 Sw 解释偏低。', 'First normalize GR to a shale index IGR (0=clean sand, 1=pure shale), then convert to shale volume Vsh via empirical relations. Larionov uses different fits for young (Tertiary) and old formations. Vsh removes shale porosity from total porosity and corrects Archie — shale itself conducts, otherwise Sw is underestimated.'),
    symbols: [
        { sym: 'I_{GR}', name: t('泥质指数', 'gamma-ray index'), unit: '无量纲' },
        { sym: 'GR', name: t('目的层 GR', 'interval GR'), unit: 'API' },
        { sym: 'GR_{clean}', name: t('纯砂岩基线 GR', 'clean-sand baseline'), unit: 'API' },
        { sym: 'GR_{shale}', name: t('纯泥岩 GR', 'pure-shale GR'), unit: 'API' },
        { sym: 'V_{sh}', name: t('泥质体积分数', 'shale volume fraction'), unit: 'v/v' },
    ],
    conditions: {
        applies: [t('GR 主要反映泥质，无放射性矿物', 'GR mainly tracks shale, no radioactive minerals')],
        breaks: [t('含铀砂岩、火山岩 GR 偏高会误判为泥质', 'U-rich sands or volcanics read high GR and bias Vsh')],
    },
    derivation: [
        { n: 1, op: 'algebra', title: t('归一化 GR', 'Normalize GR'),
            latex: String.raw `I_{GR}=\dfrac{GR-GR_{clean}}{GR_{shale}-GR_{clean}}` },
        { n: 2, op: 'physics', title: t('经验换算', 'Empirical conversion'),
            latex: String.raw `V_{sh}=0.083\,(2^{2I_{GR}}-1)\ \ (\text{年轻})` },
        { n: 3, op: 'result', title: t('用于孔隙度与 Sw 校正', 'Use for porosity and Sw correction'),
            latex: String.raw `\phi_{clean}=\phi_{total}-V_{sh}\,\phi_{shale}` },
    ],
    links: {
        upstream: [{ id: 'wl-natural-gamma' }],
        downstream: [{ id: 'wl-shale-corrected-porosity' }],
    },
    refs: [{ text: 'Larionov (1969); Ellis & Singer §12' }],
};
export default wlShaleVolumeLarionov;
//# sourceMappingURL=wl-shale-volume-larionov.js.map