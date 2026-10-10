"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, X } from "lucide-react";

type Props = { id: string; message: string; link?: { label: string; href: string } };

const STORAGE_KEY = "tvc-announcement-dismissed";

// The dismissed message id lives in localStorage; read it as an external store so
// the server render (no storage) and other tabs stay consistent.
const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const readDismissed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * Slim site-wide banner above the nav, controlled from the CMS ("Announcement bar").
 * Its height is exposed as --banner-h so the fixed nav and page content sit below it.
 * Dismissal is remembered per message, so a new announcement shows again.
 */
export function AnnouncementBar({ id, message, link }: Props) {
  const dismissedId = useSyncExternalStore(subscribe, readDismissed, () => null);
  const [dismissedNow, setDismissedNow] = useState(false);
  const hidden = dismissedNow || dismissedId === id;

  useEffect(() => {
    document.documentElement.style.setProperty("--banner-h", hidden ? "0px" : "2.5rem");
  }, [hidden]);

  if (hidden) return null;

  const dismiss = () => {
    setDismissedNow(true);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  };

  const external = link && /^https?:/.test(link.href);

  return (
    <div className="fixed inset-x-0 top-0 z-[55] flex h-10 items-center border-b border-teal/20 bg-ink-950 text-[0.8rem] text-white">
      {/* Sets the offset before hydration so there's no layout shift. */}
      <style>{`:root{--banner-h:2.5rem}`}</style>
      <div className="container-site flex items-center justify-center gap-3 pr-10">
        <span className="size-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
        <p className="truncate">{message}</p>
        {link &&
          (external ? (
            <a href={link.href} target="_blank" rel="noopener noreferrer" className="hidden shrink-0 items-center gap-1 font-semibold text-teal hover:underline sm:inline-flex">
              {link.label} <ArrowRight className="size-3.5" aria-hidden />
            </a>
          ) : (
            <Link href={link.href} className="hidden shrink-0 items-center gap-1 font-semibold text-teal hover:underline sm:inline-flex">
              {link.label} <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ))}
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 grid size-9 place-items-center rounded-full text-white/60 hover:text-white"
        aria-label="Dismiss announcement"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
