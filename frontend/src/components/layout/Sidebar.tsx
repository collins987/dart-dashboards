"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  Wallet,
  ChevronDown,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENT_USER } from "@/lib/constants";
import { SIGNED_OUT_PATH } from "@/lib/session";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/finance/overview",
    icon: LayoutDashboard,
    activeText: "text-brand-blue",
    activePill: "bg-tint-blue",
    activeTile: "bg-brand-blue",
    indicator: "bg-brand-blue",
  },
  {
    label: "Revenue",
    href: "/finance/revenue",
    icon: TrendingUp,
    activeText: "text-brand-primary",
    activePill: "bg-tint-teal",
    activeTile: "bg-brand-primary",
    indicator: "bg-brand-primary",
  },
  {
    label: "Expenses",
    href: "/finance/expenses",
    icon: CreditCard,
    activeText: "text-brand-secondary",
    activePill: "bg-tint-pink",
    activeTile: "bg-brand-secondary",
    indicator: "bg-brand-secondary",
  },
] as const;

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(true);

  const groupActive = NAV_ITEMS.some((item) => pathname === item.href);

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col border-r border-line bg-white transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[76px]" : "w-[244px]"
      )}
    >
      {/* Collapse control */}
      <div className={cn("flex pt-3", collapsed ? "justify-center px-2" : "justify-end px-3")}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-grid hover:text-ink"
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {/* Finance — main menu */}
        <button
          onClick={() => (collapsed ? setCollapsed(false) : setFinanceOpen(!financeOpen))}
          title="Finance"
          className={cn(
            "flex w-full items-center rounded-xl py-2 text-[13px] font-semibold transition-colors",
            collapsed ? "justify-center px-0" : "gap-3 px-2",
            groupActive ? "text-ink" : "text-body hover:bg-grid/60"
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
              groupActive ? "bg-brand-blue text-white" : "bg-grid text-ink"
            )}
          >
            <Wallet size={17} strokeWidth={2} />
          </span>
          {!collapsed && (
            <>
              <span>Finance</span>
              <ChevronDown
                size={15}
                className={cn(
                  "ml-auto text-muted transition-transform duration-200",
                  !financeOpen && "-rotate-90"
                )}
              />
            </>
          )}
        </button>

        {/* Submenus */}
        {(financeOpen || collapsed) && (
          <nav className={cn("mt-1 flex flex-col gap-1", collapsed ? "" : "pl-3")}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "relative flex items-center rounded-xl text-[13px] transition-colors",
                    collapsed ? "justify-center px-0 py-1.5" : "gap-3 px-2 py-1.5",
                    isActive
                      ? `${item.activePill} ${item.activeText} font-semibold`
                      : "text-body font-medium hover:bg-grid/60"
                  )}
                >
                  {isActive && !collapsed && (
                    <span
                      className={cn(
                        "absolute -left-3 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full",
                        item.indicator
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                      isActive ? `${item.activeTile} text-white` : "bg-grid text-muted"
                    )}
                  >
                    <Icon size={16} />
                  </span>
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* User card */}
      <div className="border-t border-line p-3">
        <div
          className={cn(
            "flex items-center rounded-xl bg-grid/60",
            collapsed ? "justify-center p-1.5" : "gap-3 p-2.5"
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tint-teal text-[12px] font-bold text-brand-blue">
            {initials(CURRENT_USER.name)}
          </span>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink">
                  {CURRENT_USER.name}
                </p>
                <p className="truncate text-[11px] text-muted">{CURRENT_USER.email}</p>
              </div>
              <button
                type="button"
                onClick={() => router.push(SIGNED_OUT_PATH)}
                title="Sign out"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-white hover:text-ink"
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
