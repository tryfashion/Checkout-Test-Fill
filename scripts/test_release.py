"""Check that offline and store ZIPs contain the same valid extension."""

import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from zipfile import ZipFile


root = Path(__file__).resolve().parents[1]
version = json.loads((root / "manifest.json").read_text(encoding="utf-8"))["version"]
store = root / "release" / f"checkout-test-autofill-store-v{version}.zip"
offline = root / "release" / f"checkout-test-autofill-offline-v{version}.zip"
assert hashlib.sha256(store.read_bytes()).digest() == hashlib.sha256(offline.read_bytes()).digest()

with tempfile.TemporaryDirectory(prefix="checkout-release-") as name:
    staged = Path(name)
    with ZipFile(store) as package:
        assert package.testzip() is None
        assert json.loads(package.read("manifest.json"))["version"] == version
        package.extractall(staged)
    for path in staged.rglob("*.js"):
        subprocess.run(["node", "--check", str(path)], check=True, capture_output=True)
    (staged / "scripts").mkdir()
    for test in ("test_background.js", "test_frame_card.js"):
        shutil.copy2(root / "scripts" / test, staged / "scripts" / test)
        result = subprocess.run(["node", str(staged / "scripts" / test)], capture_output=True, text=True)
        assert result.returncode == 0, result.stdout + result.stderr
    language_probe = """
const fs = require('node:fs');
const vm = require('node:vm');
const context = {chrome: {i18n: {getUILanguage: () => 'zh-TW'}}, navigator: {language: 'zh-TW'}};
context.globalThis = context;
vm.runInNewContext(fs.readFileSync(process.argv[1], 'utf8'), context);
if (context.CHECKOUT_I18N.t('save') !== '儲存設定') process.exit(1);
context.CHECKOUT_I18N.setLanguage('en');
if (context.CHECKOUT_I18N.t('save') !== 'Save settings') process.exit(1);
"""
    subprocess.run(["node", "-e", language_probe, str(staged / "i18n.js")], check=True)

print(f"PASS identical store/offline ZIPs, package integrity and minified JavaScript: v{version}")
