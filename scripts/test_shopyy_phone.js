const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "content.js"), "utf8");
const from = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
const code = {
  value: "CN_86",
  getAttribute: (name) => name === "data-country" ? code.value.split("_")[0] : null,
  getClientRects: () => [{}]
};
const option = { getClientRects: () => [{}], click: () => { code.value = "US_1"; } };
const trigger = { click: () => {} };
const container = { querySelector: (selector) => selector.includes("tel_area_code") ? code : trigger };
const area = {
  name: "tel_area_code", id: "", type: "text", labels: [], parentElement: { querySelector: () => null },
  closest: () => null, getAttribute: () => null, getClientRects: () => [{}]
};
const phone = {
  name: "phone", id: "mobilephone", type: "text", labels: [{ textContent: "Phone" }],
  parentElement: { parentElement: container, querySelector: () => null },
  closest: () => null, getAttribute: () => null, getClientRects: () => [{}]
};
const context = {
  document: { querySelectorAll: (selector) => selector.includes("phone-number-wrap") ? [option] : [area, phone], getElementById: () => null },
  getComputedStyle: () => ({ visibility: "visible" }),
  sleep: async () => {}
};
vm.createContext(context);
vm.runInContext(from("  const visible =", "  function selection(") + from("  async function setUSPhoneCountry()", "  function setText(") + "\nthis.input = input; this.setUSPhoneCountry = setUSPhoneCountry;", context);

async function run() {
  assert.equal(context.input("phone"), phone);
  assert.equal(await context.setUSPhoneCountry(), true);
  assert.equal(code.value, "US_1");
  console.log("PASS Shopyy phone field and US +1 dial code selection");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
