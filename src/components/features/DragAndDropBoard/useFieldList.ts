"use client";

import { useState, useEffect } from "react";
import { FieldItem } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Mock API — replace the fetch functions with real API calls.
// The hook interface stays identical — callers never need to change.
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_LIST_A: FieldItem[] = [
  { id: "revenue", label: "Revenue", meta: { type: "currency" } },
  { id: "profit", label: "Profit", meta: { type: "currency" } },
  { id: "units_sold", label: "Units Sold", meta: { type: "number" } },
  { id: "cost", label: "Cost", meta: { type: "currency" } },
  { id: "margin", label: "Margin %", meta: { type: "percent" } },
  { id: "orders", label: "Order Count", meta: { type: "number" } },
  { id: "returns", label: "Returns", meta: { type: "number" } },
  { id: "avg_order", label: "Avg Order Value", meta: { type: "currency" } },
];

const MOCK_LIST_B: FieldItem[] = [
  { id: "region", label: "Region", meta: { type: "dimension" } },
  { id: "country", label: "Country", meta: { type: "dimension" } },
  { id: "city", label: "City", meta: { type: "dimension" } },
  { id: "category", label: "Category", meta: { type: "dimension" } },
  { id: "sub_category", label: "Sub-Category", meta: { type: "dimension" } },
  { id: "product", label: "Product", meta: { type: "dimension" } },
  { id: "customer", label: "Customer Segment", meta: { type: "dimension" } },
  { id: "channel", label: "Sales Channel", meta: { type: "dimension" } },
  { id: "quarter", label: "Quarter", meta: { type: "time" } },
  { id: "year", label: "Year", meta: { type: "time" } },
];

async function fetchListA(): Promise<FieldItem[]> {
  // Simulated network delay
  await new Promise((r) => setTimeout(r, 900));
  return MOCK_LIST_A;
}

async function fetchListB(): Promise<FieldItem[]> {
  // Slightly different delay so they resolve independently
  await new Promise((r) => setTimeout(r, 1400));
  return MOCK_LIST_B;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic list fetcher hook
// ─────────────────────────────────────────────────────────────────────────────

interface UseFieldListResult {
  items: FieldItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFieldList(fetcher: () => Promise<FieldItem[]>): UseFieldListResult {
  const [items, setItems] = useState<FieldItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetcher()
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return { items, isLoading, error, refetch: () => setTick((t) => t + 1) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported hooks — swap fetcher to point at real endpoints
// ─────────────────────────────────────────────────────────────────────────────

export function useListA() {
  return useFieldList(fetchListA);
}

export function useListB() {
  return useFieldList(fetchListB);
}
