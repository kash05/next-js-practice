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
import { GroupedRowTableProps } from "./types";
import {
  buildSelectColumn,
  getStickyClass,
  getStickyStyle,
  SortableHeader,
  TableEmpty,
  TableShell,
  TableCheckbox,
} from "./shared";

/**
 * GroupedRowTable — Table variant 2.
 *
 * Rows are visually grouped under a label cell that spans N rows on the left.
 * The label cell has a coloured left border as a group accent.
 *
 * We pre-process the flat data into
 * groups ourselves and handle the span in JSX. TanStack still manages columns,
 * sorting (within-group), selection, and pinning.
 *
 * Usage:
 *   <GroupedRowTable
 *     data={orders}
 *     columns={orderColumns}
 *     groupByKey="quarter"
 *     getGroupLabel={(val) => `Q${val} 2024`}
 *     enableSorting
 *     enableRowSelection
 *     stickyLeft={["name"]}
 *   />
 */
export function GroupedRowTable<TData extends Record<string, unknown>>({
  data,
  columns,
  groupByKey,
  getGroupLabel,
  renderGroupLabel,
  groupLabelWidth = 120,
  enableSorting = false,
  enableRowSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  stickyLeft = [],
  stickyRight = [],
  onRowClick,
  onSortingChange,
  className,
}: GroupedRowTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});

  const sorting = internalSorting;
  const rowSelection = controlledRowSelection ?? internalRowSelection;

  // ── Pre-process flat data → groups ────────────────────────────────────────
  const groups = useMemo(() => {
    const map = new Map<string, TData[]>();
    for (const row of data) {
      const key = String(row[groupByKey as string]);
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(row);
    }
    return Array.from(map.entries()).map(([key, rows]) => ({
      key,
      label: getGroupLabel
        ? getGroupLabel(
            rows[0][groupByKey as string] as TData[keyof TData],
            rows,
          )
        : key,
      rows,
    }));
  }, [data, groupByKey, getGroupLabel]);

  // ── Column pinning ─────────────────────────────────────────────────────────
  const columnPinning = useMemo<ColumnPinningState>(() => {
    const left = [...stickyLeft];
    if (enableRowSelection) left.unshift("__select__");
    return { left, right: stickyRight };
  }, [stickyLeft, stickyRight, enableRowSelection]);

  // ── Columns ────────────────────────────────────────────────────────────────
  const allColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!enableRowSelection) return columns;
    return [
      buildSelectColumn<TData>() as ColumnDef<TData, unknown>,
      ...columns,
    ];
  }, [columns, enableRowSelection]);

  // TanStack manages the flat row list for column/sort/selection logic.
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

  // Map original data object → TanStack row (for selection / cell rendering)
  const rowByOriginal = useMemo(() => {
    const map = new WeakMap<
      object,
      typeof table.getRowModel.prototype extends () => infer R ? R : never
    >();
    // WeakMap keyed by object reference — works because TData extends object
    table
      .getRowModel()
      .rows.forEach((r) => map.set(r.original as object, r as never));
    return map;
  }, [table]);

  // Group-level selection helpers
  function isGroupSelected(rows: TData[]) {
    return rows.every((r) => {
      const row = rowByOriginal.get(r as object) as
        { getIsSelected?: () => boolean } | undefined;
      return row?.getIsSelected?.() ?? false;
    });
  }
  function isGroupIndeterminate(rows: TData[]) {
    const selected = rows.filter((r) => {
      const row = rowByOriginal.get(r as object) as
        { getIsSelected?: () => boolean } | undefined;
      return row?.getIsSelected?.() ?? false;
    });
    return selected.length > 0 && selected.length < rows.length;
  }
  function toggleGroup(rows: TData[], select: boolean) {
    rows.forEach((r) => {
      const row = rowByOriginal.get(r as object) as
        | {
            getIsSelected?: () => boolean;
            toggleSelected?: (val: boolean) => void;
          }
        | undefined;
      row?.toggleSelected?.(select);
    });
  }

  return (
    <TableShell className={className}>
      {/* ── Head ────────────────────────────────────────────────────────── */}
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="border-border bg-muted/50 border-b"
          >
            {/* Extra th for the group label column */}
            <th
              style={{ width: groupLabelWidth, minWidth: groupLabelWidth }}
              className="bg-muted/50 text-muted-foreground px-3 py-2.5 text-left text-xs font-medium"
            />
            {headerGroup.headers.map((header) => {
              const pinned = header.column.getIsPinned();
              return (
                <th
                  key={header.id}
                  style={{
                    width: header.getSize(),
                    ...getStickyStyle(header.column),
                  }}
                  className={cn(
                    "text-muted-foreground px-3 py-2.5 text-left text-xs font-medium",
                    "bg-muted/50",
                    getStickyClass(pinned),
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
        {data.length === 0 ? (
          <TableEmpty colSpan={allColumns.length + 1} />
        ) : (
          groups.map((group, groupIndex) =>
            group.rows.map((rowData, rowIndex) => {
              const row = rowByOriginal.get(rowData as object) as
                | {
                    id: string;
                    getIsSelected: () => boolean;
                    getVisibleCells: () => {
                      id: string;
                      column: ReturnType<
                        typeof table.getVisibleLeafColumns
                      >[number];
                      getContext: () => any;
                    }[];
                  }
                | undefined;

              if (!row) return null;
              const isFirst = rowIndex === 0;

              return (
                <tr
                  key={row.id}
                  data-selected={row.getIsSelected()}
                  onClick={() => onRowClick?.(rowData)}
                  className={cn(
                    "border-border/60 border-b transition-colors last:border-0",
                    groupIndex > 0 && isFirst && "border-t-border border-t-2",
                    onRowClick && "hover:bg-accent/40 cursor-pointer",
                    row.getIsSelected() && "bg-primary/5",
                  )}
                >
                  {/* ── Group label cell — only rendered once per group ── */}
                  {isFirst && (
                    <td
                      rowSpan={group.rows.length}
                      style={{
                        width: groupLabelWidth,
                        minWidth: groupLabelWidth,
                      }}
                      className="border-primary bg-primary/5 border-r-2 px-3 align-middle"
                    >
                      {renderGroupLabel ? (
                        renderGroupLabel(group)
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          {/* Group-level select checkbox */}
                          {enableRowSelection && (
                            <TableCheckbox
                              checked={isGroupSelected(group.rows)}
                              indeterminate={isGroupIndeterminate(group.rows)}
                              onChange={(e) =>
                                toggleGroup(group.rows, e.target.checked)
                              }
                              label={`Select group ${group.label}`}
                            />
                          )}
                          <span className="text-primary text-center text-xs leading-tight font-medium">
                            {group.label}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {group.rows.length}{" "}
                            {group.rows.length === 1 ? "row" : "rows"}
                          </span>
                        </div>
                      )}
                    </td>
                  )}

                  {/* ── Data cells ── */}
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            }),
          )
        )}
      </tbody>
    </TableShell>
  );
}
