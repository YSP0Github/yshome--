import { t } from '../../core/types.js';
/** uem-resistor-series-parallel */
const uemResistorSeriesParallel = {
    id: 'uem-resistor-series-parallel',
    name: t('电阻的串并联', 'Series and Parallel Resistance'),
    aliases: { zh: ['电阻串并联', '等效电阻'], en: ['resistor combination', 'equivalent resistance'] },
    node: 'S19.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('电阻串联 并联 等效电阻 R=R1+R2 分流分压', 'resistor series parallel equivalent resistance voltage divider current divider'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `R_{\mathrm{ser}}=R_{1}+R_{2}+\cdots,\qquad \frac{1}{R_{\mathrm{par}}}=\frac{1}{R_{1}}+\frac{1}{R_{2}}+\cdots`,
        variants: [
            { name: t('两电阻', 'Two resistors'), latex: String.raw `R_{\mathrm{par}}=\dfrac{R_{1}R_{2}}{R_{1}+R_{2}}` },
            { name: t('分压/分流', 'Voltage / current division'), latex: String.raw `U_{1}=U\dfrac{R_{1}}{R_{1}+R_{2}},\quad I_{1}=I\dfrac{R_{2}}{R_{1}+R_{2}}` },
        ],
    },
    meaning: t('串联电阻相加（电流相同、电压按电阻分配）；并联电阻取倒数和（电压相同、电流按电导分配）。与电容相反：串联增大总电阻，并联减小总电阻。', 'Series resistances add (same current, voltage divides by resistance); parallel resistances combine by reciprocal sum (same voltage, current divides by conductance). Opposite to capacitors: series increases total R, parallel decreases it.'),
    symbols: [
        { sym: 'R_{\\mathrm{ser}}', name: t('串联等效电阻', 'series equivalent'), unit: 'Ω' },
        { sym: 'R_{\\mathrm{par}}', name: t('并联等效电阻', 'parallel equivalent'), unit: 'Ω' },
    ],
    conditions: {
        applies: [t('仅由电阻组成的网络', 'Networks of pure resistors')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('串联：电流相同', 'Series: same current'),
            latex: String.raw `U=U_{1}+U_{2}=I(R_{1}+R_{2})\ \Rightarrow\ R_{\mathrm{ser}}=R_{1}+R_{2}` },
        { n: 2, op: 'physics', title: t('并联：电压相同', 'Parallel: same voltage'),
            latex: String.raw `I=I_{1}+I_{2}=\dfrac{U}{R_{1}}+\dfrac{U}{R_{2}}\ \Rightarrow\ \dfrac{1}{R_{\mathrm{par}}}=\dfrac{1}{R_{1}}+\dfrac{1}{R_{2}}` },
    ],
    links: {
        upstream: [{ id: 'uem-resistance-resistivity' }],
        seealso: [{ id: 'uem-capacitor-series-parallel', note: t('规律相反', 'opposite rule') }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §27' }],
};
export default uemResistorSeriesParallel;
//# sourceMappingURL=uem-resistor-series-parallel.js.map