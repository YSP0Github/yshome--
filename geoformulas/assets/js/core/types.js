/**
 * FormulaCard —— 全站唯一的数据契约。
 * 所有页面、检索、图谱、导出都从这一份结构派生。
 * 内容用 TS 模块书写（而非 YAML），换取编译期类型校验与补全。
 */
export const t = (zh, en) => ({ zh, en });
export const pick = (v, lang) => (lang === 'zh' ? v.zh : v.en);
//# sourceMappingURL=types.js.map