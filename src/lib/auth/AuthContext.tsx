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
  can: (permission: Permission) => boolean;
  canAll: (...permissions: Permission[]) => boolean;
  canAny: (...permissions: Permission[]) => boolean;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// DEV BYPASS — active until MSAL is configured
// To enable real MSAL auth:
//   1. Set DEV_BYPASS = false  (or flip to process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true")
//   2. Fill in .env.local with your Azure client ID and tenant ID
//   3. Uncomment the MSAL button in LoginCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
const DEV_BYPASS = true;
// const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true"; // ← use this in production

const DEV_USER: AuthUser = {
  name: "Dev User",
  email: "dev@example.com",
  tenantId: "dev-tenant",
  accountId: "dev-account",
  roles: [ROLES.SUPER_ADMIN], // change to test different roles e.g. ROLES.VIEWER
};
// ─────────────────────────────────────────────────────────────────────────────

export function AuthContextProvider({ children }: { children: ReactNode }) {
  // Always call MSAL hooks — rules of hooks require unconditional calls.
  // When DEV_BYPASS=true its return value is simply never used.
  const msalAuth = useAuth();

  // Dev-only local auth state
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

  const permissions = useMemo(
    () => resolvePermissions(auth.user?.roles ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [auth.user?.roles?.join(",")],
  );

  const can = (permission: Permission): boolean => permissions.has(permission);
  const canAll = (...perms: Permission[]): boolean => perms.every((p) => permissions.has(p));
  const canAny = (...perms: Permission[]): boolean => perms.some((p) => permissions.has(p));

  return (
    <AuthContext.Provider value={{ ...auth, permissions, can, canAll, canAny }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthContextProvider>");
  return ctx;
}
