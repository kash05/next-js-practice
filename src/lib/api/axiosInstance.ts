import axios from "axios";

/**
 * Pre-configured Axios instance.
 *
 * Token injection: call setTokenGetter() once inside a client component
 * (e.g. in RootProviders) to wire up the MSAL token getter.
 * Every request then automatically carries a Bearer token.
 *
 * Usage:
 *   // In RootProviders.tsx after auth is ready:
 *   setTokenGetter(() => getAccessToken());
 *
 *   // In a query/mutation:
 *   import { api } from "@/lib/api/axiosInstance";
 *   const data = await api.get("/orders");
 */

let _getToken: (() => Promise<string>) | null = null;

export function setTokenGetter(fn: () => Promise<string>) {
  _getToken = fn;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const token = await _getToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // Token acquisition failure is handled by MSAL redirect
    }
  }
  return config;
});

// Response interceptor — normalise errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? error.message;

    if (status === 401) {
      // Let MSAL handle re-auth — just reject cleanly
      return Promise.reject(new Error("Unauthorised"));
    }
    if (status === 403) {
      return Promise.reject(new Error("Forbidden"));
    }
    return Promise.reject(new Error(message));
  },
);
