"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth/AuthContext";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * AuthGuard — protects routes that require authentication.
 *
 * Behaviour:
 *  - isLoading  → show spinner (MSAL is processing redirect or hydrating from cache)
 *  - not authenticated → redirect to /login (does NOT auto-fire MSAL — user must click login)
 *  - authenticated → render children
 *
 * Session restore: when the user closes and reopens the tab, MSAL hydrates
 * its state from localStorage before this component mounts. isAuthenticated
 * will already be true on first render, so the redirect never fires.
 *
 * Place this only in (protected)/layout.tsx — not in individual pages.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once MSAL has finished its initialisation.
    // If we redirect during isLoading, we'll send cached users to /login on
    // every page load before MSAL has had a chance to restore their session.
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // MSAL is still processing — show a neutral loading screen.
  // This is brief (< 300ms) for returning users with a cached session.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — render nothing while router.replace("/login") fires.
  // This is a single frame, the user will never see a flash of protected content.
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
