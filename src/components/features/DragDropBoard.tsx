"use client";

import { useState, useEffect } from "react";
import { BoardState, DragDropBoard, FieldItem } from "./DragAndDropBoard";

// ── Mock data — replace with real API calls ───────────────────────────────────
const MOCK_MEASURES: FieldItem[] = [
  {
    id: "revenue",
    label: "Revenue",
    meta: { type: "currency" },
    category: "measure",
  },
  {
    id: "profit",
    label: "Profit",
    meta: { type: "currency" },
    category: "measure",
  },
  {
    id: "units_sold",
    label: "Units Sold",
    meta: { type: "number" },
    category: "measure",
  },
  {
    id: "cost",
    label: "Cost",
    meta: { type: "currency" },
    category: "measure",
  },
  {
    id: "margin",
    label: "Margin %",
    meta: { type: "percent" },
    category: "measure",
  },
  {
    id: "orders",
    label: "Order Count",
    meta: { type: "number" },
    category: "measure",
  },
  {
    id: "returns",
    label: "Returns",
    meta: { type: "number" },
    category: "measure",
  },
  {
    id: "avg_order",
    label: "Avg Order Value",
    meta: { type: "currency" },
    category: "measure",
  },
];

const MOCK_DIMENSIONS: FieldItem[] = [
  {
    id: "region",
    label: "Region",
    meta: { type: "dimension" },
    category: "dimension",
  },
  {
    id: "country",
    label: "Country",
    meta: { type: "dimension" },
    category: "dimension",
  },
  {
    id: "city",
    label: "City",
    meta: { type: "dimension" },
    category: "dimension",
  },
  {
    id: "category",
    label: "Category",
    meta: { type: "dimension" },
    category: "dimension",
  },
  {
    id: "sub_category",
    label: "Sub-Category",
    meta: { type: "dimension" },
    category: "dimension",
  },
  {
    id: "product",
    label: "Product",
    meta: { type: "dimension" },
    category: "dimension",
  },
  {
    id: "customer",
    label: "Customer Segment",
    meta: { type: "dimension" },
    category: "dimension",
  },
  {
    id: "channel",
    label: "Sales Channel",
    meta: { type: "dimension" },
    category: "dimension",
  },
  {
    id: "quarter",
    label: "Quarter",
    meta: { type: "time" },
    category: "dimension",
  },
  { id: "year", label: "Year", meta: { type: "time" }, category: "dimension" },
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
            accepts: "measure",
          },
          {
            id: "columnMeasures",
            label: "Column Measures",
            description: "Numeric values for columns",
            accepts: "measure",
          },
          {
            id: "rowDimensions",
            label: "Row Dimensions",
            description: "Dimension labels on rows",
            accepts: "dimension",
          },
          {
            id: "columnDimensions",
            label: "Column Dimensions",
            description: "Dimension labels on columns",
            accepts: "dimension",
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
