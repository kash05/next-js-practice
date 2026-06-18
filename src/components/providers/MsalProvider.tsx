"use client";

import { ReactNode } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider as AzureMsalProvider } from "@azure/msal-react";
import { msalConfig } from "@/config/msal.config";
import { AuthContextProvider } from "@/lib/auth/AuthContext";

/**
 * PublicClientApplication is instantiated OUTSIDE the component —
 * creating it inside would cause a new instance on every render,
 * breaking MSAL's internal state and token cache.
 */
const msalInstance = new PublicClientApplication(msalConfig);

export function MsalProvider({ children }: { children: ReactNode }) {
  return (
    <AzureMsalProvider instance={msalInstance}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </AzureMsalProvider>
  );
}
