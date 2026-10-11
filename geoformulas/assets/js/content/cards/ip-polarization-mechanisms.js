import { t } from '../../core/types.js';
/** ip-polarization-mechanisms */
const ipPolarizationMechanisms = {
    id: 'ip-polarization-mechanisms',
    name: t('激发极化的微观机制', 'Microscopic Mechanisms of Induced Polarization'),
    aliases: { zh: ['电子导体极化 薄膜极化 双电层'], en: ['electronic conduction polarization', 'membrane polarization', 'electrical double layer'] },
    node: 'S16.3',
    tags: {
        math: [],
        method: ['METH.EM', 'METH.ROCK'],
        quantity: ['Q.ELEC'],
        keywords: t('激发极化 机制 电子导体 薄膜极化 双电层 硫化物 粘土', 'IP mechanism electronic conductor membrane double layer sulphide clay'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\underbrace{\text{电子导体极化}}_{\text{硫化物/石墨}}+\underbrace{\text{薄膜(粘土)极化}}_{\text{阳离子交换}}`,
        variants: [
            { name: t('宏观表现', 'Macroscopic effect'), latex: String.raw `\text{充电后断电，离子/电荷在界面缓慢弛豫}\Rightarrow\Delta U_{2}(t)` },
        ],
    },
    meaning: t('IP 有两类主要机制：①电子导体（浸染状金属矿物、石墨）表面双电层的充放电；②薄膜极化——细粒粘土堵塞孔隙喉道时，阳离子输运受阻、在界面堆积形成浓差电池。前者对找金属矿最灵敏，后者使泥质地层也有可测 IP 效应，解释时须区分。', 'Two main IP mechanisms: (1) double-layer charging at disseminated electronic conductors (ore minerals, graphite); (2) membrane polarisation — when clay throats impede cation transport, charge builds up as a concentration cell. The first is most useful for ore detection; the second makes shaly formations polarisable too and must be separated during interpretation.'),
    symbols: [
        { sym: '\\Delta U_{2}(t)', name: t('二次电位衰减', 'secondary potential decay'), unit: 'V' },
    ],
    conditions: {
        applies: [t('含金属矿物、石墨或粘土的岩石', 'Rocks containing ore minerals, graphite or clay')],
        breaks: [t('纯净、大孔隙砂岩 IP 响应很弱', 'Clean, well-sorted sandstones show weak IP')],
    },
    links: {
        seealso: [{ id: 'ip-polarizability-definition' }, { id: 'ip-cole-cole-model' }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, 2nd ed., §6.2' }],
};
export default ipPolarizationMechanisms;
//# sourceMappingURL=ip-polarization-mechanisms.js.map