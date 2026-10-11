import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-kirchhoff-laws */
const uemKirchhoffLaws: FormulaCard = {
  id: 'uem-kirchhoff-laws',
  name: t('Kirchhoff 定律', "Kirchhoff's Laws"),
  aliases: { zh: ['基尔霍夫定律', '节点电流定律 回路电压定律'], en: ["Kirchhoff's rules", 'junction and loop rules'] },
  node: 'S19.2',
  tags: {
    math: ['MATH.ALGEBRA', 'MATH.LINALG'],
    method: ['METH.PHYS'],
    quantity: ['Q.ELEC'],
    keywords: t('基尔霍夫 节点 KCL 流入=流出 回路 KVL 电势升降和', 'Kirchhoff junction KCL loop KVL sum voltage rises drops conservation'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\sum I_{\mathrm{in}}=\sum I_{\mathrm{out}}\quad(\text{KCL}),\qquad \sum \mathcal{E}=\sum IR\quad(\text{KVL})`,
    variants: [
      { name: t('KCL 一般式', 'KCL general'), latex: String.raw`\sum_{k}I_{k}=0\ \text{（节点）}` },
      { name: t('KVL 一般式', 'KVL general'), latex: String.raw`\sum_{k}U_{k}=0\ \text{（闭合回路）}` },
    ],
  },
  meaning: t(
    'KCL（节点定律）：流入节点的电流之和等于流出之和，是电荷守恒；KVL（回路定律）：绕任一闭合回路电势升降之和为零，是能量守恒。二者配合欧姆定律可解任意复杂直流电路。',
    'KCL (junction rule): currents into a node equal currents out—charge conservation. KVL (loop rule): around any closed loop the sum of potential rises and drops is zero—energy conservation. With Ohm\'s law they solve any DC circuit.',
  ),
  symbols: [
    { sym: 'I', name: t('支路电流', 'branch current'), unit: 'A' },
    { sym: '\\mathcal{E}', name: t('电源电动势', 'source EMF'), unit: 'V' },
    { sym: 'R', name: t('电阻', 'resistance'), unit: 'Ω' },
  ],
  conditions: {
    applies: [t('稳恒直流电路；节点与回路可任意选取', 'Steady DC circuits; nodes and loops chosen freely')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('节点电荷不积累', 'No charge accumulates at a node'),
      latex: String.raw`\sum I_{\mathrm{in}}-\sum I_{\mathrm{out}}=\dfrac{dQ}{dt}=0` },
    { n: 2, op: 'physics', title: t('绕一周回到原电势', 'Traversing a loop returns to the same potential'),
      latex: String.raw`\sum U_{\mathrm{rise}}-\sum U_{\mathrm{drop}}=0` },
    { n: 3, op: 'algebra', title: t('代入 IR 与 ε', 'Substitute IR and ε'),
      latex: String.raw`\sum\mathcal{E}-\sum IR=0` },
  ],
  links: {
    upstream: [{ id: 'uem-electromotive-force' }, { id: 'uem-ohms-law' }],
    seealso: [{ id: 'uem-resistor-series-parallel' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §27' }],
}

export default uemKirchhoffLaws
