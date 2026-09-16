import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Offset

FONT = Path("node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2")
CUTS = [
    ("SS", Path("public/favicon.svg"), 0.16, 40),
]

BACKGROUND = "#17110d"
ACCENT = "#f0a93b"
FOREGROUND = "#f9f6f0"

WEIGHT = 700
CANVAS = 64

def main() -> int:
    if not FONT.exists():
        print(f"Font not found: {FONT}", file=sys.stderr)
        return 1

    font = TTFont(FONT)
    font = instancer.instantiateVariableFont(font, {"wght": WEIGHT})

    upem = font["head"].unitsPerEm
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()

    def outline(char):
        pen = SVGPathPen(glyphs)
        name = cmap[ord(char)]
        glyphs[name].draw(pen)
        return pen.getCommands(), glyphs[name].width

    for chars, out, margin, tracking in CUTS:
        parts = [outline(c) for c in chars]
        advance = parts[0][1] - tracking

        bounds = BoundsPen(glyphs)
        for i, char in enumerate(chars):
            pen = TransformPen(bounds, Offset(i * advance, 0))
            glyphs[cmap[ord(char)]].draw(pen)
        x_min, y_min, x_max, y_max = bounds.bounds
        ink_w, ink_h = x_max - x_min, y_max - y_min

        box = CANVAS * (1 - 2 * margin)
        scale = box / max(ink_w, ink_h)
        x0 = (CANVAS - ink_w * scale) / 2 - x_min * scale
        baseline = (CANVAS + ink_h * scale) / 2 + y_min * scale

        body = []
        for i, (commands, _) in enumerate(parts):
            colour = ACCENT if i in (0, len(parts) - 1) else FOREGROUND
            tx = x0 + i * advance * scale
            body.append(
                f'  <g transform="translate({tx:.3f} {baseline:.3f}) scale({scale:.6f} {-scale:.6f})">\n'
                f'    <path fill="{colour}" d="{commands}"/>\n'
                f"  </g>"
            )

        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS} {CANVAS}" '
            f'width="{CANVAS}" height="{CANVAS}" role="img" aria-label="Sharvin Shah">\n'
            f'  <rect width="{CANVAS}" height="{CANVAS}" fill="{BACKGROUND}"/>\n'
            + "\n".join(body)
            + "\n</svg>\n"
        )
        out.write_text(svg)
        print(f"Wrote {out}  {chars}  ink {ink_w:.0f}x{ink_h:.0f}  margin {margin:.0%}")

    print(f"upem {upem}, wght {WEIGHT}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
