const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require("node:path").join(__dirname, "..", "content.js"), "utf8");
const start = source.indexOf("  function selection(kind, values = []) {");
const end = source.indexOf("  function setValue(el, value) {", start);
assert(start >= 0 && end > start);

const country = {
  tagName: "SELECT", field: "country", disabled: false, value: "CA",
  options: [{ value: "CA", textContent: "Canada" }, { value: "US", textContent: "United States" }],
  get selectedOptions() { return this.options.filter((item) => item.value === this.value); }
};
const province = {
  tagName: "SELECT", field: "province", disabled: false, value: "",
  options: [{ value: "", textContent: "Province" }, { value: "CA", textContent: "California" }],
  get selectedOptions() { return this.options.filter((item) => item.value === this.value); }
};
const context = {
  document: { querySelectorAll: () => [country, province] },
  visible: () => true,
  details: (el) => el.field
};
vm.createContext(context);
vm.runInContext(source.slice(start, end) + "\nthis.selection = selection; this.selectionMatches = selectionMatches;", context);

assert.equal(context.selection("state", ["california", "ca"]), province,
  "Canada (CA) must not be selected as California (CA)");
assert.equal(context.selectionMatches(country, ["united states", "us"]), false);
country.value = "US";
province.value = "CA";
assert.equal(context.selectionMatches(country, ["united states", "us"]), true);
assert.equal(context.selectionMatches(province, ["california", "ca"]), true);
console.log("PASS Shopline country/state collision and selection verification");
