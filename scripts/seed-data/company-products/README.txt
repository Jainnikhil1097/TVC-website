Clean product renders for the home page product spotlight and company profiles,
named <slug>-product.<ext>, e.g. matel-motion-product.png, emo-energy-product.png,
suind-product.webp (the slug is the last part of the company's web address).

- White or transparent background, no text labels baked in (labels are added as
  "Product callouts" in the CMS, under the company's One-pager tab).
- Landscape, around 4:3, at least 1600 px wide. PNG or WebP with transparency is best.

Then run  npm run company:onepagers  (the seed also picks them up). Callout positions
are pre-filled from the one-pager PDF; check and nudge them in the CMS after upload.
