// Settings for the static preview build (`npm run build:pages`, published on GitHub
// Pages). The normal site leaves both unset.

/** Sub-folder the site is served from, e.g. "/TVC-website" on GitHub Pages; "" normally. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** True in a static build (`npm run build:pages`): no CMS server behind it. */
export const isStaticPreview = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "1";

/**
 * True when that static build is the live website (SITE_LIVE=1, set by the Hostinger
 * deploy): it's indexed by search engines, and forms hand over to email. Without it, a
 * static build is a hidden preview (GitHub Pages): no indexing, forms switched off.
 */
export const isLiveStatic = isStaticPreview && process.env.NEXT_PUBLIC_SITE_LIVE === "1";

/** Hidden from search engines: the static preview, but not the live static site. */
export const isHiddenPreview = isStaticPreview && !isLiveStatic;

/**
 * Address of a file in /public. Next.js adds the sub-folder to links and its own
 * files automatically, but not to plain URLs like fetch() or <Image src>.
 */
export const asset = (path: string) => `${basePath}${path}`;
