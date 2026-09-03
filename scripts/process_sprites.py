#!/usr/bin/env python3
"""Chroma-key magenta Imagine outputs into 64x64 transparent PNGs."""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SESSION = Path(os.environ.get("PICNIC_RAW", ROOT / "raw"))
ENEMIES = ROOT / "public/sprites/enemies"
VFX = ROOT / "public/sprites/vfx"
BG = ROOT / "public/bg"

# source jpg -> (dest, cell)
SPRITES: list[tuple[str, Path, int]] = [
    ("2.jpg", ENEMIES / "ant_column.png", 64),
    ("13.jpg", ENEMIES / "wasp.png", 64),
    ("7.jpg", ENEMIES / "basket_mimic.png", 64),
    ("5.jpg", ENEMIES / "raven.png", 64),
    ("6.jpg", ENEMIES / "bear.png", 64),
    ("8.jpg", ENEMIES / "goblin_thief.png", 64),
    ("9.jpg", ENEMIES / "storm_sprite.png", 64),
    ("10.jpg", ENEMIES / "sandwich_slime.png", 64),
    ("1.jpg", VFX / "bolt01.png", 48),
    ("12.jpg", VFX / "bolt02.png", 48),
]


def is_magenta(r: int, g: int, b: int) -> bool:
    return r > 150 and b > 150 and g < 170 and (r + b) / 2 - g > 35


def chroma_key(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_magenta(r, g, b):
                px[x, y] = (0, 0, 0, 0)
            else:
                # despill leftover magenta fringe
                if r > 140 and b > 140 and g < 200:
                    g2 = min(255, g + 40)
                    px[x, y] = (min(r, g2 + 20), g2, min(b, g2 + 20), a)
    return rgba


def trim(im: Image.Image) -> Image.Image:
    bbox = im.split()[-1].point(lambda a: 255 if a > 12 else 0).getbbox()
    if not bbox:
        return im
    pad = 8
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def fit_cell(im: Image.Image, cell: int) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    scale = (cell - 4) / max(w, h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = im.resize((nw, nh), Image.Resampling.NEAREST)
    out = Image.new("RGBA", (cell, cell), (0, 0, 0, 0))
    out.paste(resized, ((cell - nw) // 2, (cell - nh) // 2), resized)
    return out


def main() -> None:
    ENEMIES.mkdir(parents=True, exist_ok=True)
    VFX.mkdir(parents=True, exist_ok=True)
    BG.mkdir(parents=True, exist_ok=True)

    picnic = Image.open(SESSION / "3.jpg").convert("RGB")
    picnic.save(BG / "picnic.png", "PNG")

    for name, dest, cell in SPRITES:
        src = SESSION / name
        if not src.exists():
            print("missing", src)
            continue
        keyed = chroma_key(Image.open(src))
        fitted = fit_cell(trim(keyed), cell)
        dest.parent.mkdir(parents=True, exist_ok=True)
        fitted.save(dest, "PNG")
        print(dest.relative_to(ROOT), fitted.size)


if __name__ == "__main__":
    main()
