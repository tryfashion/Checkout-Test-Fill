"""Generate a clear checkout receipt icon at Chrome extension sizes."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1] / "icons"
SCALE = 8


def icon(size: int) -> Image.Image:
    s = SCALE
    image = Image.new("RGBA", (size * s, size * s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    def box(coords): return tuple(round(value * size * s / 128) for value in coords)
    def width(value): return max(1, round(value * size * s / 128))

    draw.rounded_rectangle(box((4, 4, 124, 124)), radius=width(25), fill="#145CCB")
    # Large receipt silhouette with a torn edge, readable at toolbar size.
    draw.polygon([box(point)[:2] for point in [(28, 20), (100, 20), (100, 107), (91, 101), (82, 107), (73, 101), (64, 107), (55, 101), (46, 107), (37, 101), (28, 107)]], fill="white")
    draw.rounded_rectangle(box((42, 36, 86, 43)), radius=width(3), fill="#145CCB")
    draw.rounded_rectangle(box((42, 52, 76, 58)), radius=width(3), fill="#7EA9EB")
    draw.line(box((43, 80, 56, 91, 83, 65)), fill="#087F61", width=width(9), joint="curve")
    return image.resize((size, size), Image.Resampling.LANCZOS)


for size in (16, 32, 48, 128):
    icon(size).save(ROOT / f"{size}.png")
