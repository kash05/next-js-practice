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
            <p className="text-muted-foreground text-sm">
              Manage and track all orders.
            </p>
          </div>

          <PermissionGate requires={PERMISSIONS.ORDERS_CREATE}>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium">
              New order
            </button>
          </PermissionGate>
        </div>

        {/* Orders table goes here */}
        <div className="border-border bg-card rounded-lg border p-6">
          <TablesDemo />
        </div>

        <PermissionGate
          requiresAny={[PERMISSIONS.ORDERS_APPROVE, PERMISSIONS.ORDERS_DELETE]}
        >
          <div className="border-border bg-card rounded-lg border p-6">
            <p className="text-sm font-medium">Pending approvals</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Wire up pending approvals panel here.
            </p>
          </div>
        </PermissionGate>

        <PermissionGate
          requires={PERMISSIONS.ORDERS_EXPORT}
          fallback={
            <p className="text-muted-foreground text-sm">
              Export is not available for your role.
            </p>
          }
        >
          <button className="border-border hover:bg-accent rounded-md border px-4 py-2 text-sm">
            Export CSV
          </button>
        </PermissionGate>
      </div>
    </RouteGuard>
  );
}
