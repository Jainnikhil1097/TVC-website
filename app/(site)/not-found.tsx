import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="grid min-h-[80svh] place-items-center bg-surface pt-24 pb-16 text-center">
      <div className="container-site">
        <p className="eyebrow text-teal-ink">Error 404</p>
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
    </section>
  );
}
