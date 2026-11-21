const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const data = new Map();
let onMessage;
let onRemoved;
const session = {
  get: async (key) => ({ [key]: data.get(key) }),
  set: async (items) => { for (const [key, value] of Object.entries(items)) data.set(key, value); },
  remove: async (key) => { data.delete(key); },
  clear: async () => { data.clear(); }
};
const chrome = {
  runtime: { onMessage: { addListener: (fn) => { onMessage = fn; } } },
  tabs: { onRemoved: { addListener: (fn) => { onRemoved = fn; } }, sendMessage: async () => {} },
  storage: { session }
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "background.js"), "utf8"), { chrome });

const send = (message, tabId, frameId = 0, url = "https://store.example/checkout") => new Promise((resolve) => onMessage(message, { tab: { id: tabId, url }, frameId }, resolve));
async function run() {
  const profile = { first: "Jane", last: "Smith", email: "jane.smith1992@gmail.com", stage: "contact" };
  assert.equal((await send({ type: "SAVE_PROFILE", profile }, 10)).ok, true);
  assert.equal((await send({ type: "GET_PROFILE" }, 10)).profile.first, "Jane");
  assert.equal((await send({ type: "GET_PROFILE" }, 10, 3)).profile.first, "Jane");
  assert.equal((await send({ type: "GET_PROFILE" }, 10, 3, "https://store.example/cart")).profile, null);
  assert.equal((await send({ type: "GET_PROFILE" }, 11)).profile, null);
  onRemoved(10);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal((await send({ type: "GET_PROFILE" }, 10)).profile, null);
  await send({ type: "SAVE_PROFILE", profile }, 11);
  await send({ type: "CLEAR_PROFILE" }, 11);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal((await send({ type: "GET_PROFILE" }, 11)).profile, null);
  console.log("PASS tab-scoped profile storage and clearing");
}
run().catch((error) => { console.error(error); process.exitCode = 1; });
