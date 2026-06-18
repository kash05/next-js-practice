"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/auth/AuthContext";

interface GuestGuardProps {
  children: ReactNode;
}

/**
 * GuestGuard — protects routes that must NOT be accessible when logged in.
 * Use this in the (auth)/layout.tsx to prevent authenticated users from
 * reaching /login.
 *
 * Behaviour:
 *  - isLoading  → show nothing (avoids redirect-then-back flash)
 *  - authenticated     → redirect to /dashboard
 *  - not authenticated → render children (login page)
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // While loading or already authenticated, render nothing.
  // Prevents the login page flashing before the redirect fires.
  if (isLoading || isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
