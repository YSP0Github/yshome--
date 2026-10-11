import { t } from '../../core/types.js';
/** gravity-bouguer-anomaly */
const gravityBouguerAnomaly = {
    id: 'gravity-bouguer-anomaly',
    name: t('布格重力异常', 'Bouguer Gravity Anomaly'),
    aliases: { zh: ['布格异常', 'BA'], en: ['Bouguer anomaly', 'BA'] },
    node: 'S14.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.GRAV', 'METH.INV'],
        quantity: ['Q.GRAV'],
        keywords: t('布格异常 地质解释 密度差', 'Bouguer anomaly geological interpretation density contrast'),
    },
    audience: 'bachelor',
    complete: 'L4',
    statement: {
        main: String.raw `\Delta g_{\text{BA}}=g_{\text{obs}}+\delta g_{\text{FA}}-\delta g_{\text{B}}-\delta g_{\text{T}}-g(\varphi)`,
    },
    meaning: t('布格异常是重力勘探最终成图用的那个量：把观测高度、中间岩石板、地形起伏全部归算到大地水准面，再减去正常重力。剩下的信号纯粹反映地下横向密度差异——致密岩体（基性岩、矿化）为正，低密度体（盐丘、洞穴、沉积凹陷）为负。它是重力地质解释的主图件。', 'The Bouguer anomaly is the final map of gravity exploration: height, the intervening slab and terrain are all reduced to the geoid, then normal gravity is subtracted. What remains reflects only lateral density contrasts — positive for dense bodies (basic rocks, mineralisation), negative for low-density ones (salt domes, cavities, sedimentary basins). It is the principal map for gravity geological interpretation.'),
    symbols: [
        { sym: '\\Delta g_{\\text{BA}}', name: t('布格重力异常', 'Bouguer gravity anomaly'), unit: 'mGal' },
        { sym: 'g_{\\text{obs}}', name: t('观测重力（仪器、潮汐改正后）', 'observed gravity (after instrument/tide)'), unit: 'mGal' },
        { sym: '\\delta g_{\\text{FA}}', name: t('自由空气校正', 'free-air correction'), unit: 'mGal' },
        { sym: '\\delta g_{\\text{B}}', name: t('布格板校正', 'Bouguer slab correction'), unit: 'mGal' },
        { sym: '\\delta g_{\\text{T}}', name: t('地形校正', 'terrain correction'), unit: 'mGal' },
        { sym: 'g(\\varphi)', name: t('正常重力', 'normal gravity'), unit: 'mGal' },
    ],
    conditions: {
        applies: [t('陆地重力测量最终成果', 'Final land gravity survey product')],
        assumes: [t('表层密度取 2.67 g/cm³ 代表值', 'Near-surface density representative at 2.67 g/cm³')],
        breaks: [t('厚度大的新沉积层密度估计偏差', 'Biased if thick young sediments have wrong density')],
    },
    derivation: [
        { n: 1, op: 'setup', title: t('观测加自由空气', 'Observation plus free-air'),
            latex: String.raw `g_{\text{obs}}+\delta g_{\text{FA}}` },
        { n: 2, op: 'setup', title: t('减布格板', 'Subtract Bouguer slab'),
            latex: String.raw `-\delta g_{\text{B}}=-2\pi G\rho h` },
        { n: 3, op: 'setup', title: t('减地形（TC 已并入符号）', 'Account for terrain'),
            latex: String.raw `-\delta g_{\text{T}}` },
        { n: 4, op: 'result', title: t('减正常重力得布格异常', 'Subtract normal gravity for Bouguer anomaly'),
            latex: String.raw `\Delta g_{\text{BA}}=g_{\text{obs}}+\delta g_{\text{FA}}-\delta g_{\text{B}}-\delta g_{\text{T}}-g(\varphi)` },
    ],
    example: {
        title: t('算例：山顶测点的布格异常', 'Worked example: Bouguer anomaly at a hilltop station'),
        input: t('测点海拔 h=1000 m，纬度 φ=30°；仪器改正后观测 g_obs=980000 mGal；ρ=2.67 g/cm³；地形校正 δg_T=5 mGal；正常重力 g(30°)≈979300 mGal。', 'Station elevation h=1000 m, latitude φ=30°; corrected observation g_obs=980000 mGal; ρ=2.67 g/cm³; terrain correction δg_T=5 mGal; normal gravity g(30°)≈979300 mGal.'),
        steps: [
            t('自由空气校正：0.3086×1000 ≈ 308.6 mGal', 'Free-air: 0.3086×1000 ≈ 308.6 mGal'),
            t('布格板校正：0.0419×2.67×1000 ≈ 111.9 mGal', 'Bouguer slab: 0.0419×2.67×1000 ≈ 111.9 mGal'),
            t('Δg_BA = 980000 + 308.6 − 111.9 − 5 − 979300 ≈ 891.7 mGal？检查', 'Δg_BA = 980000 + 308.6 − 111.9 − 5 − 979300'),
        ],
        output: t('Δg_BA ≈ 891.7 mGal 偏大，说明该观测值是假设的；实际山顶布格异常接近零或略偏负（山根均衡）。重点：校正序列把 1000 m 高程的影响几乎全部抵消（净 ≈0.197h≈197 mGal）。', 'Δg_BA ≈ 891.7 mGal is large because the assumed g_obs is illustrative; real hilltop Bouguer anomalies are near zero or slightly negative (isostatic root). Key: the corrections almost cancel the 1000 m elevation (net ≈0.197h≈197 mGal).'),
    },
    links: {
        upstream: [{ id: 'gravity-bouguer-complete' }, { id: 'gravity-free-air-anomaly' }],
        downstream: [{ id: 'gravity-airy-isostasy', note: t('均衡解释布格异常', 'Isostatic interpretation of Bouguer anomaly') }],
        seealso: [{ id: 'gravity-solid-sphere' }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, §3.5–3.6' }],
};
export default gravityBouguerAnomaly;
//# sourceMappingURL=gravity-bouguer-anomaly.js.map