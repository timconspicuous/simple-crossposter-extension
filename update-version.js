const fs = require("fs");
const manifest = require("./static/manifest.json");
const package = require("./package.json");

manifest.version = package.version;

fs.writeFileSync("./static/manifest.json", JSON.stringify(manifest, null, 2));

console.log(`Updated manifest.json to version ${package.version}`);