import type { Metadata } from "next";
import { getJobs, getSite } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RoleList } from "@/components/careers/RoleList";
import { CvForm } from "@/components/careers/CvForm";

export const revalidate = 3600;

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("careers", {
    title: "Careers",
    description: "Join Transition VC and help back the engineers building India's energy future.",
  });
}

const careersIntro =
  "We're a small team backing the engineers building India's energy future. If you want to work at the intersection of deep technology, capital and climate, we'd like to hear from you.";

export default async function CareersPage() {
  const [roles, site] = await Promise.all([getJobs(), getSite()]);

  return (
    <>
      <PageHero eyebrow="Careers" title="Build India's energy future with us" intro={careersIntro} />

      <section className="container-site pb-20 sm:pb-24">
        <SectionHeading eyebrow="Open roles" title="Current openings" />
        <RoleList roles={roles} email={site.contact.email} />
      </section>

      <section className="border-t border-white/8 bg-ink-950/40">
        <div className="container-site grid gap-10 py-20 sm:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <SectionHeading
            eyebrow="Talent network"
            title="Don't see the right role?"
            intro="We're always looking to connect with exceptional talent. Share your CV and we'll reach out if a suitable opportunity becomes available."
          />
          <Reveal className="rounded-3xl border border-white/8 bg-ink-800/70 p-5 sm:p-10">
            <CvForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
