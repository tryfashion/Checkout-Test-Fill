const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

let allowed = false;
let reads = 0;
let messageListener;
let storageListener;
let host;
let language = "zh";
let languageListener;
let statusVisible = false;
const status = {
  classList: {
    add() { statusVisible = true; },
    remove() { statusVisible = false; },
    contains() { return statusVisible; }
  }
};
const parts = {
  ".generate": { addEventListener(type, fn) { this[type] = fn; } },
  ".disclosure": { hidden: false },
  ".disclosure span": {},
  ".disclosure a": {},
  p: status,
  'p[role="status"]': status
};
const shadow = { querySelector(selector) { return parts[selector]; } };
const context = {
  CHECKOUT_I18N: { t: (key) => language === "en" ? `EN:${key}` : key },
  TEST_NAMES: { first: ["Jane"], last: ["Smith"] },
  document: {
    documentElement: {},
    body: { appendChild() {} },
    createElement() { host = { style: {}, attachShadow() { this.shadowRoot = shadow; return shadow; }, remove() {} }; return host; },
    addEventListener() {},
    querySelectorAll() { reads++; return []; }
  },
  location: { href: "https://shop.example/checkout" },
  MutationObserver: class { observe() {} },
  addEventListener(type, fn) { if (type === "checkout-language-changed") languageListener = fn; },
  setInterval() {},
  setTimeout, clearTimeout,
  chrome: {
    storage: {
      local: {
        async get() { return { consentGranted: allowed }; },
        async set() { allowed = true; storageListener({ consentGranted: { newValue: true } }, "local"); }
      },
      onChanged: { addListener(fn) { storageListener = fn; } }
    },
    runtime: {
      onMessage: { addListener(fn) { messageListener = fn; } },
      getURL: () => "chrome-extension://test/privacy.html",
      async sendMessage() { return { profile: null }; }
    }
  }
};
context.globalThis = context;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "content.js"), "utf8"), context);

async function run() {
  await new Promise((resolve) => setTimeout(resolve, 230));
  assert.equal(reads, 0, "no form scan before consent");
  assert.match(host.style.cssText, /bottom:calc\(50vh - 24px\)/);
  assert.equal(parts[".generate"].textContent, "enableAndFill");
  assert.equal(parts[".disclosure"].hidden, false);
  language = "en";
  languageListener();
  assert.equal(parts[".generate"].textContent, "EN:enableAndFill");
  assert.equal(parts[".disclosure span"].textContent, "EN:consentNotice");
  assert.equal(parts[".disclosure a"].textContent, "EN:privacyLink");
  const reply = await new Promise((resolve) => messageListener({ type: "FILL", force: true }, null, resolve));
  assert.equal(reply.message, "EN:refreshPage");
  assert.equal(reads, 0, "a fill message cannot bypass consent");
  await parts[".generate"].click();
  assert.equal(status.textContent, "EN:noFields");
  language = "zh";
  languageListener();
  assert.equal(statusVisible, false, "stale status is hidden when language changes");
  assert.equal(allowed, true);
  assert.equal(parts[".disclosure"].hidden, true);
  assert.match(host.style.cssText, /bottom:calc\(50vh - 24px\)/, "button stays centered after enabling");
  await new Promise((resolve) => setTimeout(resolve, 230));
  assert.ok(reads > 0, "form scan starts after consent");
  console.log("PASS page button grants consent before scanning checkout fields");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
