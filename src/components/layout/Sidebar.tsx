"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/auth/AuthContext";
import { useFilteredNav } from "@/lib/auth/useFilteredNav";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// NavLink — recursive, handles nested children
// ─────────────────────────────────────────────────────────────────────────────

interface NavLinkProps {
  item: NavItem;
  depth?: number;
  /** Called on navigation so the mobile drawer can close itself. */
  onNavigate?: () => void;
}

function NavLink({ item, depth = 0, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const [open, setOpen] = useState(isActive);
  const hasChildren = (item.children?.length ?? 0) > 0;

  const baseClass = cn(
    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-sidebar-item-active text-white font-medium"
      : "text-sidebar-item-fg hover:bg-sidebar-item-hover hover:text-sidebar-fg",
    depth > 0 && "pl-7",
  );

  if (hasChildren) {
    return (
      <div>
        <button onClick={() => setOpen((o) => !o)} className={baseClass}>
          <span className="flex-1 text-left">{item.label}</span>
          <svg
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              open && "rotate-180",
            )}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 9l6 6 6-6"
            />
          </svg>
        </button>
        {open && (
          <div className="mt-0.5 space-y-0.5">
            {item.children!.map((child) => (
              <NavLink
                key={child.href}
                item={child}
                depth={depth + 1}
                onNavigate={onNavigate || (() => {})}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate || (() => {})}
      className={baseClass}
    >
      {item.label}
      {item.badge && (
        <span className="bg-primary ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar — full sidebar content (logo, nav, user footer)
// Shared between desktop aside and mobile drawer.
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarProps {
  /** Called when a nav link is clicked — used by mobile drawer to close itself. */
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
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
    <div className="bg-sidebar flex h-full flex-col">
      {/* Logo */}
      <div className="border-sidebar-border flex h-14 shrink-0 items-center border-b px-5">
        <div className="flex items-center gap-2">
          {/* Orange accent mark */}
          <div className="bg-primary h-6 w-1.5 rounded-full" />
          <span className="text-sidebar-fg text-sm font-semibold tracking-tight">
            MyApp
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 scrollbar-thin space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            onNavigate={onNavigate || (() => {})}
          />
        ))}
      </nav>

      {/* User footer */}
      <div className="border-sidebar-border shrink-0 border-t p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sidebar-fg truncate text-sm font-medium">
              {user?.name}
            </p>
            <p className="text-sidebar-muted-fg truncate text-xs">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-sidebar-item-fg hover:bg-sidebar-item-hover hover:text-sidebar-fg mt-3 w-full rounded-md px-3 py-1.5 text-xs transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
