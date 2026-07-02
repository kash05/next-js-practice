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
  RowSelectionState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { GroupedColumnTableProps, ColumnGroup } from "./types";
import {
  buildSelectColumn,
  getStickyClass,
  getStickyStyle,
  SortableHeader,
  TableEmpty,
  TableShell,
} from "./shared";

/**
 * GroupedColumnTable — Table variant 3.
 *
 * Certain columns share a merged header cell spanning multiple columns.
 * The group header sits in row 1; individual column headers sit in row 2.
 * Columns not belonging to any group get a single cell that spans both rows.
 *
 * Architecture note: TanStack's built-in column grouping (headerGroups) works
 * by nesting column definitions. We intentionally avoid restructuring the caller's
 * column definitions — they stay flat. Instead we compute the two-row header
 * layout ourselves from the `columnGroups` prop, keeping the column definitions
 * portable across all three table variants.
 *
 * Usage:
 *   <GroupedColumnTable
 *     data={sales}
 *     columns={salesColumns}
 *     columnGroups={[
 *       { label: "Q1 Revenue", columnIds: ["jan", "feb", "mar"], className: "bg-blue-50 text-blue-700" },
 *       { label: "Q2 Revenue", columnIds: ["apr", "may", "jun"], className: "bg-green-50 text-green-700" },
 *     ]}
 *     enableSorting
 *     enableRowSelection
 *     stickyLeft={["name"]}
 *   />
 */
export function GroupedColumnTable<TData>({
  data,
  columns,
  columnGroups,
  enableSorting = false,
  enableRowSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  stickyLeft = [],
  stickyRight = [],
  onRowClick,
  onSortingChange,
  className,
}: GroupedColumnTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});

  const sorting = internalSorting;
  const rowSelection = controlledRowSelection ?? internalRowSelection;

  const columnPinning = useMemo<ColumnPinningState>(() => {
    const left = [...stickyLeft];
    if (enableRowSelection) left.unshift("__select__");
    return { left, right: stickyRight };
  }, [stickyLeft, stickyRight, enableRowSelection]);

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

  const visibleLeafHeaders = useMemo(
    () => table.getHeaderGroups()[0]?.headers ?? [],
    [table],
  );

  // ── Build two-row header layout ───────────────────────────────────────────
  // Build a lookup: columnId → which group it belongs to
  const columnToGroup = useMemo<Map<string, ColumnGroup>>(() => {
    const map = new Map<string, ColumnGroup>();
    for (const group of columnGroups) {
      for (const id of group.columnIds) {
        map.set(id, group);
      }
    }
    return map;
  }, [columnGroups]);

  /**
   * Row 1 cells — each entry is either:
   *   - A group span cell: { type: "group", group, span }
   *   - A standalone cell: { type: "standalone", headerId } (spans 2 rows)
   * We walk through visible headers left-to-right, collapsing consecutive
   * columns that belong to the same group into one cell.
   */
  const topRowCells = useMemo(() => {
    type TopCell =
      | {
          type: "group";
          group: ColumnGroup;
          span: number;
          firstHeaderId: string;
        }
      | { type: "standalone"; headerId: string; columnId: string };

    const cells: TopCell[] = [];
    let i = 0;

    while (i < visibleLeafHeaders.length) {
      const header = visibleLeafHeaders[i];
      const colId = header.column.id;
      const group = columnToGroup.get(colId);

      if (group) {
        // Count consecutive columns in the same group
        let span = 0;
        const firstHeaderId = header.id;
        while (
          i + span < visibleLeafHeaders.length &&
          columnToGroup.get(visibleLeafHeaders[i + span].column.id) === group
        ) {
          span++;
        }
        cells.push({ type: "group", group, span, firstHeaderId });
        i += span;
      } else {
        cells.push({
          type: "standalone",
          headerId: header.id,
          columnId: colId,
        });
        i++;
      }
    }
    return cells;
  }, [visibleLeafHeaders, columnToGroup]);

  return (
    <TableShell className={className}>
      <thead>
        {/* ── Row 1: group labels + standalone column headers ── */}
        <tr className="border-border bg-muted/50 border-b">
          {topRowCells.map((cell) => {
            if (cell.type === "group") {
              return (
                <th
                  key={`group-${cell.firstHeaderId}`}
                  colSpan={cell.span}
                  className={cn(
                    "border-border border-b px-3 py-2 text-center text-xs font-semibold",
                    "border-border/40 border-r border-l",
                    cell.group.className ??
                      "bg-accent/60 text-accent-foreground",
                  )}
                >
                  {cell.group.label}
                </th>
              );
            }

            // Standalone column — spans both header rows (rowSpan=2)
            const header = visibleLeafHeaders.find(
              (h) => h.id === cell.headerId,
            );
            if (!header) return null;
            const pinned = header.column.getIsPinned();

            return (
              <th
                key={cell.headerId}
                rowSpan={2}
                style={{
                  width: header.getSize(),
                  ...getStickyStyle(header.column),
                }}
                className={cn(
                  "text-muted-foreground px-3 py-2.5 text-left text-xs font-medium",
                  "border-border bg-muted/50 border-b",
                  getStickyClass(pinned),
                )}
              >
                <SortableHeader column={header.column}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </SortableHeader>
              </th>
            );
          })}
        </tr>

        {/* ── Row 2: individual column headers for grouped columns only ── */}
        <tr className="border-border bg-muted/30 border-b">
          {visibleLeafHeaders.map((header) => {
            const group = columnToGroup.get(header.column.id);
            // Standalone columns already rendered with rowSpan=2 above — skip them
            if (!group) return null;

            const pinned = header.column.getIsPinned();
            return (
              <th
                key={header.id}
                style={{
                  width: header.getSize(),
                  ...getStickyStyle(header.column),
                }}
                className={cn(
                  "border-border/30 text-muted-foreground border-l px-3 py-2 text-left text-xs font-medium",
                  "bg-muted/30",
                  getStickyClass(pinned),
                )}
              >
                <SortableHeader column={header.column}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </SortableHeader>
              </th>
            );
          })}
        </tr>
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
                const inGroup = columnToGroup.has(cell.column.id);
                return (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                      ...getStickyStyle(cell.column),
                    }}
                    className={cn(
                      "text-foreground px-3 py-2.5 text-sm",
                      inGroup && "border-border/20 border-l",
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
