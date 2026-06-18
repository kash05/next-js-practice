import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootProviders } from "@/components/providers/RootProviders";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { template: "%s | MyApp", default: "MyApp" },
  description: "Enterprise application",
};

/**
 * Root layout — Server Component.
 * Never import MSAL or browser-only libs here.
 * All client providers live inside RootProviders.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
