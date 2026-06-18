// ── API response envelope ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Table ─────────────────────────────────────────────────────────────────────
export interface GroupedRow<T> {
  groupKey: string;
  groupLabel: string;
  rows: T[];
}

export type GroupedTableData<T> = GroupedRow<T>[];

// ── Common UI ─────────────────────────────────────────────────────────────────
export interface SelectOption<T = string> {
  label: string;
  value: T;
}
