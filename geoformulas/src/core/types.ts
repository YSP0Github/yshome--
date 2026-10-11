/**
 * FormulaCard —— 全站唯一的数据契约。
 * 所有页面、检索、图谱、导出都从这一份结构派生。
 * 内容用 TS 模块书写（而非 YAML），换取编译期类型校验与补全。
 */

export type Lang = 'zh' | 'en'
export type BText = { zh: string; en: string }

/** 目标读者层级：高中 → 博士 */
export type Audience = 'highschool' | 'bachelor' | 'master' | 'phd'

/** 完成度等级：L1 条目式 / L2 含推导 / L3 含交互 / L4 含仿真与算例 */
export type Complete = 'L1' | 'L2' | 'L3' | 'L4'

/** 可视化等级，能用低级就不上高级 */
export type VizLevel = 'V0' | 'V1' | 'V2' | 'V3' | 'V4' | 'V5'

/** 推导步的「操作类型」，前端据此上色 */
export type StepOp =
  | 'setup'      // 设定与定义
  | 'geometry'   // 几何关系
  | 'physics'    // 引入物理定律
  | 'identity'   // 使用恒等式
  | 'substitute' // 代入
  | 'algebra'    // 代数化简
  | 'taylor'     // 泰勒展开 / 近似
  | 'transform'  // 积分变换 / 坐标变换
  | 'result'     // 结论

export interface SymbolDef {
  sym: string
  name: BText
  unit: string
  dimension?: string
  typical?: string
}

export interface Step {
  n: number
  op: StepOp
  title: BText
  latex: string
  note?: BText
}

export interface Control {
  id: string
  label: BText
  min: number
  max: number
  step: number
  value?: number
  unit?: string
}

export interface Series {
  label?: BText
  color: string
  points: Array<[number, number]>
  dash?: boolean
}

export interface VizSpec {
  id: string
  level: VizLevel
  title: BText
  xlabel: BText
  ylabel: BText
  xScale?: 'linear' | 'log'
  yScale?: 'linear' | 'log'
  controls: Control[]
  /** 由参数计算 series，content 是 TS 所以可以直接放函数 */
  compute: (p: Record<string, number>) => Series[]
  /** x / y 轴显示范围 */
  xRange?: [number, number]
  yRange?: [number, number]
  note?: BText
}

export interface RefItem {
  text: string
  url?: string
}

export interface LinkItem {
  id: string
  note?: BText
}

/**
 * 多维度标签。一条公式可以同时属于多个互不隶属的分类体系，
 * 因此同一份数据可以按任意体系重新排序、筛选、聚合成图。
 */
export interface CardTags {
  /** 学科树归属（主体系，同时决定 URL 中的学科路径） */
  subject?: string
  /** 数学工具体系 */
  math?: string[]
  /** 方法 / 应用体系 */
  method?: string[]
  /** 核心物理量体系 */
  quantity?: string[]
  /** 自由关键词，参与检索 */
  keywords?: BText
}

export interface FormulaCard {
  /** 稳定 slug，同时是 URL */
  id: string
  name: BText
  aliases?: { zh?: string[]; en?: string[] }
  /** 学科树节点 id，例如 'S2.2' */
  node: string
  /** 多维分类标签 */
  tags: CardTags
  audience: Audience
  complete: Complete
  statement: {
    main: string
    variants?: Array<{ name: BText; latex: string }>
  }
  meaning?: BText
  symbols: SymbolDef[]
  conditions?: {
    applies?: BText[]
    assumes?: BText[]
    breaks?: BText[]
  }
  derivation?: Step[]
  viz?: VizSpec[]
  numerics?: { note: BText; snippet: string }[]
  example?: { title?: BText; input: BText; steps?: BText[]; output: BText }
  links?: {
    upstream?: LinkItem[]
    downstream?: LinkItem[]
    seealso?: LinkItem[]
  }
  refs?: RefItem[]
}

/** 学科树节点 */
export interface TaxoNode {
  id: string
  name: BText
  parent?: string
  desc?: BText
}

export const t = (zh: string, en: string): BText => ({ zh, en })
export const pick = (v: BText, lang: Lang): string => (lang === 'zh' ? v.zh : v.en)
