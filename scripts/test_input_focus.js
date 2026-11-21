const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

class FakeInput {
  set value(value) { this.current = value; this.events.push("set"); }
  get value() { return this.current || ""; }
  focus() { this.events.push("focus"); this.box.className = "order_text_box order_text_on"; }
  blur() { this.events.push("blur"); }
  dispatchEvent(event) { this.events.push(event.type); }
}

for (const file of ["content.js", "frame-card.js"]) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const start = source.indexOf("  function setValue(el, value) {");
  const end = source.indexOf(file === "content.js" ? "  async function setUSPhoneCountry()" : "  async function fill()", start);
  const context = { HTMLInputElement: FakeInput, HTMLTextAreaElement: class {}, Event: class { constructor(type) { this.type = type; } } };
  vm.createContext(context);
  vm.runInContext(source.slice(start, end) + "\nthis.setValue = setValue;", context);
  const field = new FakeInput();
  field.events = [];
  field.box = { className: "order_text_box" };
  assert.equal(context.setValue(field, "Adam"), true);
  assert.equal(field.value, "Adam");
  assert.equal(field.box.className, "order_text_box order_text_on");
  assert.deepEqual(field.events, ["focus", "set", "input", "change", "blur"]);
}
console.log("PASS main and iframe fields focus before input and really blur afterward");
