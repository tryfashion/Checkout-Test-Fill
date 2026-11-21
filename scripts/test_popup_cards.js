const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");
const builtIn3ds = "4000002760003184";

async function loadPopup(saved) {
  const values = { ...saved };
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, {
      value: "", checked: false, options: [], dataset: {},
      add(option) { this.options.push(option); },
      replaceChildren() { this.options = []; },
      addEventListener() {}
    });
    return elements.get(id);
  };
  const context = {
    document: { documentElement: {}, title: "", getElementById: element, querySelectorAll: () => [] },
    addEventListener() {},
    Option: class { constructor(text, value) { this.text = text; this.value = value; } },
    CHECKOUT_I18N: { language: "en", preference: "auto", t: (key) => key },
    chrome: {
      storage: { local: {
        get(defaults, callback) { const result = typeof defaults === "string" ? { [defaults]: values[defaults] } : { ...defaults, ...values }; if (callback) callback(result); return Promise.resolve(result); },
        async set(update) { Object.assign(values, update); }
      } },
      tabs: { async query() { return []; } }
    }
  };
  context.globalThis = context;
  vm.runInNewContext(source, context);
  await new Promise(setImmediate);
  return { values, cards: element("cardNumber").options };
}

(async () => {
  const old = await loadPopup({ cardNumber: "5555555555554444", cardNumbers: ["4242424242424242", "5555555555554444"] });
  assert.equal(old.cards.filter((card) => card.value === builtIn3ds).length, 1);
  assert.match(old.cards.find((card) => card.value === builtIn3ds).text, /^official3ds/);
  assert.equal(old.values.added3dsCard, true);
  assert.equal(old.values.cardNumber, "5555555555554444");

  const removed = await loadPopup({ cardNumbers: ["4242424242424242"], added3dsCard: true });
  assert.equal(removed.cards.some((card) => card.value === builtIn3ds), false);
  console.log("PASS 3DS card added to existing settings once and user removal respected");
})().catch((error) => { console.error(error); process.exitCode = 1; });
