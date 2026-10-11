import { t } from '../../core/types.js';
/** wl-density-log */
const wlDensityLog = {
    id: 'wl-density-log',
    name: t('密度测井 ρb', 'Bulk Density Log ρb'),
    aliases: { zh: ['密度测井', '伽马—伽马测井'], en: ['density log', 'gamma–gamma density'] },
    node: 'S17.1',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.LOG'],
        quantity: ['Q.MAT', 'Q.POR'],
        keywords: t('密度测井 体积密度 ρb 康普顿散射 孔隙度 骨架密度', 'density log bulk density Compton porosity matrix density'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `\rho_{b}=\phi\,\rho_{f}+(1-\phi)\,\rho_{matrix}`, variants: [
            { name: t('解出孔隙度', 'Solve for porosity'), latex: String.raw `\phi_{D}=\dfrac{\rho_{matrix}-\rho_{b}}{\rho_{matrix}-\rho_{f}}` },
            { name: t('典型骨架密度', 'Typical matrix density'), latex: String.raw `\rho_{qz}=2.65,\ \rho_{lime}=2.71,\ \rho_{dol}=2.87\ \mathrm{g/cm^{3}}` },
        ],
    },
    meaning: t('密度测井用 Cs-137 γ 源照射地层，测量康普顿散射回的 γ 强度，得到体积密度 ρb=孔隙流体与骨架的体积加权平均。孔隙里是密度约 1 g/cm³ 的水，而骨架 2.6–2.9，因此孔隙越多 ρb 越小。密度曲线求孔隙度是最直接、最常用的方法之一。', 'A Cs-137 gamma source irradiates the formation; measuring back-scattered gamma intensity gives the bulk density ρb = volume-weighted average of pore fluid and matrix. Pore water is ~1 g/cm³, matrix 2.6–2.9, so more porosity lowers ρb. Deriving porosity from the density log is one of the most direct and common methods.'),
    symbols: [
        { sym: '\\rho_{b}', name: t('体积密度（测井值）', 'bulk density (log reading)'), unit: 'g/cm³', typical: '2.0 – 2.7' },
        { sym: '\\rho_{f}', name: t('孔隙流体密度', 'pore-fluid density'), unit: 'g/cm³', typical: '≈ 1.0' },
        { sym: '\\rho_{matrix}', name: t('骨架密度', 'matrix density'), unit: 'g/cm³' },
        { sym: '\\phi', name: t('孔隙度', 'porosity'), unit: '无量纲' },
    ],
    conditions: {
        applies: [t('井眼规则、泥饼影响已校正', 'Regular hole, mud-cake corrected')],
        assumes: [t('已知岩性骨架密度', 'Matrix density known from lithology')],
        breaks: [t('含气时 ρb 偏低、孔隙度偏大', 'Gas lowers ρb and overestimates porosity')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('体积密度加权平均', 'Volume-weighted bulk density'),
            latex: String.raw `\rho_{b}=(1-\phi)\rho_{matrix}+\phi\rho_{f}` },
        { n: 2, op: 'algebra', title: t('整理', 'Rearrange'),
            latex: String.raw `\rho_{matrix}-\rho_{b}=\phi(\rho_{matrix}-\rho_{f})` },
        { n: 3, op: 'result', title: t('解出 φD', 'Solve for φD'),
            latex: String.raw `\phi_{D}=(\rho_{matrix}-\rho_{b})/(\rho_{matrix}-\rho_{f})` },
    ],
    links: {
        downstream: [{ id: 'wl-porosity-from-density' }],
        seealso: [{ id: 'gardner-relation' }],
    },
    refs: [{ text: 'Ellis & Singer, Well Logging, 2nd ed., §9' }],
};
export default wlDensityLog;
//# sourceMappingURL=wl-density-log.js.map