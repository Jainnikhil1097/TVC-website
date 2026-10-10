import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import type { Site } from "@/lib/cms";

type ContactInfo = Pick<Site, "contact" | "socials">;

// Approximate coordinates of the Domlur office, shown as a HUD label.
const coords = "12.961° N · 77.639° E";

/** Lightweight schematic map tile — pure SVG, no third-party map embed. */
function MapCard({ mapUrl }: { mapUrl: string }) {
  return (
    <a
      href={mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-3xl border border-white/8 bg-ink-800 transition-colors hover:border-teal/40"
    >
      <div className="blueprint-grid relative aspect-[16/10]">
        <svg
          viewBox="0 0 400 250"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 size-full"
          fill="none"
          aria-hidden
        >
          {/* Secondary streets */}
          <g stroke="rgb(255 255 255 / 0.08)" strokeWidth="1">
            <path d="M-10 60 L410 40" />
            <path d="M-10 170 L410 200" />
            <path d="M80 -10 L60 260" />
            <path d="M300 -10 L330 260" />
            <path d="M-10 220 C120 190 180 230 410 150" />
            <path d="M150 -10 C170 80 140 160 190 260" />
          </g>
          {/* Arterial roads */}
          <g stroke="rgb(255 255 255 / 0.16)" strokeWidth="2.5">
            <path d="M-10 118 C120 100 250 140 410 110" />
            <path d="M232 -10 C220 80 250 170 236 260" />
          </g>
          {/* A park / lake block */}
          <path d="M40 190 q30 -24 64 -6 t40 30 q-40 22 -104 -24z" fill="rgb(14 213 194 / 0.06)" stroke="rgb(14 213 194 / 0.18)" />
          {/* Route to the office */}
          <path d="M-10 118 C120 100 180 118 226 118" stroke="rgb(14 213 194 / 0.55)" strokeWidth="1.5" strokeDasharray="4 5" />
        </svg>

        <span className="absolute top-[47%] left-[56.5%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
          <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-teal/25" />
          <span className="relative block size-3.5 rounded-full border-2 border-ink-900 bg-teal shadow-[0_0_20px_rgb(14_213_194/0.6)]" />
        </span>

        <p className="hud absolute top-4 left-4 text-teal">Domlur · Bengaluru</p>
        <p className="hud absolute bottom-4 left-4 text-ink-300">{coords}</p>
      </div>
      <div className="flex min-h-12 items-center justify-between px-5 py-3 text-sm text-ink-200 group-hover:text-teal">
        Open in Google Maps <ArrowUpRight className="size-4" aria-hidden />
      </div>
    </a>
  );
}

export function ContactDetails({ site }: { site: ContactInfo }) {
  return (
    <div className="space-y-8">
      <p className="leading-relaxed text-ink-200">
        Whether you&rsquo;re a founder building in energy, an investor exploring our funds, or a partner in the
        ecosystem — write to us and the right person on our team will respond.
      </p>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
          <dt className="flex items-center gap-3 text-sm font-semibold text-white">
            <span className="grid size-9 place-items-center rounded-full border border-white/12 text-teal">
              <Mail className="size-4" aria-hidden />
            </span>
            Email
          </dt>
          <dd className="mt-3 text-sm">
            <a
              href={`mailto:${site.contact.email}`}
              className="break-all text-ink-200 underline decoration-white/20 underline-offset-4 hover:text-teal hover:decoration-teal"
            >
              {site.contact.email}
            </a>
          </dd>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
          <dt className="flex items-center gap-3 text-sm font-semibold text-white">
            <span className="grid size-9 place-items-center rounded-full border border-white/12 text-teal">
              <MapPin className="size-4" aria-hidden />
            </span>
            Our office
          </dt>
          <dd className="mt-3 text-sm leading-relaxed text-ink-200">
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

      {site.contact.mapUrl && <MapCard mapUrl={site.contact.mapUrl} />}

      <div>
        <p className="eyebrow text-ink-400">Follow</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {site.socials.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 rounded-full border border-white/12 px-4 text-sm text-ink-200 transition-colors hover:border-teal hover:text-teal"
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
