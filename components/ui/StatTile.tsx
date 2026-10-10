import { cn } from "@/lib/utils";

type StatTileProps = {
  value: string;
  label: string;
  note?: string;
  tone?: "dark" | "light";
  className?: string;
};

export function StatTile({ value, label, note, tone = "dark", className }: StatTileProps) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "rounded-2xl p-6 sm:p-7",
        dark ? "border border-white/8 bg-white/[0.03]" : "bg-white",
        className
      )}
    >
      <p className={cn("display text-4xl sm:text-5xl", dark ? "text-white" : "text-stone")}>{value}</p>
      <p className={cn("eyebrow mt-4", dark ? "text-ink-200" : "text-stone/70")}>{label}</p>
      {note && <p className={cn("mt-2 text-xs", dark ? "text-ink-400" : "text-stone/50")}>{note}</p>}
    </div>
  );
}
