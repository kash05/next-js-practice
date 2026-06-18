import type { Metadata } from "next";
import { RouteGuard } from "@/components/providers/RouteGuard";
import { PermissionGate } from "@/components/providers/PermissionGate";
import { PERMISSIONS } from "@/config/permissions";
import { TablesDemo } from "@/components/features/TableDemo";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <RouteGuard requires={PERMISSIONS.ORDERS_VIEW}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
            <p className="text-sm text-muted-foreground">Manage and track all orders.</p>
          </div>

          <PermissionGate requires={PERMISSIONS.ORDERS_CREATE}>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              New order
            </button>
          </PermissionGate>
        </div>

        {/* Orders table goes here */}
        <div className="rounded-lg border border-border bg-card p-6">
          <TablesDemo />
        </div>

        <PermissionGate requiresAny={[PERMISSIONS.ORDERS_APPROVE, PERMISSIONS.ORDERS_DELETE]}>
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="text-sm font-medium">Pending approvals</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Wire up pending approvals panel here.
            </p>
          </div>
        </PermissionGate>

        <PermissionGate
          requires={PERMISSIONS.ORDERS_EXPORT}
          fallback={
            <p className="text-sm text-muted-foreground">Export is not available for your role.</p>
          }
        >
          <button className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent">
            Export CSV
          </button>
        </PermissionGate>
      </div>
    </RouteGuard>
  );
}
