import Image from "next/image";
import { cn, initials } from "@/lib/utils";

type AvatarProps = {
  name: string;
  photo?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Portrait with a graceful fallback: until headshots are supplied, shows
 * initials on a subtle graded tile so layouts are final from day one.
 */
export function Avatar({ name, photo, className, sizes = "160px", priority }: AvatarProps) {
  return (
    <div className={cn("@container relative overflow-hidden bg-surface in-data-[theme=dark]:bg-ink-700", className)}>
      {photo ? (
        <Image src={photo} alt={name} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_90%_at_30%_20%,#ffffff_0%,#e6ecf0_75%)] in-data-[theme=dark]:bg-[radial-gradient(120%_90%_at_30%_20%,#2b313b_0%,#12161d_70%)]"
        >
          <span className="display text-[28cqw] text-ink/25 in-data-[theme=dark]:text-white/35">
            {initials(name)}
          </span>
        </div>
      )}
    </div>
  );
}
