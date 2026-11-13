import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource/merriweather/latin-300.css";
import "@fontsource-variable/manrope/index.css";
import "./(site)/globals.css";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

// Shown for any unmatched URL (the site and the admin have separate root layouts).
export const metadata: Metadata = {
  title: "Page not found | Transition VC",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en-IN">
      <body>
        <main className="grid min-h-svh place-items-center bg-surface px-5 text-center">
          <div className="container-site">
            <Link href="/" className="inline-block text-ink" aria-label="Transition VC home">
              <Logo />
            </Link>
            <p className="eyebrow mt-16 text-teal-ink">Error 404</p>
            <h1 className="display mt-4 text-4xl text-ink sm:text-5xl">Page not found</h1>
            <p className="mx-auto mt-6 max-w-md text-muted">
              This page doesn&rsquo;t exist or has moved. Check the address, or use the links below.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/">Go to home</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Contact us
              </ButtonLink>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
