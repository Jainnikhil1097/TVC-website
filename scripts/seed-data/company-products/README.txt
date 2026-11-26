Product images for the company profiles, named <slug>-product.<ext>, e.g.
matel-motion-product.jpg (the slug is the last part of the company's web address).

Most are the team's annotated product images (25 Nov 2026), with their labels built in,
so those companies have no "Product callouts" in the CMS. Only the edge grid lines of the
screenshots were whitened, and a stray mark on EMO's removed. GreenFi, Perovskia Solar,
Prithu, Two Point O and WorkOnGrid still use the earlier crops from the Fund I one-pager,
with numbered callouts added in the CMS (Portfolio → company → One-pager tab).

To change an image:
  - In the CMS: open the company → One-pager tab → Product image (best), or
  - Here: replace the file (same name) and run  npm run company:products

The import replaces an image only if the current one came from this folder; an image
uploaded by an editor in the CMS is never overwritten.

On-dark versions (<slug>-product-dark.webp) are for the home page's black portfolio
section: the product lifted out by Apple Vision on a transparent background, with the
labels and leader lines turned light. To remake one after replacing an image:
  swift scripts/cutout-team-photos.swift <folder with the -product.jpg> /tmp/cut
  node scripts/make-dark-product-images.mjs <same folder> /tmp/cut <out folder> <slug>
then copy it here and run  npm run company:products. Areas Vision can't lift (Fitsol's
dashboards, Helionis's spec card) are kept as they are via KEEP in that script.
