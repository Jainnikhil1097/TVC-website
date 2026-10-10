import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The thin teal rule used under headings throughout the site. */
export function AccentRule({ className, center }: { className?: string; center?: boolean }) {
  return <span aria-hidden className={cn("block h-px w-12 bg-teal", center && "mx-auto", className)} />;
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
  tone?: "dark" | "light";
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  as: Tag = "h2",
  className,
  tone = "dark",
}: SectionHeadingProps) {
  const center = align === "center";
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("eyebrow mb-4", tone === "dark" ? "text-teal" : "text-teal-deep")}>{eyebrow}</p>
      )}
      <Tag
        className={cn(
          "display",
          Tag === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl lg:text-[2.75rem]"
        )}
      >
        {title}
      </Tag>
      <AccentRule center={center} className="mt-6" />
      {intro && (
        <p
          className={cn(
            "mt-6 text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-ink-200" : "text-stone/70"
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
