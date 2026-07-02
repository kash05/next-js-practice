import type { Metadata } from "next";
import { LoginCard } from "./LoginCard";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Login page — server component shell so we can export metadata.
 * All interactivity lives in LoginCard (client component).
 */
export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <LoginCard />
    </div>
  );
}
