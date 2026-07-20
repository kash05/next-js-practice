"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { DropZoneId, ZoneCategory } from "./types";
import { ZoneItem as ZoneItemType } from "./useDragAndDropBoard";
import { ZoneItem } from "./DraggableItem";

const ZONE_ICONS: Record<DropZoneId, React.ReactNode> = {
  rowMeasures: (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <rect x="2" y="5" width="16" height="3.5" rx="0.5" />
      <rect x="2" y="11.5" width="16" height="3.5" rx="0.5" />
    </svg>
  ),
  columnMeasures: (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <rect x="2" y="2" width="4" height="16" rx="0.5" />
      <rect x="8" y="2" width="4" height="16" rx="0.5" />
      <rect x="14" y="2" width="4" height="16" rx="0.5" />
    </svg>
  ),
  rowDimensions: (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <rect x="2" y="2" width="5" height="16" rx="0.5" />
      <line x1="10" y1="6" x2="18" y2="6" />
      <line x1="10" y1="10" x2="18" y2="10" />
      <line x1="10" y1="14" x2="18" y2="14" />
    </svg>
  ),
  columnDimensions: (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <rect x="2" y="2" width="16" height="5" rx="0.5" />
      <line x1="6" y1="10" x2="6" y2="18" />
      <line x1="10" y1="10" x2="10" y2="18" />
      <line x1="14" y1="10" x2="14" y2="18" />
    </svg>
  ),
};

interface DropZoneProps {
  id: DropZoneId;
  label: string;
  description?: string;
  accepts: ZoneCategory;
  items: ZoneItemType[];
  isOver: boolean;
  /**
   * True when the item currently being dragged is incompatible with this zone.
   * Greyes out the zone and shows not-allowed cursor to signal rejection.
   */
  isDisabled: boolean;
  onRemoveItem: (dndId: string) => void;
  onClear: () => void;
}

export function DropZone({
  id,
  label,
  description,
  accepts,
  items,
  isOver,
  isDisabled,
  onRemoveItem,
  onClear,
}: DropZoneProps) {
  // Still register as droppable so dnd-kit tracks position —
  // the rejection happens in onDragEnd, the UI just signals it visually here
  const { setNodeRef } = useDroppable({ id });
  const isEmpty = items.length === 0;

  const emptyHint =
    accepts === "dimension" ? "Drag a dimension here" : "Drag a measure here";
  const disabledHint =
    accepts === "dimension"
      ? "Only dimensions allowed"
      : "Only measures allowed";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border-2 shadow-sm",
        "transition-all duration-200",
        // ── Disabled state — incompatible item being dragged ──────────────
        isDisabled && [
          "border-border/30 bg-bg-muted/40 cursor-not-allowed",
          "opacity-50 grayscale-[30%]",
        ],
        // ── Normal states (only when not disabled) ────────────────────────
        !isDisabled &&
          isEmpty &&
          !isOver &&
          "border-border/60 bg-card border-dashed",
        !isDisabled && !isEmpty && !isOver && "border-border bg-card",
        !isDisabled &&
          isOver &&
          "border-primary/70 bg-primary/5 shadow-primary/10 shadow-md",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-between border-b px-3 py-2 transition-colors duration-200",
          isDisabled
            ? "border-border/30 bg-bg-subtle/30"
            : isOver
              ? "border-primary/20 bg-primary/10"
              : "border-border/60 bg-bg-subtle/60",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "shrink-0 transition-colors duration-200",
              isDisabled
                ? "text-text-disabled"
                : isOver
                  ? "text-primary"
                  : "text-text-tertiary",
            )}
          >
            {ZONE_ICONS[id]}
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-xs leading-tight font-semibold transition-colors duration-200",
                isDisabled
                  ? "text-text-disabled"
                  : isOver
                    ? "text-primary"
                    : "text-text-primary",
              )}
            >
              {label}
            </p>
            {description && (
              <p className="text-text-tertiary/70 mt-0.5 truncate text-[10px] leading-none">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="ml-2 flex shrink-0 items-center gap-1.5">
          {/* Show a small "not allowed" badge when disabled */}
          {isDisabled && (
            <span className="bg-error-bg text-error rounded px-1.5 py-0.5 text-[9px] font-medium">
              Not allowed
            </span>
          )}
          {!isDisabled && !isEmpty && (
            <span className="bg-primary/12 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
              {items.length}
            </span>
          )}
          {!isDisabled && !isEmpty && (
            <button
              type="button"
              onClick={onClear}
              className="text-text-tertiary/50 hover:bg-error-bg hover:text-error rounded p-0.5 transition-colors"
              title="Clear all"
            >
              <svg
                viewBox="0 0 10 10"
                className="h-2.5 w-2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
              >
                <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Item list */}
      <SortableContext
        items={items.map((i) => i.dndId)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={cn(
            "flex min-h-0 flex-1 scrollbar-thin flex-col gap-1.5 overflow-y-auto p-2",
            isDisabled && "pointer-events-none", // block all interaction when disabled
          )}
        >
          {isEmpty ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-1.5 text-center">
                {isDisabled ? (
                  // Not-allowed icon
                  <svg
                    className="text-error/40 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.2}
                  >
                    <circle cx="10" cy="10" r="7" />
                    <line x1="4" y1="4" x2="16" y2="16" />
                  </svg>
                ) : (
                  <svg
                    className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isOver ? "text-primary/60" : "text-text-disabled/40",
                    )}
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 4v12M4 10h12"
                    />
                  </svg>
                )}
                <p
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isDisabled
                      ? "text-error/50"
                      : isOver
                        ? "text-primary/80"
                        : "text-text-disabled/50",
                  )}
                >
                  {isDisabled
                    ? disabledHint
                    : isOver
                      ? "Release to drop"
                      : emptyHint}
                </p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <ZoneItem
                key={item.dndId}
                field={item}
                dndId={item.dndId}
                onRemove={() => onRemoveItem(item.dndId)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
