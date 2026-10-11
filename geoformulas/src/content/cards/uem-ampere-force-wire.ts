import type { FormulaCard } from '../../core/types.js'
import { t } from '../../core/types.js'

/** uem-ampere-force-wire */
const uemAmpereForceWire: FormulaCard = {
  id: 'uem-ampere-force-wire',
  name: t('磁场对电流的作用力（Ampere 力）', 'Magnetic Force on a Current-Carrying Wire'),
  aliases: { zh: ['安培力 F=BIL', '载流导线受力'], en: ['Ampere force', 'force on a wire'] },
  node: 'S19.3',
  tags: {
    math: ['MATH.VECTOR'],
    method: ['METH.PHYS'],
    quantity: ['Q.MAG'],
    keywords: t('安培力 F=BIL sinθ 载流导线 磁场 电动机', 'Ampere force B I L sin theta current wire magnetic motor'),
  },
  audience: 'bachelor',
  complete: 'L2',
  statement: {
    main: String.raw`\mathbf{F}=I\,\mathbf{L}\times\mathbf{B},\qquad F=BIL\sin\theta`,
    variants: [
      { name: t('平行/垂直', 'Parallel / perpendicular'), latex: String.raw`F_{\perp}=BIL,\qquad F_{\parallel}=0` },
    ],
  },
  meaning: t(
    '载流导线在磁场中受力，方向由左手定则（L×B）确定，大小 F=BIL sinθ。这是电动机、动圈式仪表把电能转成机械运动的根本力。',
    'A current-carrying wire feels a force in a magnetic field, direction by the left-hand rule (L×B), magnitude F=BIL sinθ. It is the fundamental force that motors and moving-coil meters use to turn electricity into motion.',
  ),
  symbols: [
    { sym: '\\mathbf{F}', name: t('安培力', 'Ampere force'), unit: 'N' },
    { sym: 'I', name: t('电流', 'current'), unit: 'A' },
    { sym: '\\mathbf{L}', name: t('导线矢量（沿电流方向）', 'wire vector along current'), unit: 'm' },
    { sym: '\\mathbf{B}', name: t('磁感应强度', 'magnetic field'), unit: 'T' },
    { sym: '\\theta', name: t('电流与磁场夹角', 'angle between current and field'), unit: 'rad' },
  ],
  conditions: {
    applies: [t('均匀磁场中的直导线', 'Straight wire in a uniform field')],
  },
  derivation: [
    { n: 1, op: 'physics', title: t('导线内载流子受力', 'Force on carriers in the wire'),
      latex: String.raw`\mathbf{F}=\int dq\,\mathbf{v}\times\mathbf{B}` },
    { n: 2, op: 'algebra', title: t('换成 I 与 L', 'Rewrite with I and L'),
      latex: String.raw`dq\,\mathbf{v}=I\,d\mathbf{l}\ \Rightarrow\ \mathbf{F}=I\int d\mathbf{l}\times\mathbf{B}=I\mathbf{L}\times\mathbf{B}` },
  ],
  links: {
    upstream: [{ id: 'uem-magnetic-field-b' }],
    downstream: [{ id: 'uem-magnetic-dipole-moment' }],
  },
  refs: [{ text: 'Halliday, Resnick & Walker, 10e, §28' }],
}

export default uemAmpereForceWire
