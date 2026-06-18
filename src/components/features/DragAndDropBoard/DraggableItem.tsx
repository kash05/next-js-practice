"use client";

import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { FieldItem } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Source list item
// ─────────────────────────────────────────────────────────────────────────────
interface SourceItemProps {
  field: FieldItem;
  dndId: string;
  onClick?: () => void;
  isUsed?: boolean;
}

export function SourceItem({ field, dndId, onClick, isUsed }: SourceItemProps) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: dndId,
    disabled: isUsed,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(0px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.35 : 1,
    transition: isDragging ? "none" : "opacity 120ms ease",
    position: isDragging ? "relative" : undefined,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex shrink-0 select-none items-center gap-2 rounded-lg border px-2.5 py-2 text-sm",
        "transition-colors duration-100",
        isUsed
          ? "cursor-not-allowed border-border/30 bg-muted/20 text-muted-foreground/40"
          : [
              "cursor-grab border-border bg-card text-foreground",
              "hover:border-primary/40 hover:bg-primary/5",
              isDragging && "shadow-sm ring-1 ring-primary/20",
            ],
      )}
      onClick={() => !isUsed && onClick?.()}
      title={isUsed ? "Already added" : "Click to add · Drag to place"}
    >
      <span
        className={cn(
          "flex shrink-0 flex-col gap-[3px]",
          isUsed ? "opacity-15" : "opacity-25 group-hover:opacity-50",
        )}
      >
        {[0, 1].map((r) => (
          <span key={r} className="flex gap-[3px]">
            {[0, 1].map((c) => (
              <span key={c} className="h-[3px] w-[3px] rounded-full bg-current" />
            ))}
          </span>
        ))}
      </span>

      <span className="flex-1 truncate text-xs leading-snug">{field.label}</span>

      {isUsed ? (
        <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground/50">
          added
        </span>
      ) : (
        <svg
          className="h-3 w-3 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-primary/40"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Zone item — whole body is the drag handle except the X button
// ─────────────────────────────────────────────────────────────────────────────
interface ZoneItemProps {
  field: FieldItem;
  dndId: string;
  onRemove: () => void;
  isOverlay?: boolean;
}

export function ZoneItem({ field, dndId, onRemove, isOverlay }: ZoneItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dndId,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : (transition ?? "transform 180ms ease"),
    opacity: isDragging ? 0.25 : 1,
  };

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      className={cn(
        "group flex w-full shrink-0 select-none items-center rounded-lg border",
        "transition-colors duration-100",
        isOverlay
          ? "rotate-[0.8deg] scale-[1.03] cursor-grabbing border-primary bg-primary text-primary-foreground shadow-2xl"
          : [
              "bg-primary/8 border-primary/25 text-primary",
              "hover:bg-primary/14 hover:border-primary/45",
              isDragging ? "cursor-grabbing" : "cursor-grab",
            ],
      )}
    >
      {/* Drag area: full row minus the X button */}
      <div
        {...(isOverlay ? {} : { ...listeners, ...attributes })}
        className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2"
      >
        <span
          className={cn(
            "flex shrink-0 flex-col gap-[2.5px] opacity-30",
            !isOverlay && "transition-opacity group-hover:opacity-55",
          )}
        >
          {[0, 1].map((r) => (
            <span key={r} className="flex gap-[2px]">
              {[0, 1].map((c) => (
                <span
                  key={c}
                  className={cn(
                    "h-[2.5px] w-[2.5px] rounded-full",
                    isOverlay ? "bg-primary-foreground" : "bg-current",
                  )}
                />
              ))}
            </span>
          ))}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium leading-snug">
          {field.label}
        </span>
      </div>

      {/* Remove button — stops pointer events from triggering drag */}
      {!isOverlay && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "flex h-full shrink-0 items-center justify-center px-2.5",
            "border-l border-primary/15 text-primary/35",
            "transition-colors hover:bg-destructive/10 hover:text-destructive",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100",
          )}
          aria-label={`Remove ${field.label}`}
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
  );
}
