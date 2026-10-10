import { ArrowUpRight } from "lucide-react";
import type { Role } from "@/lib/types";

function applyHref(role: Role, email: string) {
  if (role.applyUrl) return role.applyUrl;
  const subject = encodeURIComponent(`Application: ${role.title}${role.company ? ` (${role.company})` : ""}`);
  return `mailto:${email}?subject=${subject}`;
}

export function RoleCard({ role, email }: { role: Role; email: string }) {
  const external = Boolean(role.applyUrl);
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-colors hover:border-teal/35 sm:p-7">
      <p className="hud text-teal">{role.company ?? "Transition VC"}</p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Role details">
        {[role.function, role.experience, role.location].filter(Boolean).map((tag) => (
          <li key={tag} className="hud rounded-full border border-white/10 px-3 py-1.5 text-ink-300">
            {tag}
          </li>
        ))}
      </ul>
      <h3 className="mt-6 font-serif text-xl leading-snug font-light text-white sm:text-2xl">{role.title}</h3>
      <a
        href={applyHref(role, email)}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-6 text-sm font-semibold tracking-[0.06em] text-white uppercase transition-colors hover:text-teal"
      >
        View role <ArrowUpRight className="size-4" aria-hidden />
        <span className="sr-only">: {role.title}</span>
      </a>
    </article>
  );
}
