import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "solid" | "outline" | "ghost" | "dark";

const variants: Record<Variant, string> = {
  // On light pages (the default).
  primary: "bg-ink text-white hover:bg-teal-ink",
  secondary: "border border-ink/20 text-ink hover:border-teal-ink hover:text-teal-ink",
  // On dark bands (globe hero, featured portfolio, footer).
  solid: "bg-white text-ink hover:bg-teal-soft",
  outline: "border border-white/30 text-white hover:border-teal hover:text-teal",
  ghost: "text-white/80 hover:text-teal",
  /** @deprecated use "primary" */
  dark: "bg-ink text-white hover:bg-teal-ink",
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-[0.9rem] font-semibold transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none";

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
  external?: boolean;
};

export function ButtonLink({ href, variant = "primary", className, children, external }: ButtonLinkProps) {
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

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(base, variants[variant], className)} {...props} />;
}
