import { ALL_CARDS } from '../content/index.js';
import { pick } from './types.js';
import { TAXONOMY, SYSTEMS } from '../taxonomy.js';
/** 一条公式所属学科路径，例如 S1.2 → ['S1', 'S1.2'] */
export function nodePath(card) {
    const out = [];
    let cur = TAXO_BY_ID.get(card.node);
    while (cur) {
        out.unshift(cur.id);
        cur = cur.parent ? TAXO_BY_ID.get(cur.parent) : undefined;
    }
    return out;
}
const TAXO_BY_ID = new Map(TAXONOMY.map((n) => [n.id, n]));
class Store {
    cards = ALL_CARDS;
    byId = new Map();
    /** 学科节点 → 直接归属的卡片 */
    directByNode = new Map();
    edges = [];
    /** 每个维度体系的类目 → 卡片列表 */
    byFacet = new Map();
    /** 数据完整性问题，开发期用于自检 */
    issues = [];
    constructor() {
        for (const c of this.cards) {
            if (this.byId.has(c.id))
                this.issues.push(`重复 id: ${c.id}`);
            this.byId.set(c.id, c);
            const list = this.directByNode.get(c.node) ?? [];
            list.push(c);
            this.directByNode.set(c.node, list);
        }
        this.validateLinks();
        this.buildFacets();
    }
    validateLinks() {
        const seen = new Set();
        const add = (from, to) => {
            const key = `${from}->${to}`;
            if (seen.has(key))
                return;
            seen.add(key);
            this.edges.push({ from, to });
        };
        for (const c of this.cards) {
            const groups = [c.links?.upstream, c.links?.downstream, c.links?.seealso];
            for (const g of groups) {
                for (const l of g ?? []) {
                    if (!this.byId.has(l.id)) {
                        this.issues.push(`${c.id} 引用了不存在的公式: ${l.id}`);
                        continue;
                    }
                }
            }
            for (const u of c.links?.upstream ?? [])
                if (this.byId.has(u.id))
                    add(u.id, c.id);
            for (const d of c.links?.downstream ?? [])
                if (this.byId.has(d.id))
                    add(c.id, d.id);
        }
    }
    buildFacets() {
        for (const sys of SYSTEMS) {
            const map = new Map();
            if (sys.id === 'subject') {
                // 学科树有层级：一个类目下应统计「它自身 + 全部后代节点」的卡片
                for (const node of sys.items) {
                    const ids = descendantNodes(node.id);
                    map.set(node.id, this.cards.filter((c) => ids.includes(c.node)));
                }
            }
            else {
                for (const item of sys.items)
                    map.set(item.id, []);
                for (const c of this.cards) {
                    const vals = c.tags[sys.id] ?? [];
                    for (const v of vals) {
                        if (!map.has(v)) {
                            this.issues.push(`${c.id} 使用了未定义的类目 ${sys.id}=${v}`);
                            continue;
                        }
                        map.get(v)?.push(c);
                    }
                }
            }
            this.byFacet.set(sys.id, map);
        }
    }
    /** 递归收集某学科节点及其全部后代节点下的卡片 */
    cardsUnder(nodeId) {
        const ids = descendantNodes(nodeId);
        return this.cards.filter((c) => ids.includes(c.node));
    }
    /** 依赖深度：最长上游路径长度（惰性计算，必须在 links 校验之后） */
    rankOf(id) {
        return this.rankCache().get(id) ?? 0;
    }
    rankMemo = null;
    rankCache() {
        if (!this.rankMemo)
            this.rankMemo = computeRanks(this.cards, this.edges);
        return this.rankMemo;
    }
    /** 每个 ID 的邻居 */
    neighbours(id) {
        const c = this.byId.get(id);
        const up = (c?.links?.upstream ?? []).map((l) => this.byId.get(l.id)).filter(isCard);
        const down = (c?.links?.downstream ?? []).map((l) => this.byId.get(l.id)).filter(isCard);
        return { up, down };
    }
    /** 递归回溯全部祖先（用于系谱图的「溯祖」视图） */
    ancestors(id, maxDepth = 6) {
        const out = new Map();
        const walk = (cur, depth) => {
            if (depth > maxDepth)
                return;
            for (const e of this.edges) {
                if (e.to !== cur)
                    continue;
                const prev = out.get(e.from);
                if (prev === undefined || prev < depth) {
                    out.set(e.from, depth);
                    walk(e.from, depth + 1);
                }
            }
        };
        walk(id, 0);
        return out;
    }
    descendants(id, maxDepth = 6) {
        const out = new Map();
        const walk = (cur, depth) => {
            if (depth > maxDepth)
                return;
            for (const e of this.edges) {
                if (e.from !== cur)
                    continue;
                const prev = out.get(e.to);
                if (prev === undefined || prev < depth) {
                    out.set(e.to, depth);
                    walk(e.to, depth + 1);
                }
            }
        };
        walk(id, 0);
        return out;
    }
    /** 「被依赖次数」——用于气泡图的半径、以及「核心公式」排序 */
    centrality(id) {
        let n = 0;
        for (const e of this.edges) {
            if (e.to === id)
                n++;
            if (e.from === id)
                n++;
        }
        return n;
    }
    searchableDocs() {
        return this.cards.map((c) => ({
            id: c.id,
            card: c,
            name: c.name,
            nodePath: nodePath(c),
        }));
    }
}
function computeRanks(cards, edges) {
    const indeg = new Map();
    for (const c of cards)
        indeg.set(c.id, []);
    for (const e of edges)
        indeg.get(e.to)?.push(e.from);
    const memo = new Map();
    const visiting = new Set();
    const rank = (id) => {
        const cached = memo.get(id);
        if (cached !== undefined)
            return cached;
        if (visiting.has(id))
            return 0; // 环路保护
        visiting.add(id);
        const ups = indeg.get(id) ?? [];
        let r = 0;
        for (const u of ups)
            r = Math.max(r, rank(u) + 1);
        visiting.delete(id);
        memo.set(id, r);
        return r;
    };
    for (const c of cards)
        rank(c.id);
    return memo;
}
/** 某学科节点的全部后代节点（含自身） */
function descendantNodes(nodeId) {
    const out = [nodeId];
    let i = 0;
    while (i < out.length) {
        for (const n of TAXONOMY)
            if (n.parent === out[i] && !out.includes(n.id))
                out.push(n.id);
        i++;
    }
    return out;
}
function isCard(c) {
    return !!c;
}
export const store = new Store();
/** 双语取值的便捷函数 */
export function T(v, lang) {
    return pick(v, lang);
}
//# sourceMappingURL=store.js.map