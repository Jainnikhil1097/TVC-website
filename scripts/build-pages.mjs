// Builds the static preview of the website for GitHub Pages:
//
//   npm run build:pages                         # site served from the domain root
//   BASE_PATH=/TVC-website npm run build:pages  # site served from a sub-folder
//
// Every page is saved as plain HTML into out/, using the content currently in the
// CMS database (DATABASE_URL, or dev.db). The CMS admin (/admin) and its API need
// a server, so they're set aside during the build and put back afterwards; forms
// show a "preview" note instead of sending. Uploaded images (media/) are copied in.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const cmsRoutes = path.join(root, "app", "(payload)");
const stashDir = path.join(root, ".pages-stash");
const stashed = path.join(stashDir, "(payload)");
const basePath = (process.env.BASE_PATH ?? "").replace(/\/+$/, "");

if (basePath && !basePath.startsWith("/")) {
  console.error(`BASE_PATH must start with "/" (got "${basePath}").`);
  process.exit(1);
}
if (existsSync(stashed)) {
  console.error(
    `A previous preview build didn't finish: the CMS routes are still in ${path.relative(root, stashed)}.\n` +
      `Move that folder back to app/(payload) and run this again.`
  );
  process.exit(1);
}

let moved = false;
const restore = () => {
  if (!moved) return;
  renameSync(stashed, cmsRoutes);
  rmSync(stashDir, { recursive: true, force: true });
  moved = false;
};
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    restore();
    process.exit(130);
  });
}

let status = 1;
try {
  mkdirSync(stashDir, { recursive: true });
  renameSync(cmsRoutes, stashed);
  moved = true;

  const result = spawnSync("npx", ["next", "build", "--webpack"], {
    stdio: "inherit",
    env: {
      ...process.env,
      STATIC_EXPORT: "1",
      NEXT_PUBLIC_STATIC_PREVIEW: "1",
      NEXT_PUBLIC_BASE_PATH: basePath,
    },
  });
  status = result.status ?? 1;
} finally {
  restore();
}

if (status === 0) {
  // GitHub Pages runs Jekyll by default, which hides folders starting with "_" (like _next).
  writeFileSync(path.join(root, "out", ".nojekyll"), "");
  // CMS uploads (team photos etc.): on the preview, lib/cms.ts points images at /media/.
  const media = path.resolve(root, process.env.MEDIA_DIR || "media");
  if (existsSync(media)) cpSync(media, path.join(root, "out", "media"), { recursive: true });
  console.log(`\nStatic preview ready in out/${basePath ? ` (for ${basePath}/)` : ""}.`);
}
process.exit(status);
