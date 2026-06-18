# Enterprise Next.js Starter

Production-ready Next.js 15 application with MSAL (Azure AD) authentication, role-based access control, and a dark-sidebar app shell.

---

## Quick start

```bash
cp .env.example .env.local   # fill in Azure credentials (or leave bypass=true for dev)
npm install
npm run dev
```

---

## Authentication flow

### How login works

```
User visits /dashboard
       │
       ▼
(protected)/layout.tsx
  └── AuthGuard
        │  isLoading? ──► spinner (MSAL hydrating from localStorage)
        │  not authed? ──► router.replace("/login")
        │  authed? ──────► render AppShell + page
        ▼
User visits /login
       │
       ▼
(auth)/layout.tsx
  └── GuestGuard
        │  isLoading? ──► render nothing (avoid flash)
        │  authed? ──────► router.replace("/dashboard")
        │  not authed? ──► render LoginCard
        ▼
User clicks "Sign in with Microsoft"
       │
       ▼
login() → instance.loginRedirect()
       │
       ▼
Browser navigates to Microsoft login page
       │
       ▼
Azure authenticates user, redirects to NEXT_PUBLIC_REDIRECT_URI
       │
       ▼
MSAL processes response (MsalProvider.handleRedirectPromise auto-called)
Tokens stored in localStorage
Active account set via EventType.LOGIN_SUCCESS callback
       │
       ▼
isAuthenticated = true
AuthGuard renders protected content
```

### Session restore (close tab → reopen)

MSAL stores tokens in `localStorage` (`BrowserCacheLocation.LocalStorage` in `msal.config.ts`).

When the user closes and reopens the tab:

1. MSAL reads from `localStorage` during its initialisation (before React mounts).
2. By the time `AuthGuard` first renders, `useIsAuthenticated()` already returns `true`.
3. The spinner shows for < 300ms while `inProgress` transitions from `Startup` to `None`.
4. The user lands directly on the protected page — no login required.

Token expiry is handled transparently: `getAccessToken()` calls `acquireTokenSilent()`, which uses the cached refresh token to obtain a new access token without user interaction. If the refresh token has also expired (default: 90 days), the user is redirected to Azure AD.

### Dev bypass mode

Set `NEXT_PUBLIC_DEV_AUTH_BYPASS=true` in `.env.local` to skip Azure AD entirely.

- No Azure credentials required.
- Login button sets local React state instead of firing MSAL.
- Simulated user is defined in `AuthContext.tsx` → `DEV_USER`.
- Change `DEV_USER.roles` to test different permission levels.

**To switch to production auth**: set `NEXT_PUBLIC_DEV_AUTH_BYPASS=false` (or remove the variable). No code changes required.

---

## Permission system

### Architecture: roles → permissions, never check roles directly

```
Azure AD App Roles (e.g. "Manager")
         │
         ▼
src/config/rolePermissions.ts
  ROLE_PERMISSIONS["Manager"] = [
    "orders:view", "orders:create", "orders:approve", ...
  ]
         │
         ▼  resolvePermissions(user.roles)
         │
         ▼
AuthContext → Set<Permission>   (flat, deduplicated)
  can("orders:approve")   → true / false
  canAll("a", "b", "c")   → user has all three
  canAny("a", "b")        → user has at least one
```

**Why permissions instead of roles?**
Code that checks `user.roles.includes("Admin")` breaks the moment you add a new role with the same access. Checking permissions (`can("orders:approve")`) means the component never needs to change when roles are reorganised.

### Three layers of access control

#### Layer 1 — `AuthGuard` (route group)

Protects all routes inside `(protected)/`. Unauthenticated users are redirected to `/login`.

```tsx
// (protected)/layout.tsx — automatic, no per-page code needed
<AuthGuard>
  <AppShell>{children}</AppShell>
</AuthGuard>
```

#### Layer 2 — `RouteGuard` (page level)

Renders an "Access denied" screen when the user lacks the required permission(s).

```tsx
// Any page inside (protected)/
export default function BillingPage() {
  return (
    <RouteGuard requires={PERMISSIONS.BILLING_VIEW}>
      <BillingDashboard />
    </RouteGuard>
  );
}
```

#### Layer 3 — `PermissionGate` (UI element level)

Shows/hides individual buttons, sections, or actions.

```tsx
<PermissionGate requires={PERMISSIONS.ORDERS_CREATE}>
  <CreateOrderButton />
</PermissionGate>

// With fallback
<PermissionGate
  requires={PERMISSIONS.BILLING_MANAGE}
  fallback={<UpgradeBanner />}
>
  <BillingSettings />
</PermissionGate>

// Any of multiple permissions
<PermissionGate requiresAny={[PERMISSIONS.ORDERS_EDIT, PERMISSIONS.ORDERS_APPROVE]}>
  <OrderActions />
</PermissionGate>
```

### Navigation filtering

`useFilteredNav()` in `AppShell` filters `NAV_ITEMS` at render time. Nav items declare their required permission — items the user can't access simply don't appear in the sidebar. No hidden links, no broken pages reached via the nav.

### Adding a new permission

1. Add to `PERMISSIONS` in `src/config/permissions.ts`:
   ```ts
   INVOICES_APPROVE: "invoices:approve",
   ```
2. Assign to roles in `src/config/rolePermissions.ts`:
   ```ts
   const MANAGER_PERMISSIONS = [..., PERMISSIONS.INVOICES_APPROVE];
   ```
3. Use anywhere:
   ```tsx
   <PermissionGate requires={PERMISSIONS.INVOICES_APPROVE}>...</PermissionGate>
   ```
   `SuperAdmin` gets it automatically (uses `Object.values(PERMISSIONS)`).

### Adding a new role

1. Add to `ROLES` in `src/config/permissions.ts` — value must match the Azure AD App Role name exactly.
2. Add its permission list to `ROLE_PERMISSIONS` in `src/config/rolePermissions.ts`.
3. Assign the App Role to users in Azure Portal → App registrations → App roles.

---

## Project structure

```
src/
├── app/
│   ├── (auth)/              Public routes — GuestGuard redirects authed users away
│   │   ├── layout.tsx
│   │   └── login/
│   │       ├── page.tsx     Server component shell (exports metadata)
│   │       └── LoginCard.tsx Client component (button, loading state)
│   │
│   ├── (protected)/         Private routes — AuthGuard redirects to /login if not authed
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   └── orders/page.tsx
│   │
│   ├── layout.tsx            Root layout — server component, mounts RootProviders
│   ├── page.tsx              Redirects / → /dashboard
│   └── globals.css           Design tokens + base styles
│
├── components/
│   ├── layout/
│   │   └── AppShell.tsx      Sidebar + topbar chrome
│   └── providers/
│       ├── RootProviders.tsx  Composes all providers
│       ├── MsalProvider.tsx   Azure MSAL + AuthContextProvider
│       ├── QueryProvider.tsx  TanStack Query
│       ├── AuthGuard.tsx      Redirects unauthenticated → /login
│       ├── GuestGuard.tsx     Redirects authenticated → /dashboard
│       ├── RouteGuard.tsx     Page-level permission denial screen
│       └── PermissionGate.tsx UI-level show/hide by permission
│
├── config/
│   ├── msal.config.ts        MSAL PublicClientApplication config
│   ├── permissions.ts        PERMISSIONS const + ROLES const
│   ├── rolePermissions.ts    Role → permission matrix + resolvePermissions()
│   └── navigation.ts         Nav items with permission declarations
│
├── lib/
│   ├── api/
│   │   └── axiosInstance.ts  Pre-configured Axios with Bearer token interceptor
│   ├── auth/
│   │   ├── AuthContext.tsx   App-level auth state + permission helpers
│   │   ├── useAuth.ts        MSAL hooks wrapper + session/event handling
│   │   ├── usePermission.ts  can() / canAll() / canAny()
│   │   ├── useFilteredNav.ts Nav filtered to current user's permissions
│   │   └── useRoleGuard.ts   Raw role check (prefer usePermission instead)
│   └── utils.ts              cn() Tailwind class merger
│
└── types/
    └── index.ts              Shared TypeScript interfaces
```

---

## Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start dev server                 |
| `npm run build`      | Production build                 |
| `npm run lint`       | ESLint check                     |
| `npm run lint:fix`   | ESLint auto-fix                  |
| `npm run format`     | Prettier format                  |
| `npm run type-check` | TypeScript check (no emit)       |
| `npm run validate`   | type-check + lint + format:check |

---

## Environment variables

| Variable                      | Required   | Description                                  |
| ----------------------------- | ---------- | -------------------------------------------- |
| `NEXT_PUBLIC_AZURE_CLIENT_ID` | Production | Azure AD app registration client ID          |
| `NEXT_PUBLIC_AZURE_TENANT_ID` | Production | Azure AD tenant ID                           |
| `NEXT_PUBLIC_REDIRECT_URI`    | Production | OAuth redirect URI (must match Azure Portal) |
| `NEXT_PUBLIC_API_BASE_URL`    | Production | Backend API base URL                         |
| `NEXT_PUBLIC_DEV_AUTH_BYPASS` | Dev only   | Set `"true"` to skip MSAL in development     |

---

## Azure AD setup checklist

1. Create an App Registration in Azure Portal.
2. Set Redirect URI to `http://localhost:3000` (dev) and your production URL.
3. Under "API permissions", add `openid`, `profile`, `email`, `User.Read`.
4. Under "App roles", create roles matching `ROLES` values in `permissions.ts`:
   `SuperAdmin`, `Admin`, `Manager`, `Finance`, `Analyst`, `Support`, `Viewer`.
5. Assign roles to users/groups in Azure Portal → Enterprise applications → your app → Users and groups.
6. Copy client ID and tenant ID to `.env.local`.
