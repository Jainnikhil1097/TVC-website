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
        <main className="starfield grid min-h-svh place-items-center text-center">
          <div className="container-site">
            <Link href="/" className="inline-block text-white" aria-label="Transition VC home">
              <Logo />
            </Link>
            <p className="eyebrow mt-16 text-teal">404</p>
            <h1 className="display mt-4 text-5xl sm:text-6xl">Lost in orbit</h1>
            <p className="mx-auto mt-6 max-w-md text-ink-300">
              The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
            </p>
            <div className="mt-10 flex justify-center gap-3">
              <ButtonLink href="/">Back home</ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Contact us
              </ButtonLink>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
