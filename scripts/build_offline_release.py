"""Build an obfuscated offline trial ZIP and CRX; never submit these to the store."""

import json
import shutil
import struct
import subprocess
import tempfile
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


root = Path(__file__).resolve().parents[1]
version = json.loads((root / "manifest.json").read_text(encoding="utf-8"))["version"]
brand = "icrebill_checkoutfill"
release = root / "release"
key = root.parent / "cktestfill-private" / "checkout-test-fill.pem"
chrome = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
terser = root / "node_modules" / ".bin" / "terser.cmd"
for tool in (chrome, terser, root / "node_modules" / "javascript-obfuscator"):
    if not tool.exists():
        raise FileNotFoundError(tool)

files = [
    "manifest.json", "i18n.js", "content.js", "frame-card.js", "background.js",
    "popup.html", "popup.css", "popup.js", "privacy.html", "privacy.js",
    "data/addresses.js", "data/names.js", "icons/16.png", "icons/32.png",
    "icons/48.png", "icons/128.png", "_locales/en/messages.json",
    "_locales/zh_CN/messages.json", "_locales/zh_TW/messages.json",
]

with tempfile.TemporaryDirectory(prefix="checkout-offline-") as temp_name:
    temporary = Path(temp_name)
    staged = temporary / f"{brand}-v{version}"
    staged.mkdir()
    for name in files:
        source = root / name
        target = staged / name
        target.parent.mkdir(parents=True, exist_ok=True)
        if name == "i18n.js":
            branded = temporary / "branded-i18n.js"
            content = source.read_text(encoding="utf-8")
            content = content.replace('popupTitle: "Checkout 测试资料"', f'popupTitle: "{brand}"')
            content = content.replace('popupTitle: "Checkout Test Fill"', f'popupTitle: "{brand}"')
            content = content.replace('privacyTitle: "Checkout 测试资料填充 · 隐私说明"', f'privacyTitle: "{brand} · 隐私说明"')
            content = content.replace('privacyTitle: "Checkout Test Fill · Privacy Notice"', f'privacyTitle: "{brand} · Privacy Notice"')
            branded.write_text(content, encoding="utf-8")
            subprocess.run(["node", str(root / "scripts" / "obfuscate_file.js"),
                            str(branded), str(target)], check=True, timeout=120)
        elif name.endswith(".js") and not name.startswith("data/"):
            subprocess.run(["node", str(root / "scripts" / "obfuscate_file.js"),
                            str(source), str(target)], check=True, timeout=120)
        elif name.endswith(".js"):
            subprocess.run([str(terser), str(source), "--compress", "--mangle",
                            "--format", "comments=false", "--output", str(target)],
                           check=True, timeout=60)
        elif name.endswith("/messages.json"):
            messages = json.loads(source.read_text(encoding="utf-8"))
            messages["extName"]["message"] = brand
            target.write_text(json.dumps(messages, ensure_ascii=False, indent=2), encoding="utf-8")
        elif name in ("popup.html", "privacy.html"):
            target.write_text(source.read_text(encoding="utf-8").replace("Checkout Test Fill", brand), encoding="utf-8")
        else:
            shutil.copy2(source, target)

    release.mkdir(exist_ok=True)
    trial = release / f"{brand}-v{version}-offline.zip"
    with ZipFile(trial, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for name in files:
            archive.write(staged / name, f"{staged.name}/{name}")
        guide = release / f"{brand}-线下试用使用说明-v{version}.docx"
        animation = release / f"{brand}-点击生成自动填充演示.gif"
        if not guide.is_file() or not animation.is_file():
            raise FileNotFoundError("Word guide and standalone animation are required")
        archive.write(guide, "使用说明.docx")
        archive.write(animation, "点击生成自动填充演示.gif")

    command = [str(chrome), "--disable-crash-reporter", "--no-first-run",
               f"--user-data-dir={temporary / 'chrome-profile'}",
               f"--pack-extension={staged}"]
    if key.exists():
        command.append(f"--pack-extension-key={key}")
    result = subprocess.run(command, timeout=60, capture_output=True)
    packed = Path(f"{staged}.crx")
    if result.returncode or not packed.is_file():
        message = (result.stdout + result.stderr).decode("utf-8", errors="replace")
        raise RuntimeError(f"Chrome packing failed ({result.returncode}): {message[-1500:]}")
    crx = release / f"{brand}-v{version}-offline.crx"
    shutil.copy2(packed, crx)
    new_key = Path(f"{staged}.pem")
    if new_key.exists():
        key.parent.mkdir(exist_ok=True)
        shutil.move(new_key, key)
    header = crx.read_bytes()[:12]
    if header[:4] != b"Cr24" or struct.unpack_from("<I", header, 4)[0] != 3:
        raise RuntimeError("Chrome did not create a CRX3 package")
    print(trial)
    print(crx)
