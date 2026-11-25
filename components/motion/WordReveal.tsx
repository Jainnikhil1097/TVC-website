"use client";

import { useEffect, useRef } from "react";

/**
 * Text that "fills in" word by word as it scrolls into view (scrubbed with the
 * scroll position). The text renders at full strength on the server; GSAP sets
 * the faded start state only once it has loaded, and skips it for reduced motion.
 */
export function WordReveal({
  text,
  as: Tag = "p",
  className,
  id,
}: {
  text: string;
  as?: "p" | "h2" | "h3";
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLParagraphElement & HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el.querySelectorAll("[data-word]"),
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: "top 88%", end: "bottom 50%", scrub: true },
          }
        );
      });
      revert = () => mm.revert();
    });
    return () => {
      cancelled = true;
      revert?.();
    };
  }, [text]);

  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag ref={ref} id={id} className={className}>
      {words.map((w, i) => (
        <span key={i} data-word>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
