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
  roles: string[];
}

function mapAccount(account: AccountInfo): AuthUser {
  return {
    name: account.name ?? "Unknown",
    email: account.username ?? "",
    tenantId: account.tenantId ?? "",
    accountId: account.localAccountId ?? "",
    // Roles come from the `roles` claim in the Azure AD id_token.
    // They are populated only when App Roles are assigned in Azure Portal.
    roles: (account.idTokenClaims?.roles as string[]) ?? [],
  };
}

export function useAuth() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = useAccount();

  // ── Session restore on tab reopen ──────────────────────────────────────────
  // MSAL stores tokens in localStorage (configured in msal.config.ts).
  // On page load, MSAL hydrates its internal state from localStorage before
  // React even mounts — so by the time useAccount() runs, the cached account
  // is already present and isAuthenticated is already true.
  // No extra code is needed for session restore. This comment is here so the
  // behaviour is explicit and not a surprise to future maintainers.
  //
  // What MSAL restores:  id_token, access_token (if not expired), account info
  // What MSAL re-fetches: access_token silently if expired (acquireTokenSilent)
  // What triggers re-login: refresh_token expiry (default: 90 days in Azure AD)
  // ──────────────────────────────────────────────────────────────────────────

  // ── Handle redirect response after loginRedirect() ────────────────────────
  // After Azure redirects back to the app, MSAL processes the hash/query params.
  // handleRedirectPromise() MUST be called to complete the login flow.
  // @azure/msal-react's MsalProvider calls this automatically — nothing to do here.
  // ──────────────────────────────────────────────────────────────────────────

  // ── Set active account when one isn't set ─────────────────────────────────
  // Handles edge case where multiple accounts are cached (e.g. user logged into
  // two tenants). We pick the first available account.
  useEffect(() => {
    if (!instance.getActiveAccount() && instance.getAllAccounts().length > 0) {
      instance.setActiveAccount(instance.getAllAccounts()[0]);
    }

    // Subscribe to LOGIN_SUCCESS so the active account is set immediately
    // after a fresh loginRedirect, before React re-renders.
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
  // ──────────────────────────────────────────────────────────────────────────

  const isLoading = inProgress !== InteractionStatus.None;
  const user = account ? mapAccount(account) : null;

  function login() {
    instance.loginRedirect(loginRequest);
  }

  function logout() {
    instance.logoutRedirect({
      account: account ?? undefined,
      postLogoutRedirectUri: "/login",
    });
  }

  async function getAccessToken(): Promise<string> {
    if (!account) throw new Error("No active account — user is not authenticated");

    try {
      const result = await instance.acquireTokenSilent({
        ...apiRequest,
        account,
      });
      return result.accessToken;
    } catch {
      // Silent acquisition failed (refresh token expired, consent needed, etc.)
      // Fall back to redirect — user will be sent to Azure AD and returned.
      instance.acquireTokenRedirect({ ...apiRequest, account });
      throw new Error("Token acquisition failed — initiating redirect");
    }
  }

  return { user, isAuthenticated, isLoading, login, logout, getAccessToken };
}
