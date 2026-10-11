#!/usr/bin/env python3
"""修复卡片中 `meaning: t( ... ]` 的括号笔误。

某些卡片在 meaning 块结束时误写成 `  ],`（本应为 `  ),`）。
判据：向上回溯，若越过若干行后遇到的第一个顶层字段之前出现了 `meaning: t(`，
就把该行改写为 `  ),`。
"""
import io
import os
import re
import sys

CARDS = os.path.join(os.path.dirname(__file__), '..', 'src', 'content', 'cards')
FIELD = re.compile(r'^\s{2}(symbols|conditions|derivation|viz|numerics|example|links|statement|tags|aliases)\s*:')


def fix(path):
    with io.open(path, encoding='utf-8') as f:
        lines = f.read().split('\n')
    out = []
    changed = False
    for line in lines:
        if line == '  ],':
            j = len(out) - 1
            found = False
            while j >= 0:
                ln = out[j]
                if FIELD.match(ln):
                    break
                if 'meaning: t(' in ln:
                    found = True
                    break
                j -= 1
            if found:
                out.append('  ),')
                changed = True
                continue
        out.append(line)
    if changed:
        with io.open(path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(out))
    return changed


def main():
    n = 0
    for name in sorted(os.listdir(CARDS)):
        if not name.endswith('.ts'):
            continue
        if fix(os.path.join(CARDS, name)):
            print('fixed', name)
            n += 1
    print('共修复', n, '个文件')


if __name__ == '__main__':
    sys.exit(main())
