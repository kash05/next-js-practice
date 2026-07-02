/** A single draggable field item */
export interface FieldItem {
  /** Unique identifier — used as dnd-kit's id */
  id: string;
  /** Display label */
  label: string;
  /** Optional metadata (data type, format, etc.) — passed through untouched */
  meta?: Record<string, unknown>;
}

/** The four report axis zones */
export type DropZoneId =
  "rowMeasures" | "columnMeasures" | "rowHeaders" | "columnHeaders";

/** Snapshot of all four drop zones — this is what gets sent to the API */
export interface BoardState {
  rowMeasures: FieldItem[];
  columnMeasures: FieldItem[];
  rowHeaders: FieldItem[];
  columnHeaders: FieldItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DnD kit internal identifiers
// Items can originate from one of two source lists, or from a drop zone.
// We prefix ids so we always know where a drag originated.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every draggable element in the system gets a unique dnd id.
 * Format:  "<sourceType>|<zoneId?>|<fieldId>|<instanceKey>"
 *   sourceType : "list-a" | "list-b" | "zone"
 *   zoneId     : drop zone id (only when sourceType = "zone")
 *   fieldId    : the FieldItem.id
 *   instanceKey: random key so the same field can appear in multiple zones
 */
export interface DndId {
  sourceType: "list-a" | "list-b" | "zone";
  zoneId?: DropZoneId;
  fieldId: string;
  instanceKey: string;
}

export function encodeDndId(parts: DndId): string {
  return JSON.stringify(parts);
}

export function decodeDndId(raw: string): DndId | null {
  try {
    return JSON.parse(raw) as DndId;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Props for the public DragDropBoard component
// ─────────────────────────────────────────────────────────────────────────────

export interface DropZoneConfig {
  id: DropZoneId;
  label: string;
  description?: string;
}

export interface DragDropBoardProps {
  /** Items for the first (left) source list */
  listA: FieldItem[];
  listALabel?: string;
  listALoading?: boolean;

  /** Items for the second source list */
  listB: FieldItem[];
  listBLabel?: string;
  listBLoading?: boolean;

  /**
   * Override drop zone labels/descriptions.
   * Defaults are: Row Measures, Column Measures, Row Headers, Column Headers.
   */
  zones?: DropZoneConfig[];

  /** Initial state of the board (controlled / hydrated from saved state) */
  initialState?: Partial<BoardState>;

  /** Called whenever any zone changes */
  onChange?: (state: BoardState) => void;

  className?: string;
}
