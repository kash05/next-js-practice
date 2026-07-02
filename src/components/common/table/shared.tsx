"use client";

/**
 * Shared primitives used by all three table variants.
 * Nothing in here knows about grouping or the specific table shape.
 */

import { Column, Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Checkbox
// ─────────────────────────────────────────────────────────────────────────────
interface TableCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
}

export function TableCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
}: TableCheckboxProps) {
  return (
    <input
      type="checkbox"
      aria-label={label ?? "Select row"}
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate ?? false;
      }}
      onChange={onChange}
      className="border-border accent-primary h-4 w-4 cursor-pointer rounded"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sortable column header cell
// ─────────────────────────────────────────────────────────────────────────────
interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  children: React.ReactNode;
  className?: string;
}

export function SortableHeader<TData, TValue>({
  column,
  children,
  className,
}: SortableHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted();
  const canSort = column.getCanSort();

  return (
    <button
      type="button"
      onClick={canSort ? column.getToggleSortingHandler() : undefined}
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap",
        canSort && "hover:text-foreground cursor-pointer select-none",
        className,
      )}
    >
      {children}
      {canSort && (
        <span className="flex flex-col" aria-hidden="true">
          <svg
            className={cn(
              "h-2.5 w-2.5 transition-colors",
              sorted === "asc" ? "text-primary" : "text-border",
            )}
            viewBox="0 0 10 6"
            fill="currentColor"
          >
            <path d="M5 0L10 6H0L5 0Z" />
          </svg>
          <svg
            className={cn(
              "h-2.5 w-2.5 transition-colors",
              sorted === "desc" ? "text-primary" : "text-border",
            )}
            viewBox="0 0 10 6"
            fill="currentColor"
          >
            <path d="M5 6L0 0H10L5 6Z" />
          </svg>
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sticky column helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns inline style for a pinned column cell (th or td).
 * TanStack's column.getStart() / getAfter() give us the pixel offset.
 */
export function getStickyStyle<TData, TValue>(
  column: Column<TData, TValue>,
): React.CSSProperties {
  const pinned = column.getIsPinned();
  if (!pinned) return {};

  return {
    position: "sticky",
    left: pinned === "left" ? column.getStart("left") : undefined,
    right: pinned === "right" ? column.getAfter("right") : undefined,
    zIndex: 1,
  };
}

/**
 * Returns className additions for a sticky cell.
 */
export function getStickyClass(isPinned: false | "left" | "right"): string {
  if (!isPinned) return "";
  return cn(
    "bg-card", // must have a background or content bleeds through
    isPinned === "left" && "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]",
    isPinned === "right" && "shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.08)]",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Select-all checkbox column definition factory
// Used by all three tables so the checkbox column is consistent everywhere.
// ─────────────────────────────────────────────────────────────────────────────
export function buildSelectColumn<TData>() {
  return {
    id: "__select__",
    enableSorting: false,
    enablePinning: true,
    size: 44,
    header: ({ table }: { table: Table<TData> }) => (
      <TableCheckbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        label="Select all rows"
      />
    ),
    cell: ({ row }: { row: import("@tanstack/react-table").Row<TData> }) => (
      <TableCheckbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        label={`Select row ${row.index + 1}`}
      />
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────
export function TableEmpty({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="text-muted-foreground h-32 text-center text-sm"
      >
        No results.
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Table shell — the outer <div> + <table> wrapper with overflow handling
// ─────────────────────────────────────────────────────────────────────────────
export function TableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border w-full overflow-auto rounded-lg border",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}
