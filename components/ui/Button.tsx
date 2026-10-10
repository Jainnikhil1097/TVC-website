import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost" | "dark";

const variants: Record<Variant, string> = {
  // Light pill on dark backgrounds — the primary CTA (as in the home reference).
  solid:
    "bg-white text-ink-950 hover:bg-teal-soft shadow-[0_0_24px_rgb(14_213_194/0.18)]",
  outline: "border border-white/25 text-white hover:border-teal hover:text-teal",
  ghost: "text-white/80 hover:text-teal",
  // Dark pill on light pages.
  dark: "bg-stone text-white hover:bg-ink-700",
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-[0.8rem] font-semibold tracking-[0.08em] uppercase transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none";

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
  external?: boolean;
};

export function ButtonLink({ href, variant = "solid", className, children, external }: ButtonLinkProps) {
  const cls = cn(base, variants[variant], className);
  if (external || /^https?:/.test(href)) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant };

export function Button({ variant = "solid", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(base, variants[variant], className)} {...props} />;
}
