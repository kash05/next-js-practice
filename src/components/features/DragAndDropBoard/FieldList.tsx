"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FieldItem, encodeDndId } from "./types";
import { SourceItem } from "./DraggableItem";

function ItemSkeleton() {
  return (
    <div className="flex shrink-0 animate-pulse items-center gap-2.5 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
      <div className="h-3 w-3 rounded bg-muted/60" />
      <div className="h-3 flex-1 rounded bg-muted/60" />
    </div>
  );
}

interface FieldListProps {
  label: string;
  sourceType: "list-a" | "list-b";
  items: FieldItem[];
  isLoading?: boolean;
  error?: string | null;
  usedFieldIds: Set<string>;
  onItemClick?: (field: FieldItem) => void;
  onRegister?: (items: FieldItem[]) => void;
  className?: string;
}

export function FieldList({
  label,
  sourceType,
  items,
  isLoading = false,
  error,
  usedFieldIds,
  onItemClick,
  onRegister,
  className,
}: FieldListProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isLoading && items.length > 0) onRegister?.(items);
  }, [items, isLoading, onRegister]);

  const filtered = search.trim()
    ? items.filter((f) => f.label.toLowerCase().includes(search.trim().toLowerCase()))
    : items;

  const availableCount = items.filter((f) => !usedFieldIds.has(f.id)).length;

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      {/* Header — fixed */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{label}</p>
          {!isLoading && items.length > 0 && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {availableCount} of {items.length} available
            </p>
          )}
        </div>
        {isLoading && (
          <span className="ml-2 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>

      {/* Search — fixed */}
      <div className="shrink-0 border-b border-border px-2.5 py-2">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/50"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <circle cx="6.5" cy="6.5" r="4" />
            <path strokeLinecap="round" d="M10.5 10.5l3 3" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border/50 bg-background py-1.5 pl-7 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Item list */}
      <div
        className={cn(
          "scrollbar-thin flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-2.5",
          "overflow-x-hidden",
        )}
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <ItemSkeleton key={i} />)
        ) : error ? (
          <div className="flex flex-1 items-center justify-center py-6">
            <p className="text-center text-xs text-destructive">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground/50">
            {search ? "No matches" : "No fields"}
          </p>
        ) : (
          filtered.map((field) => {
            const dndId = encodeDndId({
              sourceType,
              zoneId: undefined,
              fieldId: field.id,
              instanceKey: field.id,
            });
            return (
              <SourceItem
                key={field.id}
                field={field}
                dndId={dndId}
                isUsed={usedFieldIds.has(field.id)}
                onClick={() => onItemClick?.(field)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
