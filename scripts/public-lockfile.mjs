// Rewrites every "resolved" URL in package-lock.json to the public npm registry.
//
// On networks where registry.npmjs.org is blocked, install through a mirror
// (e.g. `npm install --registry=<mirror>`), then run `npm run lockfile:public`.
// Mirrors serve byte-identical tarballs, so the "integrity" hashes stay valid and
// the committed lockfile works on any machine or CI. npm's default
// `replace-registry-host=npmjs` maps these URLs back to a configured mirror locally.
//
// URLs are rebuilt from the package name + version (the canonical npm layout,
// `<name>/-/<basename>-<version>.tgz`) rather than host-swapped, because some
// mirrors add their own path prefix.
import { readFileSync, writeFileSync } from "node:fs";

const PUBLIC = "https://registry.npmjs.org/";
const lockPath = new URL("../package-lock.json", import.meta.url);
const lock = JSON.parse(readFileSync(lockPath, "utf8"));

let rewritten = 0;
const skipped = [];
for (const [key, pkg] of Object.entries(lock.packages ?? {})) {
  if (typeof pkg.resolved !== "string" || !pkg.resolved.endsWith(".tgz")) continue;
  // Package name comes from the install path (…/node_modules/<name>), or `name` for aliases.
  const name = pkg.name ?? key.slice(key.lastIndexOf("node_modules/") + "node_modules/".length);
  if (!name || !pkg.version) {
    skipped.push(key);
    continue;
  }
  const basename = name.startsWith("@") ? name.split("/")[1] : name;
  const url = `${PUBLIC}${name}/-/${basename}-${pkg.version}.tgz`;
  if (pkg.resolved !== url) {
    pkg.resolved = url;
    rewritten++;
  }
}

writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\n");
console.log(
  rewritten ? `Rewrote ${rewritten} resolved URLs to ${PUBLIC}` : "Lockfile already uses the public registry."
);
if (skipped.length) console.warn(`Skipped ${skipped.length} entries without name/version:`, skipped);
