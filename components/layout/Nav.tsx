"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { nav, pitchHref } from "@/lib/site-config";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { basePath } from "@/lib/base-path";

/**
 * Light by default; transparent with white text while it sits over a dark hero
 * (any element marked `data-nav-dark`, e.g. the home globe), then white once
 * a `data-nav-cover` section slides over it or
 * the visitor scrolls past it.
 */
export function Nav({ investorLoginUrl, email }: { investorLoginUrl?: string; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 8);
      const hero = document.querySelector<HTMLElement>("[data-nav-dark]");
      // A section that slides over a sticky hero ends the dark zone when it reaches the nav.
      const cover = document.querySelector<HTMLElement>("[data-nav-cover]");
      const covered = Boolean(cover && cover.getBoundingClientRect().top <= 72);
      setOverDark(Boolean(hero && hero.getBoundingClientRect().bottom > 72 && !covered));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const dark = overDark && !open;
  // A plain <a> (it may be an external portal), so the preview's sub-folder is added by hand.
  const investorHref = investorLoginUrl || `${basePath}/contact?type=investor`;
  const investorProps = investorLoginUrl ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    // bg-transparent: data-theme="dark" would otherwise paint the band colour (globals.css) and
    // show as a solid bar over the hero; the inner bar below owns the light-mode background.
    <header className="fixed inset-x-0 top-[var(--banner-h,0px)] z-50 bg-transparent [view-transition-name:site-nav]" data-theme={dark ? "dark" : undefined}>
      <div
        className={cn(
          "border-b transition-[background-color,border-color] duration-300",
          dark
            ? "border-transparent bg-transparent text-white"
            : cn(
                "text-ink",
                scrolled || open
                  ? "border-line bg-white/90 backdrop-blur-md"
                  : "border-transparent bg-white/70 backdrop-blur-sm"
              )
        )}
      >
        <nav aria-label="Main" className="container-site flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
          <Link href="/" aria-label="Transition VC home" className="shrink-0">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative px-3 py-2 text-[0.9rem] font-medium transition-colors",
                      dark
                        ? active
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                        : active
                          ? "text-ink"
                          : "text-muted hover:text-ink"
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-3 -bottom-0.5 h-px transition-transform duration-500 ease-out-expo",
                        dark ? "bg-teal" : "bg-teal-ink",
                        active ? "scale-x-100" : "scale-x-0"
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1 sm:gap-3">
            <a
              href={investorHref}
              {...investorProps}
              className={cn(
                "hidden items-center gap-1 px-2 py-2 text-[0.85rem] font-medium transition-colors md:inline-flex",
                dark ? "text-white/70 hover:text-white" : "text-muted hover:text-ink"
              )}
            >
              Investor login <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
            <Link
              href={pitchHref}
              className={cn(
                "hidden min-h-10 items-center rounded-full px-5 text-[0.85rem] font-semibold transition-colors sm:inline-flex",
                dark ? "bg-white text-ink hover:bg-teal-soft" : "bg-ink text-white hover:bg-teal-ink"
              )}
            >
              Pitch to us
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid size-11 place-items-center rounded-full lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 top-[calc(4rem+var(--banner-h,0px))] bottom-0 overflow-y-auto bg-white text-ink lg:hidden"
      >
        <div className="container-site flex min-h-full flex-col py-8">
          <ul className="divide-y divide-line border-y border-line">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center justify-between font-serif text-2xl font-light"
                >
                  {item.label}
                  {pathname === item.href && <span className="h-px w-8 bg-teal-ink" aria-hidden />}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3">
            <Link
              href={pitchHref}
              onClick={() => setOpen(false)}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink text-[0.95rem] font-semibold text-white"
            >
              Pitch to us
            </Link>
            <a
              href={investorHref}
              {...investorProps}
              onClick={() => setOpen(false)}
              className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-line text-[0.95rem] font-medium"
            >
              Investor login <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
          <p className="mt-auto pt-10 text-sm text-muted">{email}</p>
        </div>
      </div>
    </header>
  );
}
