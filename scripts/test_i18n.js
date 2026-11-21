const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const files = ["popup.html", "popup.js", "privacy.html", "privacy.js", "content.js"];
const keys = new Set();
for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  for (const match of text.matchAll(/\bt\("([A-Za-z]\w*)"|data-i18n(?:-placeholder)?="([A-Za-z]\w*)"/g)) keys.add(match[1] || match[2]);
}
for (const locale of ["zh-CN", "zh-TW", "zh-HK", "zh-Hant", "en-US", "fr-FR"]) {
  const context = { chrome: { i18n: { getUILanguage: () => locale } }, navigator: { language: locale } };
  context.globalThis = context;
  vm.runInNewContext(source, context);
  const i18n = context.CHECKOUT_I18N;
  assert.equal(i18n.language, /^zh-(TW|HK|Hant)$/.test(locale) ? "zh_TW" : locale.startsWith("zh") ? "zh_CN" : "en");
  for (const key of keys) assert.notEqual(i18n.t(key), key, `${locale}: untranslated ${key}`);
  assert.equal(i18n.t("fillSuccess", { fields: 2, cards: 3, name: "Jane Smith" }).includes("Jane Smith"), true);
  if (i18n.language === "en") {
    assert.match(i18n.t("consentNotice"), /^The extension reads checkout form fields/);
    assert.match(i18n.t("enableAndFill"), /^Enable and generate$/);
    assert.match(i18n.t("fillSuccess", { fields: 2, cards: 3, name: "Jane Smith" }), /^Filled 2/);
  }
}
{
  const context = { chrome: { i18n: { getUILanguage: () => "en-US" } }, navigator: { language: "en-US" } };
  context.globalThis = context;
  vm.runInNewContext(source, context);
  context.CHECKOUT_I18N.setLanguage("zh_TW");
  assert.equal(context.CHECKOUT_I18N.t("save"), "儲存設定");
  context.CHECKOUT_I18N.setLanguage("auto");
  assert.equal(context.CHECKOUT_I18N.language, "en");
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
assert.equal(manifest.default_locale, "en");
assert.doesNotMatch(fs.readFileSync(path.join(root, "privacy.html"), "utf8"), /<script(?![^>]*src=)[^>]*>/i);
for (const locale of ["en", "zh_CN", "zh_TW"]) {
  const messages = JSON.parse(fs.readFileSync(path.join(root, "_locales", locale, "messages.json"), "utf8"));
  assert.ok(messages.extName.message && messages.extDescription.message);
}
console.log(`PASS localized UI coverage for ${keys.size} keys and 6 browser languages`);
