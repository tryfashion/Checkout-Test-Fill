const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

class Input {
  constructor(placeholder) { this.placeholder = placeholder; this._value = ""; this.type = "text"; this.labels = []; }
  get value() { return this._value; }
  set value(value) { this._value = value; }
  getClientRects() { return [1]; }
  getAttribute() { return null; }
  closest() { return null; }
  focus() {}
  blur() {}
  dispatchEvent() {}
}
const fields = ["Card number", "Expiration date (MM / YY)", "Security code", "Name on card"].map((label) => new Input(label));
let onMessage;
const context = {
  window: { top: {} },
  document: { documentElement: {}, querySelectorAll: () => fields, getElementById: () => null },
  getComputedStyle: () => ({ visibility: "visible" }),
  HTMLInputElement: Input,
  Event: class {}, FocusEvent: class {},
  MutationObserver: class { observe() {} },
  setTimeout, clearTimeout,
  chrome: {
    runtime: {
      onMessage: { addListener: (fn) => { onMessage = fn; } },
      sendMessage: async () => ({ profile: { first: "Jane", last: "Smith" } })
    },
    storage: {
      local: { get: async (defaults) => ({ ...defaults, consentGranted: true }) },
      onChanged: { addListener: () => {} }
    }
  }
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "frame-card.js"), "utf8"), context);
async function run() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal(fields[0].value.replace(/\D/g, ""), "4242424242424242");
  assert.match(fields[1].value, /^\d{2}\/\d{2}$/);
  assert.equal(fields[2].value, "234");
  assert.equal(fields[3].value, "Jane Smith");
  fields[0].value = "4111111111111111";
  fields[1].value = "";
  onMessage({ type: "PROFILE_UPDATED", profile: { first: "Robert", last: "Smith" } });
  await new Promise((resolve) => setTimeout(resolve, 250));
  assert.equal(fields[1].value, "", "do not mix a test expiry with another card number");
  console.log("PASS payment iframe test fields and existing-card guard");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
