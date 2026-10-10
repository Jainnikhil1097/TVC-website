"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One IntersectionObserver for the whole site. Finds elements marked by <Reveal>
 * ([data-reveal] and [data-reveal-group] with [data-reveal] children), applies
 * stagger delays, and flags them [data-revealed] as they enter the viewport.
 * Re-scans on route changes and when client components mount new content.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (!document.documentElement.classList.contains("js-motion")) return;
    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const targets = el.hasAttribute("data-reveal-group")
            ? el.querySelectorAll<HTMLElement>("[data-reveal]")
            : [el];
          targets.forEach((t) => t.setAttribute("data-revealed", ""));
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );

    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
        if (seen.has(group)) return;
        seen.add(group);
        const step = Number(group.dataset.revealGroup) || 0;
        const base = parseFloat(group.style.getPropertyValue("--reveal-delay")) || 0;
        const y = group.style.getPropertyValue("--reveal-y");
        group.querySelectorAll<HTMLElement>("[data-reveal]").forEach((child, i) => {
          child.style.transitionDelay = `${base + step * i}s`;
          if (y) child.style.setProperty("--reveal-y", y);
        });
        io.observe(group);
      });
      root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])").forEach((el) => {
        if (seen.has(el) || el.closest("[data-reveal-group]")) return;
        seen.add(el);
        const delay = el.style.getPropertyValue("--reveal-delay");
        if (delay) el.style.transitionDelay = delay;
        io.observe(el);
      });
    };

    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => n instanceof HTMLElement && scan(n.parentElement ?? n));
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
