"use client";

import { useEffect } from "react";
import { useMsal, useIsAuthenticated, useAccount } from "@azure/msal-react";
import { AccountInfo, InteractionStatus, EventType } from "@azure/msal-browser";
import { loginRequest, apiRequest } from "@/config/msal.config";

export interface AuthUser {
  name: string;
  email: string;
  tenantId: string;
  accountId: string;
  /** Roles from the Azure AD id_token `roles` claim. Populated only when App Roles are assigned in Azure Portal. */
  roles: string[];
}

function mapAccount(account: AccountInfo): AuthUser {
  return {
    name: account.name ?? "Unknown",
    email: account.username ?? "",
    tenantId: account.tenantId ?? "",
    accountId: account.localAccountId ?? "",
    roles: (account.idTokenClaims?.roles as string[]) ?? [],
  };
}

/**
 * Low-level MSAL hook. Prefer useAuthContext() in components — this is
 * consumed by AuthContext and should not be used directly elsewhere.
 *
 * Handles:
 *  - Active account selection (multi-account edge case)
 *  - LOGIN_SUCCESS event to set active account immediately after redirect
 *  - Silent token acquisition with redirect fallback on expiry
 *
 * Session restore: MSAL reads localStorage before React mounts, so
 * isAuthenticated is already true on first render for returning users.
 */
export function useAuth() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = useAccount();

  useEffect(() => {
    // Set active account if not already set (e.g. multiple cached accounts)
    if (!instance.getActiveAccount() && instance.getAllAccounts().length > 0) {
      instance.setActiveAccount(instance.getAllAccounts()[0] ?? null);
    }

    // Set active account immediately after a fresh loginRedirect completes
    const callbackId = instance.addEventCallback((event) => {
      if (
        event.eventType === EventType.LOGIN_SUCCESS &&
        event.payload &&
        "account" in event.payload &&
        event.payload.account
      ) {
        instance.setActiveAccount(event.payload.account as AccountInfo);
      }
    });

    return () => {
      if (callbackId) instance.removeEventCallback(callbackId);
    };
  }, [instance]);

  const isLoading = inProgress !== InteractionStatus.None;
  const user = account ? mapAccount(account) : null;

  // void discards Promise<void> — login() is typed as () => void in AuthContextValue
  function login(): void {
    void instance.loginRedirect(loginRequest);
  }

  function logout(): void {
    void instance.logoutRedirect({
      account: account ?? undefined,
      postLogoutRedirectUri: "/login",
    });
  }

  async function getAccessToken(): Promise<string> {
    if (!account)
      throw new Error("No active account — user is not authenticated");

    try {
      const result = await instance.acquireTokenSilent({
        ...apiRequest,
        account,
      });
      return result.accessToken;
    } catch {
      // Silent failed (refresh token expired, consent required) — fall back to redirect
      void instance.acquireTokenRedirect({ ...apiRequest, account });
      throw new Error("Token acquisition failed — initiating redirect");
    }
  }

  return { user, isAuthenticated, isLoading, login, logout, getAccessToken };
}
