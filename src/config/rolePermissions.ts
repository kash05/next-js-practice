import { Role, Permission, PERMISSIONS, ROLES } from "./permissions";

// ─────────────────────────────────────────────────────────────────────────────
// Role → Permission matrix.
//
// Rules:
//  1. Each role lists only the permissions it uniquely adds.
//  2. Use roleInheritance below to compose roles — don't duplicate permission
//     lists manually. E.g. Manager inherits Analyst, adds approve/delete.
//  3. This file is the single source of truth. When a new permission is needed,
//     add it to permissions.ts then assign it here.
// ─────────────────────────────────────────────────────────────────────────────

type RolePermissionMatrix = Record<Role, Permission[]>;

const BASE_PERMISSIONS: Permission[] = [PERMISSIONS.DASHBOARD_VIEW];

const VIEWER_PERMISSIONS: Permission[] = [
  ...BASE_PERMISSIONS,
  PERMISSIONS.ORDERS_VIEW,
  PERMISSIONS.REPORTS_VIEW,
];

const SUPPORT_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS,
  PERMISSIONS.USERS_VIEW,
  PERMISSIONS.ORDERS_EDIT,
];

const ANALYST_PERMISSIONS: Permission[] = [
  ...VIEWER_PERMISSIONS,
  PERMISSIONS.REPORTS_CREATE,
  PERMISSIONS.REPORTS_EXPORT,
  PERMISSIONS.ORDERS_EXPORT,
  PERMISSIONS.USERS_VIEW,
];

const FINANCE_PERMISSIONS: Permission[] = [
  ...ANALYST_PERMISSIONS,
  PERMISSIONS.REPORTS_VIEW_FINANCIAL,
  PERMISSIONS.BILLING_VIEW,
  PERMISSIONS.BILLING_MANAGE,
  PERMISSIONS.AUDIT_VIEW,
];

const MANAGER_PERMISSIONS: Permission[] = [
  ...ANALYST_PERMISSIONS,
  PERMISSIONS.USERS_CREATE,
  PERMISSIONS.USERS_EDIT,
  PERMISSIONS.USERS_EXPORT,
  PERMISSIONS.ORDERS_CREATE,
  PERMISSIONS.ORDERS_APPROVE,
  PERMISSIONS.ORDERS_DELETE,
  PERMISSIONS.SETTINGS_VIEW,
  PERMISSIONS.SETTINGS_EDIT_GENERAL,
  PERMISSIONS.AUDIT_VIEW,
];

const ADMIN_PERMISSIONS: Permission[] = [
  ...MANAGER_PERMISSIONS,
  ...FINANCE_PERMISSIONS,
  PERMISSIONS.USERS_DELETE,
  PERMISSIONS.SETTINGS_EDIT_SECURITY,
  PERMISSIONS.SETTINGS_MANAGE_INTEGRATIONS,
  PERMISSIONS.AUDIT_EXPORT,
];

// SuperAdmin gets everything — derived so adding a new permission auto-grants it
const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

export const ROLE_PERMISSIONS: RolePermissionMatrix = {
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,
  [ROLES.ADMIN]: ADMIN_PERMISSIONS,
  [ROLES.MANAGER]: MANAGER_PERMISSIONS,
  [ROLES.FINANCE]: FINANCE_PERMISSIONS,
  [ROLES.ANALYST]: ANALYST_PERMISSIONS,
  [ROLES.SUPPORT]: SUPPORT_PERMISSIONS,
  [ROLES.VIEWER]: VIEWER_PERMISSIONS,
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility — resolves a set of roles into a flat, deduplicated permission set.
// This is what the auth context actually stores and checks against.
// ─────────────────────────────────────────────────────────────────────────────
export function resolvePermissions(roles: string[]): Set<Permission> {
  const perms = new Set<Permission>();
  for (const role of roles) {
    const mapped = ROLE_PERMISSIONS[role as Role];
    if (mapped) mapped.forEach((p) => perms.add(p));
  }
  return perms;
}
