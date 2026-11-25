import type { Metadata, Viewport } from "next";
// Brand Book typography, self-hosted (all OFL):
//   headlines: Inter · body & interface: Calibri → Carlito (its free, metric-identical
//   twin; real Calibri is used where installed) · taglines: Baron → Montserrat (stand-in
//   until licensed Baron web fonts are supplied).
import "@fontsource-variable/inter/wght.css";
import "@fontsource/carlito/400.css";
import "@fontsource/carlito/700.css";
import "@fontsource-variable/montserrat/wght.css";
import "./globals.css";
import { siteIdentity as site } from "@/lib/site-config";
import { isStaticPreview } from "@/lib/base-path";
import { getAnnouncement, getSite } from "@/lib/cms";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { RevealObserver } from "@/components/motion/RevealObserver";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  // Keep the GitHub Pages preview out of search results.
  ...(isStaticPreview && { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

// Runs before first paint: enables reveal animations only when motion is allowed,
// so content is never hidden for reduced-motion or no-JS visitors.
const motionScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-motion')}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [cms, announcement] = await Promise.all([getSite(), getAnnouncement()]);
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-ink-950"
        >
          Skip to content
        </a>
        <SmoothScroll>
          {announcement && <AnnouncementBar {...announcement} />}
          <Nav investorLoginUrl={cms.investorLoginUrl} email={cms.contact.email} />
          <main id="main">{children}</main>
          <Footer site={cms} />
          <RevealObserver />
        </SmoothScroll>
      </body>
    </html>
  );
}
