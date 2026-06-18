"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { DropZoneId } from "./types";
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
  rowHeaders: (
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
  columnHeaders: (
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
  items: ZoneItemType[];
  isOver: boolean;
  onRemoveItem: (dndId: string) => void;
  onClear: () => void;
}

export function DropZone({
  id,
  label,
  description,
  items,
  isOver,
  onRemoveItem,
  onClear,
}: DropZoneProps) {
  const { setNodeRef } = useDroppable({ id });
  const isEmpty = items.length === 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border-2 bg-card shadow-sm",
        "transition-all duration-200",
        isEmpty && !isOver && "border-dashed border-border/60",
        !isEmpty && !isOver && "border-border",
        isOver && "border-primary/70 bg-primary/5 shadow-md shadow-primary/10",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-between border-b px-3 py-2 transition-colors duration-200",
          isOver ? "border-primary/20 bg-primary/10" : "border-border/60 bg-muted/40",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "shrink-0 transition-colors duration-200",
              isOver ? "text-primary" : "text-muted-foreground/70",
            )}
          >
            {ZONE_ICONS[id]}
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-xs font-semibold leading-tight transition-colors duration-200",
                isOver ? "text-primary" : "text-foreground",
              )}
            >
              {label}
            </p>
            {description && (
              <p className="mt-0.5 truncate text-[10px] leading-none text-muted-foreground/60">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="ml-2 flex shrink-0 items-center gap-1.5">
          {!isEmpty && (
            <span className="bg-primary/12 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {items.length}
            </span>
          )}
          {!isEmpty && (
            <button
              type="button"
              onClick={onClear}
              className="rounded p-0.5 text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
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

      <SortableContext items={items.map((i) => i.dndId)} strategy={verticalListSortingStrategy}>
        <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2">
          {isEmpty ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <svg
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isOver ? "text-primary/60" : "text-muted-foreground/20",
                  )}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 4v12M4 10h12" />
                </svg>
                <p
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isOver ? "text-primary/80" : "text-muted-foreground/40",
                  )}
                >
                  {isOver ? "Release to drop" : "Drag or click a field"}
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
