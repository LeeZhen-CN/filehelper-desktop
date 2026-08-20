"""生成 FileHelper 客户端图标 (1024x1024 PNG) — 中性蓝灰配色，无品牌关联"""
from PIL import Image, ImageDraw, ImageFilter

S = 1024
img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# 中性蓝灰渐变（不使用任何品牌色）
BG_TOP = (74, 103, 133, 255)     # #4A6785 石板蓝
BG_BOT = (52, 73, 98, 255)       # #344962 深石板蓝
WHITE = (255, 255, 255, 255)
ARROW_GRAY = (180, 200, 220, 255)


def draw_rounded_rect(canvas, box, radius, fill):
    w, h = box[2] - box[0], box[3] - box[1]
    scale = 4
    big = Image.new("RGBA", (w * scale, h * scale), (0, 0, 0, 0))
    bd = ImageDraw.Draw(big)
    bd.rounded_rectangle([0, 0, w * scale - 1, h * scale - 1], radius=radius * scale, fill=fill)
    big = big.resize((w, h), Image.LANCZOS)
    canvas.paste(big, (box[0], box[1]), big)


def make_gradient(size, c1, c2):
    """纵向渐变"""
    grad = Image.new("RGBA", (1, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    for i in range(size):
        t = i / (size - 1)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        a = int(c1[3] + (c2[3] - c1[3]) * t)
        gd.point((0, i), fill=(r, g, b, a))
    return grad.resize((size, size))


margin = 22
radius = 228

# 圆角底 + 渐变
grad = make_gradient(S, BG_TOP, BG_BOT)
mask = Image.new("L", (S, S), 0)
md = ImageDraw.Draw(mask)
md.rounded_rectangle([margin, margin, S - margin, S - margin], radius=radius, fill=255)
img.paste(grad, (0, 0), mask)

# 文档主体（白色，带折叠角）
doc_l, doc_t, doc_r, doc_b = 300, 250, 724, 780
fold = 80  # 折叠角大小

# 主文档矩形
d.rounded_rectangle([doc_l, doc_t + fold, doc_r, doc_b], radius=8, fill=WHITE)

# 顶部折叠区（左白右灰）
d.polygon([
    (doc_l, doc_t + fold),         # 左下
    (doc_l, doc_t),                # 左上
    (doc_r - fold, doc_t),         # 折叠起点
    (doc_r, doc_t + fold),         # 折叠终点
], fill=WHITE)

# 折叠角阴影
d.polygon([
    (doc_r - fold, doc_t),         # 折叠起点
    (doc_r, doc_t + fold),         # 折叠终点
    (doc_r - fold, doc_t + fold),  # 折叠内角
], fill=ARROW_GRAY)

# 文档内的横线（模拟文字行）
for y_off in [fold + 80, fold + 140, fold + 200]:
    y = doc_t + y_off
    d.rounded_rectangle([doc_l + 60, y, doc_r - 60, y + 14], radius=7, fill=(200, 215, 230, 255))

# 下载箭头（覆盖在文档下半部，表示文件传输）
arrow_cx = (doc_l + doc_r) // 2
arrow_top = doc_t + fold + 260
arrow_bot = doc_b - 50
shaft_w = 36

# 箭杆
d.rounded_rectangle(
    [arrow_cx - shaft_w // 2, arrow_top, arrow_cx + shaft_w // 2, arrow_bot - 50],
    radius=8,
    fill=BG_BOT,
)
# 箭头三角
d.polygon([
    (arrow_cx - 70, arrow_bot - 70),
    (arrow_cx + 70, arrow_bot - 70),
    (arrow_cx, arrow_bot),
], fill=BG_BOT)

img.save("/Users/lizhen/Desktop/workspaces/pj/wechat-filehelper/build/icon_1024.png")
print("icon saved")
