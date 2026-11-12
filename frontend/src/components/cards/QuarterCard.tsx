import type { ChangeDirection, ChangeTone } from "@/lib/calculations";
import { cn } from "@/lib/utils";

interface QuarterCardProps {
  label: string;
  value: string | null;
  changePct?: string;
  changeTone?: ChangeTone;
  changeArrow?: ChangeDirection;
  changeCaption?: string;
  isSelected?: boolean;
}

export function QuarterCard({
  label,
  value,
  changePct,
  changeTone,
  changeArrow,
  changeCaption,
  isSelected = false,
}: QuarterCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white px-5 py-4 transition-shadow",
        isSelected ? "border-brand-blue ring-2 ring-brand-blue/25" : "border-line"
      )}
    >
      <p className="text-[11px] font-semibold text-ink">{label}</p>
      <p className="mt-1.5 text-[20px] font-bold leading-6 text-ink">{value ?? "—"}</p>
      {value && changePct ? (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              changeTone === "positive" && "bg-positive-bg text-positive",
              changeTone === "negative" && "bg-negative-bg text-negative",
              changeTone === "neutral" && "bg-grid text-muted"
            )}
          >
            {changeArrow === "up" && "▲ "}
            {changeArrow === "down" && "▼ "}
            {changePct}
          </span>
          {changeCaption && <span className="text-[10px] text-muted">{changeCaption}</span>}
        </div>
      ) : null}
    </div>
  );
}
