import {
  Cog,
  Coins,
  Factory,
  Handshake,
  Hourglass,
  MapPin,
  Microscope,
  Network,
  PlugZap,
  Sprout,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { PillarIcon } from "@/lib/pillar-icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

const ICONS: Record<PillarIcon, LucideIcon> = {
  engineering: Cog,
  research: Microscope,
  india: MapPin,
  capital: Coins,
  "long-term": Hourglass,
  partnership: Handshake,
  network: Network,
  speed: Zap,
  industry: Factory,
  energy: PlugZap,
  growth: Sprout,
  focus: Target,
};

type Pillar = { title: string; text: string; icon: PillarIcon };

/** "Why founders choose us" — short, scannable pillars (edited in CMS → Home page). */
export function FounderPillars({ pillars }: { pillars: Pillar[] }) {
  if (!pillars.length) return null;
  return (
    <section aria-labelledby="pillars-title" className="border-y border-line bg-surface py-20 sm:py-28">
      <div className="container-site">
        <SectionHeading eyebrow="For founders" title={<span id="pillars-title">Why founders choose us</span>} />
        <Reveal
          as="ul"
          stagger={0.07}
          className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5"
        >
          {pillars.map((p) => {
            const Icon = ICONS[p.icon] ?? Cog;
            return (
              <li key={p.title} data-reveal className="flex flex-col bg-white p-7">
                <span className="grid size-11 place-items-center rounded-full bg-teal/10 text-teal-ink">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-6 text-lg font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{p.text}</p>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
