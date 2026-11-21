const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const saved = { consentGranted: false };
const elements = new Map();
let tabQueries = 0;
let sent = 0;
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    value: "", checked: false, hidden: false, options: [], dataset: {}, listeners: {},
    add(option) { this.options.push(option); },
    replaceChildren() { this.options = []; },
    addEventListener(type, fn) { this.listeners[type] = fn; }
  });
  return elements.get(id);
}
const context = {
  document: { documentElement: {}, title: "", getElementById: element, querySelectorAll: () => [] },
  addEventListener() {},
  Option: class { constructor(text, value) { this.text = text; this.value = value; } },
  CHECKOUT_I18N: { language: "en", preference: "auto", t: (key) => key },
  chrome: {
    storage: {
      local: {
        get(defaults, callback) {
          const result = typeof defaults === "string" ? { [defaults]: saved[defaults] } : { ...defaults, ...saved };
          if (callback) callback(result);
          return Promise.resolve(result);
        },
        async set(update) { Object.assign(saved, update); }
      }
    },
    tabs: {
      async query() { tabQueries++; return [{ id: 1, url: "https://shop.example/checkout" }]; },
      async sendMessage() { assert.equal(saved.consentGranted, true); sent++; return { message: "filled" }; }
    }
  }
};
context.globalThis = context;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8"), context);

async function run() {
  await new Promise(setImmediate);
  assert.equal(tabQueries, 0, "popup does not inspect the tab before first click");
  assert.equal(element("status").textContent, "enableOnPage");
  assert.equal(element("fill").disabled, true);
  assert.equal(saved.consentGranted, false);
  assert.equal(sent, 0);
  assert.equal(element("fill").textContent, "generateAndFill");
  console.log("PASS popup directs first use to checkout page");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
