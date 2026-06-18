import type { ReactNode } from "react";
import { GuestGuard } from "@/components/providers/GuestGuard";

/**
 * Auth layout — wraps all public auth pages (/login, /logout, etc.)
 * GuestGuard ensures already-authenticated users are bounced to /dashboard.
 * No AppShell, no sidebar — just the raw page.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}
