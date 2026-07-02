import {
  ColumnDef,
  RowSelectionState,
  SortingState,
} from "@tanstack/react-table";

// ─────────────────────────────────────────────────────────────────────────────
// Shared props that every table variant accepts
// ─────────────────────────────────────────────────────────────────────────────

export interface BaseTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];

  // ── Sorting ───────────────────────────────────────────────────────────────
  /** Enable column sorting. Clicking a header cycles asc → desc → none. */
  enableSorting?: boolean;

  // ── Row selection (checkbox column) ──────────────────────────────────────
  /** Render a checkbox as the first column for multi-row selection. */
  enableRowSelection?: boolean;
  /** Controlled selection state — pass in if you need selection outside the table. */
  rowSelection?: RowSelectionState;
  /** Called whenever selection changes. */
  onRowSelectionChange?: (selection: RowSelectionState) => void;

  // ── Sticky columns ────────────────────────────────────────────────────────
  /**
   * Column ids to pin to the LEFT.
   * The checkbox column (id: "__select__") is auto-pinned when enableRowSelection=true.
   * Example: stickyLeft={["name", "id"]}
   */
  stickyLeft?: string[];
  /**
   * Column ids to pin to the RIGHT.
   * Example: stickyRight={["actions"]}
   */
  stickyRight?: string[];

  // ── Row interaction ───────────────────────────────────────────────────────
  onRowClick?: (row: TData) => void;

  // ── State callbacks (controlled / server-side) ────────────────────────────
  onSortingChange?: (sorting: SortingState) => void;

  // ── Layout ────────────────────────────────────────────────────────────────
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Grouped row table extras
// ─────────────────────────────────────────────────────────────────────────────
export interface GroupedRowTableProps<TData> extends BaseTableProps<TData> {
  /** Key of TData to group by. */
  groupByKey: keyof TData;
  /** Optional — derive a display label from the raw group value. */
  getGroupLabel?: (value: TData[keyof TData], rows: TData[]) => string;
  /** Optional — custom renderer for the entire group label cell. */
  renderGroupLabel?: (group: {
    key: string;
    label: string;
    rows: TData[];
  }) => React.ReactNode;
  /** Width of the group label column in px. Default: 120. */
  groupLabelWidth?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Grouped column table extras
// ─────────────────────────────────────────────────────────────────────────────
export interface ColumnGroup {
  /** Display label shown in the merged header cell. */
  label: string;
  /** Column ids that belong to this group. */
  columnIds: string[];
  /** Optional accent class for the group header e.g. "bg-blue-50 text-blue-700" */
  className?: string;
}

export interface GroupedColumnTableProps<TData> extends BaseTableProps<TData> {
  /**
   * Declares which columns are grouped under a shared header.
   * Columns NOT listed in any group get a plain header cell spanning 1 row.
   */
  columnGroups: ColumnGroup[];
}
