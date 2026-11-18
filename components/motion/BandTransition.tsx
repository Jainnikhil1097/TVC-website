"use client";

import { ViewTransition, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The black band at the top of every page (the home hero and each inner page's
 * PageHero) is one shared element: on navigation it morphs from one page's
 * band to the next while the rest of the page fades (styles: `.vt-band` in
 * globals.css). React drives this through the browser's View Transitions API.
 * Browsers without it, and reduced-motion users, simply change page.
 *
 * The band only takes part while it's mostly on screen. Otherwise a click from far
 * down a page would morph a band that's out of view, which looks like it drops in
 * from above. `active={false}` opts out too (the home hero passes it once the content
 * has slid over its panel, so the hidden panel never flashes on top).
 */
export function BandTransition({
  children,
  className,
  active = true,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio >= 0.3), {
      threshold: [0, 0.3, 0.6],
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The name stays fixed: React only forgets a name if it's still set when the band
  // unmounts, so toggling it (e.g. after scrolling past the header) left a stale entry
  // and the next page's band was reported as a duplicate. Opting out is done with
  // share="none" instead, which skips the morph for that navigation.
  return (
    <ViewTransition
      name="page-band"
      share={inView && active ? "vt-band" : "none"}
      enter="none"
      exit="none"
      update="none"
      default="none"
    >
      <div ref={ref} className={className}>
        {children}
      </div>
    </ViewTransition>
  );
}
