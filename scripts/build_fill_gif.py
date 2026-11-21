"""Build a standalone animated GIF from captured browser frames."""

from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
frames = sorted((root / 'release' / 'animation-frames').glob('frame-*.png'))
if len(frames) < 10:
    raise RuntimeError(f'Expected at least 10 frames, found {len(frames)}')
images = [Image.open(frame).convert('RGB').quantize(colors=192) for frame in frames]
durations = [850, 900, 750] + [320] * 8 + [1100, 1100]
out = root / 'release' / 'icrebill_checkoutfill-点击生成自动填充演示.gif'
images[0].save(out, save_all=True, append_images=images[1:], duration=durations,
               loop=0, optimize=True, disposal=2)
with Image.open(out) as check:
    assert check.n_frames >= len(images) - 1  # Pillow merges identical final frames.
print(out)
