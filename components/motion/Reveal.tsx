import type { CSSProperties, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  as?: "div" | "section" | "ul" | "li" | "article";
  className?: string;
  /** Stagger direct children marked with [data-reveal] instead of the wrapper (seconds). */
  stagger?: number;
  delay?: number;
  y?: number;
};

/**
 * Marks content to fade and lift into view on scroll. This is a plain server
 * component — the single <RevealObserver/> in the root layout does the work —
 * so pages ship no per-section animation JavaScript. Content is visible by
 * default and only hidden when <html> has `js-motion` (set pre-paint for users
 * without reduced motion), so nothing is lost without JS.
 */
export function Reveal({ children, as: Tag = "div", className, stagger, delay = 0, y = 24 }: RevealProps) {
  const style = { "--reveal-y": `${y}px`, ...(delay ? { "--reveal-delay": `${delay}s` } : {}) } as CSSProperties;
  const attrs = stagger ? { "data-reveal-group": String(stagger) } : { "data-reveal": "" };
  return (
    <Tag className={className} style={style} {...attrs}>
      {children}
    </Tag>
  );
}
