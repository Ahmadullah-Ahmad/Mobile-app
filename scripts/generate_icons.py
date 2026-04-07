"""
Generate all app icons for the Quran app.

Produces:
  assets/images/icon.png                     1024×1024  main icon
  assets/images/android-icon-foreground.png   512×512   adaptive icon foreground
  assets/images/android-icon-background.png   512×512   adaptive icon solid background
  assets/images/android-icon-monochrome.png   432×432   adaptive monochrome layer
  assets/images/splash-icon.png               512×512   splash screen logo
  assets/images/favicon.png                    48×48    web favicon

Usage:
  python3 scripts/generate_icons.py
"""

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

ROOT = Path(__file__).parent.parent
FONT_QURAN = str(ROOT / "assets/fonts/Amiri-Regular.ttf")
OUT = ROOT / "assets/images"

# Brand colors
GREEN_DARK  = (10,  60,  35)
GREEN_MID   = (18,  92,  50)
GOLD        = (212, 175,  55)
GOLD_DIM    = (170, 138,  40)
WHITE       = (255, 255, 255)


def load_font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_QURAN, size)


def arabic(text: str) -> str:
    """Reshape and apply bidi so PIL renders Arabic correctly."""
    return get_display(arabic_reshaper.reshape(text))


def centered_text(draw, cx, cy, text, font, color):
    shaped = arabic(text)
    bbox = draw.textbbox((0, 0), shaped, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((cx - w / 2 - bbox[0], cy - h / 2 - bbox[1]), shaped, font=font, fill=color)


def draw_star_outline(draw, cx, cy, r_out, r_in, points, color, width=2):
    """Draw a star as an outline only (no fill)."""
    pts = []
    for i in range(points * 2):
        angle = math.pi * i / points - math.pi / 2
        r = r_out if i % 2 == 0 else r_in
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(pts, outline=color, fill=None)


def render_icon(size: int, corner_radius: int = 0) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    s = size  # shorthand

    # ── Solid dark green background ──────────────────────────────────────────
    if corner_radius > 0:
        draw.rounded_rectangle([0, 0, s, s], radius=corner_radius, fill=GREEN_DARK)
    else:
        draw.rectangle([0, 0, s, s], fill=GREEN_DARK)

    # ── Subtle center glow (same green family, no beige) ────────────────────
    for i in range(int(s * 0.38), 0, -2):
        t = i / (s * 0.38)
        alpha = int(45 * (1 - t))
        r = int(GREEN_DARK[0] + (GREEN_MID[0] - GREEN_DARK[0]) * (1 - t))
        g = int(GREEN_DARK[1] + (GREEN_MID[1] - GREEN_DARK[1]) * (1 - t))
        b = int(GREEN_DARK[2] + (GREEN_MID[2] - GREEN_DARK[2]) * (1 - t))
        draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(r, g, b, alpha))

    # ── Outer thin gold circle ───────────────────────────────────────────────
    r1 = s * 0.445
    lw = max(1, s // 160)
    draw.ellipse([cx - r1, cy - r1, cx + r1, cy + r1],
                 outline=(*GOLD_DIM, 120), width=lw)

    # ── 8-point star (outline only, no fill) ────────────────────────────────
    draw_star_outline(draw, cx, cy,
                      r_out=s * 0.42, r_in=s * 0.375,
                      points=8, color=(*GOLD_DIM, 80), width=lw)

    # ── Inner gold circle ────────────────────────────────────────────────────
    r2 = s * 0.36
    lw2 = max(1, s // 100)
    draw.ellipse([cx - r2, cy - r2, cx + r2, cy + r2],
                 outline=(*GOLD, 200), width=lw2)

    # ── Small decorative second inner ring ───────────────────────────────────
    r3 = r2 - lw2 * 3
    draw.ellipse([cx - r3, cy - r3, cx + r3, cy + r3],
                 outline=(*GOLD_DIM, 80), width=lw)

    # ── Arabic text — القرآن ─────────────────────────────────────────────────
    font1_size = max(8, int(s * 0.195))
    font1 = load_font(font1_size)
    centered_text(draw, cx, int(cy - s * 0.055), "القرآن", font1, GOLD)

    # ── Arabic text — الكريم ─────────────────────────────────────────────────
    font2_size = max(6, int(s * 0.115))
    font2 = load_font(font2_size)
    centered_text(draw, cx, int(cy + s * 0.125), "الكريم", font2, (*GOLD_DIM, 220))

    # ── Gold dots at cardinal points ─────────────────────────────────────────
    dot_r = max(2, s // 90)
    dot_d = s * 0.435
    for deg in [0, 90, 180, 270]:
        rad = math.radians(deg)
        dx = cx + dot_d * math.cos(rad)
        dy = cy + dot_d * math.sin(rad)
        draw.ellipse([dx - dot_r, dy - dot_r, dx + dot_r, dy + dot_r],
                     fill=(*GOLD, 180))

    return img


def render_monochrome(size: int) -> Image.Image:
    """White-on-transparent icon for the Android adaptive monochrome layer."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    s = size
    lw = max(1, s // 100)

    draw.ellipse([cx - s*0.445, cy - s*0.445, cx + s*0.445, cy + s*0.445],
                 outline=(*WHITE, 140), width=lw)

    draw_star_outline(draw, cx, cy, r_out=s*0.42, r_in=s*0.375,
                      points=8, color=(*WHITE, 80), width=lw)

    draw.ellipse([cx - s*0.36, cy - s*0.36, cx + s*0.36, cy + s*0.36],
                 outline=(*WHITE, 220), width=max(1, s // 70))

    font1 = load_font(max(8, int(s * 0.195)))
    centered_text(draw, cx, int(cy - s*0.055), "القرآن", font1, WHITE)

    font2 = load_font(max(6, int(s * 0.115)))
    centered_text(draw, cx, int(cy + s*0.125), "الكريم", font2, (*WHITE, 200))

    dot_r = max(2, s // 90)
    for deg in [0, 90, 180, 270]:
        rad = math.radians(deg)
        dx = cx + s*0.435 * math.cos(rad)
        dy = cy + s*0.435 * math.sin(rad)
        draw.ellipse([dx-dot_r, dy-dot_r, dx+dot_r, dy+dot_r], fill=(*WHITE, 180))

    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    print("Generating icon.png (1024×1024)...")
    render_icon(1024, corner_radius=180).save(OUT / "icon.png")

    print("Generating android-icon-foreground.png (512×512)...")
    render_icon(512).save(OUT / "android-icon-foreground.png")

    print("Generating android-icon-background.png (512×512)...")
    bg = Image.new("RGBA", (512, 512), (*GREEN_DARK, 255))
    bg.save(OUT / "android-icon-background.png")

    print("Generating android-icon-monochrome.png (432×432)...")
    render_monochrome(432).save(OUT / "android-icon-monochrome.png")

    print("Generating splash-icon.png (512×512)...")
    render_icon(512, corner_radius=80).save(OUT / "splash-icon.png")

    print("Generating favicon.png (48×48)...")
    render_icon(512).resize((48, 48), Image.LANCZOS).save(OUT / "favicon.png")

    print("\nDone! All icons saved to assets/images/")


if __name__ == "__main__":
    main()
