import fs from "node:fs";

const file = "tools/finalizePushedMedia.mjs";
let text = fs.readFileSync(file, "utf8");

const start = text.indexOf("function replaceTopObject(file, outletId, replacement) {");
const endMarker = "\n}\n\nreplaceTopObject(\"src/constants/outlets/final-expansion.ts\"";
const end = text.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error("Could not locate replaceTopObject helper in finalizer");

const helper = `function replaceTopObject(file, outletId, replacement) {
  let text = read(file);
  const marker = \`outletId: "\${outletId}"\`;
  const markerAt = text.indexOf(marker);
  if (markerAt < 0) throw new Error(\`\${file}: could not find outlet marker for \${outletId}\`);

  const objectStart = text.lastIndexOf("\\n  {\\n", markerAt);
  const objectEndStart = text.indexOf("\\n  },", markerAt);
  if (objectStart < 0 || objectEndStart < 0) {
    throw new Error(\`\${file}: could not find top-level object bounds for \${outletId}\`);
  }

  const objectEnd = objectEndStart + "\\n  },".length;
  text = text.slice(0, objectStart) + "\\n" + replacement + text.slice(objectEnd);
  write(file, text);
}`;

text = text.slice(0, start) + helper + text.slice(end + 2);
fs.writeFileSync(file, text);
console.log("Patched finalizePushedMedia.mjs top-level object matcher");
