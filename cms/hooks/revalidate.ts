import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";

/**
 * Any content change refreshes the whole site. It's nine static pages, so a full
 * revalidation is cheap and guarantees nothing shows stale data (counts, footer,
 * home teasers all draw from several collections).
 *
 * Skipped outside a Next.js runtime (e.g. the seed script) and when a caller sets
 * `context.disableRevalidate`.
 */
async function revalidateSite(context: Record<string, unknown>) {
  if (context.disableRevalidate) return;
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/", "layout");
  } catch {
    // Not running inside Next.js (CLI scripts) — nothing to revalidate.
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  await revalidateSite(req.context);
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidateSite(req.context);
  return doc;
};

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, req }) => {
  await revalidateSite(req.context);
  return doc;
};

export const revalidateHooks = {
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
};
