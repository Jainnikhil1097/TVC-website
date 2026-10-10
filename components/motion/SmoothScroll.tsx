"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Smooth wheel scrolling via Lenis, loaded lazily after the page is idle so it
 * never competes with first paint. Lenis drives the native window scroll, so
 * ScrollTrigger scenes (home) stay in sync through ordinary scroll events.
 * Disabled for reduced-motion users and on touch devices, where native momentum
 * scrolling is already smooth and cheaper.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || touch) return;

    let lenis: { destroy: () => void } | undefined;
    let cancelled = false;
    const start = () =>
      import("lenis").then(({ default: Lenis }) => {
        if (!cancelled) lenis = new Lenis({ lerp: 0.1, autoRaf: true });
      });
    const idle = typeof window.requestIdleCallback === "function";
    const id = idle ? window.requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 800);

    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(id as number);
      else clearTimeout(id);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
