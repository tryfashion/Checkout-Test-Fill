"""Build identical minified ZIPs for Chrome Web Store and offline testing."""

import json
import shutil
import subprocess
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
version = manifest["version"]
terser = root / "node_modules" / ".bin" / "terser.cmd"
if not terser.is_file():
    raise FileNotFoundError(terser)
files = [
    "manifest.json",
    "i18n.js",
    "content.js",
    "frame-card.js",
    "background.js",
    "popup.html",
    "popup.css",
    "popup.js",
    "privacy.html",
    "privacy.js",
    "data/addresses.js",
    "data/names.js",
    "icons/16.png",
    "icons/32.png",
    "icons/48.png",
    "icons/128.png",
    "_locales/en/messages.json",
    "_locales/zh_CN/messages.json",
    "_locales/zh_TW/messages.json",
]
out = root / "release" / f"checkout-test-autofill-store-v{version}.zip"
offline = root / "release" / f"checkout-test-autofill-offline-v{version}.zip"
out.parent.mkdir(exist_ok=True)
source_js = output_js = 0
with ZipFile(out, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
    for name in files:
        path = root / name
        if not path.is_file():
            raise FileNotFoundError(path)
        if path.suffix == ".js":
            result = subprocess.run(
                [str(terser), str(path), "--compress", "--mangle", "--format", "comments=false"],
                check=True, capture_output=True, timeout=120,
            )
            archive.writestr(name, result.stdout)
            source_js += path.stat().st_size
            output_js += len(result.stdout)
        else:
            archive.write(path, name)
shutil.copyfile(out, offline)
print(f"JavaScript: {source_js:,} -> {output_js:,} bytes ({output_js / source_js:.1%})")
print(out)
print(offline)
