#!/usr/bin/env python3
"""Generate iPhone/PWA icons: a tropical gradient square with a swap-arrows glyph."""
from PIL import Image, ImageDraw

TOP = (20, 184, 166)     # teal-500
BOT = (14, 165, 233)     # sky-500
WHITE = (255, 255, 255, 255)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make(size: int, path: str):
    # Supersample for smooth edges, then downscale.
    S = size * 4
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # Vertical gradient background (full-bleed, iOS rounds corners itself).
    for y in range(S):
        d.line([(0, y), (S, y)], fill=lerp(TOP, BOT, y / S))

    # Two rounded arrows forming a swap symbol (top->right, bottom->left).
    shaft_h = S * 0.085
    head = S * 0.16
    cx = S / 2
    gap = S * 0.085
    left = S * 0.27
    right = S * 0.73

    # Top arrow: shaft + right-pointing head
    ty = cx - gap - shaft_h / 2
    d.rounded_rectangle([left, ty, right - head * 0.4, ty + shaft_h],
                        radius=shaft_h / 2, fill=WHITE)
    d.polygon([(right - head, ty - head * 0.45),
               (right, ty + shaft_h / 2),
               (right - head, ty + shaft_h + head * 0.45)], fill=WHITE)

    # Bottom arrow: shaft + left-pointing head
    by = cx + gap - shaft_h / 2
    d.rounded_rectangle([left + head * 0.4, by, right, by + shaft_h],
                        radius=shaft_h / 2, fill=WHITE)
    d.polygon([(left + head, by - head * 0.45),
               (left, by + shaft_h / 2),
               (left + head, by + shaft_h + head * 0.45)], fill=WHITE)

    img = img.resize((size, size), Image.LANCZOS)
    # Flatten onto solid bg (no transparency) for apple-touch-icon friendliness.
    flat = Image.new("RGB", (size, size), BOT)
    flat.paste(img, (0, 0), img)
    flat.save(path)
    print("wrote", path)


if __name__ == "__main__":
    base = "/Users/florianlutz/Documents/Claude/code/currency-converter/icons/"
    make(512, base + "icon-512.png")
    make(192, base + "icon-192.png")
    make(180, base + "apple-touch-icon.png")
