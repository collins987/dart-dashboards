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
    activeBg: "bg-tint-blue",
    indicator: "bg-brand-blue",
  },
  {
    label: "Revenue",
    href: "/finance/revenue",
    icon: TrendingUp,
    activeText: "text-brand-primary",
    activeBg: "bg-tint-teal",
    indicator: "bg-brand-primary",
  },
  {
    label: "Expenses",
    href: "/finance/expenses",
    icon: CreditCard,
    activeText: "text-brand-secondary",
    activeBg: "bg-tint-pink",
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
        collapsed ? "w-[72px]" : "w-[248px]"
      )}
    >
      {/* Collapse control */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-line",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {!collapsed && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Menu
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-grid hover:text-ink"
        >
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {/* Finance — section parent */}
        <button
          onClick={() => (collapsed ? setCollapsed(false) : setFinanceOpen(!financeOpen))}
          title="Finance"
          className={cn(
            "flex w-full items-center rounded-lg text-[13px] font-semibold transition-colors",
            collapsed ? "h-10 justify-center px-0" : "h-10 gap-3 px-3",
            groupActive ? "text-ink" : "text-body hover:bg-grid"
          )}
        >
          <Wallet
            size={18}
            strokeWidth={2}
            className={cn("shrink-0", groupActive ? "text-brand-blue" : "text-muted")}
          />
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

        {/* Nav items */}
        {(financeOpen || collapsed) && (
          <nav className={cn("mt-1.5 flex flex-col gap-0.5", collapsed ? "" : "pl-2")}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center rounded-lg text-[13px] transition-colors",
                    collapsed ? "h-10 justify-center px-0" : "h-10 gap-3 px-3",
                    isActive
                      ? `${item.activeBg} ${item.activeText} font-semibold`
                      : "font-medium text-body hover:bg-grid"
                  )}
                >
                  {isActive && (
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full",
                        item.indicator
                      )}
                    />
                  )}
                  <Icon
                    size={18}
                    className={cn("shrink-0", isActive ? item.activeText : "text-muted")}
                  />
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
            "flex items-center rounded-lg transition-colors hover:bg-grid",
            collapsed ? "justify-center p-1.5" : "gap-3 p-2.5"
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue text-[12px] font-bold text-white">
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
                aria-label="Sign out"
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
