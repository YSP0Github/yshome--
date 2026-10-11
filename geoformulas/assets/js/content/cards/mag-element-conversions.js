import { t } from '../../core/types.js';
/** mag-element-conversions */
const magElementConversions = {
    id: 'mag-element-conversions',
    name: t('地磁要素之间的换算', 'Conversions Among Geomagnetic Elements'),
    aliases: { zh: ['要素换算', 'F H Z X Y D I 关系'], en: ['element conversions'] },
    node: 'S15.2',
    tags: {
        math: ['MATH.GEOM', 'MATH.ALGEBRA'],
        method: ['METH.MAG'],
        quantity: ['Q.MAG'],
        keywords: t('要素换算 H=FcosI Z=FsinI X=HcosD Y=HsinD', 'element conversions F cos I sin D tan'),
    },
    audience: 'bachelor',
    complete: 'L3',
    statement: {
        main: String.raw `H=F\cos I,\quad Z=F\sin I,\quad X=H\cos D,\quad Y=H\sin D`,
        variants: [
            { name: t('角度反解', 'angle recovery'), latex: String.raw `\tan I=\frac{Z}{H},\quad \tan D=\frac{Y}{X}` },
        ],
    },
    meaning: t('七要素不是独立的——给定 F、I、D 三个量，其余全部由直角三角形分解得到：F 分解为水平 H 与垂直 Z；H 再分解为北向 X 与东向 Y。磁法勘探只测总场 F，但要做化极、剖面解释时必须先用 I、D 把 F 投影到垂直方向。', 'The seven elements are not independent — given F, I and D, the rest follow from right-triangle decomposition: F splits into H and Z; H splits into X and Y. Magnetic surveys measure only total field F, but reduction-to-pole and profile interpretation require projecting F vertically using I and D.'),
    symbols: [
        { sym: 'F', name: t('总场强度', 'total intensity'), unit: 'nT' },
        { sym: 'H', name: t('水平强度', 'horizontal intensity'), unit: 'nT' },
        { sym: 'Z', name: t('垂直强度', 'vertical intensity'), unit: 'nT' },
        { sym: 'X,Y', name: t('北向、东向分量', 'north, east components'), unit: 'nT' },
        { sym: 'I', name: t('磁倾角', 'inclination'), unit: '°' },
        { sym: 'D', name: t('磁偏角', 'declination'), unit: '°' },
    ],
    conditions: {
        applies: [t('任意地磁台站或测点', 'Any geomagnetic station or survey point')],
        assumes: [t('右手坐标系，Z 向下为正', 'Right-handed frame, Z positive down')],
        breaks: [t('局部异常叠加时需去参考场', 'Remove reference field when local anomalies superpose')],
    },
    derivation: [
        { n: 1, op: 'geometry', title: t('F 在垂直面内分解为 H、Z', 'Decompose F into H and Z in the vertical plane'),
            latex: String.raw `H=F\cos I,\quad Z=F\sin I` },
        { n: 2, op: 'geometry', title: t('H 在水平面内分解为 X、Y', 'Decompose H into X and Y in the horizontal plane'),
            latex: String.raw `X=H\cos D,\quad Y=H\sin D` },
        { n: 3, op: 'identity', title: t('校验 F²=H²+Z²=X²+Y²+Z²', 'Verify F²=H²+Z²=X²+Y²+Z²'),
            latex: String.raw `F^{2}=F^{2}(\cos^{2}I+\sin^{2}I)` },
        { n: 4, op: 'result', title: t('由分量反解角度', 'Recover angles from components'),
            latex: String.raw `\tan I=Z/H,\quad \tan D=Y/X` },
    ],
    viz: [
        {
            id: 'components-vs-inclination',
            level: 'V1',
            title: t('总场 F=50000 nT 时 H、Z 随倾角 I', 'H and Z versus inclination I (F=50000 nT)'),
            xlabel: t('倾角 I (°)', 'inclination I (°)'),
            ylabel: t('强度 (nT)', 'intensity (nT)'),
            controls: [
                { id: 'Fv', label: t('总场 F', 'total field F'), min: 25000, max: 65000, step: 1000, value: 50000, unit: 'nT' },
            ],
            compute: (p) => {
                const F = p['Fv'];
                const hPts = [];
                const zPts = [];
                for (let i = 0; i <= 90; i++) {
                    const I = (i * Math.PI) / 180;
                    hPts.push([i, F * Math.cos(I)]);
                    zPts.push([i, F * Math.sin(I)]);
                }
                return [
                    { label: t('H=F cosI', 'H=F cosI'), color: '#185FA5', points: hPts },
                    { label: t('Z=F sinI', 'Z=F sinI'), color: '#993C1D', points: zPts },
                ];
            },
            note: t('赤道 I=0 时全为水平分量；磁极 I=90° 时全为垂直分量。', 'At the equator I=0 the field is purely horizontal; at the pole I=90° it is purely vertical.'),
        },
    ],
    links: {
        upstream: [{ id: 'mag-geomagnetic-elements' }],
        downstream: [{ id: 'mag-reduction-to-pole' }],
    },
    refs: [{ text: 'Telford et al., Applied Geophysics, §4.1' }],
};
export default magElementConversions;
//# sourceMappingURL=mag-element-conversions.js.map