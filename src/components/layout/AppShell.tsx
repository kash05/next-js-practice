"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      {open ? (
        <>
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </>
      ) : (
        <>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  );
}

/**
 * AppShell — persistent layout chrome for all authenticated pages.
 *
 * Desktop: fixed sidebar on the left, topbar + scrollable content on the right.
 * Mobile/tablet: sidebar hidden behind a hamburger drawer (slides in from left).
 *
 * Sidebar content lives in Sidebar.tsx — import that if you need it standalone.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="bg-bg-page flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="border-sidebar-border hidden border-r md:flex md:w-60 md:shrink-0 md:flex-col">
        <Sidebar />
      </aside>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 shadow-xl transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Navigation"
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="border-border bg-surface flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="text-text-tertiary hover:bg-bg-muted hover:text-text-primary flex h-8 w-8 items-center justify-center rounded-md transition-colors md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>

          {/* App name — mobile only (desktop shows it in sidebar) */}
          <span className="text-sm font-semibold tracking-tight md:hidden">
            MyApp
          </span>

          <div className="flex-1" />
          {/* Slot: GlobalSearch, NotificationBell, ThemeToggle */}
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 scrollbar-thin overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
