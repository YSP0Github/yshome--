import { t } from '../../core/types.js';
/** dc-point-source-potential */
const dcPointSourcePotential = {
    id: 'dc-point-source-potential',
    name: t('均匀半空间点电源电场', 'Point-source Field in a Uniform Half-space'),
    aliases: { zh: ['点电源电位', '稳恒电流场'], en: ['point-source potential', 'steady current field'] },
    node: 'S16.1',
    tags: {
        math: ['MATH.VECTOR', 'MATH.GEOM'],
        method: ['METH.EM'],
        quantity: ['Q.ELEC'],
        keywords: t('点电源 电位 电场强度 电流密度 半球扩散', 'point source potential current density hemisphere'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `U(r)=\frac{I\,\rho_{e}}{2\pi r}\;,\qquad E(r)=\frac{I\,\rho_{e}}{2\pi r^{2}}`,
        variants: [
            { name: t('电流密度', 'Current density'), latex: String.raw `J(r)=\dfrac{I}{2\pi r^{2}}=\dfrac{E}{\rho_{e}}` },
        ],
    },
    meaning: t('向均匀大地（半无限空间）供入电流 I，电流只在上半空间被地面截断的半球内扩散，故球面面积取 2πr² 而非 4πr²。电位按 1/r 衰减，电场按 1/r² 衰减——这是所有直流装置系数（Wenner、Schlumberger 等）的推导起点。', 'When a current I is injected into a uniform half-space, it spreads over a hemisphere (area 2πr², not 4πr²). Potential decays as 1/r and field as 1/r² — this is the starting point for deriving the geometric factor of every DC array (Wenner, Schlumberger, …).'),
    symbols: [
        { sym: 'U(r)', name: t('距供电极 r 处的电位', 'potential at distance r from the source'), unit: 'V' },
        { sym: 'I', name: t('供电电流', 'injected current'), unit: 'A' },
        { sym: '\\rho_{e}', name: t('均匀半空间电阻率', 'uniform half-space resistivity'), unit: 'Ω·m' },
        { sym: 'r', name: t('到供电极的距离', 'distance to the source electrode'), unit: 'm' },
        { sym: 'E(r)', name: t('电场强度', 'electric field'), unit: 'V/m' },
    ],
    conditions: {
        applies: [t('均匀、各向同性半无限介质', 'Uniform, isotropic half-space')],
        assumes: [t('地表为水平面，无边界效应', 'Flat free surface, no boundary effects')],
        breaks: [t('地下有电性分层时须叠加镜像/分层解', 'Layering requires superposition with layered-earth solutions')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('半球面电流密度', 'Current density over a hemisphere'),
            latex: String.raw `J=\dfrac{I}{\text{半球面积}}=\dfrac{I}{2\pi r^{2}}` },
        { n: 2, op: 'physics', title: t('由微分 Ohm 定律得电场', 'Field from differential Ohm law'),
            latex: String.raw `E=\rho_{e}J=\dfrac{I\rho_{e}}{2\pi r^{2}}` },
        { n: 3, op: 'transform', title: t('电位为电场的线积分', 'Potential as the line integral of E'),
            latex: String.raw `U(r)=\int_{r}^{\infty}E\,dr=\int_{r}^{\infty}\dfrac{I\rho_{e}}{2\pi r'^{2}}dr'=\dfrac{I\rho_{e}}{2\pi r}` },
    ],
    links: {
        downstream: [{ id: 'dc-apparent-resistivity', note: t('双极装置由它叠加而来', 'Built by superposition of two such sources') }],
        seealso: [{ id: 'dc-ohm-law-resistivity' }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §4.2' }],
};
export default dcPointSourcePotential;
//# sourceMappingURL=dc-point-source-potential.js.map