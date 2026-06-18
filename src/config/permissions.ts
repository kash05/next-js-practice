// ─────────────────────────────────────────────────────────────────────────────
// All permissions in the system — granular, verb:resource format.
// Add new permissions here first; everything else derives from this list.
// ─────────────────────────────────────────────────────────────────────────────
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: "dashboard:view",

  // Users
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_EDIT: "users:edit",
  USERS_DELETE: "users:delete",
  USERS_EXPORT: "users:export",

  // Orders
  ORDERS_VIEW: "orders:view",
  ORDERS_CREATE: "orders:create",
  ORDERS_EDIT: "orders:edit",
  ORDERS_DELETE: "orders:delete",
  ORDERS_APPROVE: "orders:approve",
  ORDERS_EXPORT: "orders:export",

  // Reports
  REPORTS_VIEW: "reports:view",
  REPORTS_CREATE: "reports:create",
  REPORTS_EXPORT: "reports:export",
  REPORTS_VIEW_FINANCIAL: "reports:view_financial",

  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_EDIT_GENERAL: "settings:edit_general",
  SETTINGS_EDIT_SECURITY: "settings:edit_security",
  SETTINGS_MANAGE_ROLES: "settings:manage_roles",
  SETTINGS_MANAGE_INTEGRATIONS: "settings:manage_integrations",

  // Billing
  BILLING_VIEW: "billing:view",
  BILLING_MANAGE: "billing:manage",

  // Audit
  AUDIT_VIEW: "audit:view",
  AUDIT_EXPORT: "audit:export",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─────────────────────────────────────────────────────────────────────────────
// All roles in the system — must match App Role names in Azure AD exactly.
// ─────────────────────────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  ADMIN: "Admin",
  MANAGER: "Manager",
  FINANCE: "Finance",
  ANALYST: "Analyst",
  SUPPORT: "Support",
  VIEWER: "Viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
