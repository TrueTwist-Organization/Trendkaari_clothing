#!/usr/bin/env python3
"""Generate circle-ready category cutouts → public/category-cutouts/*.png"""
import io
import os
from pathlib import Path

os.environ.setdefault("NUMBA_DISABLE_JIT", "1")

import numpy as np  # noqa: E402
from PIL import Image  # noqa: E402
from rembg import remove  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/category-cutouts"
CANVAS_W = 400
CANVAS_H = 540

# (id, source path, focus: upper | lower)
JOBS = [
    ("women-kurtas", "public/kurtas/Kurtas/9/DishaParmarVaidya_2_700x.webp", "upper"),
    ("women-suit-sets", "public/suit-sets/Suit Sets/2/0T3A4320_035a159c-78ec-4f4c-87a2-8f86a58473bc_700x.webp", "upper"),
    ("women-sarees", "public/sarees/Sarees/1/0T3A5495_700x.webp", "upper"),
    ("women-lehengas", "public/lehengas/Lehengas/1/040A3523_700x.webp", "upper"),
    (
        "women-dupatta-sets",
        "public/dupatta-sets/6/yellow_peplum_skirt_dupatta_set_1_295fa5d7-8dae-48db-8b9f-8da4c168d45f_700x.webp",
        "upper",
    ),
    ("women-tops", "public/tops/1/1.webp", "upper"),
    ("women-dresses", "public/dresses/ws/dress/1/shopping.webp", "upper"),
    ("women-co-ords", "public/co-ords/co-ord_set/1/1.webp", "upper"),
    ("women-t-shirts", "public/t-shirts/t-shirt/1/1.webp", "upper"),
    ("women-bottoms", "public/bottoms/bottom_wear/1/1.webp", "lower"),
    ("gents-kurtas", "public/mens/kurtas/kurta/4/xxl-dmm-daswani-exports-original-imahmgj4r2evzddc.webp", "upper"),
    ("gents-jackets", "public/mens/jackets/jacketmen/j7/RFJ1096_2.webp", "upper"),
    ("gents-hoodies", "public/mens/hoodies/Hoodiesmen/h10/1.webp", "upper"),
    ("gents-blazers", "public/mens/blazers/Blezermen/b10/1.webp", "upper"),
    ("gents-co-ords", "public/mens/coords/co-ordset men/co5/3.webp", "upper"),
    ("gents-shirts", "public/mens/shirts/shirt/shirt 9/xxl-ps-37-s-stenfia-original-imahkd8atwr2fqgm.webp", "upper"),
    (
        "gents-t-shirts",
        "public/mens/tshirts/t-shirt/2/10-11-years-hr-polo-tshirt-red-82-1p-fast-cry-original-imahguhuczyesyh6.webp",
        "upper",
    ),
    (
        "gents-trackpants",
        "public/mens/trackpants/TRackpents/T1/s-dd19-l-grey-01-mack-jonney-original-imahkvyfr8ajtawh.webp",
        "lower",
    ),
    ("gents-pants", "public/mens/pants/Pants/2/34-el-p-cot-el-cielo-original-imahed6dbxfeyqvb.webp", "lower"),
    ("gents-jeans", "public/mens/jeans/jeans/6/30-jeanlscargo-mgrey-01-urbano-fashion-original-imahhwp4gydryjds.webp", "lower"),
]


def _subject_bbox(alpha):
    ys, xs = np.where(alpha > 12)
    if len(ys) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def _crop_box(x0: int, y0: int, x1: int, y1: int, focus: str) -> tuple[int, int, int, int]:
    bw = x1 - x0 + 1
    bh = y1 - y0 + 1
    aspect = bh / max(bw, 1)

    if focus == "lower":
        top = y0 + int(bh * 0.18)
        bottom = y1
    elif aspect > 1.55:
        # Full-length — waist-up (reference pop-out)
        top = y0
        bottom = y0 + int(bh * 0.52)
    elif aspect > 1.2:
        top = y0
        bottom = y0 + int(bh * 0.64)
    else:
        top = y0
        bottom = y1

    side_pad = int(bw * 0.04)
    left = max(0, x0 - side_pad)
    right = x1 + side_pad
    return left, top, right, bottom


def normalize_for_circle(png_bytes: bytes, focus: str = "upper") -> bytes:
    img = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    alpha = np.array(img)[:, :, 3]
    bbox = _subject_bbox(alpha)
    if bbox is None:
        return png_bytes

    crop_box = _crop_box(*bbox, focus)
    subject = img.crop(crop_box)
    sw, sh = subject.size
    if sw < 1 or sh < 1:
        return png_bytes

    # Uniform width for pop-out (head above circle, feet at bottom)
    target_w = int(CANVAS_W * 0.94)
    scale = target_w / sw
    nw = max(1, int(sw * scale))
    nh = max(1, int(sh * scale))
    subject = subject.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    px = (CANVAS_W - nw) // 2
    py = CANVAS_H - nh - 6
    py = max(4, min(py, CANVAS_H - nh - 4))
    canvas.paste(subject, (px, py), subject)

    out = io.BytesIO()
    canvas.save(out, format="PNG", optimize=True)
    return out.getvalue()


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, rel, focus in JOBS:
        inp = ROOT / rel
        if not inp.exists():
            print(f"skip {name}: missing {rel}")
            continue
        raw = remove(inp.read_bytes())
        normalized = normalize_for_circle(raw, focus)
        out_path = OUT / f"{name}.png"
        out_path.write_bytes(normalized)
        print(f"ok {name} ({focus}) → {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
