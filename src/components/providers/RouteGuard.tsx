"use client";

import { type ReactNode } from "react";
import { Permission } from "@/config/permissions";
import { usePermission } from "@/lib/auth/usePermission";
import { useAuthContext } from "@/lib/auth/AuthContext";

interface RouteGuardProps {
  /** Single permission or array of permissions — user must have ALL of them. */
  requires: Permission | Permission[];
  children: ReactNode;
}

/**
 * RouteGuard — page-level permission check.
 *
 * Renders a full-screen "Access denied" UI when the authenticated user lacks
 * the required permission(s). This is intentionally a blocking UI rather than
 * a redirect — the user is authenticated, they just don't have the right role.
 * Showing the denied screen is more transparent than a silent redirect.
 *
 * Usage — wrap the entire page content:
 *
 *   export default function BillingPage() {
 *     return (
 *       <RouteGuard requires={PERMISSIONS.BILLING_VIEW}>
 *         <BillingDashboard />
 *       </RouteGuard>
 *     );
 *   }
 *
 * For multi-permission gates, pass an array (must have ALL):
 *
 *   <RouteGuard requires={[PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_VIEW_FINANCIAL]}>
 */
export function RouteGuard({ requires, children }: RouteGuardProps) {
  const { isLoading } = useAuthContext();
  const { can, canAll } = usePermission();

  // Still hydrating — render nothing rather than flashing the denied screen
  if (isLoading) return null;

  const hasAccess = Array.isArray(requires)
    ? canAll(...requires)
    : can(requires);

  if (!hasAccess) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        {/* Icon */}
        <div className="bg-destructive/10 flex h-20 w-20 items-center justify-center rounded-full">
          <svg
            className="text-destructive h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="max-w-sm space-y-2">
          <h2 className="text-foreground text-xl font-semibold">
            You don&apos;t have access to this page
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your current role doesn&apos;t include permission to view this
            content. Contact your administrator if you believe this is a
            mistake.
          </p>
        </div>

        {/* Role hint — only shown in development */}
        {process.env.NODE_ENV === "development" && (
          <p className="bg-muted text-muted-foreground rounded-md px-3 py-1.5 font-mono text-xs">
            Required: {Array.isArray(requires) ? requires.join(", ") : requires}
          </p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
