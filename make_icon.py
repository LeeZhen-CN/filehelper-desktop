"""生成微信传输助手客户端图标 (1024x1024 PNG)"""
from PIL import Image, ImageDraw

S = 1024
img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

GREEN = (7, 193, 96, 255)        # 微信绿 #07C160
WHITE = (255, 255, 255, 255)

def draw_rounded_rect(canvas, box, radius, fill):
    # 使用全透明遮罩绘制抗锯齿圆角矩形
    w, h = box[2] - box[0], box[3] - box[1]
    scale = 4
    big = Image.new("RGBA", (w * scale, h * scale), (0, 0, 0, 0))
    bd = ImageDraw.Draw(big)
    bd.rounded_rectangle([0, 0, w * scale - 1, h * scale - 1], radius=radius * scale, fill=fill)
    big = big.resize((w, h), Image.LANCZOS)
    canvas.paste(big, (box[0], box[1]), big)

# 圆角方形底
margin = 22
radius = 228
draw_rounded_rect(img, (margin, margin, S - margin, S - margin), radius, GREEN)

# 纸飞机投影（稍深、稍偏下，增加立体感）
SHADOW = (5, 160, 78, 180)
shadow_plane = [
    (310, 550),
    (830, 290),
    (730, 810),
    (560, 670),
]
d.polygon(shadow_plane, fill=SHADOW)

# 纸飞机主体（白色）
plane = [
    (290, 520),   # 左尖
    (810, 260),   # 上尖（机头）
    (710, 780),   # 下折点
    (540, 640),   # 折痕点
]
d.polygon(plane, fill=WHITE)

# 机翼折痕阴影（浅绿）
d.polygon([(540, 640), (710, 780), (580, 700)], fill=(210, 245, 225, 255))

# 传输轨迹线（三个渐隐小点）
for i, r in enumerate((24, 17, 11)):
    alpha = 230 - i * 60
    x = 230 + i * 72
    y = 690 + i * 8
    d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, alpha))

img.save("/Users/lizhen/WorkBuddy/2026-08-20-08-58-45/wechat-filehelper/build/icon_1024.png")
print("icon saved")
