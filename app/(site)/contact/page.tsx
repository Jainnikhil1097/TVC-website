import type { Metadata } from "next";
import { Suspense } from "react";
import { getSite } from "@/lib/cms";
import { contactIntro } from "@/lib/forms";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { ContactTabs, ContactTabsFromParams } from "@/components/contact/ContactTabs";
import { ContactDetails } from "@/components/contact/ContactDetails";

export const revalidate = 3600;

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("contact", {
    title: "Contact",
    description:
      "Pitch to Transition VC, enquire about our funds, or partner with India's first energy-transition venture fund.",
  });
}

export default async function ContactPage() {
  const site = await getSite();

  return (
    <>
      <PageHero eyebrow="Contact" title="Contact Us" intro={contactIntro} />

      <section className="container-site grid gap-10 pb-24 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
        <Reveal className="rounded-3xl border border-white/8 bg-ink-800/70 p-5 sm:p-10">
          <p className="eyebrow text-teal">Contact us</p>
          <h2 className="display mt-3 mb-8 text-3xl sm:text-4xl">Get in touch</h2>
          {/* Static prerender shows the default tab; ?type= selects another once hydrated. */}
          <Suspense fallback={<ContactTabs />}>
            <ContactTabsFromParams />
          </Suspense>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactDetails site={site} />
        </Reveal>
      </section>
    </>
  );
}
