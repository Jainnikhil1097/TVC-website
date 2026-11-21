import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import type { Site } from "@/lib/cms";
import { OfficeMap } from "./OfficeMap";

type ContactInfo = Pick<Site, "contact" | "socials">;

export function ContactDetails({ site }: { site: ContactInfo }) {
  return (
    <div className="space-y-8">
      <p className="leading-relaxed text-muted">
        Whether you&rsquo;re a founder building in energy, an investor exploring our funds, or a partner in the
        ecosystem — write to us and the right person on our team will respond.
      </p>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-5">
          <dt className="flex items-center gap-3 text-sm font-bold text-ink">
            <span className="grid size-9 place-items-center rounded-full border border-line bg-white text-teal-ink">
              <Mail className="size-4" aria-hidden />
            </span>
            General Enquiries
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
          <dt className="flex items-center gap-3 text-sm font-bold text-ink">
            <span className="grid size-9 place-items-center rounded-full border border-line bg-white text-teal-ink">
              <MapPin className="size-4" aria-hidden />
            </span>
            {site.contact.offices.length > 1 ? "Our offices" : "Our office"}
          </dt>
          <dd className="mt-3 space-y-3 text-sm leading-relaxed text-ink/80">
            {site.contact.offices.map((office) => (
              <address key={office.name} className="not-italic">
                {office.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            ))}
          </dd>
        </div>
      </dl>

      {site.contact.offices.length > 0 && <OfficeMap offices={site.contact.offices} />}

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
