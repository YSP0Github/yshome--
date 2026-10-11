import { t } from '../../core/types.js';
/** wl-neutron-density-crossplot */
const wlNeutronDensityCrossplot = {
    id: 'wl-neutron-density-crossplot',
    name: t('中子—密度交会识别岩性与气层', 'Neutron–Density Crossplot: Lithology & Gas'),
    aliases: { zh: ['中子密度交会图', '气层交叉显示'], en: ['neutron–density crossplot', 'gas crossover'] },
    node: 'S17.1',
    tags: {
        math: ['MATH.GEOM', 'MATH.ALGEBRA'],
        method: ['METH.LOG', 'METH.ROCK'],
        quantity: ['Q.POR'],
        keywords: t('中子密度交会 岩性识别 气层 交叉显示 砂岩 灰岩 白云岩', 'neutron density crossplot lithology gas crossover sand lime dolomite'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `\text{水层: }\phi_{N}\approx\phi_{D}\;;\quad \text{气层: }\phi_{N}<\phi_{D}\ (\text{交叉})`,
        variants: [
            { name: t('岩性子图', 'Lithology lines'), latex: String.raw `(\phi_{N},\rho_{b})\text{ 落在砂岩/灰岩/白云岩线上}` },
        ],
    },
    meaning: t('把中子孔隙度 φN 与密度孔隙度 φD（或 ρb）交会到一张图上：纯水饱和时两者近似相等，点落在过原点的岩性子图线上，可据落点判断岩性（砂岩、灰岩、白云岩）。含气时中子因 HI 低而 φN 偏小，密度因气轻而 ρb 偏小、φD 偏大，两曲线在测井track上"交叉"——这就是找气的经典标志。', 'Cross-plotting neutron φN against density φD (or ρb): in a water-saturated bed the two are nearly equal and points lie on lithology-specific lines, identifying sandstone/limestone/dolomite. With gas, low HI pulls φN down while light gas lowers ρb and raises φD; the two curves "crossover" on the track — the classic gas indicator.'),
    symbols: [
        { sym: '\\phi_{N}', name: t('中子孔隙度', 'neutron porosity'), unit: 'v/v' },
        { sym: '\\phi_{D}', name: t('密度孔隙度', 'density porosity'), unit: 'v/v' },
        { sym: '\\rho_{b}', name: t('体积密度', 'bulk density'), unit: 'g/cm³' },
    ],
    conditions: {
        applies: [t('已做泥质、井眼校正的干净地层', 'Shale- and hole-corrected clean beds')],
        assumes: [t('岩性骨架密度已知', 'Matrix density known')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('纯水层 φN=φD=φ', 'Water: φN=φD=φ'),
            latex: String.raw `HI_{water}=1\Rightarrow\phi_{N}=\phi` },
        { n: 2, op: 'physics', title: t('密度 also gives φD=φ', 'Density also gives φD=φ'),
            latex: String.raw `\rho_{b}=(1-\phi)\rho_{matrix}+\phi\cdot 1` },
        { n: 3, op: 'result', title: t('含气使 φN↓、φD↑', 'Gas lowers φN and raises φD'),
            latex: String.raw `HI_{gas}\ll 1,\ \rho_{gas}\ll 1\Rightarrow\phi_{N}<\phi_{D}` },
    ],
    viz: [
        {
            id: 'n-d-crossplot',
            level: 'V1',
            title: t('中子—密度交会（水饱和岩性线 + 气点）', 'Neutron–density crossplot'),
            xlabel: t('中子孔隙度 φN', 'neutron porosity φN'),
            ylabel: t('体积密度 ρb (g/cm³)', 'bulk density ρb (g/cm³)'),
            controls: [
                { id: 'phi', label: t('真孔隙度 φ', 'true porosity φ'), min: 0.05, max: 0.35, step: 0.01, value: 0.2 },
                { id: 'sg', label: t('含气饱和度 Sg', 'gas saturation Sg'), min: 0, max: 0.7, step: 0.05, value: 0.4 },
            ],
            compute: (p) => {
                const phi = p['phi'], sg = p['sg'];
                const line = (rm) => {
                    const pts = [];
                    for (let i = 0; i <= 100; i++) {
                        const x = (i / 100) * 0.35;
                        pts.push([x, rm - x * (rm - 1)]);
                    }
                    return pts;
                };
                // gas point: neutron reduced by gas HI (~0.15), density lowered by light gas
                const phig = phi * (1 - sg * 0.85);
                const rho_g = (1 - phi) * 2.65 + phi * ((1 - sg) * 1.0 + sg * 0.2);
                return [
                    { label: t('砂岩 ρm=2.65', 'sandstone 2.65'), color: '#185FA5', points: line(2.65) },
                    { label: t('灰岩 ρm=2.71', 'limestone 2.71'), color: '#0F6E56', points: line(2.71) },
                    { label: t('白云岩 ρm=2.87', 'dolomite 2.87'), color: '#BA7517', points: line(2.87) },
                    { label: t('气层点', 'gas point'), color: '#993C1D', points: [[phig, rho_g]] },
                ];
            },
            note: t('水层点落在岩性线上（φN≈φD）；气点向左下偏离，与水线拉开距离——这就是中子—密度交叉。', 'Water points sit on lithology lines (φN≈φD); gas points shift lower-left, separating from the water line — the neutron–density crossover.'),
        },
    ],
    links: {
        upstream: [{ id: 'wl-neutron-porosity' }, { id: 'wl-density-log' }],
        downstream: [{ id: 'wl-average-porosity-combination' }],
    },
    refs: [{ text: 'Ellis & Singer, Well Logging, 2nd ed., §11' }],
};
export default wlNeutronDensityCrossplot;
//# sourceMappingURL=wl-neutron-density-crossplot.js.map