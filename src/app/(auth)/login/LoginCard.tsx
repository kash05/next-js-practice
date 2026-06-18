"use client";

import { useState } from "react";
import { useAuthContext } from "@/lib/auth/AuthContext";

export function LoginCard() {
  const { login } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  function handleLogin() {
    setIsLoading(true);
    login();
  }

  return (
    <div className="w-full max-w-sm space-y-8 rounded-xl border border-border bg-card p-8 shadow-sm">
      {/* Brand */}
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <span className="text-xl font-bold text-primary-foreground">M</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
      </div>

      {/* ── MSAL login button (uncomment when Azure AD is configured) ──────────
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 23 23"
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path fill="#f3f3f3" d="M0 0h23v23H0z" />
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
        )}
        {isLoading ? "Signing in..." : "Sign in with Microsoft"}
      </button>
      ── end MSAL button ── */}

      {/* ── Dev login button — remove this block when enabling MSAL above ── */}
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        )}
        {isLoading ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        <span className="bg-warning/15 text-warning rounded px-1.5 py-0.5 font-medium">DEV</span>{" "}
        MSAL disabled — using local auth bypass
      </p>
      {/* ── end dev login block ── */}
    </div>
  );
}
