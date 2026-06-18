"use client";

import { useAuth } from "./useAuth";

/**
 * Returns whether the current user holds at least one of the allowed roles.
 * Roles are sourced from the MSAL id_token `roles` claim (App roles in Azure AD).
 *
 * Usage:
 *   const { hasRole, isLoading } = useRoleGuard(["Admin", "Editor"]);
 */
export function useRoleGuard(allowedRoles: string[]) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const hasRole = isAuthenticated ? allowedRoles.some((r) => user?.roles.includes(r)) : false;

  return { hasRole, isLoading };
}
