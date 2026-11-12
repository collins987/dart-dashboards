"use client";

import type { LucideIcon } from "lucide-react";
import type { ChangeTone, ChangeDirection } from "@/lib/calculations";
import { cn } from "@/lib/utils";

interface OverviewKpiCardProps {
  variant: "overview";
  label: string;
  value: string;
  icon: LucideIcon;
  iconTint: string;
  iconColor: string;
  changePct?: string;
  changeTone?: ChangeTone;
  changeArrow?: ChangeDirection;
  changeCaption?: string;
  neutralCaption?: string;
}

interface AnalysisKpiCardProps {
  variant: "analysis";
  label: string;
  value: string;
  borderColor: string;
  /** When set, the value is coloured and prefixed with an arrow (growth cards). */
  valueTone?: ChangeTone;
  valueArrow?: ChangeDirection;
}

export type KpiCardProps = OverviewKpiCardProps | AnalysisKpiCardProps;

export function KpiCard(props: KpiCardProps) {
  if (props.variant === "analysis") {
    return (
      <div className="relative overflow-hidden rounded-xl bg-white px-6 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <span
          className="absolute left-0 top-0 h-full w-[5px]"
          style={{ backgroundColor: props.borderColor }}
        />
        <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">
          {props.label}
        </p>
        <p
          className={cn(
            "mt-2 text-[22px] font-bold leading-7 tracking-tight",
            props.valueTone === "positive" && "text-positive",
            props.valueTone === "negative" && "text-negative",
            (!props.valueTone || props.valueTone === "neutral") && "text-ink"
          )}
        >
          {props.valueArrow === "up" && "▲ "}
          {props.valueArrow === "down" && "▼ "}
          {props.value}
        </p>
      </div>
    );
  }

  const Icon = props.icon;
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-line bg-white px-5 py-5">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: props.iconTint }}
      >
        <Icon size={22} strokeWidth={1.8} style={{ color: props.iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">
          {props.label}
        </p>
        <p className="mt-1 text-[24px] leading-8 font-bold tracking-tight text-ink">{props.value}</p>
        {props.neutralCaption ? (
          <span className="mt-2 inline-block rounded-full bg-grid px-2.5 py-0.5 text-[11px] font-medium text-muted">
            {props.neutralCaption}
          </span>
        ) : props.changePct ? (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                props.changeTone === "positive" && "bg-positive-bg text-positive",
                props.changeTone === "negative" && "bg-negative-bg text-negative",
                props.changeTone === "neutral" && "bg-grid text-muted"
              )}
            >
              {props.changeArrow === "up" && "▲ "}
              {props.changeArrow === "down" && "▼ "}
              {props.changePct}
            </span>
            {props.changeCaption && (
              <span className="text-[11px] text-muted">{props.changeCaption}</span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
