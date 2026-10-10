import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Site } from "@/lib/cms";
import { getFunds } from "@/lib/cms";
import { nav } from "@/lib/site-config";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { AccentRule } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

export async function Footer({ site }: { site: Site }) {
  const year = new Date().getFullYear();
  const funds = await getFunds();

  return (
    <footer className="relative border-t border-white/8 bg-ink-950 text-white">
      {/* Newsletter CTA */}
      <Reveal className="container-site grid gap-8 py-16 md:grid-cols-[1.4fr_1fr] md:items-end md:py-20">
        <div>
          <h2 className="display text-3xl sm:text-4xl">{site.footerHeadline}</h2>
          <AccentRule className="mt-6" />
          <p className="mt-6 max-w-md text-ink-300">{site.newsletterBlurb}</p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <ButtonLink href={site.substackUrl}>Subscribe on Substack</ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Get in touch
          </ButtonLink>
        </div>
      </Reveal>

      <div className="container-site grid gap-10 border-t border-white/8 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-300">
            India&rsquo;s first energy-transition venture fund.
          </p>
        </div>

        <div>
          <h3 className="eyebrow text-ink-400">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-200 transition-colors hover:text-teal">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-ink-400">Our office</h3>
          <address className="mt-4 text-sm leading-relaxed text-ink-200 not-italic">
            {site.contact.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <a
              href={`mailto:${site.contact.email}`}
              className="mt-3 block text-white underline decoration-white/25 underline-offset-4 hover:decoration-teal"
            >
              {site.contact.email}
            </a>
          </address>
        </div>

        <div>
          <h3 className="eyebrow text-ink-400">Follow</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[...site.socials, { label: "Substack", href: site.substackUrl }].map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-ink-200 transition-colors hover:text-teal"
                >
                  {s.label} <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Regulatory disclosures */}
      <div className="container-site border-t border-white/8 py-10">
        <h3 className="eyebrow text-ink-400">SEBI-registered funds</h3>
        <ul className="mt-5 grid gap-x-8 gap-y-4 text-xs leading-relaxed text-ink-300 sm:grid-cols-2 lg:grid-cols-4">
          {funds.map((f) => (
            <li key={f.sebiRegistration}>
              <span className="block text-ink-200">{f.name}</span>
              {f.category} · {f.sebiRegistration}
              <span className="block text-ink-400">Manager: {f.manager}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-site flex flex-col gap-4 border-t border-white/8 py-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {site.legalName}. All rights reserved.
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {site.policies.map((p) => (
            <li key={p.href}>
              <a href={p.href} className="hover:text-teal" target="_blank" rel="noopener noreferrer">
                {p.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
