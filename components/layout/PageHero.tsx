import type { ReactNode } from "react";
import { AccentRule } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

/** Standard dark hero for inner pages. Headline is never hidden, so it's a safe LCP element. */
export function PageHero({ eyebrow, title, intro, children, align = "left", className }: PageHeroProps) {
  const center = align === "center";
  return (
    <section
      className={cn(
        "starfield relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[70%] before:bg-[radial-gradient(60%_80%_at_50%_0%,rgb(14_213_194/0.08),transparent_70%)]",
        className
      )}
    >
      <div className={cn("container-site relative", center && "text-center")}>
        <p className="eyebrow text-teal">{eyebrow}</p>
        <h1 className={cn("display mt-5 max-w-4xl text-[2.6rem] sm:text-6xl lg:text-7xl", center && "mx-auto")}>
          {title}
        </h1>
        <AccentRule center={center} className="mt-8" />
        {intro && (
          <p className={cn("mt-8 max-w-2xl text-base leading-relaxed text-ink-200 sm:text-lg", center && "mx-auto")}>
            {intro}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
