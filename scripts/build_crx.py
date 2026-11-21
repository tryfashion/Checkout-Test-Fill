"""Build a signed CRX from the same clean runtime files as the store ZIP.

The private signing key stays outside the extension source folder.
"""

import json
import shutil
import subprocess
import tempfile
from pathlib import Path


root = Path(__file__).resolve().parents[1]
version = json.loads((root / "manifest.json").read_text(encoding="utf-8"))["version"]
release = root / "release"
key = root.parent / "cktestfill-private" / "checkout-test-fill.pem"
chrome = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
if not chrome.is_file():
    raise FileNotFoundError(f"Chrome executable not found: {chrome}")

with tempfile.TemporaryDirectory(prefix="checkout-crx-") as temporary:
    temporary = Path(temporary)
    staged = temporary / "Checkout-Test-Fill"
    staged.mkdir()
    for path in [
        root / "manifest.json", root / "i18n.js", root / "content.js",
        root / "frame-card.js", root / "background.js", root / "popup.html",
        root / "popup.css", root / "popup.js", root / "privacy.html",
        root / "privacy.js", *sorted((root / "data").glob("*.js")),
        *sorted((root / "icons").glob("*.png")),
        *sorted((root / "_locales").glob("*/messages.json")),
    ]:
        target = staged / path.relative_to(root)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)

    command = [str(chrome), "--disable-crash-reporter", "--no-first-run", f"--user-data-dir={temporary / 'chrome-profile'}", f"--pack-extension={staged}"]
    if key.exists():
        command.append(f"--pack-extension-key={key}")
    completed = subprocess.run(command, timeout=60, capture_output=True)
    if completed.returncode:
        message = completed.stderr.decode("utf-8", errors="replace")
        raise RuntimeError(f"Chrome packing failed ({completed.returncode}): {message[-1500:]}")
    packed = staged.with_suffix(".crx")
    if not packed.is_file():
        raise RuntimeError("Chrome did not create a CRX file")
    release.mkdir(exist_ok=True)
    output = release / f"checkout-test-fill-v{version}.crx"
    shutil.copy2(packed, output)
    new_key = staged.with_suffix(".pem")
    if new_key.exists():
        key.parent.mkdir(exist_ok=True)
        shutil.move(new_key, key)
    print(output)
    print(f"Signing key (keep private): {key}")
