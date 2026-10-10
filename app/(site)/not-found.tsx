import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="starfield grid min-h-[80svh] place-items-center pt-24 text-center">
      <div className="container-site">
        <p className="eyebrow text-teal">404</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">Lost in orbit</h1>
        <p className="mx-auto mt-6 max-w-md text-ink-300">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <ButtonLink href="/">Back home</ButtonLink>
          <Link href="/contact" className="inline-flex min-h-11 items-center px-4 text-sm text-ink-200 hover:text-teal">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
