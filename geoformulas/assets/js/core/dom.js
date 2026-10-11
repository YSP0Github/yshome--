export function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === false)
            continue;
        if (k === 'class')
            node.className = String(v);
        else if (k === 'html')
            node.innerHTML = String(v);
        else if (k === 'text')
            node.textContent = String(v);
        else
            node.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of children) {
        if (c === null || c === undefined || c === false)
            continue;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
}
export function clear(node) {
    while (node.firstChild)
        node.removeChild(node.firstChild);
}
export function frag(children) {
    const f = document.createDocumentFragment();
    for (const c of children) {
        if (c === null || c === undefined || c === false)
            continue;
        f.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return f;
}
/** 把 innerHTML 字符串包成容器，便于安全注入 KaTeX 输出 */
export function rawHtml(html, tag = 'div') {
    const node = document.createElement(tag);
    node.innerHTML = html;
    return node;
}
export function fmt(x, digits = 3) {
    if (!Number.isFinite(x))
        return '—';
    const abs = Math.abs(x);
    if (abs === 0)
        return '0';
    if (abs >= 1e5 || abs < 1e-3)
        return x.toExponential(2);
    return parseFloat(x.toFixed(digits)).toString();
}
//# sourceMappingURL=dom.js.map