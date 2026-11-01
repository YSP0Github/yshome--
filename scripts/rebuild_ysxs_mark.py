# -*- coding: utf-8 -*-
"""从 YSXS/static/images/YSXS-deepblue-full.png 重建干净的透明 logo：
   1) 连通域去掉底部文字（不再用整幅宽度的矩形硬遮）
   2) 按图形真实边界裁剪 + 统一留白
   3) 追踪轮廓生成矢量 SVG
   4) 输出 512px 透明 PNG（favicon 用）

用法：python scripts/rebuild_ysxs_mark.py
"""
import os

import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import measure

HERE = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(HERE, '..', 'YSXS', 'static', 'images')

SRC = os.path.join(IMG_DIR, 'YSXS-deepblue-full.png')
OUT_PNG = os.path.join(IMG_DIR, 'YSXS-deepblue.png')
OUT_SVG = os.path.join(IMG_DIR, 'ysxs-mark.svg')

im = Image.open(SRC).convert('RGBA')
a = np.array(im)
H, W = a.shape[:2]

# ---- 1. 蓝色前景掩膜 ----
rgb = a[:, :, :3].astype(np.int16)
alpha = a[:, :, 3]
mask = (alpha > 128) & (rgb[:, :, 2] > 90) & (rgb[:, :, 2] > rgb[:, :, 0] + 40)
print('前景像素', int(mask.sum()))

# ---- 2. 去掉文字部件（bbox 顶边落在下方文字区） ----
lab, n = ndimage.label(mask)
objs = ndimage.find_objects(lab)
TEXT_TOP = 1150
keep = np.zeros(n + 1, dtype=bool)
removed = []
for i, sl in enumerate(objs, 1):
    ys, xs = sl
    if ys.start >= TEXT_TOP:
        removed.append((xs.start, xs.stop, ys.start, ys.stop))
    else:
        keep[i] = True
mask2 = keep[lab]
print('剔除文字部件', len(removed), '个:', removed)
for r in removed:
    print('   x %d..%d  y %d..%d' % r)

# ---- 3. 图形真实边界 ----
ys, xs = np.where(mask2)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
bw, bh = x1 - x0, y1 - y0
print('图形 bbox x %d..%d  y %d..%d  (%dx%d)' % (x0, x1, y0, y1, bw, bh))

side = int(round(max(bw, bh) * 1.12))          # 四周约 5.4% 留白
ox = (side - bw) // 2
oy = (side - bh) // 2
print('画布 %dx%d  偏移 (%d,%d)' % (side, side, ox, oy))

# ---- 4. 追踪轮廓 → SVG ----
# 在原图坐标系里追踪，再整体平移，避免重采样误差
sub = np.zeros((H + 2, W + 2), dtype=np.uint8)
sub[1:-1, 1:-1] = mask2.astype(np.uint8)

contours = measure.find_contours(sub, 0.5)
paths = []
total_pts = 0
for c in contours:
    if len(c) < 8:
        continue
    ap = measure.approximate_polygon(c, tolerance=2.5)
    # find_contours 返回 (row, col)；减去补边 1 再减裁剪偏移
    pts = [(p[1] - 1 - x0 + ox, p[0] - 1 - y0 + oy) for p in ap]
    if len(pts) < 3:
        continue
    total_pts += len(pts)
    d = 'M' + ' '.join('%.1f,%.1f' % p for p in pts) + 'Z'
    paths.append(d)
print('轮廓 %d 条，节点 %d 个' % (len(paths), total_pts))

svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" '
    'width="%d" height="%d" role="img" aria-label="云凇学术">\n'
    '  <path fill="#1D4ED8" fill-rule="evenodd" d="%s"/>\n'
    '</svg>\n'
) % (side, side, side, side, ' '.join(paths))
open(OUT_SVG, 'w', encoding='utf-8', newline='\n').write(svg)
print('写出', OUT_SVG)

# ---- 5. 位图：按图形边界裁剪 + 留白，再预乘缩放 ----
# 注意：必须用清理过文字后的 alpha，不能用原图裁
alpha_clean = (a[:, :, 3] * mask2).astype(np.uint8)
clean = Image.fromarray(np.dstack([a[:, :, 0], a[:, :, 1], a[:, :, 2], alpha_clean]), 'RGBA')
crop = clean.crop((x0, y0, x1, y1))
canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
canvas.paste(crop, (ox, oy), crop)

def save_png(size, path):
    # RGBa 预乘后再缩放，避免透明边缘发黑
    out = canvas.convert('RGBa').resize((size, size), Image.LANCZOS).convert('RGBA')
    out.save(path, optimize=True)
    print('写出', path, size)

save_png(512, OUT_PNG)
