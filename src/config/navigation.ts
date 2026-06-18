import { Permission, PERMISSIONS } from "@/config/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // Lucide icon name
  permission?: Permission; // If set, item hidden when user lacks this
  children?: NavItem[]; // Sub-nav (second level)
  badge?: string; // Optional pill: "New", "Beta"
}

/**
 * Central navigation config. Every nav item declares its required permission.
 * The AppShell filters this list at render time — no permission = no item shown.
 * Never show a nav link to a page the user can't access.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: "ShoppingCart",
    permission: PERMISSIONS.ORDERS_VIEW,
    children: [
      { label: "All orders", href: "/orders", icon: "List", permission: PERMISSIONS.ORDERS_VIEW },
      {
        label: "Pending",
        href: "/orders/pending",
        icon: "Clock",
        permission: PERMISSIONS.ORDERS_VIEW,
      },
      {
        label: "Approvals",
        href: "/orders/approve",
        icon: "CheckCircle",
        permission: PERMISSIONS.ORDERS_APPROVE,
      },
    ],
  },
  {
    label: "Users",
    href: "/users",
    icon: "Users",
    permission: PERMISSIONS.USERS_VIEW,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "BarChart2",
    permission: PERMISSIONS.REPORTS_VIEW,
    children: [
      {
        label: "Overview",
        href: "/reports",
        icon: "BarChart2",
        permission: PERMISSIONS.REPORTS_VIEW,
      },
      {
        label: "Financial",
        href: "/reports/financial",
        icon: "DollarSign",
        permission: PERMISSIONS.REPORTS_VIEW_FINANCIAL,
      },
    ],
  },
  {
    label: "Billing",
    href: "/billing",
    icon: "CreditCard",
    permission: PERMISSIONS.BILLING_VIEW,
  },
  {
    label: "Audit log",
    href: "/audit",
    icon: "ScrollText",
    permission: PERMISSIONS.AUDIT_VIEW,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "Settings",
    permission: PERMISSIONS.SETTINGS_VIEW,
    children: [
      {
        label: "General",
        href: "/settings",
        icon: "Settings",
        permission: PERMISSIONS.SETTINGS_EDIT_GENERAL,
      },
      {
        label: "Security",
        href: "/settings/security",
        icon: "Shield",
        permission: PERMISSIONS.SETTINGS_EDIT_SECURITY,
      },
      {
        label: "Roles",
        href: "/settings/roles",
        icon: "Key",
        permission: PERMISSIONS.SETTINGS_MANAGE_ROLES,
      },
      {
        label: "Integrations",
        href: "/settings/integrations",
        icon: "Plug",
        permission: PERMISSIONS.SETTINGS_MANAGE_INTEGRATIONS,
      },
    ],
  },
];
