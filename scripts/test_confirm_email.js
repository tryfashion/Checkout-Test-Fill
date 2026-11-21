const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "content.js"), "utf8");
const start = source.indexOf("  const visible =");
const end = source.indexOf("  function selection(", start);
assert(start >= 0 && end > start);

const email = { name: "billing_email", labels: [{ textContent: "Email address" }], type: "email", value: "" };
const confirmation = { name: "billing_email_confirm", labels: [{ textContent: "Confirm Email Address" }], type: "email", value: "" };
for (const field of [email, confirmation]) {
  field.getClientRects = () => [{}];
  field.getAttribute = () => null;
  field.closest = () => null;
  field.parentElement = { querySelector: () => null };
}

const context = {
  document: { querySelectorAll: () => [confirmation, email], getElementById: () => null },
  getComputedStyle: () => ({ visibility: "visible" }),
  edited: new Set(),
  setValue: (field, value) => { field.value = value; return true; }
};
vm.createContext(context);
const setTextStart = source.indexOf("  function setText(");
const setTextEnd = source.indexOf("  function clearMarketingOptIn(", setTextStart);
vm.runInContext(source.slice(start, end) + source.slice(setTextStart, setTextEnd) + "\nthis.input = input; this.setText = setText;", context);

assert.equal(context.input("email"), email);
assert.equal(context.input("confirmEmail"), confirmation);
confirmation.labels[0].textContent = "确认电子邮箱";
assert.equal(context.input("confirmEmail"), confirmation);
email.value = "adam.perez1975@outlook.com";
assert.equal(context.setText("confirmEmail", context.input("email").value, false), true);
assert.equal(confirmation.value, email.value);
assert.equal(context.setText("confirmEmail", "different@gmail.com", false), false);
assert.equal(confirmation.value, email.value);
console.log("PASS primary and confirmation email fields remain distinct in either order");
