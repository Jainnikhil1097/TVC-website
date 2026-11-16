"use client";

import { useEffect, useRef } from "react";

/**
 * Pauses a header's CSS animations (LineArt `animated`) while it's scrolled out of
 * view, so off-screen motion costs nothing. Drop it anywhere inside the header; it
 * toggles `data-motion-paused` on the nearest band (`[data-nav-dark]` or <section>).
 */
export function PauseOffscreen() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = ref.current?.closest<HTMLElement>("[data-nav-dark], section");
    if (!host) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) host.removeAttribute("data-motion-paused");
      else host.setAttribute("data-motion-paused", "");
    });
    io.observe(host);
    return () => {
      io.disconnect();
      host.removeAttribute("data-motion-paused");
    };
  }, []);

  return <span ref={ref} hidden />;
}
