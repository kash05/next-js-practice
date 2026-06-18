import { redirect } from "next/navigation";

/**
 * Root page ( / ) — immediately redirects to the main dashboard.
 * If the user is not authenticated, (protected)/layout.tsx → AuthGuard
 * will intercept and redirect them to /login.
 */
export default function RootPage() {
  redirect("/dashboard");
}
