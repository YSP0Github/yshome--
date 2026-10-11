import { t } from '../../core/types.js';
/** uem-capacitor-series-parallel */
const uemCapacitorSeriesParallel = {
    id: 'uem-capacitor-series-parallel',
    name: t('电容的串并联', 'Series and Parallel Capacitance'),
    aliases: { zh: ['电容串并联', '等效电容'], en: ['capacitor combination', 'equivalent capacitance'] },
    node: 'S19.2',
    tags: {
        math: ['MATH.ALGEBRA'],
        method: ['METH.PHYS'],
        quantity: ['Q.ELEC'],
        keywords: t('电容串联 并联 等效电容 1/C=Σ1/C', 'capacitor series parallel equivalent capacitance reciprocal sum'),
    },
    audience: 'bachelor',
    complete: 'L2',
    statement: {
        main: String.raw `C_{\mathrm{par}}=C_{1}+C_{2}+\cdots,\qquad \frac{1}{C_{\mathrm{ser}}}=\frac{1}{C_{1}}+\frac{1}{C_{2}}+\cdots`,
        variants: [
            { name: t('两电容', 'Two capacitors'), latex: String.raw `C_{\mathrm{ser}}=\dfrac{C_{1}C_{2}}{C_{1}+C_{2}}` },
        ],
    },
    meaning: t('并联电容直接相加（各电容电压相同、电荷相加）；串联电容取倒数和（各电容电荷相同、电压相加）。注意电容串并联规律与电阻相反：并联增大总电容，串联减小总电容。', 'Parallel capacitances add directly (same voltage, charges add); series capacitances combine by reciprocal sum (same charge, voltages add). Note this is opposite to resistors: parallel increases total C, series decreases it.'),
    symbols: [
        { sym: 'C_{\\mathrm{par}}', name: t('并联等效电容', 'parallel equivalent'), unit: 'F' },
        { sym: 'C_{\\mathrm{ser}}', name: t('串联等效电容', 'series equivalent'), unit: 'F' },
    ],
    conditions: {
        applies: [t('仅由电容组成的串并联网络', 'Networks of pure capacitors')],
    },
    derivation: [
        { n: 1, op: 'physics', title: t('并联：电压相同', 'Parallel: same voltage'),
            latex: String.raw `Q=Q_{1}+Q_{2}=C_{1}U+C_{2}U\ \Rightarrow\ C_{\mathrm{par}}=C_{1}+C_{2}` },
        { n: 2, op: 'physics', title: t('串联：电荷相同', 'Series: same charge'),
            latex: String.raw `U=U_{1}+U_{2}=\dfrac{Q}{C_{1}}+\dfrac{Q}{C_{2}}\ \Rightarrow\ \dfrac{1}{C_{\mathrm{ser}}}=\dfrac{1}{C_{1}}+\dfrac{1}{C_{2}}` },
    ],
    links: {
        upstream: [{ id: 'uem-capacitance' }],
        seealso: [{ id: 'uem-resistor-series-parallel', note: t('规律相反', 'opposite rule') }],
    },
    refs: [{ text: 'Halliday, Resnick & Walker, 10e, §25' }],
};
export default uemCapacitorSeriesParallel;
//# sourceMappingURL=uem-capacitor-series-parallel.js.map