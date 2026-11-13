import { cn } from "@/lib/utils";

type StatTileProps = {
  value: string;
  label: string;
  note?: string;
  tone?: "dark" | "light";
  className?: string;
};

export function StatTile({ value, label, note, tone = "light", className }: StatTileProps) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "rounded-2xl p-6 sm:p-7",
        dark ? "border border-white/8 bg-white/[0.03]" : "border border-line bg-surface",
        className
      )}
    >
      <p className={cn("display text-4xl sm:text-5xl", dark ? "text-white" : "text-ink")}>{value}</p>
      <p className={cn("eyebrow mt-4", dark ? "text-ink-200" : "text-muted")}>{label}</p>
      {note && <p className={cn("mt-2 text-xs", dark ? "text-ink-400" : "text-muted")}>{note}</p>}
    </div>
  );
}
