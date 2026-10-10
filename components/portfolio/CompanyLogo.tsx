import Image from "next/image";
import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Company logo in a fixed-height box, falling back to a serif wordmark. */
export function CompanyLogo({ company, className, size = "md" }: { company: Company; className?: string; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-14 w-56" : "h-10 w-40";
  if (!company.logo) return null;
  return (
    <span className={cn("relative block", box, className)}>
      <Image
        src={company.logo.url}
        alt={company.logo.alt || company.name}
        fill
        sizes={size === "lg" ? "224px" : "160px"}
        className="object-contain object-left"
      />
    </span>
  );
}

export function StatusBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "hud inline-flex items-center rounded-full border border-white/25 bg-white/[0.06] px-2.5 py-1 text-white/85",
        className
      )}
    >
      {label}
    </span>
  );
}
