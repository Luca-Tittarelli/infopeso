"""Genera los SVG del logo Pulso (Infopeso) con contornos reales de Bricolage Grotesque 800."""
import sys, os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import uharfbuzz as hb

SRC = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(OUT, exist_ok=True)

font = TTFont(SRC)
inst = instantiateVariableFont(font, {"wght": 800, "opsz": 96, "wdth": 100}, inplace=False)
tmp = os.path.join(OUT, "_inst.ttf")
inst.save(tmp)
inst = TTFont(tmp)
gs = inst.getGlyphSet()
upem = inst["head"].unitsPerEm
cmap = inst.getBestCmap()

blob = hb.Blob.from_file_path(tmp)
face = hb.Face(blob)
hbfont = hb.Font(face)

TRACK = -0.012 * upem  # tracking del logotipo


def shape(text):
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True, "liga": False})
    names = [inst.getGlyphName(i.codepoint) for i in buf.glyph_infos]
    advs = [p.x_advance for p in buf.glyph_positions]
    return names, advs


def glyph_path(name, x):
    pen = SVGPathPen(gs)
    # y invertida: SVG crece hacia abajo; baseline en y=0
    tp = TransformPen(pen, (1, 0, 0, -1, x, 0))
    gs[name].draw(tp)
    return pen.getCommands()


def glyph_bounds(name):
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    return bp.bounds


os2 = inst["OS/2"]
xh = os2.sxHeight
cap = os2.sCapHeight

# --- Logotipo: "ı" + "nfopeso"
names, advs = shape("ınfopeso")
x = 0
paths = []
i_bounds = None
for n, a in zip(names, advs):
    paths.append(glyph_path(n, x))
    if i_bounds is None:
        b = glyph_bounds(n)
        i_bounds = (b[0] + x, b[1], b[2] + x, b[3])
    x += a + TRACK
word_w = x - TRACK

# Triángulo (punto de la i): ancho = 1.3 × asta; alto = 0.866 × ancho; separación = 0.14 × x-height
stem_w = i_bounds[2] - i_bounds[0]
stem_cx = (i_bounds[0] + i_bounds[2]) / 2
tri_w = stem_w * 1.3
tri_h = tri_w * 0.866
gap = xh * 0.14
tri_base_y = -(xh + gap)
tri_top_y = tri_base_y - tri_h
tri = f"M{stem_cx - tri_w/2:.1f} {tri_base_y:.1f} L{stem_cx + tri_w/2:.1f} {tri_base_y:.1f} L{stem_cx:.1f} {tri_top_y:.1f} Z"

# Caja: desde el tope del triángulo hasta la línea base (sin descendentes en "infopeso" salvo la p)
desc = min(glyph_bounds(n)[1] for n in names)
top = tri_top_y
bottom = -desc
pad = 0
vb_x = min(i_bounds[0], 0)
vb = (vb_x, top, word_w - vb_x, bottom - top)

word_d = " ".join(paths)


def svg(vb, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]:.0f} {vb[1]:.0f} {vb[2]:.0f} {vb[3]:.0f}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')


def logotipo(text_color, tri_color, title):
    return svg(vb, f'<path d="{word_d}" fill="{text_color}"/><path d="{tri}" fill="{tri_color}"/>', title)


CREMA, TINTA, NARANJA, NARANJA_OSC = "#F1ECE4", "#141210", "#FF6A33", "#D9461A"

files = {
    "logo-principal-sobre-oscuro.svg": logotipo(CREMA, NARANJA, "Infopeso"),
    "logo-principal-sobre-claro.svg": logotipo(TINTA, NARANJA_OSC, "Infopeso"),
    "logo-mono-tinta.svg": logotipo(TINTA, TINTA, "Infopeso"),
    "logo-mono-crema.svg": logotipo(CREMA, CREMA, "Infopeso"),
    "logo-sobre-naranja.svg": logotipo(TINTA, TINTA, "Infopeso"),
}

# --- Símbolo "i" (ı + ▲)
i_name = names[0]
i_d = glyph_path(i_name, 0)
ib = glyph_bounds(i_name)
s_cx = (ib[0] + ib[2]) / 2
s_tri = f"M{s_cx - tri_w/2:.1f} {tri_base_y:.1f} L{s_cx + tri_w/2:.1f} {tri_base_y:.1f} L{s_cx:.1f} {tri_top_y:.1f} Z"
s_left = min(ib[0], s_cx - tri_w / 2)
s_right = max(ib[2], s_cx + tri_w / 2)
s_vb = (s_left, tri_top_y, s_right - s_left, -tri_top_y)


def simbolo(c_i, c_t, title):
    return svg(s_vb, f'<path d="{i_d}" fill="{c_i}"/><path d="{s_tri}" fill="{c_t}"/>', title)


files["simbolo-i-sobre-oscuro.svg"] = simbolo(CREMA, NARANJA, "Infopeso símbolo")
files["simbolo-i-sobre-claro.svg"] = simbolo(TINTA, NARANJA_OSC, "Infopeso símbolo")

# --- Isotipo ▲ solo
files["isotipo-triangulo.svg"] = svg((0, 0, 100, 86.6), f'<path d="M0 86.6 L100 86.6 L50 0 Z" fill="{NARANJA}"/>', "Infopeso isotipo")

# --- Ícono de app: cuadrado naranja con el símbolo i en tinta
S = 1024
sym_h = -tri_top_y
scale = (S * 0.62) / sym_h
sw = (s_right - s_left) * scale
tx = (S - sw) / 2 - s_left * scale
ty = (S + sym_h * scale) / 2
icon_body = (f'<rect width="{S}" height="{S}" rx="{S*0.225:.0f}" fill="{NARANJA}"/>'
             f'<g transform="translate({tx:.1f} {ty:.1f}) scale({scale:.4f})">'
             f'<path d="{i_d}" fill="{TINTA}"/><path d="{s_tri}" fill="{TINTA}"/></g>')
files["icono-app.svg"] = svg((0, 0, S, S), icon_body, "Infopeso ícono de app")
# favicon: fondo tinta, símbolo crema + triángulo naranja
fav_body = (f'<rect width="{S}" height="{S}" rx="{S*0.18:.0f}" fill="{TINTA}"/>'
            f'<g transform="translate({tx:.1f} {ty:.1f}) scale({scale:.4f})">'
            f'<path d="{i_d}" fill="{CREMA}"/><path d="{s_tri}" fill="{NARANJA}"/></g>')
files["favicon.svg"] = svg((0, 0, S, S), fav_body, "Infopeso favicon")

for fn, content in files.items():
    with open(os.path.join(OUT, fn), "w", encoding="utf-8") as f:
        f.write(content)
os.remove(tmp)

print("upem", upem, "xh", xh, "stem", round(stem_w), "tri_w", round(tri_w), "word_w", round(word_w))
print("logo viewBox", [round(v) for v in vb], "aspect", round(vb[2] / vb[3], 3))
print("simbolo viewBox", [round(v) for v in s_vb])
print("\n".join(sorted(files)))
