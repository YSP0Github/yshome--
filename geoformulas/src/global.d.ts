// KaTeX 由 index.html 通过 <script> 全局引入（UMD），这里只做类型声明。
// 这样避免打包器，也让 vendor/katex 可以直接被 rsync 到任意静态服务器。
interface KaTeXGlobal {
  renderToString(expression: string, options?: Record<string, unknown>): string
  render(expression: string, baseNode: HTMLElement, options?: Record<string, unknown>): void
}

declare const katex: KaTeXGlobal
