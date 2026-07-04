"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { useAuth, AuthUser } from "./useAuth";
import { Permission, ROLES } from "@/config/permissions";
import { resolvePermissions } from "@/config/rolePermissions";

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Set<Permission>;
  /** Returns true if the user has the given permission. */
  can: (permission: Permission) => boolean;
  /** Returns true if the user has ALL of the given permissions. */
  canAll: (...permissions: Permission[]) => boolean;
  /** Returns true if the user has ANY of the given permissions. */
  canAny: (...permissions: Permission[]) => boolean;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/*
 * DEV BYPASS — skips Azure AD during local development.
 *
 * To enable real MSAL auth:
 *   1. Set DEV_BYPASS = false
 *   2. Fill in .env.local with NEXT_PUBLIC_AZURE_CLIENT_ID and NEXT_PUBLIC_AZURE_TENANT_ID
 *   3. Uncomment the MSAL button in LoginCard.tsx
 *
 * Change DEV_USER.roles to test different permission levels without re-logging in.
 */
const DEV_BYPASS = true;
// const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true"; // ← production

const DEV_USER: AuthUser = {
  name: "Dev User",
  email: "dev@example.com",
  tenantId: "dev-tenant",
  accountId: "dev-account",
  roles: [ROLES.SUPER_ADMIN],
};

export function AuthContextProvider({ children }: { children: ReactNode }) {
  // MSAL hooks must always be called — rules of hooks. Ignored when DEV_BYPASS=true.
  const msalAuth = useAuth();
  const [devAuthenticated, setDevAuthenticated] = useState(false);

  const auth = DEV_BYPASS
    ? {
        user: devAuthenticated ? DEV_USER : null,
        isAuthenticated: devAuthenticated,
        isLoading: false,
        login: () => setDevAuthenticated(true),
        logout: () => setDevAuthenticated(false),
        getAccessToken: async (): Promise<string> => "dev-token",
      }
    : msalAuth;

  // Stable string key avoids re-computing permissions on every render
  const rolesKey = (auth.user?.roles ?? []).join(",");
  const permissions = useMemo(
    () => resolvePermissions(auth.user?.roles ?? []),
    [rolesKey], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const can = (permission: Permission): boolean => permissions.has(permission);
  const canAll = (...perms: Permission[]): boolean =>
    perms.every((p) => permissions.has(p));
  const canAny = (...perms: Permission[]): boolean =>
    perms.some((p) => permissions.has(p));

  return (
    <AuthContext.Provider value={{ ...auth, permissions, can, canAll, canAny }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used inside <AuthContextProvider>");
  return ctx;
}
