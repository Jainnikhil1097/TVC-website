// Builds the website as static files (out/):
//
//   npm run build:pages                         # hidden preview, served from the domain root
//   BASE_PATH=/TVC-website npm run build:pages  # hidden preview in a sub-folder (GitHub Pages)
//   SITE_LIVE=1 npm run build:pages             # the live site (Hostinger): indexed by search
//                                               # engines, forms hand over to email, plus an
//                                               # .htaccess for https, www and the 404 page
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
const live = process.env.SITE_LIVE === "1";
// The one address the live site answers on; the others redirect to it.
const siteUrl = (process.env.SITE_URL || "https://www.transitionventurecapital.com").replace(/\/+$/, "");

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

/** Web server rules for the live site on Hostinger (LiteSpeed/Apache read .htaccess). */
function htaccess(url) {
  const host = url.host.replace(/\./g, "\\.");
  return `# Written by scripts/build-pages.mjs (SITE_LIVE=1). Edit there, not here: each deploy replaces it.
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Certificate checks pass through untouched.
  RewriteRule ^\\.well-known/ - [L]

  # One address, over https: ${url.origin}
  # Plain http → https. Behind Hostinger's CDN or proxy the server itself sees http, so
  # a visit counts as https if either the server or the forwarding proxy says so
  # (otherwise every https visit would redirect to itself, forever).
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !https [NC]
  RewriteCond %{HTTP:X-Forwarded-SSL} !on [NC]
  RewriteRule ^ ${url.origin}%{REQUEST_URI} [R=301,L,NE]
  # transitionventurecapital.com (or any other name for this site) → ${url.host}
  RewriteCond %{HTTP_HOST} !^${host}$ [NC]
  RewriteRule ^ ${url.origin}%{REQUEST_URI} [R=301,L,NE]

  # Pages that moved (the same as next.config.ts redirects).
  RewriteRule ^careers/?$ /contact/ [R=301,L]
  RewriteRule ^funds/?$ /#funds [R=301,L,NE]

  # Addresses from the previous website, so old links land somewhere useful.
  RewriteRule ^about-us/?$ /about/ [R=301,L,NC]
  RewriteRule ^contact-us/?$ /contact/ [R=301,L,NC]
  RewriteRule ^(our-)?team/?$ /about/ [R=301,L,NC]
  RewriteRule ^(our-)?portfolio-companies/?$ /portfolio/ [R=301,L,NC]
  RewriteRule ^(in-the-media|media|news|press)(/.*)?$ /perspectives/ [R=301,L,NC]
  RewriteRule ^(blog|blogs|insights)(/.*)?$ /perspectives/ [R=301,L,NC]
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set X-Frame-Options "SAMEORIGIN"
  # Next.js file names change whenever their content does, so they can be cached for a year.
  <FilesMatch "\\.(js|css|woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 30 days"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/svg+xml "access plus 30 days"
</IfModule>
`;
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
      NEXT_PUBLIC_SITE_LIVE: live ? "1" : "",
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
  if (live) writeFileSync(path.join(root, "out", ".htaccess"), htaccess(new URL(siteUrl)));
  console.log(`\n${live ? `Live site (${siteUrl})` : "Static preview"} ready in out/${basePath ? ` (for ${basePath}/)` : ""}.`);
}
process.exit(status);
