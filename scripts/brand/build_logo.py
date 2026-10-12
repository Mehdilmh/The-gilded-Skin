"""
Build The Gilded Skin vector logo set.

Outlines the wordmark from Cormorant Garamond (SIL Open Font License, via
@fontsource-variable) into SVG paths so the logo never depends on installed
fonts, then composes it with the botanical star mark.

Requires: pip install fonttools brotli
Run:      python3 scripts/brand/build_logo.py
"""
import io
import math
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[2]
FONT = ROOT / "node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2"
OUT = ROOT / "public/brand"
APP = ROOT / "src/app"

GOLD_LIGHT = "#D9C59C"
GOLD = "#B7975B"
GOLD_DEEP = "#8F7240"
ESPRESSO = "#342C25"
IVORY = "#F8F4EC"


def load_font(weight=560):
    font = TTFont(FONT)
    return instantiateVariableFont(font, {"wght": weight})


def text_path(font, text, size, tracking_em):
    """Return (svg path d, width, cap height) for text set at `size` px."""
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    upm = font["head"].unitsPerEm
    scale = size / upm
    hmtx = font["hmtx"]
    cap = font["OS/2"].sCapHeight * scale
    x = 0.0
    parts = []
    tracking = tracking_em * size
    for i, ch in enumerate(text):
        if ch == " ":
            x += hmtx[cmap[ord(" ")]][0] * scale * 0.55
            continue
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyph_set, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
        # Flip Y (font units are y-up) and place on baseline at y=cap.
        tpen = TransformPen(pen, (scale, 0, 0, -scale, x, cap))
        glyph_set[name].draw(tpen)
        parts.append(pen.getCommands())
        x += hmtx[name][0] * scale
        if i < len(text) - 1:
            x += tracking
    return " ".join(parts), x, cap


def star_mark(cx, cy, r, fill, accent=None):
    """Eight-petal botanical star: four long petals, four short diagonal leaves."""

    def petal(length, width, angle):
        a = math.radians(angle)
        # Petal along -Y, then rotate.
        pts = [(0, -length), (width, -length * 0.55), (width * 0.45, -length * 0.12), (0, 0),
               (-width * 0.45, -length * 0.12), (-width, -length * 0.55)]

        def rot(p):
            x, y = p
            return (cx + x * math.cos(a) - y * math.sin(a), cy + x * math.sin(a) + y * math.cos(a))

        tip, c1, c2, base, c3, c4 = [rot(p) for p in pts]
        f = lambda p: f"{p[0]:.2f} {p[1]:.2f}"
        return f"M{f(tip)} C{f(c1)} {f(c2)} {f(base)} C{f(c3)} {f(c4)} {f(tip)}Z"

    long_petals = " ".join(petal(r, r * 0.2, a) for a in (0, 90, 180, 270))
    short_petals = " ".join(petal(r * 0.58, r * 0.16, a) for a in (45, 135, 225, 315))
    second = accent or fill
    return (
        f'<path d="{long_petals}" fill="{fill}"/>'
        f'<path d="{short_petals}" fill="{second}" opacity="0.85"/>'
        f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r * 0.075:.2f}" fill="{IVORY if accent else fill}"/>'
    )


GRADIENT = f"""<defs><linearGradient id="gs-gold" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="{GOLD_LIGHT}"/><stop offset="0.55" stop-color="{GOLD}"/><stop offset="1" stop-color="{GOLD_DEEP}"/>
</linearGradient></defs>"""


def svg(width, height, body, title, defs=True):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.0f} {height:.0f}" '
        f'width="{width:.0f}" height="{height:.0f}" role="img" aria-labelledby="t">'
        f"<title id=\"t\">{title}</title>{GRADIENT if defs else ''}{body}</svg>\n"
    )


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    font = load_font()

    word_d, word_w, cap = text_path(font, "THE GILDED SKIN", 48, 0.16)
    small_d, small_w, small_cap = text_path(font, "BEAUTY  EDITORIAL", 13, 0.42)

    # --- Mark only -------------------------------------------------------
    mark = star_mark(50, 50, 46, "url(#gs-gold)")
    (OUT / "logo-mark.svg").write_text(svg(100, 100, mark, "The Gilded Skin"))
    (OUT / "logo-mark-mono.svg").write_text(svg(100, 100, star_mark(50, 50, 46, ESPRESSO), "The Gilded Skin", defs=False))

    # --- Horizontal lockup -------------------------------------------------
    pad, gap, mark_size = 6, 22, 64
    h = 76
    word_y = (h - cap) / 2
    body = star_mark(pad + mark_size / 2, h / 2, mark_size / 2, "url(#gs-gold)")
    x_word = pad + mark_size + gap
    body += f'<path transform="translate({x_word:.2f} {word_y:.2f})" d="{word_d}" fill="{ESPRESSO}"/>'
    width = x_word + word_w + pad
    (OUT / "logo.svg").write_text(svg(width, h, body, "The Gilded Skin"))

    for name, color in (("logo-mono-dark.svg", ESPRESSO), ("logo-mono-light.svg", IVORY)):
        mono = star_mark(pad + mark_size / 2, h / 2, mark_size / 2, color)
        mono += f'<path transform="translate({x_word:.2f} {word_y:.2f})" d="{word_d}" fill="{color}"/>'
        (OUT / name).write_text(svg(width, h, mono, "The Gilded Skin", defs=False))

    # --- Stacked lockup (social, pins) -------------------------------------
    sw = max(word_w, small_w) + 80
    mark_r = 70
    sh = 40 + mark_r * 2 + 44 + cap + 26 + small_cap + 40
    body = star_mark(sw / 2, 40 + mark_r, mark_r, "url(#gs-gold)")
    y = 40 + mark_r * 2 + 44
    body += f'<path transform="translate({(sw - word_w) / 2:.2f} {y:.2f})" d="{word_d}" fill="{ESPRESSO}"/>'
    y += cap + 26
    body += f'<path transform="translate({(sw - small_w) / 2:.2f} {y:.2f})" d="{small_d}" fill="{GOLD_DEEP}"/>'
    (OUT / "logo-stacked.svg").write_text(svg(sw, sh, body, "The Gilded Skin"))

    # --- Favicon / app icon: mark on ivory with rounded square ------------
    fav = f'<rect width="64" height="64" rx="14" fill="{ESPRESSO}"/>' + star_mark(32, 32, 25, "url(#gs-gold)")
    (APP / "icon.svg").write_text(svg(64, 64, fav, "The Gilded Skin"))
    (OUT / "favicon.svg").write_text(svg(64, 64, fav, "The Gilded Skin"))

    # --- Social avatar (square) ----------------------------------------------
    avatar = f'<rect width="1000" height="1000" fill="{IVORY}"/>'
    avatar += f'<circle cx="500" cy="500" r="430" fill="none" stroke="{GOLD}" stroke-width="3"/>'
    avatar += star_mark(500, 400, 170, "url(#gs-gold)")
    scale = 640 / word_w
    avatar += (
        f'<path transform="translate({(1000 - word_w * scale) / 2:.2f} 650) scale({scale:.4f})" '
        f'd="{word_d}" fill="{ESPRESSO}"/>'
    )
    (OUT / "social-avatar.svg").write_text(svg(1000, 1000, avatar, "The Gilded Skin"))

    print(f"wordmark {word_w:.1f}px wide, cap height {cap:.1f}px -> {OUT}")


if __name__ == "__main__":
    main()
