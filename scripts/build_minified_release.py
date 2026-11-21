"""Create minified trial ZIP and signed CRX without changing source files."""

import json
import shutil
import struct
import subprocess
import tempfile
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


root = Path(__file__).resolve().parents[1]
version = json.loads((root / "manifest.json").read_text(encoding="utf-8"))["version"]
release = root / "release"
key = root.parent / "cktestfill-private" / "checkout-test-fill.pem"
chrome = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
terser = root / "node_modules" / ".bin" / "terser.cmd"
for tool in (chrome, terser):
    if not tool.is_file():
        raise FileNotFoundError(tool)

files = [
    "manifest.json", "i18n.js", "content.js", "frame-card.js", "background.js",
    "popup.html", "popup.css", "popup.js", "privacy.html", "privacy.js",
    "data/addresses.js", "data/names.js", "icons/16.png", "icons/32.png",
    "icons/48.png", "icons/128.png", "_locales/en/messages.json",
    "_locales/zh_CN/messages.json", "_locales/zh_TW/messages.json",
]

with tempfile.TemporaryDirectory(prefix="checkout-min-") as temp_name:
    temporary = Path(temp_name)
    staged = temporary / f"Checkout-Test-Fill-v{version}"
    staged.mkdir()
    original_js = minified_js = 0
    for name in files:
        source = root / name
        target = staged / name
        target.parent.mkdir(parents=True, exist_ok=True)
        if source.suffix == ".js":
            subprocess.run(
                [str(terser), str(source), "--compress", "--mangle",
                 "--format", "comments=false", "--output", str(target)],
                check=True, timeout=60,
            )
            original_js += source.stat().st_size
            minified_js += target.stat().st_size
        else:
            shutil.copy2(source, target)

    release.mkdir(exist_ok=True)
    trial = release / f"checkout-test-fill-trial-v{version}-min.zip"
    with ZipFile(trial, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name in files:
            archive.write(staged / name, f"{staged.name}/{name}")
        archive.write(release / f"INSTALL-v{version}.txt", "安装说明.txt")

    command = [str(chrome), "--disable-crash-reporter", "--no-first-run",
               f"--user-data-dir={temporary / 'chrome-profile'}",
               f"--pack-extension={staged}"]
    if key.exists():
        command.append(f"--pack-extension-key={key}")
    result = subprocess.run(command, timeout=60, capture_output=True)
    if result.returncode:
        message = result.stderr.decode("utf-8", errors="replace")
        raise RuntimeError(f"Chrome packing failed ({result.returncode}): {message[-1500:]}")
    packed = Path(f"{staged}.crx")
    if not packed.is_file():
        message = (result.stdout + result.stderr).decode("utf-8", errors="replace")
        raise RuntimeError(f"Chrome did not create a CRX file: {message[-1500:]}")
    crx = release / f"checkout-test-fill-v{version}-min.crx"
    shutil.copy2(packed, crx)
    new_key = Path(f"{staged}.pem")
    if new_key.exists():
        key.parent.mkdir(exist_ok=True)
        shutil.move(new_key, key)

    header = crx.read_bytes()[:12]
    if header[:4] != b"Cr24" or struct.unpack_from("<I", header, 4)[0] != 3:
        raise RuntimeError("Chrome did not create a CRX3 package")
    print(f"JS: {original_js:,} -> {minified_js:,} bytes ({minified_js / original_js:.1%})")
    print(trial)
    print(crx)
    print(f"Private signing key: {key}")
