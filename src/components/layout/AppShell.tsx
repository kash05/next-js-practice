"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/auth/AuthContext";
import { useFilteredNav } from "@/lib/auth/useFilteredNav";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Nav link
// ─────────────────────────────────────────────────────────────────────────────
function NavLink({
  item,
  depth = 0,
  onNavigate,
}: {
  item: NavItem;
  depth?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const [open, setOpen] = useState(isActive);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      {hasChildren ? (
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
            isActive
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            depth > 0 && "pl-7",
          )}
        >
          <span className="flex-1 text-left">{item.label}</span>
          <svg
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </button>
      ) : (
        <Link
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
            isActive
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            depth > 0 && "pl-7",
          )}
        >
          {item.label}
          {item.badge && (
            <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
              {item.badge}
            </span>
          )}
        </Link>
      )}
      {hasChildren && open && (
        <div className="mt-0.5 space-y-0.5">
          {item.children?.map((child) => (
            <NavLink key={child.href} item={child} depth={depth + 1} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hamburger icon
// ─────────────────────────────────────────────────────────────────────────────
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
        // X / close
        <>
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </>
      ) : (
        // Hamburger lines
        <>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar content — shared between desktop and mobile drawer
// ─────────────────────────────────────────────────────────────────────────────
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuthContext();
  const navItems = useFilteredNav();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-5">
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">MyApp</span>
      </div>

      {/* Nav */}
      <nav className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</p>
            <p className="text-sidebar-muted-foreground truncate text-xs">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-3 w-full rounded-md px-3 py-1.5 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AppShell
// ─────────────────────────────────────────────────────────────────────────────
export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop sidebar — hidden on mobile ──────────────────────────── */}
      <aside className="scrollbar-thin hidden border-r border-sidebar-border bg-sidebar md:flex md:w-60 md:shrink-0 md:flex-col">
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer overlay ────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer panel ──────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar shadow-xl transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Navigation"
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main content area ────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
          {/* Hamburger — only on mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>

          {/* Mobile logo — visible when sidebar is hidden */}
          <span className="text-sm font-semibold tracking-tight md:hidden">MyApp</span>

          <div className="flex-1" />
          {/* Slot: GlobalSearch, NotificationBell, ThemeToggle */}
        </header>

        {/* Scrollable page content */}
        <main className="scrollbar-thin flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
