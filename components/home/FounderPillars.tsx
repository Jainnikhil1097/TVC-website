import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { FounderSpiral, type Pillar } from "./FounderSpiral";

/**
 * "Why founders choose us": the team's points as a spiral staircase, each heading opening
 * its details in a pop-up (edited in CMS → Home page → Why founders choose us).
 */
export function FounderPillars({ pillars }: { pillars: (Pillar & { icon?: string })[] }) {
  if (!pillars.length) return null;
  return (
    <section aria-labelledby="pillars-title" className="border-y border-line bg-surface py-20 sm:py-28">
      <div className="container-site">
        <SectionHeading
          eyebrow="For founders"
          title={<span id="pillars-title">Why founders choose us</span>}
          intro="What we bring alongside capital, step by step. Select any point for the detail."
        />
        <Reveal className="mt-12 sm:mt-16">
          <FounderSpiral pillars={pillars.map(({ title, text, points }) => ({ title, text, points }))} />
        </Reveal>
      </div>
    </section>
  );
}
