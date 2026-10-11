import { t } from '../../core/types.js';
/** double-couple-radiation-pattern */
const doubleCoupleRadiationPattern = {
    id: 'double-couple-radiation-pattern',
    name: t('双力偶辐射花样', 'Double-couple Radiation Pattern'),
    aliases: { zh: ['辐射花样', '沙滩球', '节面'], en: ['radiation pattern', 'beach ball', 'nodal planes'] },
    node: 'S4.1',
    tags: {
        math: ['MATH.VECTOR', 'MATH.GEOM'],
        method: ['METH.TELE'],
        quantity: ['Q.AMP', 'Q.SOURCE'],
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `u^{P}_{i} \propto \frac{\gamma_{i}\,\gamma_{j}M_{jk}\gamma_{k}}{4\pi\rho\alpha^{3}r},\qquad u^{S}_{i} \propto \frac{(\delta_{ij}-\gamma_{i}\gamma_{j})\gamma_{k}M_{kj}}{4\pi\rho\beta^{3}r}`,
        variants: [
            { name: t('纯双力偶的 P 波花样', 'P pattern for a pure double couple'), latex: String.raw `\mathcal{R}^{P} \propto \sin 2\theta\,\cos\phi` },
            { name: t('S 波花样', 'S pattern'), latex: String.raw `\mathcal{R}^{SV} \propto \cos 2\theta\,\cos\phi,\qquad \mathcal{R}^{SH} \propto \cos\theta\,\sin\phi` },
            { name: t('节面条件', 'Nodal-plane condition'), latex: String.raw `\gamma_j M_{jk}\gamma_k = 0` },
        ],
    },
    meaning: t('地震不是在所有方向上一样响的：双力偶震源把能量分成四瓣，P 波与 S 波的花样互相错开 45°。这正是「沙滩球」解（震源机制解）的物理基础 —— 四个象限的拉张与压缩区，把台站记录到的初动方向连起来就能反推断层面。', 'Earthquakes do not radiate equally in all directions: a double couple sends energy out in four lobes, with the P and S patterns offset by 45°. That is the physical basis of the beach-ball (focal mechanism) solution — the four quadrants of compression and dilatation let you recover the fault plane from first-motion polarities.'),
    symbols: [
        { sym: '\\gamma', name: t('从震源指向台站的单位矢量', 'unit vector from source to station'), unit: '无量纲' },
        { sym: 'M_{jk}', name: t('矩张量', 'moment tensor'), unit: 'N·m' },
        { sym: '\\mathcal{R}^{P}, \\mathcal{R}^{S}', name: t('P、S 辐射花样因子', 'P and S radiation-pattern factors'), unit: '无量纲' },
        { sym: '\\theta', name: t('与断层面法向的夹角', 'angle from the fault normal'), unit: '°' },
        { sym: '\\phi', name: t('方位角（自滑动方向量起）', 'azimuth measured from the slip direction'), unit: '°' },
    ],
    conditions: {
        applies: [t('远场体波的振幅方向性、震源机制解', 'Directionality of far-field body waves; focal mechanism solutions')],
        assumes: [
            t('远场（r 远大于震源尺度与波长）', 'Far field (r much larger than source dimension and wavelength)'),
            t('点源、均匀全空间', 'Point source in a uniform whole space'),
        ],
        breaks: [
            t('近场项（1/r²、1/r³）在震源尺度内不可忽略', 'Near-field terms (1/r², 1/r³) matter at source distances'),
            t('有限断层破裂的方向性会强烈改变花样', 'Directivity of a finite rupture strongly modifies the pattern'),
        ],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('把震源写成体力偶矩张量', 'Represent the source as a moment tensor'),
            latex: String.raw `u_i = \int G_{ij,k}\,M_{jk}\,dV` },
        { n: 2, op: 'taylor', title: t('取远场渐近（保留 1/r 项）', 'Take the far-field asymptotics (keep the 1/r term)'),
            latex: String.raw `G_{ij,k} \to \frac{\gamma_i\gamma_j\gamma_k}{4\pi\rho\alpha^{3}r}\,\delta\!\left(t-\frac{r}{\alpha}\right)` },
        { n: 3, op: 'algebra', title: t('收缩指标得到 P 波', 'Contract indices to get P'),
            latex: String.raw `u_i^{P} \propto \gamma_i\left(\gamma_j M_{jk}\gamma_k\right)` },
        { n: 4, op: 'identity', title: t('投影掉径向得到 S 波', 'Project out the radial part to get S'),
            latex: String.raw `u_i^{S} \propto \left(\delta_{ij}-\gamma_i\gamma_j\right)\gamma_k M_{kj}` },
        { n: 5, op: 'result', title: t('双力偶代入即得四象限花样', 'Substituting a double couple gives the four-quadrant pattern'),
            latex: String.raw `\mathcal{R}^{P} \propto \sin 2\theta\cos\phi` },
    ],
    viz: [
        {
            id: 'radiation-lobes',
            level: 'V2',
            title: t('双力偶的 P 波与 S 波四瓣花样', 'Four-lobe P and S patterns of a double couple'),
            xlabel: t('水平', 'horizontal'),
            ylabel: t('竖直', 'vertical'),
            controls: [
                { id: 'phi', label: t('方位角 φ (°)', 'azimuth φ (°)'), min: 0, max: 90, step: 1, value: 0 },
            ],
            note: t('P 波与 S 波的花样相差 45° —— 所以在 P 波节面上的台站，S 波反而最大。', 'The P and S patterns differ by 45° — a station on a P nodal plane sees the largest S.'),
            compute: (p) => {
                const phi = (p['phi'] * Math.PI) / 180;
                const P = [];
                const S = [];
                for (let i = 0; i <= 360; i++) {
                    const th = (i / 360) * 2 * Math.PI;
                    const rp = Math.abs(Math.sin(2 * th) * Math.cos(phi));
                    const rs = Math.abs(Math.cos(2 * th) * Math.cos(phi));
                    P.push([rp * Math.cos(th), rp * Math.sin(th)]);
                    S.push([rs * Math.cos(th) * 0.9, rs * Math.sin(th) * 0.9]);
                }
                return [
                    { label: t('P 波花样 sin2θ', 'P pattern sin2θ'), color: '#185FA5', points: P },
                    { label: t('S 波花样 cos2θ', 'S pattern cos2θ'), color: '#993C1D', points: S, dash: true },
                ];
            },
        },
    ],
    example: {
        title: t('节面上的台站', 'A station on a nodal plane'),
        input: t('θ = 90°（断层面内），φ = 0°', 'θ = 90° (in the fault plane), φ = 0°'),
        steps: [
            t('sin 2θ = sin 180° = 0 → P 波振幅为零', 'sin 2θ = sin 180° = 0 → P amplitude vanishes'),
            t('cos 2θ = cos 180° = −1 → S 波绝对值最大', 'cos 2θ = cos 180° = −1 → S amplitude is maximal'),
        ],
        output: t('该台站记录不到 P 波初动，但 S 波很强 —— 这正是识别节面的依据', 'This station records no P first motion but a strong S — exactly how nodal planes are identified'),
    },
    links: {
        upstream: [{ id: 'moment-tensor-definition', note: t('矩张量的定义', 'Definition of the moment tensor') }],
        downstream: [{ id: 'focal-mechanism-first-motion', note: t('由初动反推机制', 'Recovering the mechanism from first motions') }],
        seealso: [{ id: 'dc-iso-clvd-decomposition', note: t('非双力偶成分', 'The non-double-couple part') }],
    },
    refs: [{ text: 'Aki & Richards, Quantitative Seismology, 2nd ed., §4.5' }],
};
export default doubleCoupleRadiationPattern;
//# sourceMappingURL=double-couple-radiation-pattern.js.map