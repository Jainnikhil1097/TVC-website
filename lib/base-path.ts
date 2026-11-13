// Settings for the static preview build (`npm run build:pages`, published on GitHub
// Pages). The normal site leaves both unset.

/** Sub-folder the site is served from, e.g. "/TVC-website" on GitHub Pages; "" normally. */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** True in the static preview: no CMS server behind it, so forms can't be sent. */
export const isStaticPreview = process.env.NEXT_PUBLIC_STATIC_PREVIEW === "1";

/**
 * Address of a file in /public. Next.js adds the sub-folder to links and its own
 * files automatically, but not to plain URLs like fetch() or <Image src>.
 */
export const asset = (path: string) => `${basePath}${path}`;
