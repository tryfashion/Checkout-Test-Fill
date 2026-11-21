const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "content.js"), "utf8");
const start = source.indexOf("  async function setSelection(kind, values, force) {");
const end = source.indexOf("  async function nextAddress() {", start);
assert(start >= 0 && end > start);

const fields = {
  country: { tagName: "INPUT", type: "text", value: "", readOnly: false, getAttribute: () => null },
  state: { tagName: "INPUT", type: "text", value: "", readOnly: false, getAttribute: () => null }
};
const context = {
  edited: new Set(),
  selection: (kind) => fields[kind],
  selectionMatches: (el, values) => values.includes(el.value.toLowerCase()),
  setValue: (el, value) => { el.value = value; return true; },
  sleep: async () => {}
};
vm.createContext(context);
vm.runInContext(source.slice(start, end) + "\nthis.setSelection = setSelection;", context);

(async () => {
  assert.equal(await context.setSelection("country", ["united states", "us"], true), true);
  assert.equal(fields.country.value, "United States");
  assert.equal(await context.setSelection("state", ["california", "ca"], true), true);
  assert.equal(fields.state.value, "California");
  console.log("PASS plain country and state text inputs");
})().catch((error) => { console.error(error); process.exitCode = 1; });
