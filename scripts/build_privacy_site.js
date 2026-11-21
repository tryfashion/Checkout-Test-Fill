const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "i18n.js"), "utf8");
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const fields = ["privacyRead", "privacyStore", "privacyShare", "privacyDelete", "privacyScope"];

function section(locale, browserLanguage) {
  const context = { chrome: { i18n: { getUILanguage: () => browserLanguage } }, navigator: { language: browserLanguage } };
  context.globalThis = context;
  vm.runInNewContext(source, context);
  const { t } = context.CHECKOUT_I18N;
  const content = fields.map((key) => `<h2>${escapeHtml(t(`${key}Heading`))}</h2><p>${escapeHtml(t(key))}</p>`).join("\n");
  return `<section id="${locale}" lang="${browserLanguage}"><h1>${escapeHtml(t("privacyTitle"))}</h1><p>${escapeHtml(t("privacyDate"))}</p>${content}</section>`;
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Checkout Test Fill · Privacy Notice</title>
<style>body{max-width:760px;margin:40px auto;padding:0 20px;color:#202124;font:16px/1.65 system-ui,sans-serif}nav{display:flex;gap:18px;flex-wrap:wrap}a{color:#165dcb}section{padding-top:16px;margin-bottom:70px;border-top:1px solid #ddd}h1{font-size:28px}h2{font-size:20px;margin-top:30px}</style>
</head><body><nav><a href="#en">English</a><a href="#zh-CN">简体中文</a><a href="#zh-TW">繁體中文</a></nav>
${section("en", "en-US")}
${section("zh-CN", "zh-CN")}
${section("zh-TW", "zh-TW")}
</body></html>\n`;
const output = path.join(root, "release", "privacy-site", "index.html");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html, "utf8");
console.log(output);
