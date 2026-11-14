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
      <PageHero art="dots" eyebrow="Contact" title="Get in touch" intro={contactIntro} />

      <section className="container-site grid gap-10 pt-12 pb-24 sm:pt-16 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
        <Reveal className="rounded-3xl border border-line bg-white p-5 shadow-[0_8px_40px_rgb(10_30_63/0.05)] sm:p-10">
          <h2 className="display mb-8 text-3xl text-ink sm:text-4xl">Send us a message</h2>
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
