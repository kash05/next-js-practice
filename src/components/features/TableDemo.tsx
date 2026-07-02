"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  GroupedColumnTable,
  GroupedRowTable,
} from "../common/table";

// ─── Shared sample data ────────────────────────────────────────────────────────

interface Order {
  id: string;
  name: string;
  quarter: string;
  status: "Paid" | "Pending" | "Overdue";
  amount: number;
  due: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
}

const DATA: Order[] = [
  {
    id: "1",
    name: "Acme Corp",
    quarter: "Q1",
    status: "Paid",
    amount: 4200,
    due: "Jan 15",
    jan: 800,
    feb: 1200,
    mar: 2200,
    apr: 0,
    may: 0,
    jun: 0,
  },
  {
    id: "2",
    name: "Globex Inc",
    quarter: "Q1",
    status: "Pending",
    amount: 1800,
    due: "Feb 03",
    jan: 600,
    feb: 700,
    mar: 500,
    apr: 0,
    may: 0,
    jun: 0,
  },
  {
    id: "3",
    name: "Initech Ltd",
    quarter: "Q1",
    status: "Paid",
    amount: 9500,
    due: "Feb 28",
    jan: 3000,
    feb: 3200,
    mar: 3300,
    apr: 0,
    may: 0,
    jun: 0,
  },
  {
    id: "4",
    name: "Umbrella Co",
    quarter: "Q2",
    status: "Overdue",
    amount: 3100,
    due: "Mar 10",
    jan: 0,
    feb: 0,
    mar: 0,
    apr: 900,
    may: 1100,
    jun: 1100,
  },
  {
    id: "5",
    name: "Stark Industries",
    quarter: "Q2",
    status: "Paid",
    amount: 22000,
    due: "Apr 05",
    jan: 0,
    feb: 0,
    mar: 0,
    apr: 7000,
    may: 8000,
    jun: 7000,
  },
  {
    id: "6",
    name: "Wayne Enterprises",
    quarter: "Q2",
    status: "Pending",
    amount: 8750,
    due: "Apr 22",
    jan: 0,
    feb: 0,
    mar: 0,
    apr: 2800,
    may: 3000,
    jun: 2950,
  },
];

const STATUS_STYLES: Record<Order["status"], string> = {
  Paid: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Overdue: "bg-destructive/10 text-destructive",
};

function StatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

// ─── Column definitions ────────────────────────────────────────────────────────

const BASE_COLUMNS: ColumnDef<Order, unknown>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    size: 180,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    size: 110,
    cell: ({ getValue }) => (
      <StatusBadge status={getValue() as Order["status"]} />
    ),
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: "Amount",
    size: 110,
    cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}`,
  },
  {
    id: "due",
    accessorKey: "due",
    header: "Due date",
    size: 110,
  },
];

const REVENUE_COLUMNS: ColumnDef<Order, unknown>[] = [
  { id: "name", accessorKey: "name", header: "Client", size: 160 },
  {
    id: "jan",
    accessorKey: "jan",
    header: "Jan",
    size: 80,
    cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}`,
  },
  {
    id: "feb",
    accessorKey: "feb",
    header: "Feb",
    size: 80,
    cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}`,
  },
  {
    id: "mar",
    accessorKey: "mar",
    header: "Mar",
    size: 80,
    cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}`,
  },
  {
    id: "apr",
    accessorKey: "apr",
    header: "Apr",
    size: 80,
    cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}`,
  },
  {
    id: "may",
    accessorKey: "may",
    header: "May",
    size: 80,
    cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}`,
  },
  {
    id: "jun",
    accessorKey: "jun",
    header: "Jun",
    size: 80,
    cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}`,
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: "Total",
    size: 100,
    cell: ({ getValue }) => (
      <strong>${(getValue() as number).toLocaleString()}</strong>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export function TablesDemo() {
  return (
    <div className="space-y-12">
      {/* ── 1. Simple Table ─────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">1 — Simple Table</h2>
          <p className="text-muted-foreground text-sm">
            Sorting, multi-select checkboxes, sticky first column.
          </p>
        </div>
        <DataTable
          data={DATA}
          columns={BASE_COLUMNS}
          enableSorting
          enableRowSelection
          stickyLeft={["name"]}
        />
      </section>

      {/* ── 2. Grouped Row Table ────────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">2 — Grouped Row Table</h2>
          <p className="text-muted-foreground text-sm">
            Rows grouped by quarter. Label cell spans all rows in the group.
            Group-level checkbox selects all rows in the group.
          </p>
        </div>
        <GroupedRowTable
          data={DATA as unknown as Record<string, unknown>[]}
          columns={
            BASE_COLUMNS as ColumnDef<Record<string, unknown>, unknown>[]
          }
          groupByKey="quarter"
          getGroupLabel={(val) => `${String(val)} 2024`}
          enableSorting
          enableRowSelection
          stickyLeft={["name"]}
        />
      </section>

      {/* ── 3. Grouped Column Table ─────────────────────────────────────── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">3 — Grouped Column Table</h2>
          <p className="text-muted-foreground text-sm">
            Jan–Mar grouped under &quot;Q1 Revenue&quot;, Apr–Jun under &quot;Q2
            Revenue&quot;. Client and Total are standalone (span both header
            rows).
          </p>
        </div>
        <GroupedColumnTable
          data={DATA}
          columns={REVENUE_COLUMNS}
          columnGroups={[
            {
              label: "Q1 Revenue",
              columnIds: ["jan", "feb", "mar"],
              className: "bg-primary/5 text-primary",
            },
            {
              label: "Q2 Revenue",
              columnIds: ["apr", "may", "jun"],
              className: "bg-success/5 text-success",
            },
          ]}
          enableSorting
          enableRowSelection
          stickyLeft={["name"]}
          stickyRight={["amount"]}
        />
      </section>
    </div>
  );
}
