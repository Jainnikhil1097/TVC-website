"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { nav } from "@/lib/site-config";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

export function Nav({ investorLoginUrl, email }: { investorLoginUrl?: string; email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const investorHref = investorLoginUrl || "/contact?type=investor";

  return (
    <header className="fixed inset-x-0 top-[var(--banner-h,0px)] z-50">
      <div
        className={cn(
          "transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open ? "glass border-x-0 border-t-0" : "border-b border-transparent"
        )}
      >
        <nav aria-label="Main" className="container-site flex h-16 items-center justify-between lg:h-[4.5rem]">
          <Link href="/" className="text-white" aria-label="Transition VC home">
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
                      "relative px-3 py-2 text-[0.82rem] font-medium tracking-wide transition-colors",
                      active ? "text-white" : "text-white/65 hover:text-white"
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-3 -bottom-0.5 h-px bg-teal transition-transform duration-500 ease-out-expo",
                        active ? "scale-x-100" : "scale-x-0"
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={investorHref}
              {...(investorLoginUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="hidden min-h-10 items-center gap-1.5 rounded-full bg-white px-5 text-[0.75rem] font-semibold tracking-[0.08em] text-ink-950 uppercase transition-colors hover:bg-teal-soft sm:inline-flex"
            >
              Investor Login <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid size-11 place-items-center rounded-full text-white lg:hidden"
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
        className="fixed inset-x-0 top-[calc(4rem+var(--banner-h,0px))] bottom-0 overflow-y-auto bg-ink-950/97 backdrop-blur-xl lg:hidden"
      >
        <div className="container-site flex min-h-full flex-col py-8">
          <a
            href={investorHref}
            {...(investorLoginUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            onClick={() => setOpen(false)}
            className="mb-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold tracking-[0.08em] text-ink-950 uppercase"
          >
            Investor Login <ArrowUpRight className="size-4" aria-hidden />
          </a>
          <ul className="divide-y divide-white/8 border-y border-white/8">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center justify-between font-serif text-2xl font-light text-white"
                >
                  {item.label}
                  {pathname === item.href && <span className="h-px w-8 bg-teal" aria-hidden />}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-auto pt-10 text-sm text-ink-300">{email}</p>
        </div>
      </div>
    </header>
  );
}
