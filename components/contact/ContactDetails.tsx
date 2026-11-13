import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import type { Site } from "@/lib/cms";

type ContactInfo = Pick<Site, "contact" | "socials">;

/**
 * Real, interactive Google Map of the office. The pin is placed by Google from the
 * street address (so it's exact and follows any address change in the CMS). Shown
 * muted to sit with the site's palette, returning to full colour when the visitor
 * interacts with it. Lazy-loaded, so it costs nothing until it's scrolled into view.
 */
function MapCard({ address, mapUrl }: { address: string[]; mapUrl: string }) {
  const query = encodeURIComponent(address.join(", "));
  const embed = `https://www.google.com/maps?q=${query}&z=16&output=embed`;
  return (
    <div className="group overflow-hidden rounded-3xl border border-line bg-white transition-colors focus-within:border-teal-ink/40 hover:border-teal-ink/40">
      <div className="relative aspect-[16/10] border-b border-line bg-surface">
        <iframe
          src={embed}
          title="Map showing the Transition VC office in Domlur, Bengaluru"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 size-full border-0 [filter:saturate(0.25)_contrast(1.04)] transition-[filter] duration-500 group-hover:[filter:none] group-focus-within:[filter:none]"
        />
      </div>
      <a
        href={mapUrl || `https://www.google.com/maps/search/?api=1&query=${query}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-12 items-center justify-between px-5 py-3 text-sm font-medium text-ink hover:text-teal-ink"
      >
        Open in Google Maps <ArrowUpRight className="size-4" aria-hidden />
      </a>
    </div>
  );
}

export function ContactDetails({ site }: { site: ContactInfo }) {
  return (
    <div className="space-y-8">
      <p className="leading-relaxed text-muted">
        Whether you&rsquo;re a founder building in energy, an investor exploring our funds, or a partner in the
        ecosystem — write to us and the right person on our team will respond.
      </p>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <dt className="flex items-center gap-3 text-sm font-semibold text-ink">
            <span className="grid size-9 place-items-center rounded-full border border-line bg-white text-teal-ink">
              <Mail className="size-4" aria-hidden />
            </span>
            Email
          </dt>
          <dd className="mt-3 text-sm">
            <a
              href={`mailto:${site.contact.email}`}
              className="break-all text-ink underline decoration-ink/20 underline-offset-4 hover:text-teal-ink hover:decoration-teal-ink"
            >
              {site.contact.email}
            </a>
          </dd>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5">
          <dt className="flex items-center gap-3 text-sm font-semibold text-ink">
            <span className="grid size-9 place-items-center rounded-full border border-line bg-white text-teal-ink">
              <MapPin className="size-4" aria-hidden />
            </span>
            Our office
          </dt>
          <dd className="mt-3 text-sm leading-relaxed text-ink/80">
            <address className="not-italic">
              {site.contact.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </dd>
        </div>
      </dl>

      {site.contact.address.length > 0 && <MapCard address={site.contact.address} mapUrl={site.contact.mapUrl} />}

      <div>
        <p className="eyebrow text-muted">Follow</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {site.socials.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 rounded-full border border-line bg-white px-4 text-sm text-ink transition-colors hover:border-teal-ink hover:text-teal-ink"
              >
                {s.label} <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
