"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { FieldItem, encodeDndId } from "./types";
import { SourceItem } from "./DraggableItem";

function ItemSkeleton() {
  return (
    <div className="border-border/40 bg-muted/20 flex shrink-0 animate-pulse items-center gap-2.5 rounded-lg border px-3 py-2.5">
      <div className="bg-muted/60 h-3 w-3 rounded" />
      <div className="bg-muted/60 h-3 flex-1 rounded" />
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
    ? items.filter((f) =>
        f.label.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : items;

  const availableCount = items.filter((f) => !usedFieldIds.has(f.id)).length;

  return (
    <div
      className={cn(
        "border-border bg-card flex h-full flex-col overflow-hidden rounded-xl border shadow-sm",
        className,
      )}
    >
      {/* Header — fixed */}
      <div className="border-border bg-muted/30 flex shrink-0 items-center justify-between border-b px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-semibold">
            {label}
          </p>
          {!isLoading && items.length > 0 && (
            <p className="text-muted-foreground mt-0.5 text-[10px]">
              {availableCount} of {items.length} available
            </p>
          )}
        </div>
        {isLoading && (
          <span className="border-primary ml-2 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
        )}
      </div>

      {/* Search — fixed */}
      <div className="border-border shrink-0 border-b px-2.5 py-2">
        <div className="relative">
          <svg
            className="text-muted-foreground/50 absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2"
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
            className="border-border/50 bg-background text-foreground placeholder:text-muted-foreground/50 focus:ring-ring w-full rounded-md border py-1.5 pr-2.5 pl-7 text-xs focus:ring-1 focus:outline-none"
          />
        </div>
      </div>

      {/* Item list */}
      <div
        className={cn(
          "flex min-h-0 flex-1 scrollbar-thin flex-col gap-1.5 overflow-y-auto p-2.5",
          "overflow-x-hidden",
        )}
      >
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            /* eslint-disable-next-line react/no-array-index-key */
            <ItemSkeleton key={`skeleton-${i}`} />
          ))
        ) : error ? (
          <div className="flex flex-1 items-center justify-center py-6">
            <p className="text-destructive text-center text-xs">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground/50 py-6 text-center text-xs">
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
