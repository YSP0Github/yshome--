import type { Lang } from './types.js'

type UIKey =
  | 'siteTitle' | 'siteSubtitle' | 'navTree' | 'navGraph' | 'navAbout' | 'navHome'
  | 'searchPlaceholder' | 'search' | 'searchHint'
  | 'filterNode' | 'filterAudience' | 'filterComplete' | 'filterAll' | 'filterReset'
  | 'resultCount' | 'noResult' | 'noResultHint'
  | 'secSymbols' | 'secMeaning' | 'secDerivation' | 'secViz' | 'secConditions'
  | 'secExample' | 'secNumerics' | 'secRefs' | 'secLinks' | 'secSeeAlso'
  | 'colSymbol' | 'colName' | 'colUnit' | 'colTypical'
  | 'upstream' | 'downstream' | 'applies' | 'assumes' | 'breaks'
  | 'variants' | 'stepOf' | 'toggleSteps' | 'collapseAll' | 'expandAll'
  | 'vizLevel' | 'vizNote' | 'downloadData'
  | 'back' | 'next' | 'prev' | 'randomCard' | 'copyLink'
  | 'statCards' | 'statNodes' | 'statLinks'
  | 'audienceLabel' | 'completeLabel'
  | 'graphTitle' | 'graphHint' | 'graphLegend'
  | 'language' | 'aboutBody' | 'aboutMethod' | 'aboutContrib'
  | 'homeBrowse' | 'homeRecent' | 'homeStartHere'
  | 'levelHint' | 'unitNone' | 'targetAudience' | 'nodeCoverage'
  | 'thatIsAll' | 'found'

const DICT: Record<UIKey, Record<Lang, string>> = {
  siteTitle:   { zh: '地球物理公式大全', en: 'Geophysics Formula Compendium' },
  siteSubtitle:{ zh: '推导 · 可视化 · 双语', en: 'Derivations · Visualizations · Bilingual' },
  navHome:     { zh: '首页', en: 'Home' },
  navTree:     { zh: '分类浏览', en: 'Taxonomy' },
  navGraph:    { zh: '依赖图谱', en: 'Dependency graph' },
  navAbout:    { zh: '关于', en: 'About' },
  search:      { zh: '搜索', en: 'Search' },
  searchPlaceholder: { zh: '搜索公式名、符号、LaTeX、专题…', en: 'Search names, symbols, LaTeX, topics…' },
  searchHint:  { zh: '支持中文 / English / 符号（如 v_p、Q）/ LaTeX（如 \\Delta）', en: 'Supports Chinese / English / symbols / LaTeX' },
  filterNode:  { zh: '学科分类', en: 'Subject' },
  filterAudience: { zh: '适用学段', en: 'Audience' },
  filterComplete: { zh: '完成度', en: 'Completeness' },
  filterAll:   { zh: '全部', en: 'All' },
  filterReset: { zh: '清空筛选', en: 'Reset filters' },
  resultCount: { zh: '条结果', en: 'results' },
  noResult:    { zh: '没有匹配的公式', en: 'No matching formula' },
  noResultHint:{ zh: '试试更短的关键词，或按学科浏览', en: 'Try a shorter query, or browse by subject' },
  secSymbols:  { zh: '符号表', en: 'Symbols' },
  secMeaning:  { zh: '物理意义', en: 'Physical meaning' },
  secDerivation: { zh: '分步推导', en: 'Derivation' },
  secViz:      { zh: '可视化', en: 'Visualization' },
  secConditions: { zh: '适用条件', en: 'Assumptions & limits' },
  secExample:  { zh: '数值算例', en: 'Worked example' },
  secNumerics: { zh: '数值实现', en: 'Numerical notes' },
  secRefs:     { zh: '参考来源', en: 'References' },
  secLinks:    { zh: '公式网络', en: 'Formula network' },
  secSeeAlso:  { zh: '相关公式', en: 'See also' },
  colSymbol:   { zh: '符号', en: 'Symbol' },
  colName:     { zh: '含义', en: 'Meaning' },
  colUnit:     { zh: '单位', en: 'Unit' },
  colTypical:  { zh: '典型取值', en: 'Typical' },
  upstream:    { zh: '上游（由此导出）', en: 'Upstream (derived from)' },
  downstream:  { zh: '下游（导出得到）', en: 'Downstream (leads to)' },
  applies:     { zh: '适用', en: 'Applies' },
  assumes:     { zh: '隐含假设', en: 'Assumptions' },
  breaks:      { zh: '失效边界', en: 'Breaks when' },
  variants:    { zh: '常见等价形式', en: 'Equivalent forms' },
  stepOf:      { zh: '步', en: 'Step' },
  toggleSteps: { zh: '展开/收起推导', en: 'Toggle steps' },
  collapseAll: { zh: '全部收起', en: 'Collapse all' },
  expandAll:   { zh: '全部展开', en: 'Expand all' },
  vizLevel:    { zh: '可视化等级', en: 'Viz level' },
  vizNote:     { zh: '读图提示', en: 'Reading note' },
  downloadData:{ zh: '导出数据 CSV', en: 'Export CSV' },
  back:        { zh: '返回', en: 'Back' },
  next:        { zh: '下一条', en: 'Next' },
  prev:        { zh: '上一条', en: 'Previous' },
  randomCard:  { zh: '随机一条', en: 'Random' },
  copyLink:    { zh: '复制链接', en: 'Copy link' },
  statCards:   { zh: '公式条目', en: 'Formula entries' },
  statNodes:   { zh: '学科节点', en: 'Subject nodes' },
  statLinks:   { zh: '依赖边', en: 'Dependency edges' },
  audienceLabel: { zh: '目标读者', en: 'Audience' },
  completeLabel: { zh: '完成度', en: 'Completeness' },
  graphTitle:  { zh: '公式依赖图谱', en: 'Formula dependency graph' },
  graphHint:   { zh: '箭头方向 = 谁导出谁；点击节点进入公式页。布局按依赖深度自动分层。', en: 'Arrows point from prerequisite to consequence. Click a node to open it. Layout is layered by dependency depth.' },
  graphLegend: { zh: '图例', en: 'Legend' },
  language:    { zh: 'EN', en: '中文' },
  aboutBody:   { zh: '本站把地震学的基础公式做成结构化数据：每条公式都带完整符号表、逐步推导（每步标注所用变换）与参数化可视化，中英双语并存。', en: 'This site turns fundamental seismology formulas into structured data: every entry carries a full symbol table, a step-by-step derivation with each step tagged by the transformation used, and parametric visualization — all bilingual.' },
  aboutMethod: { zh: '方法：公式本体与页面表现完全解耦，同一份数据可渲染网页、图谱、搜索索引与导出文件。', en: 'Method: formula content is fully decoupled from presentation, so one dataset can render pages, graphs, search indices and exports.' },
  aboutContrib: { zh: '每条公式都标注来源确保可溯源。发现错误欢迎提 issue 纠正。', en: 'Every entry cites its source for traceability. Errors are welcome to be reported.' },
  homeBrowse:  { zh: '按学科浏览', en: 'Browse by subject' },
  homeRecent:  { zh: '全部条目', en: 'All entries' },
  homeStartHere: { zh: '推荐起点', en: 'Start here' },
  levelHint:   { zh: '读者层级', en: 'Target level' },
  unitNone:    { zh: '无量纲', en: 'dimensionless' },
  targetAudience: { zh: '高中 → 博士', en: 'High school → PhD' },
  nodeCoverage: { zh: '学科覆盖', en: 'Subject coverage' },
  thatIsAll:   { zh: '就是这些了', en: "That's all" },
  found:       { zh: '找到', en: 'Found' },
}

let current: Lang = readLang()
const listeners: Array<(l: Lang) => void> = []

function readLang(): Lang {
  try {
    const v = localStorage.getItem('geoformulas.lang')
    if (v === 'zh' || v === 'en') return v
  } catch { /* localStorage 不可用时忽略 */ }
  return navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'zh'
}

export function getLang(): Lang {
  return current
}

export function setLang(l: Lang): void {
  if (l === current) return
  current = l
  try { localStorage.setItem('geoformulas.lang', l) } catch { /* ignore */ }
  document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en'
  for (const fn of listeners) fn(l)
}

export function toggleLang(): void {
  setLang(current === 'zh' ? 'en' : 'zh')
}

export function onLangChange(fn: (l: Lang) => void): void {
  listeners.push(fn)
}

export function ui(key: UIKey): string {
  return DICT[key][current]
}

export function langLabel(): string {
  return current === 'zh' ? 'EN' : '中文'
}
