"use client";

import { useState, useEffect } from "react";
import { BoardState, DragDropBoard, FieldItem } from "./DragAndDropBoard";

// ── Mock data — replace with real API calls ───────────────────────────────────
const MOCK_MEASURES: FieldItem[] = [
  { id: "revenue", label: "Revenue", meta: { type: "currency" } },
  { id: "profit", label: "Profit", meta: { type: "currency" } },
  { id: "units_sold", label: "Units Sold", meta: { type: "number" } },
  { id: "cost", label: "Cost", meta: { type: "currency" } },
  { id: "margin", label: "Margin %", meta: { type: "percent" } },
  { id: "orders", label: "Order Count", meta: { type: "number" } },
  { id: "returns", label: "Returns", meta: { type: "number" } },
  { id: "avg_order", label: "Avg Order Value", meta: { type: "currency" } },
];

const MOCK_DIMENSIONS: FieldItem[] = [
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

function useFieldData(mockData: FieldItem[], delay: number) {
  const [items, setItems] = useState<FieldItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      setItems(mockData);
      setIsLoading(false);
    }, delay);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { items, isLoading };
}

export function DragAndDropBoard() {
  const measures = useFieldData(MOCK_MEASURES, 900);
  const dimensions = useFieldData(MOCK_DIMENSIONS, 1400);
  const [boardState, setBoardState] = useState<BoardState | null>(null);

  return (
    <div className="space-y-6">
      <DragDropBoard
        listA={measures.items}
        listALabel="Measures"
        listALoading={measures.isLoading}
        listB={dimensions.items}
        listBLabel="Dimensions"
        listBLoading={dimensions.isLoading}
        onChange={setBoardState}
        zones={[
          {
            id: "rowMeasures",
            label: "Row Measures",
            description: "Numeric values for rows",
          },
          {
            id: "columnMeasures",
            label: "Column Measures",
            description: "Numeric values for columns",
          },
          {
            id: "rowHeaders",
            label: "Row Headers",
            description: "Dimension labels on rows",
          },
          {
            id: "columnHeaders",
            label: "Column Headers",
            description: "Dimension labels on columns",
          },
        ]}
      />

      {boardState && (
        <details className="border-border bg-muted/30 rounded-lg border p-4">
          <summary className="text-muted-foreground cursor-pointer text-sm font-medium">
            Board state (API payload preview)
          </summary>
          <pre className="bg-card text-foreground mt-3 overflow-auto rounded p-3 text-xs">
            {JSON.stringify(boardState, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
