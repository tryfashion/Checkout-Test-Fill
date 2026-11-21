const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "content.js"), "utf8");
const start = source.indexOf("  function formStage() {");
const end = source.indexOf("  function setValue(el, value) {", start);
assert(start >= 0 && end > start);

let fields = {};
let country = false;
let card = false;
const context = {
  location: { href: "https://store.example/checkout/contact" },
  input: (key) => fields[key] || null,
  selection: () => country,
  cardControls: () => ({ number: card, holder: null }),
  chrome: { runtime: { sendMessage: async (message) => {
    if (message.type === "SAVE_PROFILE") { context.savedProfile = message.profile; return { ok: true }; }
    if (message.type === "GET_PROFILE") return { profile: context.savedProfile || null };
    return {};
  } } },
  lastProfile: null
};
vm.createContext(context);
vm.runInContext(source.slice(start, end) + "\nthis.formStage = formStage; this.readProfile = readProfile; this.saveProfile = saveProfile;", context);

fields = { email: {}, first: null, last: null };
assert.equal(context.formStage(), "contact");
async function run() {
await context.saveProfile({ first: "Jane", last: "Smith", email: "jane.smith1992@gmail.com", stage: "contact" });
assert.equal((await context.readProfile()).first, "Jane");

fields = { first: {}, last: {} };
country = true;
assert.equal(context.formStage(), "shipping");
assert.equal((await context.readProfile()).last, "Smith");

fields = {};
country = false;
card = {};
assert.equal(context.formStage(), "payment");

fields = { email: {}, first: {}, last: {} };
country = true;
assert.equal(context.formStage(), "single");

context.location.href = "https://store.example/products";
assert.equal(context.formStage(), false);
console.log("PASS contact → shipping → payment and single-page detection");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
