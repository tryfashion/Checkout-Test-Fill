const fs = require("node:fs");
const obfuscator = require("javascript-obfuscator");

const [source, target] = process.argv.slice(2);
if (!source || !target) throw new Error("Usage: node obfuscate_file.js source target");
const code = fs.readFileSync(source, "utf8");
const result = obfuscator.obfuscate(code, {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: "hexadecimal",
  renameGlobals: false,
  selfDefending: false,
  stringArray: true,
  stringArrayEncoding: ["base64"],
  stringArrayThreshold: 0.5,
  transformObjectKeys: false,
  unicodeEscapeSequence: false,
});
fs.writeFileSync(target, result.getObfuscatedCode(), "utf8");
