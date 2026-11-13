import Image from "next/image";
import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Company logo in a fixed-height box (renders nothing without a logo — callers show
 * the name instead). `tone="dark"` shows it in white, for dark backgrounds.
 */
export function CompanyLogo({
  company,
  className,
  size = "md",
  tone = "light",
}: {
  company: Company;
  className?: string;
  size?: "md" | "lg";
  tone?: "light" | "dark";
}) {
  const box = size === "lg" ? "h-14 w-56" : "h-10 w-40";
  if (!company.logo) return null;
  return (
    <span className={cn("relative block", box, className)}>
      <Image
        src={company.logo.url}
        alt={company.logo.alt || company.name}
        fill
        sizes={size === "lg" ? "224px" : "160px"}
        className={cn("object-contain object-left", tone === "dark" && "brightness-0 invert")}
      />
    </span>
  );
}

export function StatusBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "hud inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-1 text-ink",
        className
      )}
    >
      {label}
    </span>
  );
}
