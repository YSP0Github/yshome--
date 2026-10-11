import { t } from '../../core/types.js';
/** uem-magnetic-field-b */
const uemMagneticFieldB = {
    id: 'uem-magnetic-field-b',
    name: t('磁感应强度 B', 'Magnetic Field B'),
    aliases: { zh: ['磁感应强度', '磁场 B'], en: ['magnetic field', 'magnetic flux density'] },
    node: 'S19.3',
    tags: {
        math: ['MATH.VECTOR'],
        method: ['METH.PHYS'],
        quantity: ['Q.MAG'],
        keywords: t('磁感应强度 B 特斯拉 磁场方向 磁力线', 'magnetic flux density B tesla field direction field lines'),
    },
    audience: 'bachelor',
    complete: 'L1',
    statement: {
        main: String.raw `\mathbf{F}=q\,\mathbf{v}\times\mathbf{B}\quad\Rightarrow\quad B=\frac{F_{\perp}}{q\,v}`,
        variants: [
            { name: t('单位', 'Units'), latex: String.raw `1\ \mathrm{T}=1\ \dfrac{\mathrm{N}}{\mathrm{A}\cdot\mathrm{m}}=10^{4}\ \mathrm{G}` },
        ],
    },
    meaning: t('磁感应强度 B 描述磁场的强弱与方向，定义为运动电荷所受最大磁力与 qv 之比。B 是轴矢量，磁力线闭合、不始于正磁荷（无磁单极）。', 'Magnetic flux density B describes the strength and direction of the field, defined as the maximum magnetic force on a moving charge divided by qv. B is an axial vector whose field lines close on themselves—there are no magnetic monopoles.'),
    symbols: [
        { sym: '\\mathbf{B}', name: t('磁感应强度', 'magnetic flux density'), unit: 'T' },
        { sym: '\\mathbf{F}', name: t('磁场力', 'magnetic force'), unit: 'N' },
        { sym: 'q', name: t('运动电荷', 'moving charge'), unit: 'C' },
        { sym: '\\mathbf{v}', name: t('电荷速度', 'charge velocity'), unit: 'm/s' },
    ],
    conditions: {
        applies: [t('由运动电荷或电流激发的磁场', 'Field produced by moving charges or currents')],
    },
    links: {
        downstream: [{ id: 'uem-biot-savart-law' }, { id: 'uem-lorentz-force' }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §28' }],
};
export default uemMagneticFieldB;
//# sourceMappingURL=uem-magnetic-field-b.js.map