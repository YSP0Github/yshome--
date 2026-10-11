import { t } from '../../core/types.js';
/** mag-induced-vs-remanent */
const magInducedVsRemanent = {
    id: 'mag-induced-vs-remanent',
    name: t('感应磁化与剩余磁化', 'Induced vs Remanent Magnetization'),
    aliases: { zh: ['感磁 剩磁', 'M_i M_r'], en: ['induced vs remanent magnetization'] },
    node: 'S15.3',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.MAG', 'METH.ROCK'],
        quantity: ['Q.MAG', 'Q.MAT'],
        keywords: t('感应磁化 剩余磁化 天然剩磁 NRM', 'induced remanent natural remanent magnetization NRM'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\mathbf{M}=\mathbf{M}_i+\mathbf{M}_r=\chi\mathbf{H}+\mathbf{M}_{\text{NRM}}`,
    },
    meaning: t('岩石的总磁化由两部分组成：感应磁化 M_i=χH，由现今地磁场当场产生、方向平行于 H；剩余磁化 M_r（NRM）是岩石在形成时（冷却、沉积、化学固化）记录下来的"化石"磁性，方向可与现今场完全不同。火成岩剩磁强，是古地磁和磁法解释中最常被忽略却影响最大的一项。', 'A rock’s total magnetization has two parts: induced M_i=χH, produced in-situ by the present field and parallel to H; and remanent M_r (NRM), a "fossil" magnetism locked in when the rock formed (cooling, deposition, chemical growth), possibly pointing in a very different direction. Igneous rocks have strong remanence — the most important yet often neglected term in magnetic interpretation.'),
    symbols: [
        { sym: '\\mathbf{M}_i', name: t('感应磁化强度', 'induced magnetization'), unit: 'A/m' },
        { sym: '\\mathbf{M}_r', name: t('剩余磁化强度（NRM）', 'remanent magnetization (NRM)'), unit: 'A/m' },
        { sym: '\\chi', name: t('磁化率', 'susceptibility'), unit: '—' },
        { sym: '\\mathbf{H}', name: t('现今地磁场强度', 'present geomagnetic field'), unit: 'A/m' },
    ],
    conditions: {
        applies: [t('火成岩、沉积岩、变质岩磁性', 'Magnetization of igneous, sedimentary, metamorphic rocks')],
        assumes: [t('线性叠加感磁与剩磁', 'Linear superposition of induced and remanent')],
        breaks: [t('强交变场中剩磁被部分改造', 'Remanence modified by strong alternating fields')],
    },
    links: {
        upstream: [{ id: 'mag-magnetization-susceptibility' }],
        downstream: [{ id: 'mag-thermal-remanence' }, { id: 'mag-depositional-remanence' }, { id: 'mag-chemical-remanence' }],
    },
    refs: [{ text: 'Dunlop & Özdemir, Rock Magnetism, ch. 2' }],
};
export default magInducedVsRemanent;
//# sourceMappingURL=mag-induced-vs-remanent.js.map