import { DragAndDropBoard } from "@/components/features/DragDropBoard";
import { RouteGuard } from "@/components/providers/RouteGuard";
import { PERMISSIONS } from "@/config/permissions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <RouteGuard requires={PERMISSIONS.DASHBOARD_VIEW}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back.</p>
        </div>
        <DragAndDropBoard />
      </div>
    </RouteGuard>
  );
}
