"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
  ColumnPinningState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { BaseTableProps } from "./types";
import {
  buildSelectColumn,
  getStickyClass,
  getStickyStyle,
  SortableHeader,
  TableEmpty,
  TableShell,
} from "./shared";

/**
 * DataTable — Table variant 1: simple rows and columns.
 *
 * Supports:
 *  - Column sorting (enableSorting)
 *  - Multi-row selection via checkbox column (enableRowSelection)
 *  - Sticky/pinned columns left or right (stickyLeft, stickyRight)
 *  - Row click handler (onRowClick)
 *
 * Usage:
 *   <DataTable
 *     data={orders}
 *     columns={orderColumns}
 *     enableSorting
 *     enableRowSelection
 *     stickyLeft={["id", "name"]}
 *     stickyRight={["actions"]}
 *     onRowClick={(row) => router.push(`/orders/${row.id}`)}
 *   />
 */
export function DataTable<TData>({
  data,
  columns,
  enableSorting = false,
  enableRowSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  stickyLeft = [],
  stickyRight = [],
  onRowClick,
  onSortingChange,
  className,
}: BaseTableProps<TData>) {
  // ── Internal state (used when caller does not control these) ──────────────
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalRowSelection, setInternalRowSelection] = useState({});

  const sorting = internalSorting;
  const rowSelection = controlledRowSelection ?? internalRowSelection;

  // ── Column pinning state ───────────────────────────────────────────────────
  const columnPinning = useMemo<ColumnPinningState>(() => {
    const left = [...stickyLeft];
    if (enableRowSelection) left.unshift("__select__");
    return { left, right: stickyRight };
  }, [stickyLeft, stickyRight, enableRowSelection]);

  // ── Prepend checkbox column when enabled ──────────────────────────────────
  const allColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!enableRowSelection) return columns;
    return [
      buildSelectColumn<TData>() as ColumnDef<TData, unknown>,
      ...columns,
    ];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, rowSelection, columnPinning },
    enableSorting,
    enableRowSelection,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setInternalSorting(next);
      onSortingChange?.(next);
    },
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setInternalRowSelection(next);
      onRowSelectionChange?.(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <TableShell className={className}>
      {/* ── Head ────────────────────────────────────────────────────────── */}
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="border-border bg-muted/50 border-b"
          >
            {headerGroup.headers.map((header) => {
              const pinned = header.column.getIsPinned();
              return (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    width: header.getSize(),
                    ...getStickyStyle(header.column),
                  }}
                  className={cn(
                    "text-muted-foreground px-3 py-2.5 text-left text-xs font-medium",
                    getStickyClass(pinned),
                    "bg-muted/50",
                  )}
                >
                  {header.isPlaceholder ? null : (
                    <SortableHeader column={header.column}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </SortableHeader>
                  )}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <tbody>
        {table.getRowModel().rows.length === 0 ? (
          <TableEmpty colSpan={allColumns.length} />
        ) : (
          table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              data-selected={row.getIsSelected()}
              onClick={() => onRowClick?.(row.original)}
              className={cn(
                "border-border/60 border-b transition-colors last:border-0",
                onRowClick && "hover:bg-accent/40 cursor-pointer",
                row.getIsSelected() && "bg-primary/5",
              )}
            >
              {row.getVisibleCells().map((cell) => {
                const pinned = cell.column.getIsPinned();
                return (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      ...getStickyStyle(cell.column),
                    }}
                    className={cn(
                      "text-foreground px-3 py-2.5 text-sm",
                      getStickyClass(pinned),
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))
        )}
      </tbody>
    </TableShell>
  );
}
