"use client";

import { ReactNode, useEffect } from "react";
import { MsalProvider } from "./MsalProvider";
import { QueryProvider } from "./QueryProvider";
import { useAuthContext } from "@/lib/auth/AuthContext";
import { setTokenGetter } from "@/lib/api/axiosInstance";

function AxiosTokenBridge() {
  const { getAccessToken } = useAuthContext();
  useEffect(() => {
    setTokenGetter(getAccessToken);
  }, [getAccessToken]);
  return null;
}

export function RootProviders({ children }: { children: ReactNode }) {
  return (
    <MsalProvider>
      <QueryProvider>
        <AxiosTokenBridge />
        {children}
      </QueryProvider>
    </MsalProvider>
  );
}
