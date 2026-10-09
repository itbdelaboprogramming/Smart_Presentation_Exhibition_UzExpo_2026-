# DEV TOOL — rebuilds files/Microhydro/map/basemap.geojson, the offline basemap of the local map
# (js/microhydroMap.js), from Natural Earth (public domain, https://www.naturalearthdata.com).
#
# 1. Download next to this script (from https://github.com/nvkelso/natural-earth-vector/tree/master/geojson):
#      ne_10m_admin_1_states_provinces.geojson   (Japan prefectures)
#      ne_10m_admin_0_countries.geojson          (neighbouring countries)
# 2. python tools/make_basemap.py files/Microhydro/map/basemap.geojson
#
# Japan prefectures + neighbouring countries clipped to the region, simplified (Douglas-Peucker) and rounded.
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
BBOX = (118.0, 22.0, 150.0, 47.0)  # lon/lat window kept for neighbours
NEIGHBOURS = {"KOR", "PRK", "CHN", "RUS", "TWN"}


def perp(p, a, b):
    (x, y), (x1, y1), (x2, y2) = p, a, b
    dx, dy = x2 - x1, y2 - y1
    if dx == dy == 0:
        return ((x - x1) ** 2 + (y - y1) ** 2) ** 0.5
    return abs(dy * x - dx * y + x2 * y1 - y2 * x1) / (dx * dx + dy * dy) ** 0.5


def simplify(pts, tol):
    if len(pts) < 4:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        s, e = stack.pop()
        dmax, idx = 0, None
        for i in range(s + 1, e):
            d = perp(pts[i], pts[s], pts[e])
            if d > dmax:
                dmax, idx = d, i
        if idx is not None and dmax > tol:
            keep[idx] = True
            stack += [(s, idx), (idx, e)]
    return [p for p, k in zip(pts, keep) if k]


def clip(ring, box):
    # Sutherland–Hodgman against an axis-aligned box
    x0, y0, x1, y1 = box
    edges = [
        (lambda p: p[0] >= x0, lambda a, b: (x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0]))),
        (lambda p: p[0] <= x1, lambda a, b: (x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0]))),
        (lambda p: p[1] >= y0, lambda a, b: (a[0] + (b[0] - a[0]) * (y0 - a[1]) / (b[1] - a[1]), y0)),
        (lambda p: p[1] <= y1, lambda a, b: (a[0] + (b[0] - a[0]) * (y1 - a[1]) / (b[1] - a[1]), y1)),
    ]
    out = ring
    for inside, cut in edges:
        if not out:
            break
        src, out = out, []
        for i, cur in enumerate(src):
            prev = src[i - 1]
            if inside(cur):
                if not inside(prev):
                    out.append(cut(prev, cur))
                out.append(cur)
            elif inside(prev):
                out.append(cut(prev, cur))
    return out


def polys(geom):
    return geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]


def process(geom, tol, box=None):
    result = []
    for poly in polys(geom):
        rings = []
        for ring in poly:
            r = [tuple(p[:2]) for p in ring]
            if box:
                r = clip(r, box)
            r = simplify(r, tol)
            if len(r) >= 4:
                if r[0] != r[-1]:
                    r.append(r[0])
                rings.append([[round(x, 3), round(y, 3)] for x, y in r])
        if rings:
            result.append(rings)
    return {"type": "MultiPolygon", "coordinates": result} if result else None


features = []
admin1 = json.load(open(os.path.join(HERE, "ne_10m_admin_1_states_provinces.geojson"), encoding="utf-8"))
for f in admin1["features"]:
    p = f["properties"]
    if p.get("adm0_a3") != "JPN":
        continue
    g = process(f["geometry"], 0.004)
    if g:
        features.append({"type": "Feature", "properties": {"kind": "prefecture", "name_en": p.get("name_en") or p.get("name"), "name_ja": p.get("name_ja") or ""}, "geometry": g})

admin0 = json.load(open(os.path.join(HERE, "ne_10m_admin_0_countries.geojson"), encoding="utf-8"))
for f in admin0["features"]:
    p = f["properties"]
    if p.get("ADM0_A3") not in NEIGHBOURS:
        continue
    g = process(f["geometry"], 0.02, BBOX)
    if g:
        features.append({"type": "Feature", "properties": {"kind": "country", "name_en": p.get("NAME_EN"), "name_ja": p.get("NAME_JA") or ""}, "geometry": g})

json.dump({"type": "FeatureCollection", "features": features, "attribution": "Natural Earth (public domain)"}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(features), "features", os.path.getsize(OUT) // 1024, "KB")
