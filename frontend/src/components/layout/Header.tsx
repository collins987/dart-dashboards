"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Search } from "lucide-react";
import { CURRENT_USER } from "@/lib/constants";
import { SIGNED_OUT_PATH } from "@/lib/session";
import { SEARCHABLE_DASHBOARDS } from "@/search";
import { useFilters } from "@/hooks/useFilters";
import { useCompanies } from "@/hooks/useCompanies";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type SearchResult =
  | { kind: "dashboard"; key: string; title: string; detail: string; href: string }
  | { kind: "company"; key: string; title: string; detail: string; companyId: string };

export function Header() {
  const router = useRouter();
  const { setCompany } = useFilters();
  const { data: companiesResponse } = useCompanies();

  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) setQuery("");
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const needle = query.trim().toLowerCase();
  const results: SearchResult[] = needle
    ? [
        ...SEARCHABLE_DASHBOARDS.filter(
          (d) =>
            d.name.toLowerCase().includes(needle) ||
            d.description.toLowerCase().includes(needle)
        ).map<SearchResult>((d) => ({
          kind: "dashboard",
          key: `dash-${d.url}`,
          title: d.name,
          detail: d.description,
          href: d.url,
        })),
        ...(companiesResponse?.data ?? [])
          .filter(
            (c) =>
              c.name.toLowerCase().includes(needle) ||
              (c.shortName ?? "").toLowerCase().includes(needle)
          )
          .map<SearchResult>((c) => ({
            kind: "company",
            key: `co-${c.id}`,
            title: c.shortName ?? c.name,
            detail: `Show ${c.name} across the dashboards`,
            companyId: c.id,
          })),
      ]
    : [];

  function choose(result: SearchResult) {
    if (result.kind === "company") {
      setCompany(result.companyId);
      setQuery("");
    } else {
      router.push(result.href);
      setQuery("");
    }
  }

  function signOut() {
    setMenuOpen(false);
    router.push(SIGNED_OUT_PATH);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-brand-blue pl-8 pr-10 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] shadow-sm"
          style={{ background: "linear-gradient(145deg, #0FBFD4 0%, #06ABD3 100%)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="12.5" width="2.6" height="4.5" rx="1" fill="white" />
            <rect x="10.7" y="9.5" width="2.6" height="7.5" rx="1" fill="white" />
            <rect x="15.4" y="6.5" width="2.6" height="10.5" rx="1" fill="white" />
            <rect x="5" y="18" width="14" height="2.1" rx="1.05" fill="white" />
          </svg>
        </div>
        <span className="text-[19px] font-bold tracking-tight text-white">Dart</span>
        <div className="mx-3 h-[22px] w-px bg-white/25" />
        <span className="text-sm font-medium text-white/85">Financial Reporting</span>
      </div>

      <div className="flex items-center gap-5">
        <div ref={searchRef} className="relative">
          <label
            className="flex h-[30px] w-[240px] items-center gap-2 rounded-full bg-white/15 px-3.5 transition-colors focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-white/30 hover:bg-white/[0.22]"
          >
            <Search size={14} className="shrink-0 text-white/55" aria-hidden />
            <span className="sr-only">Search dashboards and companies</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
                if (e.key === "Enter" && results.length > 0) choose(results[0]);
              }}
              placeholder="Search dashboards, companies…"
              className="h-full w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/50 [&::-webkit-search-cancel-button]:hidden"
            />
          </label>

          {needle && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-line bg-white py-1.5 shadow-xl">
              {results.length > 0 ? (
                results.map((result) =>
                  result.kind === "dashboard" ? (
                    <Link
                      key={result.key}
                      href={result.href}
                      onClick={() => setQuery("")}
                      className="block px-3.5 py-2 transition-colors hover:bg-grid"
                    >
                      <p className="text-[13px] font-medium text-ink">{result.title}</p>
                      <p className="truncate text-[11px] text-muted">{result.detail}</p>
                    </Link>
                  ) : (
                    <button
                      key={result.key}
                      onClick={() => choose(result)}
                      className="block w-full px-3.5 py-2 text-left transition-colors hover:bg-grid"
                    >
                      <p className="text-[13px] font-medium text-ink">{result.title}</p>
                      <p className="truncate text-[11px] text-muted">{result.detail}</p>
                    </button>
                  )
                )
              ) : (
                <p className="px-3.5 py-2 text-[13px] text-muted">No results</p>
              )}
            </div>
          )}
        </div>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title={CURRENT_USER.name}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[11px] font-bold text-brand-blue ring-2 ring-brand-primary transition-transform hover:scale-105"
          >
            {getInitials(CURRENT_USER.name)}
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-line bg-white py-2 shadow-xl"
            >
              <div className="px-3.5 pb-2">
                <p className="text-[13px] font-semibold text-ink">{CURRENT_USER.name}</p>
                <p className="text-[11px] text-muted">{CURRENT_USER.email}</p>
              </div>
              <div className="border-t border-line pt-1">
                <button
                  role="menuitem"
                  onClick={signOut}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-medium text-ink transition-colors hover:bg-grid"
                >
                  <LogOut size={14} className="text-muted" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
