Company logos, named after each company's slug (the last part of its web address),
e.g. matel-motion.png, emo-energy.svg, fitsol.png.

The current files are placeholders cropped from the Fund I portfolio PDF, so they're
soft. To replace one with the company's official logo:
  - In the CMS: open the company → Basics → Logo, and upload the new file (best), or
  - Here: delete the logo from the company in the CMS, put the official file in this
    folder with the same name (SVG or a large transparent PNG), and run
    npm run company:logos

The import only fills empty logos, so a logo uploaded in the CMS is never overwritten.
