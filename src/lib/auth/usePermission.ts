"use client";

import { useAuthContext } from "./AuthContext";

/**
 * Primary hook for permission checks in components.
 *
 * Usage:
 *   const { can, canAny, canAll } = usePermission();
 *
 *   can(PERMISSIONS.ORDERS_APPROVE)
 *   canAny(PERMISSIONS.ORDERS_EDIT, PERMISSIONS.ORDERS_APPROVE)
 *   canAll(PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_VIEW_FINANCIAL)
 */
export function usePermission() {
  const { can, canAll, canAny, permissions } = useAuthContext();
  return { can, canAll, canAny, permissions };
}
