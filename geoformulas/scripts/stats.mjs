// 统计各分类节点下的公式数量，用于发现内容稀疏的区域
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../src/content/cards/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const files = readdirSync(dir).filter((f) => f.endsWith('.ts'));
const counts = new Map();
const ids = new Set();
for (const f of files) {
  const src = readFileSync(join(dir, f), 'utf8');
  const node = src.match(/node:\s*'([^']+)'/)?.[1] ?? '(none)';
  const id = src.match(/^\s{2}id:\s*'([^']+)'/m)?.[1] ?? '(none)';
  ids.add(id);
  counts.set(node, (counts.get(node) ?? 0) + 1);
}
const keys = [...counts.keys()].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
for (const k of keys) console.log(k.padEnd(8), String(counts.get(k)).padStart(3));
console.log('---');
console.log('节点数', keys.length, '卡片数', files.length, '唯一 id', ids.size);
