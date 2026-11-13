import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { pitchHref } from "@/lib/site-config";

type Faq = { question: string; answer: string };

/**
 * Founder FAQ (edited in CMS → Home page). Native <details> so it works without
 * JavaScript and is fully keyboard accessible; FAQPage structured data lets
 * search engines show the answers directly.
 */
export function FounderFaq({ faq, email }: { faq: Faq[]; email: string }) {
  if (!faq.length) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section aria-labelledby="faq-title" className="border-t border-line py-20 sm:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="For founders"
            title={<span id="faq-title">Questions founders ask us</span>}
            intro="Building in energy? Here's what to expect when you pitch to us."
          />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href={pitchHref}>Pitch to us</ButtonLink>
            {email && (
              <a href={`mailto:${email}`} className="text-sm font-medium text-muted underline underline-offset-4 hover:text-teal-ink">
                {email}
              </a>
            )}
          </div>
        </div>

        <ul className="divide-y divide-line border-y border-line">
          {faq.map((f) => (
            <li key={f.question}>
              <details className="group">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-semibold text-ink marker:hidden hover:text-teal-ink [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <Plus
                    className="size-5 shrink-0 text-teal-ink transition-transform duration-300 group-open:rotate-45"
                    aria-hidden
                  />
                </summary>
                <p className="max-w-2xl pb-6 leading-relaxed text-muted">{f.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
      <script
        type="application/ld+json"
        // JSON.stringify output is safe here; escape "<" so content can't close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </section>
  );
}
