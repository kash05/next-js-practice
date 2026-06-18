"use client";

import { ReactNode } from "react";
import { Permission } from "@/config/permissions";
import { usePermission } from "@/lib/auth/usePermission";

interface PermissionGateProps {
  // Show children only if user has ALL of these
  requires?: Permission | Permission[];
  // Show children if user has ANY of these
  requiresAny?: Permission[];
  // What to render when the check fails (optional — renders nothing by default)
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Declarative permission gate. Wraps any UI that should be conditionally
 * shown based on the current user's permissions.
 *
 * Usage:
 *
 *   // Single permission
 *   <PermissionGate requires={PERMISSIONS.ORDERS_CREATE}>
 *     <CreateOrderButton />
 *   </PermissionGate>
 *
 *   // Must have both
 *   <PermissionGate requires={[PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_VIEW_FINANCIAL]}>
 *     <FinancialReports />
 *   </PermissionGate>
 *
 *   // Either one
 *   <PermissionGate requiresAny={[PERMISSIONS.ORDERS_EDIT, PERMISSIONS.ORDERS_APPROVE]}>
 *     <OrderActions />
 *   </PermissionGate>
 *
 *   // With fallback
 *   <PermissionGate requires={PERMISSIONS.BILLING_MANAGE} fallback={<UpgradeBanner />}>
 *     <BillingSettings />
 *   </PermissionGate>
 */
export function PermissionGate({
  requires,
  requiresAny,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAll, canAny } = usePermission();

  let hasAccess = true;

  if (requires) {
    hasAccess = Array.isArray(requires) ? canAll(...requires) : can(requires);
  }

  if (hasAccess && requiresAny) {
    hasAccess = canAny(...requiresAny);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
