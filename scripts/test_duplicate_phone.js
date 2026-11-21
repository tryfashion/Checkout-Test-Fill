const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "content.js"), "utf8");
const start = source.indexOf("  const visible =");
const end = source.indexOf("  function selection(", start);
const field = (label, nearby = "") => ({
  type: "text", name: "", id: "", placeholder: label, labels: [],
  parentElement: { textContent: label, querySelector: () => null, parentElement: { textContent: nearby } },
  closest: () => null, getAttribute: () => null, getClientRects: () => [1]
});
const marketingPhone = field("Mobile phone (optional)", "Mobile phone (optional) Subscribe to text offers");
const zip = field("ZIP code");
const shippingPhone = field("Phone");
let fields = [marketingPhone, zip, shippingPhone];
const context = {
  document: { querySelectorAll: () => fields, getElementById: () => null },
  getComputedStyle: () => ({ visibility: "visible" })
};
vm.createContext(context);
vm.runInContext(source.slice(start, end) + "\nthis.input = input;", context);
assert.equal(context.input("phone"), shippingPhone);
fields = [marketingPhone];
assert.equal(context.input("phone"), undefined);
console.log("PASS shipping phone selected over marketing SMS phone");
