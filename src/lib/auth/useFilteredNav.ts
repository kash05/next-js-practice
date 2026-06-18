"use client";

import { useMemo } from "react";
import { NAV_ITEMS, NavItem } from "@/config/navigation";
import { usePermission } from "@/lib/auth/usePermission";
import { Permission } from "@/config/permissions";

function filterItems(items: NavItem[], can: (p: Permission) => boolean): NavItem[] {
  return items
    .filter((item) => !item.permission || can(item.permission))
    .map((item) => ({
      ...item,
      children: item.children ? filterItems(item.children, can) : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0);
}

/**
 * Returns navigation items filtered to only those the current user
 * has permission to see. Re-computes only when permissions change.
 */
export function useFilteredNav() {
  const { can } = usePermission();
  return useMemo(() => filterItems(NAV_ITEMS, can), [can]);
}
